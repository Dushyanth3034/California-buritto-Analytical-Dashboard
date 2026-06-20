# VoltAnalytics – Technical Assessment

A high-performance, responsive full-stack sales analytics dashboard designed to process and visualize over 300,000+ sales records. Built to analyze sales metrics for California Burrito, this platform integrates interactive charts, smart filtering, secure JWT authentication, and dynamically loaded, custom rule-based AI business insights.

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black&style=flat-square)](#)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&style=flat-square)](#)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&style=flat-square)](#)
[![Express](https://img.shields.io/badge/Express-5.2-000000?logo=express&logoColor=white&style=flat-square)](#)
[![MySQL/TiDB](https://img.shields.io/badge/TiDB_Cloud-MySQL_8.0-00758F?logo=mysql&logoColor=white&style=flat-square)](#)
[![JWT](https://img.shields.io/badge/JWT-Authentication-black?logo=json-web-tokens&style=flat-square)](#)
[![Vercel](https://img.shields.io/badge/Vercel-Deployment-000000?logo=vercel&style=flat-square)](#)
[![Render](https://img.shields.io/badge/Render-Deployment-46E3B7?style=flat-square)](#)

---

## 🔗 Live Application

- **Frontend Application (Vercel):** [https://california-buritto-analytical-dashb.vercel.app](https://california-buritto-analytical-dashb.vercel.app)
- **Backend Service (Render):** [https://california-dashboard-api.onrender.com](https://california-dashboard-api.onrender.com)
- **Database (TiDB Cloud):** MySQL-Compatible Cloud Instance

---

## 📌 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture Decisions](#architecture-decisions)
3. [Data Processing Approach](#data-processing-approach)
4. [Database Design](#database-design)
5. [API Endpoints](#api-endpoints)
6. [Performance Optimizations](#performance-optimizations)
7. [Setup Instructions](#setup-instructions)
8. [Deployment Instructions](#deployment-instructions)
9. [Key Trade-offs](#key-trade-offs)
10. [Assumptions](#assumptions)
11. [Challenges Faced](#challenges-faced)
12. [Future Improvements](#future-improvements)
13. [Project Structure](#project-structure)
14. [Conclusion](#conclusion)

---

## 🏛️ Project Overview

The business problem solved by **VoltAnalytics** is the performance and usability bottleneck that occurs when analyzing large datasets. Businesses processing hundreds of thousands of retail transactions struggle to generate quick operational summaries (Revenue Trends, Brand performance, Outlet margins, and Settlement methods) without encountering slow loads or system crashes.

VoltAnalytics processes **300,000+ sales records** performantly. By moving aggregations to the database layer, implementing indexing, debouncing client inputs, and decoupling heavy background calculations (like AI Insights), it reduces dashboard update times from **45 seconds to sub-seconds (under 1 second)** on standard viewports.

### 🏗️ ASCII Architecture Diagram

```text
+---------------------------------------------------------------+
|                      CLIENT / FRONTEND                        |
|                       [React.js App]                          |
|             • Recharts Visualizations                         |
|             • Axios (With JWT Bearer Interceptors)            |
|             • Responsive UI (Tailwind CSS)                    |
|             • Deployed on: Vercel                             |
+-------------------------------|-------------------------------+
                                |
                                | HTTPS REST API Requests (JSON / JWT)
                                v
+---------------------------------------------------------------+
|                      SERVER / BACKEND                         |
|                     [Node.js + Express]                       |
|             • Token Verification Middleware                   |
|             • Parallel SQL Promise Execution                  |
|             • In-Memory Cache & Logging Middleware            |
|             • Deployed on: Render                             |
+-------------------------------|-------------------------------+
                                |
                                | SQL Connection Pooling (TCP Port 4000)
                                v
+---------------------------------------------------------------+
|                        DATABASE LAYER                         |
|                         [TiDB Cloud]                          |
|             • MySQL 8.0 Compatible Cloud DBMS                |
|             • Distributed Columnar/HTAP Architecture          |
|             • Configured B-Tree Indices                       |
+---------------------------------------------------------------+
```

---

## 💡 Architecture Decisions

- **React & Vite**: Chosen for a highly interactive SPA (Single Page Application) experience. React handles UI state transitions progressively (lazy loading chart widgets). Vite provides ultra-fast hot module replacement (HMR) and optimized build bundles.
- **Express.js (Node.js)**: Chosen for its non-blocking asynchronous event loop, enabling the backend to handle multiple concurrent analytics queries. Express's lightweight nature allows the database connection pooling to operate efficiently.
- **TiDB Cloud**: A distributed, serverless, MySQL-compatible database. It supports high concurrency and columnar scanning features, making it highly suited for analytics queries on large datasets without requiring complex Hadoop or Spark setups.
- **Why a Database over In-Memory Storage**: Storing 300,000+ transaction objects in memory on a single Node.js instance would consume excess RAM, block the single-threaded event loop during filter sorting, and reset all records upon backend crash/restart. SQL engines are natively optimized for indices and aggregate queries.
- **Decoupled Deployments (Vercel, Render, TiDB)**:
  - **Vercel** distributes static asset bundles globally via edge CDN networks, yielding fast load speeds.
  - **Render** runs the Node.js API runtime isolated from static server loads.
  - **TiDB Cloud** isolates the transactional and analytics storage tier, securing database passwords and access.

---

## ⚙️ Data Processing Approach

### 1. CSV Dataset Import Process
An ingestion runner [importExcel.js](file:///c:/Users/dushy/OneDrive/Desktop/California_Dashboard/backend/scripts/importExcel.js) parses the raw California Burrito sales records using the `xlsx` parsing library. To ensure scalability:
- Files are parsed into stream-like arrays.
- Records are processed in batches (5,000 records per transaction block) and inserted into the database.
- Text datetimes (e.g. `23/11/2024 14:35`) are reformatted to standard SQL `DATETIME` formats.

### 2. Handling 300,000+ Records
To prevent connection timeouts, the ingestion pipeline relies on transactional chunking. On the query side, the dashboard avoids fetching raw objects. Instead:
- Aggregations (`SUM`, `COUNT`, `GROUP BY`) are executed on the TiDB engine.
- Pagination is enforced on the table query (`GET /api/sales`), returning only 50 rows per page.

### 3. Database Indexing Strategy
To optimize dynamic query filters, standard secondary indexes were generated:
- Single-column indexes on `brand`, `outlet_name`, `settlement`, and `order_type`.
- A composite index on key filter dimensions to optimize multi-selection joins.

### 4. Date Optimization using `order_date` Column
Date string conversions at runtime (`STR_TO_DATE`) are highly expensive during table scans. During migration, the column `order_date` (derived from `order_datetime` as `YYYY-MM-DD`) was introduced, indexed, and query ranges are evaluated directly on this column:
```sql
CREATE INDEX idx_sales_date ON sales(order_date);
```

### 5. Aggregation and Analytics Workflow
When a filter changes, queries execute concurrently inside the database using `Promise.all`. The consolidated aggregates are returned to the client in a single response payload, eliminating round-trips.

---

## 🗄️ Database Design

### Sales Table Schema
The transactional database schema defines the following columns:

| Column Name | SQL Type | Key | Description |
| :--- | :--- | :--- | :--- |
| **billno** | `VARCHAR(100)` |  | Unique transactional identifier |
| **outlet_name** | `VARCHAR(255)` | `INDEX` | Name of the restaurant location |
| **order_datetime**| `VARCHAR(100)` |  | Raw timestamp format string |
| **order_date** | `DATE` | `INDEX` | Standardized date for range filtering |
| **group** | `VARCHAR(255)` | `INDEX` | Food category group (e.g. Burrito, Tacos) |
| **order_type** | `VARCHAR(100)` | `INDEX` | Order channel type (e.g. Dineout, Swiggy) |
| **item** | `VARCHAR(255)` |  | Specific menu item name |
| **price** | `DECIMAL(10,2)`|  | Unit selling price |
| **quantity** | `INT` |  | Units sold per transaction line |
| **settlement** | `VARCHAR(100)` | `INDEX` | Payment provider (e.g. SwiggyPay, Dineout) |
| **brand** | `VARCHAR(255)` | `INDEX` | Brand name franchise |

---

## 🔌 API Endpoints

### Authentication Endpoints
- **`POST /api/auth/register`**: Registers a new user. Includes email regex format validation and bcrypt password hashing (10 salt rounds).
- **`POST /api/auth/login`**: Authenticates users and returns a signed JSON Web Token (JWT).

### Analytics Endpoints (Protected by JWT Middleware)
- **`GET /api/dashboard-summary`**: Returns total KPIs (Revenue, Orders, Quantities, Averages) and consolidated datasets for all dashboard charts.
- **`GET /api/sales`**: Returns a paginated list of sales items. Supports sort orders, offsets, limit queries, and custom filters.
- **`GET /api/ai-insights`**: Generates rules-based strategic operational recommendations.
- **`GET /api/filter-options`**: Returns unique list options and date range limits to populate dropdown filters.

---

## ⚡ Performance Optimizations

1. **Decoupled AI Insights Engine**:
   - The heavy `/api/ai-insights` query is executed asynchronously on initial load and is not awaited in the main summary promise loop.
   - For filter modifications, `/api/ai-insights` is skipped. A manual **"Generate Insights"** button triggers the endpoint only when requested by the user, avoiding blocking the main charts.
2. **Database Indices**: Indexes on `brand`, `outlet_name`, `group`, `order_date`, and `settlement` ensure query scans take less than **250ms**.
3. **In-Memory Cache (TTL Caching)**:
   - Queries are cached in-memory with a **5-minute Time-To-Live (TTL)**.
   - Inflight queries are tracked to prevent duplicate concurrent queries from hitting the database (request deduplication).
4. **Client-Side Debouncing**: Filter inputs are debounced by **150ms** to prevent intermediate network queries while users make selections.
5. **Request Logging**: Middleware measures and logs exact execution times to standard console output:
   `[API LOG] GET /api/dashboard-summary - 200 - 415ms`

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18 or above)
- MySQL/TiDB Cloud credentials

### Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside `backend/`:
   ```env
   PORT=5000
   DB_HOST=your-tidb-cluster-uri
   DB_USER=your-database-username
   DB_PASSWORD=your-database-password
   DB_NAME=sales_db
   JWT_SECRET=your_jwt_secret_key
   ```
4. Run the Excel/CSV data import seed script (optional):
   ```bash
   npm run import-data
   ```
5. Start the API server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside `frontend/`:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🚀 Deployment Instructions

### 1. Frontend → Vercel
1. Connect your GitHub repository to Vercel.
2. Set Environment Variables: `VITE_API_URL=https://california-dashboard-api.onrender.com`.
3. Configure Build Settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Click **Deploy**.

### 2. Backend → Render
1. Connect repository to Render.
2. Select **Web Service** and choose root directory: `backend`.
3. Set environment variables matching the backend `.env`.
4. Configure Start Command: `npm start`.

### 3. Database → TiDB Cloud
1. Create a developer tier serverless database on TiDB Cloud.
2. Retrieve the host URI, username, and password.
3. Whitelist connection IPs or enable secure access certificates.
4. Execute SQL table migrations.

---

## ⚖️ Key Trade-offs

- **TiDB Cloud vs. Local MySQL**: TiDB Cloud offers horizontal scalability and distributed transactions out of the box, which is ideal for large analytical datasets. However, network latency between the backend server (Render) and TiDB Cloud (AWS region) can add 50-100ms compared to a local server.
- **Free-Tier Cold Starts (Render)**: Render free tier spins down backend web services after 15 minutes of inactivity. The initial load might take up to 50 seconds to boot the container, though performance is optimal once running.
- **Background Fetching vs. Real-Time Sync**: Decoupling the AI insights means they do not immediately reflect new filters on initial click. This is a deliberate trade-off to ensure a responsive UI, prioritizing interactive charts over compute-intensive metrics.

---

## 📝 Assumptions

1. **Read-Heavy Dashboard**: The dashboard is assumed to be read-heavy, with analytics updates happening infrequently relative to views. This justifies the 5-minute database query cache.
2. **Standard Date Format**: The dataset assumes all incoming transactions follow standard timezone metrics. The string date parsed is converted to a UTC date representation for index queries.

---

## 🚧 Challenges Faced

1. **Large Dataset Performance**: Fetching 300k records caused node memory limits to crash during pagination. Resolved by implementing database-side pagination (`LIMIT` / `OFFSET`) and aggregating values before transfer.
2. **Mobile Chart clipping**: Recharts Y-axis ticks often overflowed narrow phone viewports. Resolved by dynamically listening to resize states, shifting chart margins (`left: 25` on mobile), wrapping labels, and disabling pointer actions on hover panels.
3. **Double Initial API Hits**: React 19 double render effects triggered duplicate `/ai-insights` requests. Resolved by implementing a persistent reference ref (`hasLoadedAiRef`) to ensure initial background fetches only happen once.

---

## 🔮 Future Improvements

- **Role-Based Access Control (RBAC)**: Introduce administrator and manager roles to isolate excel database upload operations from standard view options.
- **Redis Caching**: Replace in-memory Map queries with Redis caching to support horizontal scaling on multiple API worker threads.
- **Predictive Analytics (Sales Forecasting)**: Integrate regression libraries or ML APIs to project next-month revenue trends.
- **Websockets for Live Streaming**: Integrate socket streams to push real-time transaction aggregates to cards without page refreshing.

---

## 📂 Project Structure

```text
Project/
├── backend/
│   ├── config/
│   │   ├── db.js             # TiDB Cloud Pool connection manager
│   │   └── initDb.js         # Tables schema verification
│   ├── middleware/
│   │   └── auth.js           # JWT validation logic
│   ├── routes/
│   │   ├── analytics.js      # Aggregation queries and AI logic
│   │   └── auth.js           # Login & Registration endpoints
│   ├── scripts/
│   │   └── importExcel.js    # Data ingestion seeder
│   ├── app.js                # App middlewares config (with Logger)
│   ├── server.js             # API Server runner
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Responsive charts, cards & navbar
│   │   ├── contexts/         # Authentication context
│   │   ├── hooks/            # useDashboardData (optimized state binder)
│   │   ├── pages/            # Dashboard view, Login & Registration
│   │   ├── utils/            # formatters & helpers
│   │   ├── App.jsx           # Protected routes config
│   │   └── main.jsx
│   ├── tailwind.config.js    # Customized dark theme color palette
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## 🏁 Conclusion

**VoltAnalytics** demonstrates a robust architecture for high-concurrency business intelligence applications. By optimizing database engines, decoupling heavy computation endpoints, implementing caching, and utilizing responsive design, it offers a performant analytics platform for processing large datasets on both desktop and mobile viewports.
