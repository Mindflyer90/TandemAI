from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from ..models.cultural import CulturalNote, Idiom, CulturalFunFact
from ..models.user import Language
from ..services.storage_service import StorageService
from ..services.cultural_service import CulturalService
from ..services.llm_service import LLMService
import os

router = APIRouter(prefix="/cultural", tags=["cultural"])

def get_storage_service():
    return StorageService()

def get_llm_service():
    return LLMService(
        openai_api_key=os.environ.get("OPENAI_API_KEY"),
        gemini_api_key=os.environ.get("GEMINI_API_KEY")
    )

def get_cultural_service(
    storage: StorageService = Depends(get_storage_service),
    llm_service: LLMService = Depends(get_llm_service)
):
    return CulturalService(storage, llm_service)

@router.get("/notes/{language}", response_model=List[CulturalNote])
async def get_cultural_notes(
    language: Language,
    cultural_service: CulturalService = Depends(get_cultural_service)
):
    """Get cultural notes for a specific language"""
    return cultural_service.get_cultural_notes_by_language(language)

@router.get("/notes/detail/{note_id}", response_model=CulturalNote)
async def get_cultural_note(
    note_id: str,
    cultural_service: CulturalService = Depends(get_cultural_service)
):
    """Get a cultural note by ID"""
    note = cultural_service.get_cultural_note(note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Cultural note not found")
    return note

@router.get("/idioms/{language}", response_model=List[Idiom])
async def get_idioms(
    language: Language,
    cultural_service: CulturalService = Depends(get_cultural_service)
):
    """Get idioms for a specific language"""
    return cultural_service.get_idioms_by_language(language)

@router.get("/idioms/detail/{idiom_id}", response_model=Idiom)
async def get_idiom(
    idiom_id: str,
    cultural_service: CulturalService = Depends(get_cultural_service)
):
    """Get an idiom by ID"""
    idiom = cultural_service.get_idiom(idiom_id)
    if not idiom:
        raise HTTPException(status_code=404, detail="Idiom not found")
    return idiom

@router.get("/fun-facts/{language}", response_model=List[CulturalFunFact])
async def get_fun_facts(
    language: Language,
    cultural_service: CulturalService = Depends(get_cultural_service)
):
    """Get cultural fun facts for a specific language"""
    return cultural_service.get_fun_facts_by_language(language)

@router.get("/fun-facts/detail/{fact_id}", response_model=CulturalFunFact)
async def get_fun_fact(
    fact_id: str,
    cultural_service: CulturalService = Depends(get_cultural_service)
):
    """Get a cultural fun fact by ID"""
    fact = cultural_service.get_fun_fact(fact_id)
    if not fact:
        raise HTTPException(status_code=404, detail="Fun fact not found")
    return fact

@router.post("/generate/{language}", response_model=Dict[str, Any])
async def generate_cultural_content(
    language: Language,
    cultural_service: CulturalService = Depends(get_cultural_service)
):
    """Generate new cultural content for a language"""
    return cultural_service.generate_cultural_content(language) 