/**
 * Exercises page functionality
 * Handles exercise listing, filtering, generation, and interaction
 */
const ExercisesPage = {
    // Store fetched exercises
    exercises: [],
    
    // Initialize the exercises page
    init() {
        // Check if user is authenticated
        if (!App.requireAuth()) return;
        
        this.setupEventListeners();
        this.loadExercises();
    },
    
    // Set up event listeners
    setupEventListeners() {
        // Filter change events
        document.getElementById('exercise-type-filter').addEventListener('change', () => {
            this.applyFilters();
        });
        
        document.getElementById('exercise-status-filter').addEventListener('change', () => {
            this.applyFilters();
        });
        
        // Generate exercises button
        document.getElementById('generate-exercises-btn').addEventListener('click', () => {
            this.generateExercises();
        });
        
        // Close modal
        document.querySelector('#exercise-modal .close-modal').addEventListener('click', () => {
            this.closeExerciseModal();
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('exercise-modal');
            if (e.target === modal) {
                this.closeExerciseModal();
            }
        });
    },
    
    // Load exercises from API or local storage
    async loadExercises() {
        const exercisesContainer = document.getElementById('exercises-container');
        exercisesContainer.innerHTML = '<div class="loading">Loading exercises...</div>';
        
        try {
            // Try to load from API first
            this.exercises = await API.exercises.getAll();
            
            // If no exercises found, check local storage
            if (!this.exercises || this.exercises.length === 0) {
                const storedExercises = localStorage.getItem(CONFIG.STORAGE_KEYS.EXERCISES);
                if (storedExercises) {
                    this.exercises = JSON.parse(storedExercises);
                }
            }
            
            // If still no exercises, generate mock data for testing
            if (!this.exercises || this.exercises.length === 0) {
                this.exercises = this.generateMockExercises();
                localStorage.setItem(CONFIG.STORAGE_KEYS.EXERCISES, JSON.stringify(this.exercises));
            }
            
            // Render the exercises
            this.renderExercises();
            
        } catch (error) {
            console.error('Error loading exercises:', error);
            
            // Try to load from local storage if API fails
            const storedExercises = localStorage.getItem(CONFIG.STORAGE_KEYS.EXERCISES);
            if (storedExercises) {
                this.exercises = JSON.parse(storedExercises);
                this.renderExercises();
            } else {
                // Generate mock data for testing
                this.exercises = this.generateMockExercises();
                localStorage.setItem(CONFIG.STORAGE_KEYS.EXERCISES, JSON.stringify(this.exercises));
                this.renderExercises();
                
                // Show error notification
                App.showNotification('Using mock data. Could not connect to the API.', 'warning');
            }
        }
    },
    
    // Render exercises to the container
    renderExercises(exercisesToRender = null) {
        const exercisesContainer = document.getElementById('exercises-container');
        exercisesContainer.innerHTML = '';
        
        // Use filtered exercises if provided, otherwise use all exercises
        const exercises = exercisesToRender || this.exercises;
        
        if (!exercises || exercises.length === 0) {
            exercisesContainer.innerHTML = `
                <div class="empty-state">
                    <p>No exercises found. Generate new exercises to get started.</p>
                </div>
            `;
            return;
        }
        
        // Render each exercise card
        exercises.forEach(exercise => {
            const exerciseCard = document.createElement('div');
            exerciseCard.className = `exercise-card ${exercise.type}`;
            exerciseCard.dataset.id = exercise.id;
            
            // Set status class
            if (exercise.status) {
                exerciseCard.classList.add(exercise.status);
            }
            
            exerciseCard.innerHTML = `
                <div class="exercise-tag">${this.getExerciseTypeName(exercise.type)}</div>
                <h3>${exercise.title}</h3>
                <p>${exercise.description ? exercise.description.substring(0, 100) + '...' : 'No description'}</p>
                <div class="exercise-actions">
                    <button class="cta-button small view-exercise-btn">View</button>
                </div>
            `;
            
            // Add click event for viewing the exercise
            exerciseCard.querySelector('.view-exercise-btn').addEventListener('click', () => {
                this.viewExercise(exercise.id);
            });
            
            exercisesContainer.appendChild(exerciseCard);
        });
    },
    
    // Apply filters to exercises
    applyFilters() {
        const typeFilter = document.getElementById('exercise-type-filter').value;
        const statusFilter = document.getElementById('exercise-status-filter').value;
        
        let filteredExercises = this.exercises;
        
        // Apply type filter
        if (typeFilter !== 'all') {
            filteredExercises = filteredExercises.filter(ex => ex.type === typeFilter);
        }
        
        // Apply status filter
        if (statusFilter !== 'all') {
            filteredExercises = filteredExercises.filter(ex => ex.status === statusFilter);
        }
        
        this.renderExercises(filteredExercises);
    },
    
    // View a specific exercise
    viewExercise(exerciseId) {
        const exercise = this.exercises.find(ex => ex.id === exerciseId);
        
        if (!exercise) {
            App.showNotification('Exercise not found', 'error');
            return;
        }
        
        const detailContainer = document.getElementById('exercise-detail-container');
        
        let contentHtml = '';
        
        // Create content based on exercise type
        switch (exercise.type) {
            case 'flashcard':
                contentHtml = this.renderFlashcardExercise(exercise);
                break;
            case 'quiz':
                contentHtml = this.renderQuizExercise(exercise);
                break;
            case 'conversation':
                contentHtml = this.renderConversationExercise(exercise);
                break;
            case 'pronunciation':
                contentHtml = this.renderPronunciationExercise(exercise);
                break;
            default:
                contentHtml = `
                    <h3>${exercise.title}</h3>
                    <p>${exercise.description}</p>
                `;
        }
        
        detailContainer.innerHTML = contentHtml;
        
        // Add event listeners for exercise interaction
        this.setupExerciseInteractions(exercise, detailContainer);
        
        // Show the modal
        document.getElementById('exercise-modal').style.display = 'block';
    },
    
    // Close the exercise modal
    closeExerciseModal() {
        document.getElementById('exercise-modal').style.display = 'none';
    },
    
    // Render a flashcard exercise
    renderFlashcardExercise(exercise) {
        return `
            <h3>${exercise.title}</h3>
            <div class="flashcard-container">
                <div class="flashcard" id="flashcard">
                    <div class="flashcard-front">
                        <p>${exercise.content.term}</p>
                    </div>
                    <div class="flashcard-back">
                        <p>${exercise.content.definition}</p>
                        <p class="flashcard-example">${exercise.content.example || ''}</p>
                    </div>
                </div>
            </div>
            <div class="exercise-controls">
                <button id="flip-card-btn" class="cta-button secondary">Flip Card</button>
                <button id="mark-complete-btn" class="cta-button">Mark as Learned</button>
            </div>
        `;
    },
    
    // Render a quiz exercise
    renderQuizExercise(exercise) {
        const options = exercise.content.options.map((option, index) => `
            <div class="quiz-option">
                <input type="radio" name="quiz-answer" id="option-${index}" value="${index}">
                <label for="option-${index}">${option}</label>
            </div>
        `).join('');
        
        return `
            <h3>${exercise.title}</h3>
            <div class="quiz-container">
                <p class="quiz-question">${exercise.content.question}</p>
                <div class="quiz-options">
                    ${options}
                </div>
                <div class="quiz-feedback" style="display: none;"></div>
            </div>
            <div class="exercise-controls">
                <button id="check-answer-btn" class="cta-button">Check Answer</button>
            </div>
        `;
    },
    
    // Render a conversation exercise
    renderConversationExercise(exercise) {
        return `
            <h3>${exercise.title}</h3>
            <div class="conversation-container">
                <p class="conversation-scenario">${exercise.content.scenario}</p>
                <div class="conversation-prompt">
                    <p>${exercise.content.prompt}</p>
                </div>
                <textarea id="conversation-response" rows="4" placeholder="Write your response..."></textarea>
            </div>
            <div class="exercise-controls">
                <button id="save-response-btn" class="cta-button">Save Response</button>
            </div>
        `;
    },
    
    // Render a pronunciation exercise
    renderPronunciationExercise(exercise) {
        return `
            <h3>${exercise.title}</h3>
            <div class="pronunciation-container">
                <p class="pronunciation-text">${exercise.content.text}</p>
                <p class="pronunciation-phonetic">${exercise.content.phonetic || ''}</p>
                <div class="pronunciation-controls">
                    <button id="play-audio-btn" class="audio-btn">
                        <span class="audio-icon">▶</span> Listen
                    </button>
                    <button id="record-audio-btn" class="audio-btn">
                        <span class="audio-icon">●</span> Record
                    </button>
                </div>
            </div>
            <div class="exercise-controls">
                <button id="mark-complete-btn" class="cta-button">Mark as Complete</button>
            </div>
        `;
    },
    
    // Set up interactions for the current exercise
    setupExerciseInteractions(exercise, container) {
        // Common mark complete button
        const completeBtn = container.querySelector('#mark-complete-btn');
        if (completeBtn) {
            completeBtn.addEventListener('click', () => {
                this.markExerciseComplete(exercise.id);
            });
        }
        
        // Type-specific interactions
        switch (exercise.type) {
            case 'flashcard':
                const flashcard = container.querySelector('#flashcard');
                const flipBtn = container.querySelector('#flip-card-btn');
                
                if (flashcard && flipBtn) {
                    flipBtn.addEventListener('click', () => {
                        flashcard.classList.toggle('flipped');
                    });
                }
                break;
                
            case 'quiz':
                const checkBtn = container.querySelector('#check-answer-btn');
                const feedback = container.querySelector('.quiz-feedback');
                
                if (checkBtn && feedback) {
                    checkBtn.addEventListener('click', () => {
                        const selectedOption = container.querySelector('input[name="quiz-answer"]:checked');
                        
                        if (!selectedOption) {
                            feedback.textContent = 'Please select an answer';
                            feedback.className = 'quiz-feedback error';
                            feedback.style.display = 'block';
                            return;
                        }
                        
                        const selectedIndex = parseInt(selectedOption.value);
                        const correctIndex = exercise.content.correctIndex;
                        
                        if (selectedIndex === correctIndex) {
                            feedback.textContent = 'Correct! ' + (exercise.content.explanation || '');
                            feedback.className = 'quiz-feedback correct';
                            checkBtn.textContent = 'Mark Complete';
                            checkBtn.addEventListener('click', () => {
                                this.markExerciseComplete(exercise.id);
                            }, { once: true });
                        } else {
                            feedback.textContent = 'Incorrect. Try again. ' + (exercise.content.hint || '');
                            feedback.className = 'quiz-feedback incorrect';
                        }
                        
                        feedback.style.display = 'block';
                    });
                }
                break;
                
            case 'conversation':
                const saveBtn = container.querySelector('#save-response-btn');
                const responseTextarea = container.querySelector('#conversation-response');
                
                if (saveBtn && responseTextarea) {
                    saveBtn.addEventListener('click', () => {
                        const response = responseTextarea.value.trim();
                        
                        if (!response) {
                            App.showNotification('Please write a response', 'error');
                            return;
                        }
                        
                        // Save response
                        exercise.userResponse = response;
                        this.updateExercise(exercise);
                        
                        App.showNotification('Response saved', 'success');
                        saveBtn.textContent = 'Mark Complete';
                        saveBtn.addEventListener('click', () => {
                            this.markExerciseComplete(exercise.id);
                        }, { once: true });
                    });
                    
                    // Pre-fill response if previously saved
                    if (exercise.userResponse) {
                        responseTextarea.value = exercise.userResponse;
                    }
                }
                break;
                
            case 'pronunciation':
                const playBtn = container.querySelector('#play-audio-btn');
                const recordBtn = container.querySelector('#record-audio-btn');
                
                if (playBtn) {
                    playBtn.addEventListener('click', () => {
                        // In a real app, this would play the audio file
                        App.showNotification('Audio playback would happen here', 'info');
                    });
                }
                
                if (recordBtn) {
                    recordBtn.addEventListener('click', () => {
                        // In a real app, this would start recording
                        App.showNotification('Recording would happen here', 'info');
                    });
                }
                break;
        }
    },
    
    // Mark an exercise as complete
    async markExerciseComplete(exerciseId) {
        try {
            // Update exercise status on the server
            await API.progress.completeExercise(App.currentUser.id, exerciseId);
            
            // Update local exercise object
            const exerciseIndex = this.exercises.findIndex(ex => ex.id === exerciseId);
            if (exerciseIndex >= 0) {
                this.exercises[exerciseIndex].status = 'completed';
                localStorage.setItem(CONFIG.STORAGE_KEYS.EXERCISES, JSON.stringify(this.exercises));
            }
            
            // Update UI
            this.closeExerciseModal();
            this.renderExercises();
            App.showNotification('Exercise marked as complete', 'success');
            
        } catch (error) {
            console.error('Error marking exercise complete:', error);
            
            // Update local exercise object if API fails
            const exerciseIndex = this.exercises.findIndex(ex => ex.id === exerciseId);
            if (exerciseIndex >= 0) {
                this.exercises[exerciseIndex].status = 'completed';
                localStorage.setItem(CONFIG.STORAGE_KEYS.EXERCISES, JSON.stringify(this.exercises));
            }
            
            // Update UI
            this.closeExerciseModal();
            this.renderExercises();
            App.showNotification('Exercise marked as complete (locally only)', 'warning');
        }
    },
    
    // Update an exercise object
    updateExercise(exercise) {
        const exerciseIndex = this.exercises.findIndex(ex => ex.id === exercise.id);
        if (exerciseIndex >= 0) {
            this.exercises[exerciseIndex] = exercise;
            localStorage.setItem(CONFIG.STORAGE_KEYS.EXERCISES, JSON.stringify(this.exercises));
        }
    },
    
    // Generate new exercises
    async generateExercises() {
        if (!App.currentUser) {
            App.showNotification('Please log in to generate exercises', 'error');
            return;
        }
        
        // Get partner ID
        const partnerId = App.currentUser.partnerId || localStorage.getItem(CONFIG.STORAGE_KEYS.PARTNER_ID);
        
        if (!partnerId) {
            App.showNotification('Please set a partner ID in your profile to generate exercises', 'error');
            return;
        }
        
        try {
            App.showNotification('Generating new exercises...', 'info');
            
            // Request new exercises from the API
            const newExercises = await API.exercises.generate(App.currentUser.id, partnerId, {
                count: 5 // Generate 5 exercises
            });
            
            // Add new exercises to the list
            this.exercises = [...newExercises, ...this.exercises];
            
            // Save to local storage
            localStorage.setItem(CONFIG.STORAGE_KEYS.EXERCISES, JSON.stringify(this.exercises));
            
            // Update UI
            this.renderExercises();
            App.showNotification('New exercises generated successfully', 'success');
            
        } catch (error) {
            console.error('Error generating exercises:', error);
            
            // Generate mock exercises if API fails
            const mockExercises = this.generateMockExercises(5);
            this.exercises = [...mockExercises, ...this.exercises];
            
            // Save to local storage
            localStorage.setItem(CONFIG.STORAGE_KEYS.EXERCISES, JSON.stringify(this.exercises));
            
            // Update UI
            this.renderExercises();
            App.showNotification('Generated mock exercises for testing', 'warning');
        }
    },
    
    // Generate mock exercises for testing
    generateMockExercises(count = 8) {
        const mockExercises = [];
        const types = ['flashcard', 'quiz', 'conversation', 'pronunciation'];
        const statuses = ['new', 'in-progress', 'completed'];
        
        // Generate random exercises
        for (let i = 0; i < count; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const status = i < 2 ? statuses[Math.floor(Math.random() * 2)] : 'new';
            
            let content = {};
            let title = '';
            
            // Create content based on type
            switch (type) {
                case 'flashcard':
                    title = 'Vocabulary Flashcard';
                    content = {
                        term: ['Bonjour', 'Gracias', 'Ciao', 'Hallo', 'Konnichiwa'][Math.floor(Math.random() * 5)],
                        definition: 'Hello/Thank you/Goodbye in the target language',
                        example: 'Used as a greeting in formal and informal situations.'
                    };
                    break;
                case 'quiz':
                    title = 'Grammar Quiz';
                    content = {
                        question: 'Which of the following is correct?',
                        options: [
                            'Option A - Example text',
                            'Option B - Example text',
                            'Option C - Example text',
                            'Option D - Example text'
                        ],
                        correctIndex: Math.floor(Math.random() * 4),
                        explanation: 'This is the correct form because of the specific grammar rule.'
                    };
                    break;
                case 'conversation':
                    title = 'Conversation Practice';
                    content = {
                        scenario: 'You are ordering food at a restaurant.',
                        prompt: 'The waiter asks what you would like to order. Respond appropriately.'
                    };
                    break;
                case 'pronunciation':
                    title = 'Pronunciation Practice';
                    content = {
                        text: ['Je suis étudiant', 'Donde está la biblioteca', 'Ich bin ein Berliner', 'Mi chiamo Marco'][Math.floor(Math.random() * 4)],
                        phonetic: 'Phonetic transcription would go here'
                    };
                    break;
            }
            
            // Create the exercise object
            mockExercises.push({
                id: 'exercise_' + Date.now() + '_' + i,
                type,
                title,
                description: `This is a ${type} exercise to help you practice your language skills.`,
                content,
                status,
                createdAt: new Date().toISOString(),
                userId: App.currentUser ? App.currentUser.id : 'user_mock',
                partnerId: 'partner_mock'
            });
        }
        
        return mockExercises;
    },
    
    // Get friendly name for exercise type
    getExerciseTypeName(type) {
        const exerciseType = CONFIG.EXERCISE_TYPES.find(t => t.code === type);
        return exerciseType ? exerciseType.name : type;
    }
}; 