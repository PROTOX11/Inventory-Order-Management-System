# Inventory & Order Management System

A full-stack **Inventory & Order Management System** built with a modern, production-grade stack — featuring a Flask REST API backend, PostgreSQL database modeling, multi-item order transaction validation, real-time dashboard analytics, and a premium clean UI.

---

## 🔗 Live Demo

|                             | Link                                                                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 🌐 **Frontend (Vercel)**    | [inventory-order-management-system-five-psi.vercel.app](https://inventory-order-management-system-five-psi.vercel.app/) |
| ⚙️ **Backend API (Render)** | [inventory-backend-latest-o4xj.onrender.com](https://inventory-backend-latest-o4xj.onrender.com/)                       |

---

## 📁 Project Structure

```
Inventory-Order-Management-System/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── customers.py
│   │   │   ├── dashboard.py
│   │   │   ├── orders.py
│   │   │   └── products.py
│   │   ├── __init__.py
│   │   ├── config.py
│   │   └── models.py
│   ├── run.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .dockerignore
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── index.js
    │   ├── components/
    │   │   ├── Modal.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── Spinner.jsx
    │   │   └── Toast.jsx
    │   ├── pages/
    │   │   ├── Customers.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Orders.jsx
    │   │   └── Products.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── Dockerfile
    ├── nginx.conf
    └── .dockerignore
```

---

## 🔐 Access Control

| Role  | Access Level                                                                            |
| ----- | --------------------------------------------------------------------------------------- |
| Admin | Full Access (Product catalog, CRM management, Order creation, Cancellation, & Deletion) |

---

## 🛠️ Tech Stack

| Layer            | Tech                                                 |
| ---------------- | ---------------------------------------------------- |
| Backend          | Python, Flask, Flask-SQLAlchemy                      |
| Database         | PostgreSQL 16                                        |
| Containerization | Docker, Docker Compose                               |
| Frontend         | React 18, Vite                                       |
| Styling          | Vanilla CSS (Premium harmonious dark-blue theme)     |
| Hosting          | Render (Backend), Vercel (Frontend), Neon (Database) |

---

## ✨ Features

- **Dashboard Overview** — Total products, total customers, total orders, total revenue metrics with dynamic low-stock alerts.
- **Product Catalog Management** — Create, read, update, and delete products, featuring SKU validation, stock level badges, and description text limits.
- **Customer CRM** — Add, view, and delete customers with email uniqueness checks and form validation.
- **Multi-Item Order Transactions** — Add multiple products in a single order, with real-time stock availability verification and backend-driven total calculation.
- **Transaction Cancelling & Deletion** — Cancel pending orders to automatically restore stock to original levels, or delete history records of completed orders.
- **Clean Responsive Layout** — Modern sidebar navigation, modal dialogs, and instant toast notifications with elegant animations.

---

## 🚀 Run Locally

### Prerequisites

Before running the project, make sure you have the following installed:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (For Docker deployment)
- [Python 3.9+](https://www.python.org/downloads/) (For local backend execution)
- [Node.js v18+](https://nodejs.org/) & `npm` (For local frontend execution)
- [PostgreSQL](https://www.postgresql.org/download/) (Optional, only if running DB locally without Docker)

---

### Method A: Running with Docker (Recommended & Easiest)

Docker automatically spins up the frontend, backend API, and a PostgreSQL database in isolated containers with zero local configuration required.

#### 1. Setup Environment Configuration

Clone the repository and copy the default environment variables from `.env.example`:

```bash
git clone https://github.com/PROTOX11/Inventory-Order-Management-System.git
cd Inventory-Order-Management-System
cp .env.example .env
```

_(The default parameters inside `.env` work out of the box for Docker.)_

#### 2. Launch the Stack

Run Docker Compose to build and start the services:

```bash
docker compose up --build
```

This command starts:

- **Database:** PostgreSQL on port `5432`
- **Backend:** Flask REST API on port `8000` (automatically runs database migrations/table creation)
- **Frontend:** React application served on port `80` (production build) or hot-reloading dev container

#### 3. Verify services

Once the console outputs show everything is running, visit the web interface at [http://localhost](http://localhost).

---

### Method B: Running Locally (Manual / Development Mode)

Use this method if you want to run the code locally with hot-reloading enabled for active development.

#### 1. Set Up Your Local PostgreSQL Database

1. Open your PostgreSQL tool (pgAdmin, psql, or terminal).
2. Create a database named `inventory_db`:
   ```sql
   CREATE DATABASE inventory_db;
   ```
3. Make sure your local credentials (username/password) match the `DATABASE_URL` in your `.env` file (e.g., `postgresql://postgres:postgres@localhost:5432/inventory_db`).

#### 2. Set Up the Backend REST API

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a Python virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   - **On Windows:**
     ```powershell
     .\venv\Scripts\activate
     ```
   - **On macOS/Linux:**
     ```bash
     source venv/bin/activate
     ```
4. Install all Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Launch the backend server:
   ```bash
   python run.py
   ```
   _(The app automatically verifies database connection and initializes tables on startup)._

#### 3. Set Up the Frontend React App

1. Open a new terminal tab/window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the node packages:
   ```bash
   npm install
   ```
3. Launch the development server:
   ```bash
   npm run dev
   ```

---

### 📍 Local Services Mapping

| Service                | Access Link                                                  | Description                           |
| ---------------------- | ------------------------------------------------------------ | ------------------------------------- |
| **Web UI (Docker)**    | [http://localhost](http://localhost)                         | Production Docker-Served Frontend     |
| **Web UI (Local Dev)** | [http://localhost:5173](http://localhost:5173)               | Vite Hot-Reloading Development Server |
| **Backend API**        | [http://localhost:8000](http://localhost:8000)               | Flask API Server Root                 |
| **API Health Check**   | [http://localhost:8000/health](http://localhost:8000/health) | System Health & Status Check Endpoint |

---

## 🌍 Environment Variables

**`backend/.env` (or project root `.env`)**

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/inventory_db"
SECRET_KEY="dev-secret-key-change-in-production"
PORT=8000
CORS_ORIGINS="http://localhost,http://localhost:5173"
```

**`frontend/.env`**

```env
VITE_API_BASE_URL="http://localhost:8000"
```

---

## 📡 API Response Format

**Success:**

```json
{
  "id": 1,
  "name": "Wireless Mouse",
  "sku": "WM-001",
  "price": 499.0,
  "stock_quantity": 25
}
```

**Error:**

```json
{
  "error": "A product with SKU 'WM-001' already exists"
}
```

---

## ☁️ Cloud Deployment

**Backend (Render via Docker Hub Registry + Neon PostgreSQL):**

1. Create a database on [neon.tech](https://neon.tech) and copy the connection string.
2. Link your Docker Hub account to [render.com](https://render.com).
3. Create a **New Web Service** and select **"Deploy an existing image from a registry"**.
4. Set the **Image URL** to your pushed backend tag (e.g. `prakash1142/inventory-backend:latest`).
5. Choose the **Free** instance type.
6. Configure the following environment variables under settings:
   - `DATABASE_URL` = _(Your Neon PostgreSQL connection string)_
   - `CORS_ORIGINS` = `https://inventory-order-management-system-five-psi.vercel.app`
   - `SECRET_KEY` = _(Your secure random token)_
   - `PORT` = `8000`

**Frontend (Vercel):**

1. Import the repository on [vercel.com](https://vercel.com).
2. Set the **Root Directory** to `frontend/`.
3. Set the Environment Variable:
   - `VITE_API_BASE_URL` = `https://inventory-backend-latest-o4xj.onrender.com`
4. Deploy the application.
   - _Note: SPA path routing rewrites to prevent Vercel 404 errors on direct navigation are automatically handled via [frontend/vercel.json](file:///c:/github_projects/Inventory-Order-Management-System/frontend/vercel.json)._
