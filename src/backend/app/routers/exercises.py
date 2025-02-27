from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from ..models.exercise import Exercise, ExerciseType, ExerciseStatus
from ..models.user import User, Language
from ..services.storage_service import StorageService
from ..services.exercise_service import ExerciseService
from ..services.llm_service import LLMService

router = APIRouter(prefix="/exercises", tags=["exercises"])

def get_storage_service():
    return StorageService()

def get_llm_service():
    # In a real app, these would be loaded from environment variables
    return LLMService(openai_api_key="sk-dummy", gemini_api_key="ai-dummy")

def get_exercise_service(
    storage: StorageService = Depends(get_storage_service),
    llm_service: LLMService = Depends(get_llm_service)
):
    return ExerciseService(storage, llm_service)

@router.get("/", response_model=List[Exercise])
async def get_exercises(
    language: Optional[str] = None,
    type: Optional[str] = None,
    status: Optional[str] = None,
    storage: StorageService = Depends(get_storage_service)
):
    """Get exercises with optional filters"""
    exercises = storage.get_all_items("exercises", Exercise)
    
    # Apply filters
    if language:
        exercises = [ex for ex in exercises if ex.language == language]
    if type:
        exercises = [ex for ex in exercises if ex.type == type]
    if status:
        exercises = [ex for ex in exercises if ex.status == status]
    
    return exercises

@router.get("/{exercise_id}", response_model=Exercise)
async def get_exercise(
    exercise_id: str,
    exercise_service: ExerciseService = Depends(get_exercise_service)
):
    """Get an exercise by ID"""
    exercise = exercise_service.get_exercise(exercise_id)
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return exercise

@router.post("/generate", response_model=List[Exercise])
async def generate_exercises(
    user_id: str, 
    partner_id: str,
    count: int = Query(3, ge=1, le=10),
    exercise_service: ExerciseService = Depends(get_exercise_service),
    storage: StorageService = Depends(get_storage_service)
):
    """Generate new exercises for a user and their tandem partner"""
    user = storage.get_item("users", user_id, User)
    partner = storage.get_item("users", partner_id, User)
    
    if not user or not partner:
        raise HTTPException(status_code=404, detail="User or partner not found")
    
    exercises = exercise_service.generate_exercises(user, partner, count)
    return exercises

@router.put("/{exercise_id}/status", response_model=Exercise)
async def update_exercise_status(
    exercise_id: str,
    status: ExerciseStatus,
    exercise_service: ExerciseService = Depends(get_exercise_service)
):
    """Update the status of an exercise"""
    try:
        updated_exercise = exercise_service.update_exercise_status(exercise_id, status)
        return updated_exercise
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) 