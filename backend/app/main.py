from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

# Import routers
from app.api.colleges import router as colleges_router
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.rides import router as rides_router
from app.api.pitstops import router as pitstops_router
from app.api.ratings import router as ratings_router

# Initialize FastAPI app
app = FastAPI(
    title="RidePals.ai API",
    description="Backend API for the RidePals.ai college ridesharing platform",
    version="0.1.0",
)

# Configure CORS
origins = [
    "http://localhost",
    "http://localhost:3000",  # Next.js frontend
    "https://ridepals.ai",    # Production domain
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Type", "Authorization"],
)

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to RidePals.ai API",
        "documentation": "/docs",
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    # In a production environment, we would check database connectivity,
    # external service dependencies, etc.
    return {"status": "healthy"}

# Include routers
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(users_router, prefix="/users", tags=["Users"])
app.include_router(colleges_router, prefix="/colleges", tags=["Colleges"])
app.include_router(rides_router, prefix="/rides", tags=["Rides"])
app.include_router(pitstops_router, prefix="/pitstops", tags=["Pit Stops"])
app.include_router(ratings_router, prefix="/ratings", tags=["Ratings"])

# Logger configuration
logger.add("logs/app.log", rotation="10 MB", level="INFO")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True) 