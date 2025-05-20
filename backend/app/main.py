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


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()

    # Log request details
    logger.info(f"Request started: {request.method} {request.url.path}")
    # logger.info(f"Request body: {await request.body()}")
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


@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()


app.include_router(api_router, prefix="/api")
print("HELLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLOOOOOOOOOOOOOOOOOOOOOOOOOOOOO")


@app.get("/")
async def root():
    return {"message": "Resume Match API is running and ready to go muah muah 😘😘😘😘😘😘"}
