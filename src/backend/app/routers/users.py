from fastapi import APIRouter, HTTPException, Depends
from typing import List
import uuid
from ..models.user import User, Language, ProficiencyLevel
from ..services.storage_service import StorageService

router = APIRouter(prefix="/users", tags=["users"])

def get_storage_service():
    return StorageService()

@router.get("/", response_model=List[User])
async def get_all_users(storage: StorageService = Depends(get_storage_service)):
    """Get all users"""
    return storage.get_all_items("users", User)

@router.get("/{user_id}", response_model=User)
async def get_user(user_id: str, storage: StorageService = Depends(get_storage_service)):
    """Get a user by ID"""
    user = storage.get_item("users", user_id, User)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/", response_model=User)
async def create_user(user: User, storage: StorageService = Depends(get_storage_service)):
    """Create a new user"""
    if not user.id:
        user.id = f"user-{uuid.uuid4().hex[:8]}"
    storage.save_item("users", user)
    return user

@router.put("/{user_id}", response_model=User)
async def update_user(user_id: str, user: User, storage: StorageService = Depends(get_storage_service)):
    """Update a user"""
    existing_user = storage.get_item("users", user_id, User)
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.id = user_id
    storage.save_item("users", user)
    return user

@router.delete("/{user_id}")
async def delete_user(user_id: str, storage: StorageService = Depends(get_storage_service)):
    """Delete a user"""
    success = storage.delete_item("users", user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"} 