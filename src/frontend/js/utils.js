/**
 * Utility functions for the Language Tandem App
 */
const Utils = {
    /**
     * Format a date to a readable string
     * @param {string|Date} date - The date to format
     * @returns {string} The formatted date
     */
    formatDate(date) {
        if (!date) return 'N/A';
        
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        
        if (isNaN(dateObj.getTime())) return 'Invalid date';
        
        return dateObj.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },
    
    /**
     * Format a time to a readable string
     * @param {string|Date} date - The date to format
     * @returns {string} The formatted time
     */
    formatTime(date) {
        if (!date) return 'N/A';
        
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        
        if (isNaN(dateObj.getTime())) return 'Invalid time';
        
        return dateObj.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    /**
     * Format a datetime to a readable string
     * @param {string|Date} date - The date to format
     * @returns {string} The formatted datetime
     */
    formatDateTime(date) {
        if (!date) return 'N/A';
        
        return `${this.formatDate(date)} at ${this.formatTime(date)}`;
    },
    
    /**
     * Get a relative time string (e.g., "2 hours ago")
     * @param {string|Date} date - The date to format
     * @returns {string} The relative time
     */
    getRelativeTime(date) {
        if (!date) return 'N/A';
        
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        
        if (isNaN(dateObj.getTime())) return 'Invalid date';
        
        const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
        const now = new Date();
        const diffInSeconds = Math.floor((dateObj - now) / 1000);
        
        if (Math.abs(diffInSeconds) < 60) {
            return rtf.format(diffInSeconds, 'second');
        }
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (Math.abs(diffInMinutes) < 60) {
            return rtf.format(diffInMinutes, 'minute');
        }
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (Math.abs(diffInHours) < 24) {
            return rtf.format(diffInHours, 'hour');
        }
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (Math.abs(diffInDays) < 30) {
            return rtf.format(diffInDays, 'day');
        }
        
        const diffInMonths = Math.floor(diffInDays / 30);
        if (Math.abs(diffInMonths) < 12) {
            return rtf.format(diffInMonths, 'month');
        }
        
        const diffInYears = Math.floor(diffInMonths / 12);
        return rtf.format(diffInYears, 'year');
    },
    
    /**
     * Truncate a string to a maximum length
     * @param {string} str - The string to truncate
     * @param {number} maxLength - The maximum length
     * @returns {string} The truncated string
     */
    truncateString(str, maxLength = 100) {
        if (!str) return '';
        
        if (str.length <= maxLength) return str;
        
        return str.substring(0, maxLength) + '...';
    },
    
    /**
     * Generate a random ID
     * @returns {string} A random ID
     */
    generateId() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    },
    
    /**
     * Debounce a function
     * @param {Function} func - The function to debounce
     * @param {number} wait - The wait time in milliseconds
     * @returns {Function} The debounced function
     */
    debounce(func, wait = 300) {
        let timeout;
        
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * Get a language name from its code
     * @param {string} code - The language code
     * @returns {string} The language name
     */
    getLanguageName(code) {
        const languages = {
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'zh': 'Chinese',
            'ja': 'Japanese',
            'ko': 'Korean'
        };
        
        return languages[code] || code;
    },
    
    /**
     * Get a proficiency level name from its code
     * @param {string} code - The proficiency level code
     * @returns {string} The proficiency level name
     */
    getProficiencyName(code) {
        const levels = {
            'A1': 'Beginner',
            'A2': 'Elementary',
            'B1': 'Intermediate',
            'B2': 'Upper Intermediate',
            'C1': 'Advanced',
            'C2': 'Proficient'
        };
        
        return levels[code] || code;
    }
}; 