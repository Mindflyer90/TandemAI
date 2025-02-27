from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from enum import Enum
from .user import Language

class ExerciseType(str, Enum):
    FLASHCARD = "flashcard"
    QUIZ = "quiz"
    CONVERSATION = "conversation"
    PRONUNCIATION = "pronunciation"

class ExerciseStatus(str, Enum):
    NEW = "new"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class FlashcardItem(BaseModel):
    term: str
    definition: str
    example: Optional[str] = None
    image_url: Optional[str] = None

class QuizItem(BaseModel):
    question: str
    options: List[str]
    correct_answer: int
    explanation: Optional[str] = None

class ConversationPrompt(BaseModel):
    prompt: str
    context: Optional[str] = None
    suggested_vocabulary: Optional[List[str]] = None

class PronunciationItem(BaseModel):
    phrase: str
    audio_url: Optional[str] = None
    phonetic_spelling: Optional[str] = None
    difficulty: Optional[str] = None

class Exercise(BaseModel):
    id: str
    title: str
    description: str
    type: ExerciseType
    language: Language
    difficulty: str
    content: Dict[str, Any]
    status: ExerciseStatus = ExerciseStatus.NEW
    
    class Config:
        schema_extra = {
            "example": {
                "id": "ex1",
                "title": "Basic French Greetings",
                "description": "Learn common French greetings",
                "type": "flashcard",
                "language": "french",
                "difficulty": "beginner",
                "content": {
                    "items": [
                        {"term": "Bonjour", "definition": "Hello", "example": "Bonjour, comment allez-vous?"}
                    ]
                },
                "status": "new"
            }
        } 