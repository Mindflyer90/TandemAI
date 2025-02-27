from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import os
from .routers import users, exercises, progress, cultural

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

# Create data directory if it doesn't exist
os.makedirs("data", exist_ok=True)

# Initialize FastAPI app
app = FastAPI(
    title="Language Tandem App",
    description="API for language tandem learning application",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, this should be restricted
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router)
app.include_router(exercises.router)
app.include_router(progress.router)
app.include_router(cultural.router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to the Language Tandem API",
        "docs": "/docs",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True) 