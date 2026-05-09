# Personal Finance Dashboard

A modern web application for tracking personal finances, visualizing spending patterns, and managing budgets.  
Built with **React (Vite)**, **Tailwind CSS**, **ShadCN UI**, **FastAPI**, and **PostgreSQL**.  

> **Status:** 🚧 Under Development

---

## 🔹 Features (Planned)

- **Authentication & Authorization** – secure sign-up, and login.
- **Expense Tracking** – log and categorize income & expenses.  
- **Data Visualization** – interactive charts & insights for spending habits, categories, and trends.  
- **Dashboard Overview** – quick glance at balances, budgets, and recent activity.  
- **User Profile & Preferences** – customizable settings, currency support, etc.  
- **Goals & Budgets (Future)** – set savings goals and track budget progress.  

---

## 🔹 Tech Stack

**Frontend:** [React JS](https://react.dev/) + [Vite](https://vite.dev/), [Tailwind CSS](https://tailwindcss.com/), [ShadCN UI](https://ui.shadcn.com/).  
**Backend:** [FastAPI](https://fastapi.tiangolo.com/), [PostgreSQL](https://www.postgresql.org/)  

---

## 🔹 Installation & Setup (Dev)

Follow these steps to run the project locally:

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/alishanawer/personal-finance-dashboard.git
```
```bash
cd personal-finance-dashboard
```

### 2️⃣ Frontend Setup
```bash
cd frontend
```
```bash
npm install
```
```bash
npm run dev
```
Your frontend should now be running on `http://localhost:5173`

### 3️⃣ Backend Setup
```bash
cd ../backend
```
- Use Python 3.11 or 3.12 (psycopg2-binary wheels are not available for Python 3.14 yet):
- Create virtual environment:
```bash
python3.12 -m venv venv
```
- Activate virtual environment:
```bash
source venv/bin/activate   # On Linux/Mac
```
```bash
venv\Scripts\activate      # On Windows
```
- Install dependencies:
```bash
pip install -r requirements.txt
```

### 4️⃣ Database Configuration

This project uses PostgreSQL.

1. Make sure `PostgreSQL` is installed and running locally.
2. Create a new database, e.g. `finance_db`.
3. Update your `.env` file with your own database credentials:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/finance_db
SECRET_KEY=your_secret_key
```
⚠️ You’ll need to create your own `.env` file in the `backend/` folder (not committed to GitHub).

### 5️⃣ Run Backend Server
```bash
uvicorn app.main:app --reload
```
Backend should now be running on `http://localhost:8000`

---

## 🔹 License

This project is licensed under the `MIT License`.
