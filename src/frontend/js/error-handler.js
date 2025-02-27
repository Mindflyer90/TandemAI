/**
 * Error handling utilities for the Language Tandem App
 */
const ErrorHandler = {
    /**
     * Display an error message to the user
     * @param {string|Error} error - The error message or Error object
     * @param {string} context - The context where the error occurred
     */
    showError(error, context = '') {
        // Get the error message
        const errorMessage = error instanceof Error ? error.message : error;
        
        // Log to console with context
        console.error(`Error ${context ? `in ${context}` : ''}:`, error);
        
        // Create notification
        const notification = {
            type: 'error',
            message: errorMessage,
            title: context ? `Error in ${context}` : 'Error',
            duration: 5000
        };
        
        // Show notification if app.js is loaded
        if (typeof App !== 'undefined' && App.showNotification) {
            App.showNotification(notification);
        } else {
            // Fallback if App is not available
            alert(`${notification.title}: ${notification.message}`);
        }
    },
    
    /**
     * Handle API errors
     * @param {Error} error - The error object
     * @param {string} context - The context where the error occurred
     * @param {Function} fallbackFn - Optional fallback function to call
     */
    handleApiError(error, context, fallbackFn = null) {
        this.showError(error, context);
        
        // Check if we should use mock data as fallback
        if (fallbackFn && typeof fallbackFn === 'function') {
            console.log(`Using mock data for ${context} due to API error`);
            return fallbackFn();
        }
        
        return null;
    },
    
    /**
     * Global error handler for uncaught exceptions
     * @param {ErrorEvent} event - The error event
     */
    setupGlobalErrorHandler() {
        window.addEventListener('error', (event) => {
            this.showError(event.error || event.message, 'Uncaught Exception');
            
            // Prevent default browser error handling
            event.preventDefault();
        });
        
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.showError(event.reason, 'Unhandled Promise Rejection');
            
            // Prevent default browser error handling
            event.preventDefault();
        });
        
        console.log('Global error handlers set up');
    }
}; 