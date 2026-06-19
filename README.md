# Business Analytics Dashboard

## Overview

A full-stack analytics dashboard built using:

* React
* Node.js
* Express
* MySQL

The application provides real-time sales aggregations, KPI tracking, AI-powered business insights, data export functionality, and secure JWT authentication. It is optimized to performantly query and render hundreds of thousands of records.

---

## Features

* **KPI Dashboard**: Real-time sales, order volume, average order values, and category performance tracking.
* **Revenue Analytics**: Comprehensive visual trend charts built with Recharts, optimized for responsive reflows.
* **Advanced Filtering**: Categorical multi-select filters (Brand, Outlet, Category, Settlement, Order Type) with server-side queries.
* **AI Business Insights**: Dynamic business insights and actionable suggestions compiled on actual sales analytics.
* **Export CSV & Excel**: Full or filtered dataset export supporting active search queries and filter bounds.
* **Authentication**: Complete user registration (with email format verification) and secure JWT-based login.
* **Responsive Design**: Premium dark theme dashboard interface fully optimized for mobile, tablet, and desktop viewports.
* **Server-side Pagination**: High-performance virtualized data table rendering up to 300,000+ rows seamlessly.
* **Performance Optimizations**: Debounced search controls, request promise deduplication, and in-memory API caching (5-minute TTL).

---

## Tech Stack

**Frontend:**
* React (Vite)
* Tailwind CSS
* Recharts
* Axios

**Backend:**
* Node.js
* Express.js

**Database:**
* MySQL

**Authentication:**
* JWT (JSON Web Tokens)
* bcrypt (Password Hashing)

---

## Setup Instructions

### 1. Database Setup

1. Make sure you have a MySQL server installed and running.
2. Create a new database named `sales_db`:
   ```sql
   CREATE DATABASE sales_db;
   ```
3. The backend is configured to automatically check and initialize the tables (`sales` and `users`) and their corresponding indexes on startup. You can import your sales spreadsheet using the importing script.

### 2. Environment Variables

Create a `.env` file in the `backend/` directory:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_DATABASE_PASSWORD
DB_NAME=sales_db
PORT=5000
JWT_SECRET=YOUR_JWT_SECRET_KEY
```

> [!WARNING]
> Never commit `.env` files to git. These files are ignored by default in the project configuration.

### 3. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the database seed/import script (if seeding from Excel sheets):
   ```bash
   npm run import-data
   ```

### 4. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### 5. Running Locally

#### Start the Backend Server:
```bash
cd backend
npm start
```
The server will start on [http://localhost:5000](http://localhost:5000) and run database schema checks.

#### Start the Frontend Dev Server:
```bash
cd frontend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Deployment

### Frontend → Vercel
1. Configure Vite to use the production URL for the backend API by updating `API_BASE` in the frontend hooks/configurations (using environment variables).
2. Connect your GitHub repository to Vercel.
3. Configure build commands:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Deploy the project.

### Backend → Railway / Render
1. Connect your repository to Render or Railway.
2. Set the root directory to `backend`.
3. Configure the environment variables in the host control panel matching `backend/.env`.
4. Set start command: `npm start`.

### Database → Railway MySQL
1. Spin up a MySQL instance on Railway.
2. Export your local MySQL schema/data and import it into the Railway MySQL instance.
3. Update the `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` environment variables in your backend hosting service to point to the remote database connection string.
