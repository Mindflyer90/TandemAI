from fastapi import APIRouter, HTTPException, Depends
from typing import List
from ..models.progress import UserProgress
from ..models.exercise import Exercise
from ..services.storage_service import StorageService
from ..services.progress_service import ProgressService
from ..services.exercise_service import ExerciseService

router = APIRouter(prefix="/progress", tags=["progress"])

def get_storage_service():
    return StorageService()

def get_progress_service(
    storage: StorageService = Depends(get_storage_service)
):
    return ProgressService(storage)

def get_exercise_service(
    storage: StorageService = Depends(get_storage_service),
    llm_service = Depends(lambda: None)  # Placeholder for dependency
):
    return ExerciseService(storage, llm_service)

@router.get("/{user_id}", response_model=UserProgress)
async def get_user_progress(
    user_id: str,
    progress_service: ProgressService = Depends(get_progress_service)
):
    """Get progress for a user"""
    return progress_service.get_user_progress(user_id)

@router.post("/{user_id}/complete-exercise/{exercise_id}", response_model=UserProgress)
async def complete_exercise(
    user_id: str,
    exercise_id: str,
    progress_service: ProgressService = Depends(get_progress_service),
    exercise_service: ExerciseService = Depends(get_exercise_service)
):
    """Mark an exercise as completed for a user"""
    exercise = exercise_service.get_exercise(exercise_id)
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    
    updated_progress = progress_service.complete_exercise(user_id, exercise)
    return updated_progress

@router.post("/{user_id}/update-streak", response_model=UserProgress)
async def update_user_streak(
    user_id: str,
    progress_service: ProgressService = Depends(get_progress_service)
):
    """Update the streak for a user"""
    return progress_service.update_streak(user_id) 