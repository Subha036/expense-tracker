import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from .routes import auth, expenses, reports, notifications

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="Expense Tracker API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5175", "http://127.0.0.1:5173", "http://127.0.0.1:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ PREFIX ONLY HERE
app.include_router(auth.router, prefix="/auth")
app.include_router(expenses.router, prefix="/expenses")
app.include_router(reports.router, prefix="/reports")
app.include_router(notifications.router, prefix="/notifications")


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "message": "Validation error"},
    )


@app.get("/")
def root():
    return {"message": "Expense Tracker API", "version": "1.0.0"}
