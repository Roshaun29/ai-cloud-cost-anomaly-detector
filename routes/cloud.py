from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from config import Settings, get_settings
from db.connection import get_cloud_accounts_collection, get_cost_data_collection
from models.cost_data import build_cost_data_document, serialize_cost_data
from routes.auth import get_current_user
from services.aws_service import AwsCostExplorerError, AwsCredentialsError, AwsCostService
from services.data_processor import (
    CloudCostDataProcessor,
    DataProcessingError,
    get_cloud_cost_data_processor,
)
from services.simulator_service import SimulatorService


router = APIRouter()
cloud_router = APIRouter(prefix="/cloud", tags=["Cloud"])
cost_router = APIRouter(prefix="/cost", tags=["Cost"])

SIMULATED_PROVIDER_MAP = {
    "simulated": "aws",
    "aws_simulated": "aws",
    "azure_simulated": "azure",
    "gcp_simulated": "gcp",
}


def get_aws_service(settings: Settings = Depends(get_settings)) -> AwsCostService:
    from services.aws_service import get_aws_cost_service

    return get_aws_cost_service(region_name=settings.aws_region)


def get_data_processor() -> CloudCostDataProcessor:
    return get_cloud_cost_data_processor(normalize_cost=True)


def get_simulator_service() -> SimulatorService:
    return SimulatorService()


def _serialize_records(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    serialized: list[dict[str, Any]] = []
    for record in records:
        serialized.append(
            {
                "date": (
                    record["date"].isoformat()
                    if hasattr(record["date"], "isoformat")
                    else record["date"]
                ),
                "service": str(record["service"]),
                "cost": float(record["cost"]),
                "provider": str(record.get("provider", "unknown")),
            }
        )
    return serialized


def _serialize_history_records(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    serialized: list[dict[str, Any]] = []
    for record in records:
        item = serialize_cost_data(record)
        serialized.append(
            {
                "id": item.id,
                "date": item.date.isoformat(),
                "service": item.service,
                "cost": float(item.cost),
                "provider": item.provider,
                "created_at": item.created_at.isoformat(),
            }
        )
    return serialized


@cloud_router.post("/add-account", status_code=status.HTTP_201_CREATED)
async def add_cloud_account(
    payload: dict[str, Any],
    current_user: dict = Depends(get_current_user),
) -> dict[str, Any]:
    provider = str(payload.get("provider", "")).strip().lower()
    account_name = str(payload.get("account_name", "")).strip()

    if provider not in {"aws", "azure", "gcp"}:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Provider must be one of: aws, azure, gcp",
        )

    if not account_name:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Account name is required",
        )

    cloud_accounts_collection = get_cloud_accounts_collection()
    created_at = datetime.now(timezone.utc)
    document = {
        "user_id": ObjectId(str(current_user["_id"])),
        "provider": provider,
        "account_name": account_name,
        "status": "connected",
        "created_at": created_at,
    }

    result = await cloud_accounts_collection.insert_one(document)

    return {
        "message": "Cloud account added successfully",
        "data": {
            "id": str(result.inserted_id),
            "provider": provider,
            "account_name": account_name,
            "status": "connected",
            "created_at": created_at.isoformat(),
        },
    }


