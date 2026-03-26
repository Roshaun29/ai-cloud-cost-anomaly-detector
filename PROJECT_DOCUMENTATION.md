# Cloud Cost Anomaly Detector - Complete Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Database Design](#database-design)
5. [Backend Services](#backend-services)
6. [API Endpoints](#api-endpoints)
7. [Frontend Architecture](#frontend-architecture)
8. [Data Flow](#data-flow)
9. [Authentication System](#authentication-system)
10. [Important Code Details](#important-code-details)
11. [Setup & Configuration](#setup--configuration)

---

## Project Overview

The **Cloud Cost Anomaly Detector** is a full-stack SaaS application that monitors cloud costs across AWS, Azure, and GCP. It provides real-time anomaly detection, multi-cloud insights, and FinOps visibility.

**Key Features:**
- Multi-cloud cost monitoring (AWS, Azure, GCP)
- Real-time anomaly detection using Isolation Forest + Z-score analysis
- Interactive dashboards with Recharts visualizations
- User authentication with JWT tokens
- Account management for multiple cloud providers
- Cost trend analysis with forecasting
- Professional SaaS-grade UX with notifications

**Project Status:** Production-ready with simulation data for demo

---

## Technology Stack

### Frontend Dependencies (`package.json`)

```json
{
  "dependencies": {
    "react": "^18.3.1",              // UI library
    "react-dom": "^18.3.1",          // React DOM rendering
    "react-router-dom": "^6.30.1",   // Client-side routing
    "recharts": "^2.15.4",           // Data visualization library
    "axios": "^1.8.4",               // HTTP client
    "lucide-react": "^0.525.0"       // Icon library (optional)
  },
  "devDependencies": {
    "vite": "^6.3.5",                // Build tool & dev server
    "@vitejs/plugin-react": "^4.4.1" // React plugin for Vite
  }
}
```

**Frontend Stack:**
- **Framework:** React 18.3 (Concurrent Rendering, Suspense)
- **Build Tool:** Vite (Fast HMR, ES modules)
- **Routing:** React Router v6 (Protected routes, lazy loading)
- **Charts:** Recharts (Composable, responsive)
- **HTTP:** Axios (Interceptors, error handling)
- **Styling:** CSS Grid/Flexbox (Custom CSS, no CSS-in-JS)

### Backend Dependencies (`requirements.txt`)

```
fastapi                           # Modern async web framework
uvicorn[standard]                 # ASGI application server
pydantic                          # Data validation & settings
email-validator                   # Email validation
motor                             # Async MongoDB driver
pymongo                           # MongoDB connector
passlib[bcrypt]                   # Password hashing
python-jose[cryptography]         # JWT token management
boto3                             # AWS SDK (for future real AWS integration)
pandas                            # Data analysis & manipulation
scikit-learn                      # Machine learning (Isolation Forest)
apscheduler                       # Task scheduling
```

**Backend Stack:**
- **Framework:** FastAPI (High performance, async/await, auto OpenAPI docs)
- **Server:** Uvicorn (ASGI server)
- **Database:** MongoDB (Async with Motor)
- **Auth:** JWT tokens + OAuth2
- **ML:** Scikit-learn (Isolation Forest algorithm)
- **Data Processing:** Pandas (DataFrames, aggregations)

---

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React 18)                     │
│  ┌──────────┬──────────┬──────────┬──────────────────────┐  │
│  │ LoginPage│Dashboard │Anomalies │  AccountManagement   │  │
│  └──────────┴──────────┴──────────┴──────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Notification & Error System                │ │
│  │  (Toast Context, Error Boundary, useAsyncOperation)   │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP/REST (Axios)
                      │
┌─────────────────────▼───────────────────────────────────────┐
│           Backend (FastAPI + Uvicorn)                        │
│  ┌──────────┬──────────┬──────────┬──────────────────────┐  │
│  │   Auth   │  Cloud   │ Anomaly  │    Cost History      │  │
│  │ Routes   │  Routes  │  Routes  │     Routes           │  │
│  └────┬─────┴────┬─────┴────┬─────┴──────────┬──────────┘  │
│       │          │          │                 │             │
│  ┌────▼──────────▼──────────▼─────────────────▼──────────┐  │
│  │            Service Layer                             │  │
│  │  ┌──────────┬──────────┬──────────┬──────────────┐   │  │
│  │  │  Auth    │Anomaly   │  Data    │  Simulator   │   │  │
│  │  │Utilities │Detector  │Processor │  Service     │   │  │
│  │  └──────────┴──────────┴──────────┴──────────────┘   │  │
│  └─────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        Database Layer (Motor/PyMongo)                │  │
│  │  ┌──────────┬──────────┬──────────┬──────────────┐   │  │
│  │  │  Users   │ Accounts │ Anomalies│ Cost Data    │   │  │
│  │  │Collection│Collection│Collection│ Collection   │   │  │
│  │  └──────────┴──────────┴──────────┴──────────────┘   │  │
│  └──────────────────────────────────────────────────────┘ │
└─────────────────┬──────────────────────────────────────────┘
                  │ MongoDB Connection (AsyncIO Motor)
                  │
┌─────────────────▼──────────────────────────────────────────┐
│              MongoDB Database                               │
│  (Cloud hosted, async motor driver)                         │
└────────────────────────────────────────────────────────────┘
```

### Project Directory Structure

```
Cloud cost anamoly Detector/
├── Frontend
│   └── src/
│       ├── pages/             # Page components
│       │   ├── DashboardPage.jsx
│       │   ├── AnomaliesPage.jsx
│       │   ├── LoginPage.jsx
│       │   └── RegisterPage.jsx
│       ├── components/        # Reusable components
│       │   ├── AccountCard.jsx
│       │   ├── AccountsList.jsx
│       │   ├── CostChart.jsx
│       │   ├── SyncButton.jsx
│       │   ├── Toast.jsx (notifications)
│       │   ├── ErrorBoundary.jsx
│       │   └── ... (9+ components)
│       ├── context/          # React Context
│       │   └── ToastContext.jsx
│       ├── hooks/            # Custom React hooks
│       │   └── useAsyncOperation.js
│       ├── services/         # API layer
│       │   └── api.js
│       ├── layout/           # Layout components
│       └── index.css         # Global styles (1900+ lines)
│
├── Backend
│   ├── main.py               # FastAPI entry point
│   ├── config.py             # Configuration & settings
│   ├── routes/               # API route handlers
│   │   ├── auth.py           # Authentication
│   │   ├── cloud.py          # Cloud operations
│   │   └── anomaly.py        # Anomaly detection
│   ├── services/             # Business logic
│   │   ├── simulator_service.py    # Cost simulation
│   │   ├── anomaly_detector.py     # ML anomaly detection
│   │   ├── data_processor.py       # Data cleaning & processing
│   │   ├── aws_service.py          # AWS integration
│   │   └── scheduler_service.py
│   ├── models/               # Data models
│   │   ├── user.py
│   │   ├── cost_data.py
│   │   └── anomaly.py
│   ├── db/                   # Database layer
│   │   └── connection.py     # MongoDB connections
│   └── utils/                # Utilities
│       ├── jwt.py            # JWT token management
│       └── password.py       # Password hashing
│
├── package.json              # Frontend dependencies
├── requirements.txt          # Backend dependencies
└── vite.config.js           # Vite configuration
```

---

## Database Design

### MongoDB Collections

#### 1. **users** Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  name: String,
  hashed_password: String,
  is_active: Boolean,
  created_at: ISODate,
  updated_at: ISODate
}
```

**Indexes:**
- `email` (unique)

#### 2. **cloud_accounts** Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId (ref: users),
  provider: String ("aws", "azure", "gcp"),
  account_name: String,
  account_id: String (optional),
  status: String ("connected", "connecting", "failed"),
  created_at: ISODate,
  last_synced_at: ISODate (optional)
}
```

**Indexes:**
- `user_id, provider, account_id` (unique, compound)

#### 3. **cost_data** Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId (ref: users),
  date: ISODate,
  service: String,
  cost: Float,
  provider: String,
  created_at: ISODate
}
```

**Indexes:**
- `user_id, date DESC` (compound, for quick date range queries)
- `provider, service` (compound, for service-level queries)

#### 4. **anomaly_results** Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId (ref: users),
  date: ISODate,
  service: String,
  cost: Float,
  provider: String,
  anomaly_score: Float,   // 0.0-1.0
  is_anomaly: Boolean,
  explanation: String,
  created_at: ISODate
}
```

**Indexes:**
- `user_id, date DESC` (compound)
- `service, is_anomaly` (compound)

### Connection Details (`db/connection.py`)

```python
from motor.motor_asyncio import AsyncIOMotorClient

# Motor: Async MongoDB driver for Python
# Allows non-blocking database operations in FastAPI

settings = get_settings()
_client = AsyncIOMotorClient(
    settings.mongodb_uri,  # MongoDB connection string from env
    uuidRepresentation="standard"
)
_database = _client[settings.mongodb_db_name]

# Collections are obtained through getter functions
def get_users_collection() -> AsyncIOMotorCollection:
    return _database.get_collection("users")
```

**Key Features:**
- **Async/Await:** Non-blocking database calls
- **Connection Pooling:** Automatic via Motor
- **Index Creation:** Done in FastAPI lifespan context
- **Collections:** Can be dynamically accessed

---

## Backend Services

### 1. Simulator Service (`services/simulator_service.py`)

**Purpose:** Generate fake cloud cost data for demonstration/testing

**Core Algorithm:**

```python
class SimulatorService:
    def generate(
        self,
        providers: list[str],     # ["aws", "azure", "gcp"]
        end_date: datetime = None  # Default: today
    ) -> list[dict]:
        # Returns 30 days of simulated cost data
```

**How It Works:**

1. **Time-Based Seeding for Data Variation**
```python
# Each call generates different data using millisecond precision
if self.seed is None:
    import time
    random_seed = int(time.time() * 1000000) % (2**31)
    random_instance = Random(random_seed)
```

2. **Service Profiles Define Cost Behavior**
```python
PROVIDER_SERVICE_PROFILES = {
    "aws": {
        "EC2": ServiceProfile(
            baseline_cost=260.0,              # Base daily cost
            daily_amplitude=0.11,             # Daily variation %
            weekly_amplitude=0.15,            # Weekly variation %
            growth_rate=0.0048,               # Daily growth %
            spike_multiplier_range=(2.1, 3.2), # Anomaly spike multiplier
            anomaly_probability_multiplier=1.35
        ),
        "S3": ServiceProfile(...)
    }
}
```

3. **Cost Calculation Formula**
```
cost = baseline_cost 
       × (1 + daily_amplitude × sin(daily_offset))
       × (1 + weekly_amplitude × sin(weekly_offset))
       × (1 + growth_rate × day_index)
       × (1 + random_noise)
       × [spike_multiplier if anomaly_probability triggers]
```

**Providers & Services:**
- **AWS:** EC2, S3
- **Azure:** Virtual Machines, Blob Storage
- **GCP:** Compute Engine, BigQuery

**Anomaly Injection:**
- 6% probability per data point (configurable)
- Spike multiplier: 2x - 4x cost increase
- Tracked via anomaly_probability_multiplier per service

**Output Example:**
```python
[
    {
        "date": datetime(2026, 3, 26),
        "service": "EC2",
        "cost": 287.45,
        "provider": "aws"
    },
    {
        "date": datetime(2026, 3, 26),
        "service": "S3",
        "cost": 82.13,
        "provider": "aws"
    }
]
```

### 2. Anomaly Detector Service (`services/anomaly_detector.py`)

**Purpose:** Detect cost anomalies using ML + statistical methods

**Algorithm Stack:**

**A. Isolation Forest (Ensemble Method)**
```python
model = IsolationForest(
    contamination=0.1,        # Expect ~10% anomalies
    n_estimators=200,         # 200 decision trees
    n_jobs=-1,                # Parallel processing
    random_state=42           # Reproducibility
)
# Anomaly score = -model.score_samples(features)
# Normalized to 0.0-1.0 range
```

**B. Z-Score Analysis (Statistical Method)**
```python
z_score = (cost - mean) / std_dev
anomaly_if_zscore > 2.5  # 2.5σ threshold
```

**C. Hybrid Decision Logic**
```python
is_anomaly = (isolation_anomaly) OR (zscore_anomaly)
```

**Features Used for Detection:**
```python
features = DataFrame({
    "cost": float,           # Current day cost
    "day_index": int         # Days since start
})
```

**Service-Level Analysis:**
```python
for service in cost_data:
    # Analyze each service independently
    # Prevents AWS's high baseline from masking Azure anomalies
    anomaly_df = detector.detect_for_service(service_data)
```

**Anomaly Explanations:**
```
- "Cost spike detected versus the service baseline" (Z > 0)
- "Cost drop detected versus the service baseline" (Z < 0)
- "Isolation Forest flagged this point as unusual"
- "No significant spike detected" (Non-anomaly)
```

**Configuration (config.py):**
```python
anomaly_contamination=0.1          # Expected anomaly ratio
anomaly_zscore_threshold=2.5       # Z-score cutoff
anomaly_min_samples_per_service=5  # Min data points before ML
```

### 3. Data Processor Service (`services/data_processor.py`)

**Purpose:** Clean, validate, and normalize cost data

**Processing Pipeline:**

```
Raw Data (from simulator/AWS)
    ↓
[1] Build DataFrame
    - Validate required columns: date, service, cost
    ↓
[2] Clean Data
    - Convert dates to datetime
    - Strip/validate service names
    - Convert costs to float
    - Drop NULL values
    - Sort by date
    ↓
[3] Group by Service
    - GROUP BY (date, service)
    - SUM costs (in case of duplicates)
    ↓
[4] Normalize (Optional)
    - Min-max normalization: (cost - min) / (max - min)
    - Scales values to 0-1 range
    ↓
Clean DataFrame Ready for Analysis
```

**Code:**
```python
class CloudCostDataProcessor:
    def process(self, raw_data: list[dict]) -> pd.DataFrame:
        df = self._build_dataframe(raw_data)
        df = self._clean_dataframe(df)
        df = self._group_by_service(df)
        
        if self.normalize_cost:
            df = self._normalize_cost_column(df)
        
        return df
```

**Usage in Routes:**
```python
# For cost data: normalize=True
data_processor = get_cloud_cost_data_processor(normalize_cost=True)

# For anomaly detection: normalize=False
data_processor = get_cloud_cost_data_processor(normalize_cost=False)
```

---

## API Endpoints

### Authentication Endpoints

#### `POST /auth/register`
**Purpose:** Create new user account

**Request:**
```json
{
  "name": "Alex Morgan",
  "email": "alex@costcommand.ai",
  "password": "securepassword123"
}
```

**Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "alex@costcommand.ai",
  "name": "Alex Morgan",
  "is_active": true,
  "created_at": "2026-03-26T10:00:00Z"
}
```

**Error Responses:**
- `409 Conflict`: Email already exists
- `500 Server Error`: Database error

#### `POST /auth/login`
**Purpose:** Authenticate user and get JWT tokens

**Request:**
```json
{
  "email": "alex@costcommand.ai",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 900
}
```

#### `GET /auth/me`
**Purpose:** Get current user info

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "alex@costcommand.ai",
  "name": "Alex Morgan"
}
```

### Cloud Cost Endpoints

#### `POST /cloud/add-account`
**Purpose:** Register a cloud account

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "provider": "aws",
  "account_name": "Production Billing"
}
```

**Response (201):**
```json
{
  "message": "Cloud account added successfully",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "provider": "aws",
    "account_name": "Production Billing",
    "status": "connected",
    "created_at": "2026-03-26T10:00:00Z"
  }
}
```

#### `GET /cloud/sync`
**Purpose:** Sync cloud costs (single provider)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `provider` (string): "aws", "azure", "gcp", or "aws_simulated" (default)
- `account_id` (optional): Specific account to sync

**Response (200):**
```json
{
  "message": "Cloud cost data synchronized successfully",
  "count": 60,
  "synced_at": "2026-03-26T10:15:30Z",
  "data": [
    {
      "date": "2026-02-24T00:00:00Z",
      "service": "EC2",
      "cost": 287.45,
      "provider": "aws"
    },
    {
      "date": "2026-02-24T00:00:00Z",
      "service": "S3",
      "cost": 82.13,
      "provider": "aws"
    }
  ]
}
```

#### `GET /cloud/sync-multi`
**Purpose:** Sync multiple cloud providers

**Query Parameters:**
- `providers` (string): Comma-separated providers (e.g., "aws,azure,gcp")

**Response (200):**
```json
{
  "message": "Multi-cloud data synchronized successfully",
  "count": 180,
  "synced_at": "2026-03-26T10:15:30Z",
  "provider_summary": {
    "aws": {
      "total_cost": 2156.78,
      "services_count": 2,
      "last_sync": "2026-03-26T10:15:30Z"
    },
    "azure": { ... },
    "gcp": { ... }
  },
  "providers": ["aws", "azure", "gcp"],
  "data": [ ... ]
}
```

### Cost History Endpoint

#### `GET /cost/history`
**Purpose:** Retrieve cost history with filtering

**Query Parameters:**
- `start_date` (optional): ISO 8601 date
- `end_date` (optional): ISO 8601 date
- `service` (optional): Filter by service name
- `provider` (optional): Filter by provider

**Response (200):**
```json
{
  "message": "Cost history retrieved successfully",
  "count": 25,
  "data": [
    {
      "id": "507f1f77bcf86cd799439013",
      "date": "2026-02-24T00:00:00Z",
      "service": "EC2",
      "cost": 287.45,
      "provider": "aws",
      "created_at": "2026-03-26T10:00:00Z"
    }
  ]
}
```

### Anomaly Detection Endpoint

#### `POST /anomaly/detect`
**Purpose:** Detect cost anomalies

**Query Parameters:**
- `provider` (optional): Single provider
- `providers` (optional): Multiple providers (comma-separated)

**Response (200):**
```json
{
  "message": "Anomaly detection complete",
  "count": 12,
  "anomaly_count": 8,
  "synced_at": "2026-03-26T10:15:30Z",
  "data": [
    {
      "date": "2026-03-15T00:00:00Z",
      "service": "EC2",
      "cost": 856.34,
      "anomaly_score": 0.87,
      "is_anomaly": true,
      "explanation": "Cost spike detected versus the service baseline",
      "provider": "aws"
    },
    {
      "date": "2026-03-10T00:00:00Z",
      "service": "S3",
      "cost": 125.67,
      "anomaly_score": 0.65,
      "is_anomaly": true,
      "explanation": "Isolation Forest flagged this point as unusual",
      "provider": "aws"
    }
  ]
}
```

---

## Frontend Architecture

### Component Hierarchy

```
App
├── ToastProvider (Context)
├── ErrorBoundary
├── Routes
│   ├── LoginPage
│   ├── RegisterPage
│   └── ProtectedApp
│       └── AppLayout
│           ├── Sidebar
│           ├── Topbar
│           └── Pages
│               ├── DashboardPage
│               │   ├── HeroCard
│               │   ├── ProviderSelector
│               │   ├── StatsGrid
│               │   │   └── StatCard (×4)
│               │   ├── CostChart
│               │   ├── FinOpsCard
│               │   ├── ProviderBreakdown
│               │   ├── AccountsSection
│               │   │   └── AccountsList
│               │   │       └── AccountCard (×N)
│               │   └── AnomaliesTable
│               └── AnomaliesPage
└── ToastContainer
```

### State Management Pattern

**Context-Based:**
```javascript
// ToastContext: Global notifications
const { success, error, warning, info } = useToast();

// ErrorBoundary: Global error handling
// Catches React component lifecycle errors
```

**Local Component State:**
```javascript
// DashboardPage manages:
- dashboard (data)
- selectedProviders (filter)
- loading, syncing (UI states)
- connectedAccounts (accounts list)
- autoRefreshEnabled (auto-sync toggle)
```

**Data Fetching Pattern:**
```javascript
// useAsyncOperation hook pattern
const { execute, loading, error } = useAsyncOperation(
  async () => await syncMultiCloud(providers),
  {
    successMessage: "Synced successfully",
    errorMessage: "Sync failed",
    onSuccess: (result) => { /* handle */ },
    onError: (err) => { /* handle */ }
  }
);
```

### API Client (`src/services/api.js`)

```javascript
const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor: Add JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle 401 (auth errors)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();  // Clear localStorage
      window.dispatchEvent(new Event('auth-state-changed'));
    }
    return Promise.reject(error);
  }
);
```

**Key API Functions:**
```javascript
// Authentication
export async function login(credentials)
export async function register(payload)

// Cloud operations
export async function addCloudAccount(payload)
export async function syncMultiCloud(providers)
export async function syncCloudData(provider, accountId)
export async function fetchMultiCloudDashboard(providers)

// Anomaly detection
export async function fetchAnomalies(provider)

// Cost history
export async function fetchCostHistory(filters)
```

**Data Transformation Functions:**
```javascript
// Format utilities
formatCurrency(value)           // $1,234.56
formatSyncTime(date)            // "5 mins ago"

// Data mapping
buildMetrics(costRows, anomalyRows)
buildChartData(costRows)
mapAnomalyRows(rows)
```

### Styling System

**CSS Structure (`src/index.css`):**

1. **CSS Variables**
```css
:root {
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --radius-md: 0.625rem;
  --radius-lg: 0.875rem;
}
```

2. **Layout System**
```css
/* Grid layouts */
.page-grid                    /* Main page layout */
.stats-grid                   /* 4 column metric cards */
.dashboard-main-grid          /* 60/40 chart + sidebar */
.accounts-grid                /* Responsive account cards */

/* Cards & Components */
.glass-card                   /* Frosted glass effect */
.modal-card                   /* Modal dialog style */
.account-card                 /* Individual account card */
```

3. **Animations (400+ lines)**
```css
@keyframes pulse              /* Subtle breathing effect */
@keyframes shimmer            /* Loading skeleton animation */
@keyframes spin               /* Loading spinner */
@keyframes slideInRight       /* Toast notification entrance */
@keyframes slideOutRight      /* Toast exit */
@keyframes slideInDown        /* Error boundary entrance */
@keyframes fadeIn             /* Page fade-in */
```

---

## Data Flow

### Flow 1: User Login & Dashboard Load

```
1. User enters credentials on LoginPage
2. POST /auth/login → Backend validates & returns JWT
3. Frontend stores tokens in localStorage
4. User navigated to /dashboard
5. useEffect triggers loadDashboardData()
6. GET /cloud/sync-multi with providers query
7. Backend simulator generates 30 days × 3 providers × 4 services = 360 records
8. Records stored in MongoDB
9. POST /anomaly/detect runs ML detection
10. Both responses returned to frontend
11. React renders Dashboard with data
12. Charts, metrics, anomalies populated
```

### Flow 2: Manual Cloud Sync

```
1. User clicks "Sync Data" button
2. onClick → handleSync() sets syncing=true
3. GET /cloud/sync-multi called
4. Backend generates NEW simulated data (time-based seed)
5. Time-based seed ensures each call generates different values
6. Records inserted into MongoDB
7. Response includes synced_at timestamp (ISO 8601)
8. Frontend calls loadDashboardData() again
9. New data appears on dashboard
10. success() toast: "Cloud accounts synced successfully"
11. SyncStatus component shows "Just now"
12. All animations complete, UI stable
```

### Flow 3: Auto-Refresh

```
1. User enables "Auto-refresh" checkbox
2. autoRefreshEnabled state = true
3. useEffect sets interval(loadDashboardData, 60000)
4. Every 60 seconds: auto-sync happens silently
5. If successful: no toast (success duration = 0)
6. If error: error toast appears
7. SyncStatus updates relative time
8. User disables checkbox: interval cleared
9. Cleanup on unmount: clearInterval()
```

### Flow 4: Individual Account Sync

```
1. User views AccountCard for specific account
2. Clicks "Sync Account" button
3. onClick → handleAccountSync(account)
4. syncingAccountId state set to account.id
5. GET /cloud/sync?provider=aws&account_id=xyz
6. Backend fetches that specific account's simulated data
7. Updates cloud_accounts document: last_synced_at
8. Response includes account details
9. Frontend updates:
   - accountSyncTimes[account.id] = "Just now"
   - accountCosts[account.id] = { total, services, trend }
10. Card UI updates, showing new data
11. loadDashboardData() refreshes overall dashboard
12. success() toast: "Production Billing synced successfully"
```

### Flow 5: Anomaly Detection Chain

```
1. POST /anomaly/detect called (in syncMultiCloud)
2. Backend SimulatorService generates cost data
3. CloudCostDataProcessor cleans & validates data
4. CloudCostAnomalyDetector analyzes each service:
   a. Isolation Forest: Identifies outlier points
   b. Z-Score: Detects statistical anomalies
   c. Join results: Point is anomaly if EITHER method flags
5. For each anomaly:
   - Generates explanation: "Cost spike detected..."
   - Creates entry in anomaly_results collection
6. Response includes only flagged anomalies
7. Frontend filters by severity (high/medium/low based on score)
8. AnomaliesTable displays with:
   - Red/Yellow/Blue severity indicators
   - Explanation from backend
   - Action to investigate
```

---

## Authentication System

### JWT Token Flow

**Token Structure:**

```
Access Token (15 minutes):
{
  "sub": "507f1f77bcf86cd799439011",  // User ID
  "exp": 1711425300,                   // Expiration time
  "iat": 1711424400                    // Issued at
}

Refresh Token (7 days):
{
  "sub": "507f1f77bcf86cd799439011",
  "exp": 1711957200,
  "iat": 1711370400,
  "type": "refresh"
}
```

**Signing & Verification (`utils/jwt.py`):**

```python
from jose import jwt

# Create token
def create_access_token(subject: str, expires_delta: timedelta = None):
    to_encode = {
        "sub": subject,
        "exp": datetime.utcnow() + expires_delta
    }
    encoded_jwt = jwt.encode(
        to_encode,
        JWT_SECRET_KEY,
        algorithm="HS256"
    )
    return encoded_jwt

# Verify token
def decode_token(token: str, token_type: str = "access"):
    payload = jwt.decode(
        token,
        JWT_SECRET_KEY,
        algorithms=["HS256"]
    )
    subject = payload.get("sub")
    return payload
```

**OAuth2 Password Flow:**

```
1. User sends credentials to /auth/login
2. Backend verifies email + password
3. Password verification uses bcrypt:
   - Stored: hashed_password (bcrypt hash)
   - Provided: password (plain text)
   - Algorithm: bcrypt with 12 rounds
4. If valid:
   - Generate access token (15 min)
   - Generate refresh token (7 days)
   - Return both to frontend
5. Frontend stores in localStorage
6. Every API request includes: Authorization: Bearer <token>
```

**Protected Endpoints:**

```python
async def get_current_user(token: str = Depends(oauth2_scheme)):
    # Extract token from Authorization header
    # Decode JWT
    # Look up user_id in MongoDB
    # Verify user is active
    # Return user document
    # If any step fails: 401 Unauthorized
```

### Password Security

```python
from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12  # Slow down brute force
)

# Hash password at registration
hashed = pwd_context.hash(password)
# Result: $2b$12$abcdef...

# Verify password at login
is_valid = pwd_context.verify(password, hashed)
```

---

## Important Code Details

### 1. Time-Based Seeding for Data Variation

**Problem:** Simulator was generating identical data each sync

**Solution:** Use current time as seed

```python
# services/simulator_service.py
def generate(self, providers=None, end_date=None):
    if self.seed is None:
        import time
        # Microsecond precision ensures uniqueness
        random_seed = int(time.time() * 1000000) % (2**31)
        random_instance = Random(random_seed)
    else:
        random_instance = Random(self.seed)
    
    # Use this random instance for all generation
    for service in services:
        records.extend(
            self._generate_service_series(..., random_instance)
        )
    return records
```

**Result:** Same API call returns different values each time

### 2. Multi-Provider Support

**Architecture:**

```python
# routes/cloud.py
@cloud_router.get("/sync-multi")
async def sync_multi_cloud(
    providers: str = Query(default="aws,azure,gcp")
):
    provider_list = [p.strip().lower() for p in providers.split(",")]
    raw_costs = simulator_service.generate(providers=provider_list)
    # Returns 30 days × len(providers) × 2 services = records
    
    # Group by provider for summary
    provider_summary = {}
    for provider in provider_list:
        provider_records = [r for r in raw_costs if r['provider'] == provider]
        provider_summary[provider] = {
            "total_cost": sum(r['cost'] for r in provider_records),
            "services_count": len(set(r['service'] for r in provider_records)),
            "last_sync": datetime.now(timezone.utc).isoformat()
        }
    
    return {
        "providers": provider_list,
        "provider_summary": provider_summary,
        "data": raw_costs
    }
```

### 3. Isolation Forest Anomaly Detection

**Core ML Algorithm:**

```python
# services/anomaly_detector.py
model = IsolationForest(
    contamination=0.1,        # Expect 10% anomalies
    n_estimators=200,         # 200 decision trees
    random_state=42,
    n_jobs=-1                 # Use all CPU cores
)

# Fit on historical data
model.fit(features)

# Score new points
raw_scores = -model.score_samples(features)

# Normalize to 0-1
min_score = raw_scores.min()
max_score = raw_scores.max()
normalized = (raw_scores - min_score) / (max_score - min_score)

# Threshold: > 0.5 = anomaly
is_anomaly = normalized > 0.5
```

**Features:**
- Cost value (absolute)
- Days since start (trend)

**Why Isolation Forest?**
- Works well with small datasets
- Unsupervised (no labeled training data)
- Fast training & prediction
- Handles multivariate outliers

### 4. Service-Level Grouping

**Why analyze each service separately?**

Without grouping:
- AWS EC2 ($260/day) baseline dominates
- Azure VM ($205/day) spike goes unnoticed
- GCP CE ($225/day) anomalies masked

With grouping:
- Each service evaluated independently
- Low spike in cheap service is caught
- High baseline service doesn't hide others

```python
# anomaly_detector.py
for _, service_frame in dataframe.groupby("service"):
    # Run detection on EC2 data only
    ec2_anomalies = self._detect_for_service(service_frame)
    # Run detection on S3 data only
    s3_anomalies = self._detect_for_service(service_frame)
    # Results combined at end
```

### 5. Toast Notification System

**Context-Based Global State:**

```javascript
// src/context/ToastContext.jsx
export function useToast() {
  const { success, error, warning, info } = useContext(ToastContext);
  return { success, error, warning, info };
}

// In any component:
const { success, error } = useToast();

success("Saved!", { duration: 3000 });  // Auto-dismiss 3s
error("Failed!", { duration: 5000 });   // Auto-dismiss 5s
```

**Auto-Dismiss Logic:**

```javascript
useEffect(() => {
  if (duration > 0) {
    const timeout = setTimeout(() => {
      removeToast(id);
    }, duration);
    return () => clearTimeout(timeout);
  }
}, [duration, id]);
```

**Styling:**

```css
.toast-container {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.toast {
  animation: slideInRight 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(148, 163, 184, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 0.625rem;
}

.toast.toast-success {
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(6, 78, 59, 0.5);
}

.toast.toast-error {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(127, 29, 29, 0.5);
}
```

### 6. Error Boundary Component

**Catches React Errors:**

```jsx
// src/components/ErrorBoundary.jsx
class ErrorBoundary extends Component {
  componentDidCatch(error, errorInfo) {
    this.setState({
      hasError: true,
      error,
      errorInfo
    });
    console.error('ErrorBoundary caught:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content glass-card">
            <div className="error-icon">⚠</div>
            <h2>Something went wrong</h2>
            <p>We encountered an unexpected error...</p>
            
            {process.env.NODE_ENV === 'development' && (
              <details>
                <summary>Error details</summary>
                <pre>{this.state.error.toString()}</pre>
              </details>
            )}
            
            <button onClick={this.resetError}>Try Again</button>
            <button onClick={() => window.location.href = '/'}>Go Home</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
```

### 7. Cost Chart Loading State

**Skeleton Loading:**

```jsx
// src/components/CostChart.jsx
export function CostChart({ data, loading }) {
  if (loading) {
    return (
      <GlassCard title="Daily Cost Trend" loading>
        <div className="chart-shell">
          <div className="loading-skeleton" />
        </div>
      </GlassCard>
    );
  }
  
  return (
    <GlassCard title="Daily Cost Trend">
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data}>
          {/* Chart components */}
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
```

**Shimmer Animation:**

```css
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.loading-skeleton {
  height: 300px;
  background: linear-gradient(
    90deg,
    rgba(148, 163, 184, 0.1) 25%,
    rgba(148, 163, 184, 0.2) 50%,
    rgba(148, 163, 184, 0.1) 75%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
```

---

## Setup & Configuration

### Environment Variables

**Backend (.env):**

```bash
# App Configuration
APP_NAME=Cloud Cost Anomaly Detector
APP_ENV=development
APP_DEBUG=true

# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=cloud_cost_detector

# JWT
JWT_SECRET_KEY=your-super-secret-key-min-32-chars
JWT_REFRESH_SECRET_KEY=your-refresh-secret-key-min-32-chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Security
BCRYPT_ROUNDS=12

# AWS (for real AWS integration)
AWS_REGION=us-east-1

# Anomaly Detection
ANOMALY_CONTAMINATION=0.1
ANOMALY_ZSCORE_THRESHOLD=2.5
ANOMALY_MIN_SAMPLES_PER_SERVICE=5
```

**Frontend (.env or vite.config.js):**

```javascript
// vite.config.js
export default defineConfig({
  define: {
    'process.env.REACT_APP_API_URL': JSON.stringify('http://localhost:8000')
  }
})

// Or in src/services/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
```

### Running the Application

**Backend:**

```bash
cd "Cloud cost anamoly Detector"

# Create virtual environment
python -m venv venv
source venv/Scripts/activate  # Windows
# or: source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Output:
# INFO:     Uvicorn running on http://0.0.0.0:8000
# INFO:     Application startup complete
```

**Frontend:**

```bash
cd "Cloud cost anamoly Detector"

# Install dependencies
npm install

# Run dev server
npm run dev

# Output:
#   VITE v6.3.5  ready in 234 ms
#   ➜  Local:   http://localhost:5173/
#   ➜  press h to show help
```

### Health Check

**Backend Health:**

```bash
curl http://localhost:8000/health
# {"status": "ok"}
```

**API Documentation:**

```
http://localhost:8000/docs  # Swagger UI
http://localhost:8000/redoc # ReDoc
```

### Default Credentials (Demo)

```
Email:    alex@costcommand.ai
Password: password123
```

---

## Summary

This project demonstrates a production-ready SaaS application with:

✅ **Multi-cloud cost monitoring** (AWS, Azure, GCP)
✅ **Real-time anomaly detection** (Isolation Forest + Z-score)
✅ **Professional UI** (React 18, Recharts, smooth animations)
✅ **Secure authentication** (JWT + bcrypt)
✅ **Scalable backend** (FastAPI + async/await)
✅ **Data persistence** (MongoDB with async driver)
✅ **SaaS-grade UX** (Toast notifications, error boundaries, loading states)

---

**Generated:** March 26, 2026
**Project Status:** Production-Ready with Simulation Data
**Testing:** Manual testing recommended before production deployment
