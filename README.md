# 🚀 DataAgent AI — AI-Powered Data Analytics Platform

[![Status](https://img.shields.io/badge/Status-Complete%20MVP-success)]()
[![Backend](https://img.shields.io/badge/FastAPI-0.111.0-blue)]()
[![Frontend](https://img.shields.io/badge/React%2018-Vite%20%2B%20TypeScript-indigo)]()
[![Data%20Science](https://img.shields.io/badge/Engine-Pandas%20%7C%20NumPy%20%7C%20SciPy-emerald)]()

**DataAgent AI** is an AI-powered tabular analytics platform designed to bridge the gap between heavy Python data science workflows and business decision-makers. It enables users to upload datasets (CSV, XLSX, JSON), run deep automated profiling, explore data with server-side pagination, perform interactive data cleaning with live preview and reversible history, generate Plotly charts, perform rigorous statistical analysis, chat with an AI Analyst, and export executive PDF reports.

---

## 🌟 Core Product Experience

```
Upload Dataset / Try Demo Dataset
       │
       ▼
Profile Data (Overview, Memory, Missing %, Duplicates, Quality Score)
       │
       ▼
Explore Data (Server-side paginated grid, Search, Column Filters, Sorting)
       │
       ▼
Clean & Transform (Deduplication, Imputation, Dropping, Type Casting, Undo / Reset)
       │
       ▼
Analyze & Visualize (Interactive Plotly Charts, Correlations Heatmap, IQR Outliers)
       │
       ▼
Ask AI Analyst (Intent-routed queries, Pandas execution, Natural language insights)
       │
       ▼
Export Results (Cleaned CSV/XLSX/JSON & Professional Vector PDF Report)
```

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, GSAP, Lucide React, TanStack Query, Axios, Plotly.js.
- **Backend**: Python 3.10+, FastAPI, Uvicorn, Pandas, NumPy, SciPy, scikit-learn, OpenPyXL, ReportLab (PDF), PyMongo / Motor.
- **Database**: MongoDB (`mongodb://localhost:27017`) with transparent in-memory/JSON fallback if MongoDB is not running locally.
- **Security**: Zero `eval()` or arbitrary code execution; structured intent pipeline; 25MB file upload validation; path traversal prevention.
- **AI Engine**: Modular provider architecture supporting Google Gemini, OpenAI, or high-precision deterministic heuristic fallback when no API key is supplied.

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Python 3.10 or higher
- Node.js 18+ and npm
- (Optional) MongoDB running at `localhost:27017` (the platform operates smoothly with local file fallback if MongoDB is offline).

---

### 2. Backend Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. (Optional but recommended) Create virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Start the backend server
python run.py
```

The backend API will start on: **`http://127.0.0.1:8000`**
Interactive OpenAPI Docs: **`http://127.0.0.1:8000/docs`**

---

### 3. Frontend Setup

```bash
# 1. Open a second terminal and navigate to frontend directory
cd frontend

# 2. Install npm dependencies
npm install

# 3. Start Vite development server
npm run dev
```

The application dashboard will open on: **`http://localhost:5173`**

---

### 4. Running Backend Automated Tests

```bash
cd backend
pytest tests/
```

All 14 core functional tests verify:
- Valid CSV upload & parsing
- Malformed & executable file rejection
- Automated dataset profiling
- Missing-value calculations
- Duplicate-row detection
- Cleaning operations (preview, apply, undo, reset)
- Column data type validation
- Descriptive statistics & Tukey IQR outlier detection
- Pearson correlation matrix computation
- Plotly chart configuration validation
- AI Analyst deterministic fallback behavior
- Executive PDF report generation
- Dataset 404 handling & pagination bounds

---

## 🧠 Project Knowledge Base (`brain/`)

For AI assistants and contributors looking to understand or extend the platform, explore the `brain/` directory:
- [**`brain/README.md`**](./brain/README.md) — Knowledge base overview
- [**`brain/tech_stack.md`**](./brain/tech_stack.md) — Comprehensive technical stack specification
- [**`brain/architecture.md`**](./brain/architecture.md) — End-to-end data lifecycle & security boundaries
- [**`brain/api_spec.md`**](./brain/api_spec.md) — REST API endpoints & request/response contracts
- [**`brain/ai_system.md`**](./brain/ai_system.md) — Intent parsing & safe execution architecture
- [**`brain/future_roadmap.md`**](./brain/future_roadmap.md) — Enterprise roadmap & upcoming phases

---

---

## 🌐 Production Deployment Guide

### A. Backend Deployment (Render, Railway, Heroku, or Fly.io)

1. **Root Directory**: `backend` (or set Root Directory to `backend` in your cloud dashboard).
2. **Environment Variables**:
   ```ini
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/dataagent_ai?retryWrites=true&w=majority
   AI_API_KEY=your_gemini_api_key
   AI_PROVIDER=gemini
   AI_MODEL=gemini-1.5-flash
   FRONTEND_ORIGIN=https://your-frontend-app.vercel.app
   ```
3. **Build Command**:
   ```bash
   pip install -r requirements.txt
   ```
4. **Start Command**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
   *(A `Procfile` is pre-configured in `backend/Procfile` for platforms like Render and Heroku).*

---

### B. Frontend Deployment (Vercel, Netlify, or Cloudflare Pages)

1. **Root Directory**: `frontend`
2. **Framework Preset**: `Vite`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Environment Variables**:
   ```ini
   VITE_API_BASE_URL=https://your-backend-api.onrender.com/api
   ```
6. **SPA Routing**:
   - `frontend/vercel.json` and `frontend/public/_redirects` are already configured so page refreshes on subroutes (`/dashboard`, `/features`, etc.) work seamlessly without 404s.

---

## 🔒 Security & Privacy Guarantees
- **No `eval()` / arbitrary execution**: User queries and AI instructions are parsed into strictly bounded Pandas operations.
- **Local computation**: Tabular computations run in-process using optimized NumPy/Pandas vectorization.
- **Zero-Key Deterministic Mode**: Core analytics, chart builder, and data cleaning are 100% functional without an external AI key.

