# Expense Tracker Web Application

A complete, production-ready expense tracking application built with React, TypeScript, FastAPI, and PostgreSQL. Features a modern, attractive UI for personal finance management.

## Features

- **User Authentication**: JWT-based login and registration
- **Dashboard**: Overview with charts and statistics
- **Expense Management**: Add, edit, delete, and filter expenses
- **Reports**: Monthly reports with charts and export options
- **Notifications**: In-app notifications and alerts
- **Profile Management**: Update budget and settings
- **Responsive Design**: Works on desktop and tablet

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS + Headless UI + Chart.js
- **Backend**: Python FastAPI + SQLAlchemy + Alembic
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Icons**: HeroIcons

## Project Structure

```
ExpenseTracker/
├── frontend/          # React application
├── backend/           # FastAPI application
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- PostgreSQL
- Git

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd ExpenseTracker/backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # On Windows
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   Create a `.env` file in the backend directory with:
   ```
   DATABASE_URL=postgresql://username:password@localhost/expense_tracker
   SECRET_KEY=your-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

5. Set up the database:
   ```bash
   alembic upgrade head
   ```

6. Run the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ExpenseTracker/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

### Database Setup

1. Install PostgreSQL
2. Create a database named `expense_tracker`
3. Update the `DATABASE_URL` in the `.env` file with your credentials

## API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for the FastAPI interactive documentation.

## Usage

1. Register a new account or login
2. Set your monthly budget in the profile
3. Add expenses with categories
4. View analytics on the dashboard
5. Generate monthly reports
6. Receive notifications for budget alerts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

This project is licensed under the MIT License.