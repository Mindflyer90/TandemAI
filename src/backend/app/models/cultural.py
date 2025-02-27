from pydantic import BaseModel
from typing import Optional, List
from .user import Language

class CulturalNote(BaseModel):
    id: str
    language: Language
    title: str
    content: str
    related_vocabulary: Optional[List[str]] = None
    image_url: Optional[str] = None

class Idiom(BaseModel):
    id: str
    language: Language
    original_phrase: str
    literal_translation: str
    meaning: str
    example_usage: str
    equivalent_idioms: Optional[List[dict]] = None

class CulturalFunFact(BaseModel):
    id: str
    language: Language
    title: str
    content: str
    image_url: Optional[str] = None 