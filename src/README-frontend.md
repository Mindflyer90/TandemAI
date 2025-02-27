# Language Tandem App - Frontend

This folder contains the frontend implementation for the Language Tandem application, designed to work with the backend described in the main project README.

## Overview

The frontend is implemented as a single-page application using vanilla HTML, CSS, and JavaScript. This approach was chosen for the initial prototype to:

1. Allow testing without any complex build setup
2. Provide a clear foundation that can be later migrated to any framework
3. Focus on core functionality rather than framework-specific features

## Features

The frontend implements all features required by the backend:

- **User Management**: Create and update user profiles, set language preferences
- **Exercise System**: Various exercise types including flashcards, quizzes, conversation prompts, and pronunciation practice
- **Progress Tracking**: Statistics, streaks, achievements, and activity history
- **Cultural Learning**: Cultural notes, idioms, and fun facts about the target language

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- (Optional) The backend server running at http://localhost:8000

### Running the Frontend

There are several ways to run the frontend:

#### Option 1: Directly open in a browser

Simply open the `frontend/index.html` file in your web browser. This works for basic testing but might have limitations with some browser security policies.

#### Option 2: Use a local web server

Python:
```bash
cd frontend
python -m http.server 3000
```

Node.js (with npx):
```bash
cd frontend
npx http-server -p 3000
```

Then visit `http://localhost:3000` in your browser.

### Testing Without a Backend

The frontend is designed to work without a backend by:

1. Generating mock data when API calls fail
2. Storing user data in localStorage
3. Providing appropriate UI feedback when working in offline mode

To test the application without a backend, open `frontend/test.html` which provides detailed instructions.

## Code Structure

```
frontend/
├── css/                  # Stylesheets
│   ├── styles.css        # Main application styles
│   └── notifications.css # Notification system styles
├── js/                   # JavaScript files
│   ├── api.js            # API interface to backend
│   ├── app.js            # Core application logic
│   ├── config.js         # Configuration settings
│   ├── cultural.js       # Cultural content page
│   ├── exercises.js      # Exercises page
│   ├── profile.js        # User profile page
│   └── progress.js       # Progress tracking page
├── index.html            # Main application HTML
├── test.html             # Testing instructions
└── README.md             # Frontend documentation
```

## Connecting to the Backend

The frontend is configured to connect to the backend at `http://localhost:8000` by default. You can change this in `js/config.js` by modifying the `API_URL` constant.

If the backend is not available, the frontend will automatically generate mock data and display warning messages.

## Development Notes

### Adding Exercise Types

To add new exercise types:

1. Update the exercise type definitions in `config.js`
2. Add type-specific rendering in `exercises.js`
3. Implement interaction handlers for the new type

### Browser Compatibility

The application uses modern JavaScript features (async/await, Fetch API, ES6+ syntax). It should work in all modern browsers, but Internet Explorer is not supported.

## Future Development

This frontend implementation is intended as a prototype. For a production application, consider:

1. Moving to a frontend framework like React, Vue, or Angular
2. Adding proper authentication with JWT
3. Implementing proper error handling and retry mechanisms
4. Adding offline support with Service Workers
5. Optimizing assets for production (minification, bundling)

## License

This project is licensed under the MIT License - see the LICENSE file for details. 