from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import api_router

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

# Include API routes
app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Resume Match API is running"}