@cloud_router.get("/sync")
async def sync_cloud_costs(
    current_user: dict = Depends(get_current_user),
    aws_service: AwsCostService = Depends(get_aws_service),
    data_processor: CloudCostDataProcessor = Depends(get_data_processor),
    simulator_service: SimulatorService = Depends(get_simulator_service),
    provider: str = "aws",
    account_id: str | None = Query(default=None),
) -> dict[str, Any]:
    try:
        provider_key = provider.strip().lower()
        simulated_provider = SIMULATED_PROVIDER_MAP.get(provider_key)
        synced_account: dict[str, Any] | None = None

        if account_id is not None:
            if not ObjectId.is_valid(account_id):
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Invalid account_id",
                )

            cloud_accounts_collection = get_cloud_accounts_collection()
            synced_account = await cloud_accounts_collection.find_one(
                {
                    "_id": ObjectId(account_id),
                    "user_id": ObjectId(str(current_user["_id"])),
                }
            )
            if not synced_account:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Cloud account not found",
                )

            simulated_provider = str(synced_account["provider"]).strip().lower()
            raw_costs = simulator_service.generate(providers=[simulated_provider])
        elif simulated_provider:
            raw_costs = simulator_service.generate(providers=[simulated_provider])
        else:
            raw_costs = aws_service.fetch_last_30_days_cost()

        cost_data_collection = get_cost_data_collection()
        documents = [
            build_cost_data_document(
                user_id=str(current_user["_id"]),
                date_value=record["date"],
                service=str(record["service"]),
                cost=float(record["cost"]),
                provider=str(record["provider"]),
            )
            for record in raw_costs
        ]
        if documents:
            await cost_data_collection.insert_many(documents)

        if synced_account is not None:
            await get_cloud_accounts_collection().update_one(
                {"_id": synced_account["_id"]},
                {
                    "$set": {
                        "status": "connected",
                        "last_synced_at": datetime.now(timezone.utc),
                    }
                },
            )

        processed_df = data_processor.process(raw_costs)
    except HTTPException:
        raise
    except AwsCredentialsError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc
    except AwsCostExplorerError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc
    except DataProcessingError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error while syncing cloud cost data",
        ) from exc

    records = _serialize_records(processed_df.to_dict(orient="records"))
    synced_at = datetime.now(timezone.utc)
    response: dict[str, Any] = {
        "message": "Cloud cost data synchronized successfully",
        "count": len(records),
        "synced_at": synced_at.isoformat(),
        "data": records,
    }
    if synced_account is not None:
        response["account"] = {
            "id": str(synced_account["_id"]),
            "provider": str(synced_account["provider"]),
            "account_name": str(synced_account["account_name"]),
            "status": "connected",
        }
    return response


@cost_router.get("/history")
async def get_cost_history(
    current_user: dict = Depends(get_current_user),
    start_date: datetime | None = Query(default=None),
    end_date: datetime | None = Query(default=None),
    service: str | None = Query(default=None),
    provider: str | None = Query(default=None),
) -> dict[str, Any]:
    query: dict[str, Any] = {"user_id": ObjectId(str(current_user["_id"]))}

    date_filter: dict[str, Any] = {}
    if start_date is not None:
        date_filter["$gte"] = start_date if start_date.tzinfo else start_date.replace(tzinfo=timezone.utc)
    if end_date is not None:
        date_filter["$lte"] = end_date if end_date.tzinfo else end_date.replace(tzinfo=timezone.utc)
    if date_filter:
        query["date"] = date_filter

    if service:
        query["service"] = service.strip()
    if provider:
        query["provider"] = provider.strip().lower()

    cost_data_collection = get_cost_data_collection()
    cursor = cost_data_collection.find(query).sort("date", 1)
    documents = await cursor.to_list(length=None)

    return {
        "message": "Cost history retrieved successfully",
        "count": len(documents),
        "data": _serialize_history_records(documents),
    }


@cloud_router.get("/sync-multi")
async def sync_multi_cloud(
    current_user: dict = Depends(get_current_user),
    data_processor: CloudCostDataProcessor = Depends(get_data_processor),
    simulator_service: SimulatorService = Depends(get_simulator_service),
    providers: str = Query(default="aws,azure,gcp"),
) -> dict[str, Any]:
    """Sync data from multiple cloud providers (simulated)."""
    try:
        provider_list = [p.strip().lower() for p in providers.split(",")]
        provider_list = [p for p in provider_list if p in ("aws", "azure", "gcp")]

        if not provider_list:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="At least one valid provider must be specified",
            )

        raw_costs = simulator_service.generate(providers=provider_list)

        cost_data_collection = get_cost_data_collection()
        documents = [
            build_cost_data_document(
                user_id=str(current_user["_id"]),
                date_value=record["date"],
                service=str(record["service"]),
                cost=float(record["cost"]),
                provider=str(record["provider"]),
            )
            for record in raw_costs
        ]
        if documents:
            await cost_data_collection.insert_many(documents)

        processed_df = data_processor.process(raw_costs)

    except HTTPException:
        raise
    except DataProcessingError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error while syncing multi-cloud data",
        ) from exc

    records = _serialize_records(processed_df.to_dict(orient="records"))
    provider_costs = {}
    for record in records:
        provider = record.get("provider", "unknown")
        if provider not in provider_costs:
            provider_costs[provider] = 0
        provider_costs[provider] += record.get("cost", 0)

    synced_at = datetime.now(timezone.utc)
    response: dict[str, Any] = {
        "message": "Multi-cloud cost data synchronized successfully",
        "count": len(records),
        "synced_at": synced_at.isoformat(),
        "data": records,
        "providers": provider_list,
        "provider_summary": provider_costs,
    }
    return response


router.include_router(cloud_router)
router.include_router(cost_router)
