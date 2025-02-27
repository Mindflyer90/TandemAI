/**
 * Configuration settings for the Language Tandem App
 */
const CONFIG = {
    // API base URL - change this to your backend server address
    API_URL: 'http://localhost:8000',
    
    // Default language options
    LANGUAGES: [
        { code: 'english', name: 'English' },
        { code: 'spanish', name: 'Spanish' },
        { code: 'french', name: 'French' },
        { code: 'german', name: 'German' },
        { code: 'italian', name: 'Italian' },
        { code: 'japanese', name: 'Japanese' },
        { code: 'mandarin', name: 'Mandarin Chinese' }
    ],
    
    // Proficiency levels
    PROFICIENCY_LEVELS: [
        { code: 'beginner', name: 'Beginner (A1)' },
        { code: 'elementary', name: 'Elementary (A2)' },
        { code: 'intermediate', name: 'Intermediate (B1)' },
        { code: 'upperIntermediate', name: 'Upper Intermediate (B2)' },
        { code: 'advanced', name: 'Advanced (C1)' },
        { code: 'proficient', name: 'Proficient (C2)' }
    ],
    
    // Exercise types
    EXERCISE_TYPES: [
        { code: 'flashcard', name: 'Flashcard' },
        { code: 'quiz', name: 'Quiz' },
        { code: 'conversation', name: 'Conversation Prompt' },
        { code: 'pronunciation', name: 'Pronunciation Practice' }
    ],
    
    // Local storage keys
    STORAGE_KEYS: {
        USER_ID: 'tandem_user_id',
        USER_DATA: 'tandem_user_data',
        PARTNER_ID: 'tandem_partner_id',
        EXERCISES: 'tandem_exercises',
        PROGRESS: 'tandem_progress',
        LANGUAGE_PREFERENCE: 'tandem_language'
    }
}; 