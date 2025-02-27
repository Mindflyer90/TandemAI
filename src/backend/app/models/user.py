from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class ProficiencyLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    FLUENT = "fluent"

class Language(str, Enum):
    ENGLISH = "english"
    FRENCH = "french"
    GERMAN = "german"
    ITALIAN = "italian"
    SPANISH = "spanish"

class User(BaseModel):
    id: str
    name: str
    native_language: Language
    target_language: Language
    proficiency_level: ProficiencyLevel
    interests: List[str]
    avatar: Optional[str] = None
    
    class Config:
        schema_extra = {
            "example": {
                "id": "user1",
                "name": "John Doe",
                "native_language": "english",
                "target_language": "french",
                "proficiency_level": "intermediate",
                "interests": ["travel", "cooking", "movies"],
                "avatar": "avatar1.png"
            }
        } 