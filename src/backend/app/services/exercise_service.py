from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime
from .storage_service import StorageService
from .llm_service import LLMService
from ..models.exercise import (
    Exercise, ExerciseType, ExerciseStatus,
    FlashcardItem, QuizItem, ConversationPrompt, PronunciationItem
)
from ..models.user import User, Language, ProficiencyLevel

class ExerciseService:
    """Service to handle exercise generation and management"""
    
    def __init__(self, storage: StorageService, llm_service: LLMService):
        self.storage = storage
        self.llm_service = llm_service
    
    def get_exercise(self, exercise_id: str) -> Optional[Exercise]:
        """Get an exercise by id"""
        return self.storage.get_item("exercises", exercise_id, Exercise)
    
    def get_exercises_for_user(self, user: User) -> List[Exercise]:
        """Get exercises for a specific user based on their target language and level"""
        exercises = self.storage.query_items(
            "exercises", 
            Exercise,
            lambda ex: ex.language == user.target_language
        )
        return exercises
    
    def _generate_flashcard_exercise(self, user: User, topic: str) -> Exercise:
        """Generate a flashcard exercise using LLM"""
        prompt = f"""
        Generate a set of 5 flashcards for learning {user.target_language} at {user.proficiency_level} level.
        Topic: {topic}
        Format each flashcard with:
        - term (in {user.target_language})
        - definition (in {user.native_language})
        - example sentence (in {user.target_language})
        
        Return as JSON in this format:
        {{
            "title": "Flashcard exercise title",
            "items": [
                {{"term": "word1", "definition": "definition1", "example": "example1"}},
                ...
            ]
        }}
        """
        
        response = self.llm_service.call_openai_llm([
            {"role": "system", "content": "You are a language learning assistant"},
            {"role": "user", "content": prompt}
        ])
        
        # Assume the response is valid JSON
        import json
        content = json.loads(response)
        
        exercise_id = f"ex-{uuid.uuid4().hex[:8]}"
        
        return Exercise(
            id=exercise_id,
            title=content.get("title", f"{user.target_language.capitalize()} Flashcards: {topic}"),
            description=f"Practice {user.target_language} vocabulary about {topic}",
            type=ExerciseType.FLASHCARD,
            language=user.target_language,
            difficulty=user.proficiency_level,
            content={"items": content.get("items", [])},
            status=ExerciseStatus.NEW
        )
    
    def _generate_quiz_exercise(self, user: User, topic: str) -> Exercise:
        """Generate a quiz exercise using LLM"""
        prompt = f"""
        Generate a quiz with 5 multiple-choice questions for learning {user.target_language} 
        at {user.proficiency_level} level. Topic: {topic}
        
        Format each question with:
        - question text
        - 4 options
        - index of correct answer (0-3)
        - explanation of answer
        
        Return as JSON in this format:
        {{
            "title": "Quiz title",
            "questions": [
                {{
                    "question": "question text",
                    "options": ["option1", "option2", "option3", "option4"],
                    "correct_answer": 0,
                    "explanation": "why this is correct"
                }},
                ...
            ]
        }}
        """
        
        response = self.llm_service.call_openai_llm([
            {"role": "system", "content": "You are a language learning assistant"},
            {"role": "user", "content": prompt}
        ])
        
        # Assume the response is valid JSON
        import json
        content = json.loads(response)
        
        exercise_id = f"ex-{uuid.uuid4().hex[:8]}"
        
        return Exercise(
            id=exercise_id,
            title=content.get("title", f"{user.target_language.capitalize()} Quiz: {topic}"),
            description=f"Test your {user.target_language} knowledge about {topic}",
            type=ExerciseType.QUIZ,
            language=user.target_language,
            difficulty=user.proficiency_level,
            content={"questions": content.get("questions", [])},
            status=ExerciseStatus.NEW
        )
    
    def _generate_conversation_exercise(self, user: User, partner: User) -> Exercise:
        """Generate conversation prompts based on shared interests"""
        # Find shared interests
        shared_interests = set(user.interests).intersection(set(partner.interests))
        interest = next(iter(shared_interests)) if shared_interests else user.interests[0]
        
        prompt = f"""
        Generate 3 conversation prompts for language tandem practice between:
        - Person 1: Native {user.native_language} speaker learning {user.target_language} at {user.proficiency_level} level
        - Person 2: Native {partner.native_language} speaker learning {partner.target_language} at {partner.proficiency_level} level
        
        Topic of shared interest: {interest}
        
        For each prompt include:
        - The conversation prompt
        - Some context about the topic
        - 5 suggested vocabulary words that might be useful
        
        Return as JSON in this format:
        {{
            "title": "Conversation title",
            "prompts": [
                {{
                    "prompt": "prompt text",
                    "context": "context information",
                    "suggested_vocabulary": ["word1", "word2", "word3", "word4", "word5"]
                }},
                ...
            ]
        }}
        """
        
        response = self.llm_service.call_openai_llm([
            {"role": "system", "content": "You are a language learning assistant"},
            {"role": "user", "content": prompt}
        ])
        
        # Assume the response is valid JSON
        import json
        content = json.loads(response)
        
        exercise_id = f"ex-{uuid.uuid4().hex[:8]}"
        
        return Exercise(
            id=exercise_id,
            title=content.get("title", f"Conversation Practice: {interest}"),
            description=f"Practice conversation with your tandem partner about {interest}",
            type=ExerciseType.CONVERSATION,
            language=user.target_language,
            difficulty=user.proficiency_level,
            content={"prompts": content.get("prompts", [])},
            status=ExerciseStatus.NEW
        )
    
    def generate_exercises(self, user: User, partner: User, count: int = 3) -> List[Exercise]:
        """Generate a set of exercises for a user"""
        exercises = []
        
        # Generate one of each type
        topics = ["travel", "food", "daily life", "hobbies", "culture"]
        
        # Flashcards
        flashcard_ex = self._generate_flashcard_exercise(user, topics[0])
        self.storage.save_item("exercises", flashcard_ex)
        exercises.append(flashcard_ex)
        
        # Quiz
        quiz_ex = self._generate_quiz_exercise(user, topics[1])
        self.storage.save_item("exercises", quiz_ex)
        exercises.append(quiz_ex)
        
        # Conversation
        conv_ex = self._generate_conversation_exercise(user, partner)
        self.storage.save_item("exercises", conv_ex)
        exercises.append(conv_ex)
        
        return exercises
    
    def update_exercise_status(self, exercise_id: str, status: ExerciseStatus) -> Exercise:
        """Update the status of an exercise"""
        exercise = self.get_exercise(exercise_id)
        if not exercise:
            raise ValueError(f"Exercise with id {exercise_id} not found")
            
        exercise.status = status
        self.storage.save_item("exercises", exercise)
        return exercise 