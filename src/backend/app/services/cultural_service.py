from typing import List, Optional
import uuid
from .storage_service import StorageService
from .llm_service import LLMService
from ..models.cultural import CulturalNote, Idiom, CulturalFunFact
from ..models.user import Language

class CulturalService:
    """Service to handle cultural learning content"""
    
    def __init__(self, storage: StorageService, llm_service: LLMService):
        self.storage = storage
        self.llm_service = llm_service
    
    def get_cultural_note(self, note_id: str) -> Optional[CulturalNote]:
        """Get a cultural note by id"""
        return self.storage.get_item("cultural_notes", note_id, CulturalNote)
    
    def get_cultural_notes_by_language(self, language: Language) -> List[CulturalNote]:
        """Get cultural notes for a specific language"""
        return self.storage.query_items(
            "cultural_notes",
            CulturalNote,
            lambda note: note.language == language
        )
    
    def get_idiom(self, idiom_id: str) -> Optional[Idiom]:
        """Get an idiom by id"""
        return self.storage.get_item("idioms", idiom_id, Idiom)
    
    def get_idioms_by_language(self, language: Language) -> List[Idiom]:
        """Get idioms for a specific language"""
        return self.storage.query_items(
            "idioms",
            Idiom,
            lambda idiom: idiom.language == language
        )
    
    def get_fun_fact(self, fact_id: str) -> Optional[CulturalFunFact]:
        """Get a cultural fun fact by id"""
        return self.storage.get_item("fun_facts", fact_id, CulturalFunFact)
    
    def get_fun_facts_by_language(self, language: Language) -> List[CulturalFunFact]:
        """Get cultural fun facts for a specific language"""
        return self.storage.query_items(
            "fun_facts",
            CulturalFunFact,
            lambda fact: fact.language == language
        )
    
    def generate_cultural_content(self, language: Language) -> dict:
        """Generate cultural content for a language"""
        # Generate Cultural Note
        note_prompt = f"""
        Generate a cultural note about {language} language countries. Include:
        - A title for the cultural note
        - Main content (200-300 words)
        - 5 related vocabulary words
        
        Return as JSON in this format:
        {{
            "title": "Cultural note title",
            "content": "Main content...",
            "related_vocabulary": ["word1", "word2", "word3", "word4", "word5"]
        }}
        """
        
        note_response = self.llm_service.call_openai_llm([
            {"role": "system", "content": "You are a cultural expert for language learning"},
            {"role": "user", "content": note_prompt}
        ])
        
        # Generate Idiom
        idiom_prompt = f"""
        Generate an interesting idiom in {language}. Include:
        - The original phrase in {language}
        - Literal translation to English
        - Actual meaning
        - An example of usage in context
        - Equivalent idioms in other languages if any
        
        Return as JSON in this format:
        {{
            "original_phrase": "idiom in original language",
            "literal_translation": "word-for-word translation",
            "meaning": "what it actually means",
            "example_usage": "example sentence using the idiom",
            "equivalent_idioms": [
                {{"language": "english", "phrase": "equivalent english idiom"}}
            ]
        }}
        """
        
        idiom_response = self.llm_service.call_gemini_flash(idiom_prompt)
        
        # Generate Fun Fact
        fact_prompt = f"""
        Generate an interesting cultural fun fact about {language}-speaking countries. Include:
        - A catchy title
        - The fun fact content (100-150 words)
        
        Return as JSON in this format:
        {{
            "title": "Fun fact title",
            "content": "Fun fact content..."
        }}
        """
        
        fact_response = self.llm_service.call_gemini_flash(fact_prompt)
        
        # Process and store the generated content
        import json
        
        # Cultural Note
        note_data = json.loads(note_response)
        note = CulturalNote(
            id=f"note-{uuid.uuid4().hex[:8]}",
            language=language,
            title=note_data.get("title", f"Cultural Note about {language.capitalize()}"),
            content=note_data.get("content", ""),
            related_vocabulary=note_data.get("related_vocabulary", [])
        )
        self.storage.save_item("cultural_notes", note)
        
        # Idiom
        idiom_data = json.loads(idiom_response)
        idiom = Idiom(
            id=f"idiom-{uuid.uuid4().hex[:8]}",
            language=language,
            original_phrase=idiom_data.get("original_phrase", ""),
            literal_translation=idiom_data.get("literal_translation", ""),
            meaning=idiom_data.get("meaning", ""),
            example_usage=idiom_data.get("example_usage", ""),
            equivalent_idioms=idiom_data.get("equivalent_idioms", [])
        )
        self.storage.save_item("idioms", idiom)
        
        # Fun Fact
        fact_data = json.loads(fact_response)
        fun_fact = CulturalFunFact(
            id=f"fact-{uuid.uuid4().hex[:8]}",
            language=language,
            title=fact_data.get("title", f"Fun Fact about {language.capitalize()}"),
            content=fact_data.get("content", "")
        )
        self.storage.save_item("fun_facts", fun_fact)
        
        return {
            "note": note,
            "idiom": idiom,
            "fun_fact": fun_fact
        } 