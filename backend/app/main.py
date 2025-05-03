from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api import api_router
from loguru import logger
import time
from app.db import connect_to_mongo, close_mongo_connection


app = FastAPI(
    title="Resume Match API",
    description="API for matching resumes with job descriptions",
    version="1.0.0",
)

# Configure CORS to allow requests from the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request logging middleware


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()

    # Log request details
    logger.info(f"Request started: {request.method} {request.url.path}")
    logger.info(f"Request body: {await request.body()}")
    logger.info(f"Request headers: {request.headers}")

    # Process the request
    response = await call_next(request)

    # Calculate processing time
    process_time = time.time() - start_time
    logger.info(
        f"Request completed: {request.method} {request.url.path} - Status: {response.status_code} - Time: {process_time:.4f}s")

    return response

# Connect to MongoDB on startup


@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

# Close MongoDB connection on shutdown


@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# Include API routes
app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Resume Match API is running"}
