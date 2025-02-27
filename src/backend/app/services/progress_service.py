from typing import List, Optional
from datetime import datetime, timedelta
import uuid
from .storage_service import StorageService
from ..models.progress import UserProgress, Achievement
from ..models.exercise import Exercise, ExerciseStatus

class ProgressService:
    """Service to handle user progress and gamification"""
    
    def __init__(self, storage: StorageService):
        self.storage = storage
    
    def get_user_progress(self, user_id: str) -> UserProgress:
        """Get progress for a user, creating a new record if not found"""
        progress = self.storage.get_item("progress", user_id, UserProgress)
        if not progress:
            progress = UserProgress(user_id=user_id)
            self.storage.save_item("progress", progress)
        return progress
    
    def update_streak(self, user_id: str) -> UserProgress:
        """Update user streak based on last activity date"""
        progress = self.get_user_progress(user_id)
        
        today = datetime.now().date()
        last_date = progress.last_activity_date.date() if progress.last_activity_date else None
        
        if last_date:
            # If last activity was yesterday, increment streak
            if (today - last_date).days == 1:
                progress.streak += 1
            # If last activity was today, no change
            elif (today - last_date).days == 0:
                pass
            # If more than one day passed, reset streak
            else:
                progress.streak = 1
        else:
            # First activity
            progress.streak = 1
        
        progress.last_activity_date = datetime.now()
        self.storage.save_item("progress", progress)
        
        # Check for streak achievements
        self._check_streak_achievements(progress)
        
        return progress
    
    def complete_exercise(self, user_id: str, exercise: Exercise) -> UserProgress:
        """Mark an exercise as completed and update progress"""
        progress = self.get_user_progress(user_id)
        
        # Add to completed exercises if not already there
        if exercise.id not in progress.completed_exercises:
            progress.completed_exercises.append(exercise.id)
            
            # Award points based on exercise type and difficulty
            difficulty_multiplier = {
                "beginner": 1,
                "intermediate": 2,
                "advanced": 3,
                "fluent": 4
            }.get(exercise.difficulty, 1)
            
            type_points = {
                "flashcard": 5,
                "quiz": 10,
                "conversation": 15,
                "pronunciation": 10
            }.get(exercise.type, 5)
            
            points = type_points * difficulty_multiplier
            progress.points += points
            
            # Update language stats
            language = exercise.language
            if language not in progress.language_stats:
                progress.language_stats[language] = {
                    "vocabulary": 0,
                    "grammar": 0,
                    "listening": 0,
                    "speaking": 0
                }
            
            # Update specific stats based on exercise type
            stats = progress.language_stats[language]
            if exercise.type == "flashcard":
                stats["vocabulary"] += len(exercise.content.get("items", []))
            elif exercise.type == "quiz":
                stats["grammar"] += len(exercise.content.get("questions", []))
            elif exercise.type == "conversation":
                stats["speaking"] += 1
            elif exercise.type == "pronunciation":
                stats["speaking"] += len(exercise.content.get("items", []))
                stats["listening"] += len(exercise.content.get("items", []))
                
            # Update streak
            self.update_streak(user_id)
            
            # Check for achievements
            self._check_completion_achievements(progress)
            
            self.storage.save_item("progress", progress)
        
        return progress
    
    def _check_streak_achievements(self, progress: UserProgress) -> None:
        """Check and award streak-based achievements"""
        streak_achievements = {
            3: {
                "id": "streak3",
                "title": "3-Day Streak",
                "description": "Practiced for 3 days in a row",
                "icon": "streak_3.png"
            },
            7: {
                "id": "streak7",
                "title": "Weekly Warrior",
                "description": "Practiced for a full week without missing a day",
                "icon": "streak_7.png"
            },
            30: {
                "id": "streak30",
                "title": "Monthly Master",
                "description": "Practiced every day for a month",
                "icon": "streak_30.png"
            }
        }
        
        for days, achievement_data in streak_achievements.items():
            if progress.streak >= days:
                # Check if achievement already earned
                if not any(a.id == achievement_data["id"] for a in progress.achievements):
                    # Award new achievement
                    achievement = Achievement(
                        id=achievement_data["id"],
                        title=achievement_data["title"],
                        description=achievement_data["description"],
                        icon=achievement_data["icon"],
                        date_earned=datetime.now()
                    )
                    progress.achievements.append(achievement)
    
    def _check_completion_achievements(self, progress: UserProgress) -> None:
        """Check and award completion-based achievements"""
        completion_achievements = {
            1: {
                "id": "firstex",
                "title": "First Steps",
                "description": "Completed your first exercise",
                "icon": "first_exercise.png"
            },
            10: {
                "id": "tenex",
                "title": "Getting Serious",
                "description": "Completed 10 exercises",
                "icon": "ten_exercises.png"
            },
            50: {
                "id": "fiftyex",
                "title": "Language Enthusiast",
                "description": "Completed 50 exercises",
                "icon": "fifty_exercises.png"
            }
        }
        
        completed_count = len(progress.completed_exercises)
        
        for count, achievement_data in completion_achievements.items():
            if completed_count >= count:
                # Check if achievement already earned
                if not any(a.id == achievement_data["id"] for a in progress.achievements):
                    # Award new achievement
                    achievement = Achievement(
                        id=achievement_data["id"],
                        title=achievement_data["title"],
                        description=achievement_data["description"],
                        icon=achievement_data["icon"],
                        date_earned=datetime.now()
                    )
                    progress.achievements.append(achievement) 