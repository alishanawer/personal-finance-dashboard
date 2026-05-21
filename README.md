# Personal Finance Dashboard

A modern, production-ready web application for tracking personal finances, visualizing spending patterns, and managing budgets. Built with React (Vite) on the frontend and FastAPI + PostgreSQL on the backend.

> **Status:** ✅ Completed

---

## 🔹 Summary

- **Purpose:** Track income and expenses, manage categories and budgets, and surface insights with charts and reports.
- **Frontend:** React + Vite, Tailwind CSS, ShadCN UI
- **Backend:** FastAPI, PostgreSQL, Alembic migrations

---

## 🔹 Implemented Features

- **Authentication & Authorization** – secure signup and login flows.
- **Transactions** – create, read, update, and delete income/expense entries.
- **Categories** – manage categories with color and icon support and unique names.
- **Dashboard** – overview with balances, recent transactions, and quick stats.
- **Data Visualization** – category breakdown and monthly trend charts.
- **User Settings & Preferences** – display currency, notification preferences, and theme.
- **Reports** – view downloadable reports and summaries.
- **Responsive UI** – works across desktop and mobile screens.
- **API Documentation** – FastAPI OpenAPI docs available when the backend is running at `/docs`.

---

## 🔹 Installation & Local Setup

Follow these steps to run the project locally.

1. Clone the repository

```bash
git clone https://github.com/alishanawer/personal-finance-dashboard.git
cd personal-finance-dashboard
```

2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend dev server defaults to `http://localhost:5173`.

3. Backend

```bash
cd ../backend
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

4. Database

Ensure PostgreSQL is installed and running. Create a database (example: `finance_db`) and add a `.env` in `backend/` with at least:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/finance_db
SECRET_KEY=your_secret_key
```

Run migrations (Alembic):

```bash
alembic upgrade head
```

5. Run backend

```bash
uvicorn app.main:app --reload
```

Backend will be available at `http://localhost:8000` and API docs at `http://localhost:8000/docs`.

---

## 🔹 Production / Deployment Notes

- Build frontend for production: `npm run build` in `frontend/` and serve the static assets with your preferred static server (or integrate into a Docker image).
- Serve the backend with Uvicorn/Gunicorn behind a reverse proxy (NGINX). Configure environment variables and a managed Postgres instance for production.
- Consider using `docker` for a reproducible deployment: build separate services for frontend and backend and a managed Postgres service.

---

## 🔹 Contributing

This repository is in a completed state. Contributions, bug reports, and small improvements are welcome — open a PR or issue.

---

## 🔹 License

MIT License

---

If you'd like, I can also:

- add a `RELEASE.md` or changelog entry summarizing the final features
- create a small `deploy` guide or Docker Compose setup
