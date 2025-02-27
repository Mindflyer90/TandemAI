from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class Achievement(BaseModel):
    id: str
    title: str
    description: str
    icon: str
    date_earned: datetime

class UserProgress(BaseModel):
    user_id: str
    points: int = 0
    streak: int = 0
    last_activity_date: Optional[datetime] = None
    completed_exercises: List[str] = []
    achievements: List[Achievement] = []
    language_stats: Dict[str, Dict[str, int]] = {}
    
    class Config:
        schema_extra = {
            "example": {
                "user_id": "user1",
                "points": 250,
                "streak": 5,
                "last_activity_date": "2023-06-15T14:30:00",
                "completed_exercises": ["ex1", "ex2"],
                "achievements": [
                    {
                        "id": "ach1",
                        "title": "First Steps",
                        "description": "Complete your first exercise",
                        "icon": "medal.png",
                        "date_earned": "2023-06-10T12:00:00"
                    }
                ],
                "language_stats": {
                    "french": {
                        "vocabulary": 50,
                        "grammar": 30,
                        "listening": 20
                    }
                }
            }
        } 