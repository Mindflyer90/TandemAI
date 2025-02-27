/**
 * API utilities for the Language Tandem App
 * Handles all API requests to the backend
 */
const API = {
    /**
     * Show the loading spinner
     * @param {string} message - Optional message to display
     */
    showSpinner(message = 'Loading...') {
        const spinner = document.querySelector('.spinner-container');
        const spinnerText = document.querySelector('.spinner-text');
        
        if (spinner && spinnerText) {
            spinnerText.textContent = message;
            spinner.classList.add('active');
        }
    },
    
    /**
     * Hide the loading spinner
     */
    hideSpinner() {
        const spinner = document.querySelector('.spinner-container');
        
        if (spinner) {
            spinner.classList.remove('active');
        }
    },

    /**
     * Make a fetch request to the API
     * @param {string} endpoint - The API endpoint
     * @param {Object} options - The fetch options
     * @returns {Promise} The fetch response
     */
    async request(endpoint, options = {}) {
        try {
            // Show spinner with custom message if provided
            this.showSpinner(options.spinnerMessage || 'Loading...');
            
            const url = `${CONFIG.API_URL}${endpoint}`;
            
            // Set default headers
            const headers = {
                'Content-Type': 'application/json',
                ...options.headers
            };
            
            const response = await fetch(url, {
                ...options,
                headers
            });
            
            // Handle response status
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Request failed with status ${response.status}`);
            }
            
            // Return JSON response or empty object if no content
            if (response.status === 204) {
                return {};
            }
            
            return await response.json();
        } catch (error) {
            // Use ErrorHandler if available
            if (typeof ErrorHandler !== 'undefined') {
                const context = `API request to ${endpoint}`;
                
                // If a fallback function is provided, use it
                if (options.fallbackFn && typeof options.fallbackFn === 'function') {
                    return ErrorHandler.handleApiError(error, context, options.fallbackFn);
                } else {
                    ErrorHandler.showError(error, context);
                }
            } else {
                console.error('API request failed:', error);
            }
            
            throw error;
        } finally {
            // Always hide spinner when request completes
            this.hideSpinner();
        }
    },
    
    /**
     * User API methods
     */
    users: {
        /**
         * Get all users
         * @returns {Promise<Array>} Array of users
         */
        async getAll() {
            return API.request('/users/');
        },
        
        /**
         * Get a user by ID
         * @param {string} userId - The user ID
         * @returns {Promise<Object>} The user data
         */
        async getById(userId) {
            return API.request(`/users/${userId}`);
        },
        
        /**
         * Create a new user
         * @param {Object} userData - The user data
         * @returns {Promise<Object>} The created user
         */
        async create(userData) {
            return API.request('/users/', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
        },
        
        /**
         * Update a user
         * @param {string} userId - The user ID
         * @param {Object} userData - The updated user data
         * @returns {Promise<Object>} The updated user
         */
        async update(userId, userData) {
            return API.request(`/users/${userId}`, {
                method: 'PUT',
                body: JSON.stringify(userData)
            });
        },
        
        /**
         * Delete a user
         * @param {string} userId - The user ID
         * @returns {Promise<void>}
         */
        async delete(userId) {
            return API.request(`/users/${userId}`, {
                method: 'DELETE'
            });
        }
    },
    
    /**
     * Exercise API methods
     */
    exercises: {
        /**
         * Get all exercises with optional filtering
         * @param {Object} filters - Optional filters (type, status, etc.)
         * @returns {Promise<Array>} Array of exercises
         */
        async getAll(filters = {}) {
            const queryParams = new URLSearchParams();
            
            // Add filters to query params
            Object.entries(filters).forEach(([key, value]) => {
                if (value) {
                    queryParams.append(key, value);
                }
            });
            
            const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
            return API.request(`/exercises/${queryString}`);
        },
        
        /**
         * Get an exercise by ID
         * @param {string} exerciseId - The exercise ID
         * @returns {Promise<Object>} The exercise data
         */
        async getById(exerciseId) {
            return API.request(`/exercises/${exerciseId}`);
        },
        
        /**
         * Generate new exercises for a user pair
         * @param {string} userId - The user ID
         * @param {string} partnerId - The partner ID
         * @param {Object} options - Generation options (type, count, etc.)
         * @returns {Promise<Array>} Array of generated exercises
         */
        async generate(userId, partnerId, options = {}) {
            return API.request('/exercises/generate', {
                method: 'POST',
                body: JSON.stringify({
                    userId,
                    partnerId,
                    ...options
                })
            });
        },
        
        /**
         * Update exercise status
         * @param {string} exerciseId - The exercise ID
         * @param {string} status - The new status
         * @returns {Promise<Object>} The updated exercise
         */
        async updateStatus(exerciseId, status) {
            return API.request(`/exercises/${exerciseId}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status })
            });
        }
    },
    
    /**
     * Progress API methods
     */
    progress: {
        /**
         * Get user progress
         * @param {string} userId - The user ID
         * @returns {Promise<Object>} The user progress data
         */
        async get(userId) {
            return API.request(`/progress/${userId}`);
        },
        
        /**
         * Mark an exercise as completed
         * @param {string} userId - The user ID
         * @param {string} exerciseId - The exercise ID
         * @returns {Promise<Object>} The updated progress
         */
        async completeExercise(userId, exerciseId) {
            return API.request(`/progress/${userId}/complete-exercise/${exerciseId}`, {
                method: 'POST'
            });
        },
        
        /**
         * Update user streak
         * @param {string} userId - The user ID
         * @returns {Promise<Object>} The updated streak data
         */
        async updateStreak(userId) {
            return API.request(`/progress/${userId}/update-streak`, {
                method: 'POST'
            });
        }
    },
    
    /**
     * Cultural content API methods
     */
    cultural: {
        /**
         * Get cultural notes for a language
         * @param {string} language - The language code
         * @returns {Promise<Array>} Array of cultural notes
         */
        async getNotes(language) {
            return API.request(`/cultural/notes/${language}`);
        },
        
        /**
         * Get a specific cultural note
         * @param {string} noteId - The note ID
         * @returns {Promise<Object>} The note data
         */
        async getNoteById(noteId) {
            return API.request(`/cultural/notes/detail/${noteId}`);
        },
        
        /**
         * Get idioms for a language
         * @param {string} language - The language code
         * @returns {Promise<Array>} Array of idioms
         */
        async getIdioms(language) {
            return API.request(`/cultural/idioms/${language}`);
        },
        
        /**
         * Get a specific idiom
         * @param {string} idiomId - The idiom ID
         * @returns {Promise<Object>} The idiom data
         */
        async getIdiomById(idiomId) {
            return API.request(`/cultural/idioms/detail/${idiomId}`);
        },
        
        /**
         * Get fun facts for a language
         * @param {string} language - The language code
         * @returns {Promise<Array>} Array of fun facts
         */
        async getFunFacts(language) {
            return API.request(`/cultural/fun-facts/${language}`);
        },
        
        /**
         * Get a specific fun fact
         * @param {string} factId - The fact ID
         * @returns {Promise<Object>} The fun fact data
         */
        async getFunFactById(factId) {
            return API.request(`/cultural/fun-facts/detail/${factId}`);
        },
        
        /**
         * Generate new cultural content
         * @param {string} language - The language code
         * @param {string} type - The content type (notes, idioms, facts)
         * @returns {Promise<Array>} Array of generated content
         */
        async generate(language, type) {
            return API.request(`/cultural/generate/${language}`, {
                method: 'POST',
                body: JSON.stringify({ type })
            });
        }
    }
}; 