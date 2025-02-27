# Language Tandem App

A complete language tandem application for two people learning languages together. The app facilitates interactive language learning through flashcards, quizzes, conversations, and cultural learning.

## Features

- **User Profiles**: Simple profile setup for two users with native language, target language, proficiency level, and learning interests
- **Interactive Exercises**:
  - Flashcard system for vocabulary
  - Quizzes for grammar and vocabulary practice
  - Conversation prompts based on shared interests
  - Pronunciation practice with audio recording
- **Gamification Elements**:
  - Streak tracking for daily practice
  - Point system for completed exercises
  - Achievement badges for milestones
  - Progress visualization
- **Cultural Learning**:
  - Cultural notes integrated with vocabulary
  - Idiom explanations with context
  - Cultural fun facts relevant to language learning
- **Multi-Language Support**:
  - Support for English, French, German, Italian, and Spanish
  - Proper handling of language-specific characters
  - Language comparison tools

## Technology Stack

- **Backend**: Python with FastAPI
- **Frontend**: React Native
- **Data Storage**: Local storage (JSON files)
- **AI Integration**: OpenAI and Google Gemini models for content generation

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 14+ and npm
- React Native development environment

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd language-tandem-app/backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Start the backend server:
   ```
   uvicorn app.main:app --reload
   ```

The API will be available at http://localhost:8000 with documentation at http://localhost:8000/docs

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd language-tandem-app/frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the React Native development server:
   ```
   npx react-native start
   ```

4. Run the app on a device or emulator:
   ```
   npx react-native run-android
   # or
   npx react-native run-ios
   ```

## Usage

1. Create user profiles for both language tandem partners
2. Set native and target languages for each user
3. Generate exercises and begin learning together
4. Track progress and earn achievements as you learn

## API Keys

To use the LLM services for content generation, you need to obtain API keys for:

1. OpenAI API: https://platform.openai.com/
2. Google Gemini API: https://ai.google.dev/

Add these keys to your environment variables or directly in the code (for development purposes only).

## License

This project is licensed under the MIT License - see the LICENSE file for details. 