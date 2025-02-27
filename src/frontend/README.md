# Language Tandem App Frontend

This is the frontend for the Language Tandem application, a platform designed for language learning in pairs. The frontend is built with vanilla HTML, CSS, and JavaScript to provide a prototype version before developing a full-featured app.

## Features

- **User Management**
  - Create and edit user profiles
  - Set language preferences and proficiency levels
  - Link with a learning partner

- **Exercise System**
  - View and filter different types of exercises (flashcards, quizzes, etc.)
  - Generate new exercises based on user preferences
  - Interactive exercise completion

- **Progress Tracking**
  - View learning statistics and streaks
  - Track completed exercises and achievements
  - Visualize progress with charts

- **Cultural Learning**
  - Explore cultural notes related to the target language
  - Learn idioms with translations and examples
  - Discover fun facts about language-speaking regions

## Project Structure

```
frontend/
├── css/
│   └── styles.css          # Main stylesheet
├── js/
│   ├── app.js              # Core application logic and navigation
│   ├── api.js              # API utilities for backend communication
│   ├── config.js           # Configuration settings
│   ├── profile.js          # Profile page functionality
│   ├── exercises.js        # Exercises page functionality
│   ├── progress.js         # Progress tracking page functionality
│   └── cultural.js         # Cultural learning page functionality
├── img/                    # Image assets
└── index.html              # Main HTML file
```

## Setup and Installation

1. Ensure the backend server is running at http://localhost:8000 (or modify the API_URL in config.js)

2. Serve the frontend files using any web server. For example, with Python:
   ```bash
   cd frontend
   python -m http.server 3000
   ```

3. Open a web browser and navigate to http://localhost:3000

## Working Offline / Mock Data

This frontend is designed to work even when the backend is not available:

- If API calls fail, the application will generate mock data for testing purposes
- User data is cached in localStorage to maintain state between sessions
- All features are functional in offline mode, with appropriate warning notifications

## Browser Compatibility

The application is built with modern JavaScript and CSS features and should work in all current browsers:

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Development Notes

### Adding New Exercise Types

To add a new exercise type:

1. Add the type to the `EXERCISE_TYPES` array in `config.js`
2. Create a new render function in `exercises.js` (see existing patterns)
3. Add the type-specific interaction handlers
4. Update any filters or UI elements that reference exercise types

### Extending Cultural Content

To add a new type of cultural content:

1. Add appropriate API methods in `api.js`
2. Create new render functions in `cultural.js`
3. Add UI elements (tabs, buttons) to `index.html`
4. Update the tab switch handlers in `cultural.js`

## Connecting to a Production Backend

To connect to a production backend:

1. Update the `API_URL` in `config.js` to point to your production server
2. Ensure CORS is properly configured on the server
3. Implement proper authentication if needed (current version uses a simplified system)

## Future Improvements

- Implement proper user authentication with JWT
- Add offline mode with Service Workers
- Create native mobile versions with frameworks like React Native
- Add real-time chat features for language partners
- Implement pronunciation analysis with Web Audio API 