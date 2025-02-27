/**
 * Main application script
 * Handles page navigation, authentication, and common functionality
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application
    App.init();
});

/**
 * Main App object
 */
const App = {
    // Current user data
    currentUser: null,
    
    // Initialize the application
    init() {
        // Set up global error handler
        if (typeof ErrorHandler !== 'undefined') {
            ErrorHandler.setupGlobalErrorHandler();
        }
        
        this.loadCurrentUser();
        this.setupEventListeners();
        this.handleNavigation();
        
        // Check if user is logged in and update UI
        this.updateAuthUI();
        
        // Create notification container if it doesn't exist
        this.createNotificationContainer();
        
        // Show welcome message if this is the first visit
        this.showWelcomeMessage();
    },
    
    // Create notification container
    createNotificationContainer() {
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            document.body.appendChild(container);
        }
    },
    
    /**
     * Show a notification to the user
     * @param {Object} notification - The notification object
     * @param {string} notification.type - The type of notification (info, success, warning, error)
     * @param {string} notification.message - The notification message
     * @param {string} notification.title - Optional title
     * @param {number} notification.duration - Duration in ms (default: 3000)
     */
    showNotification(notification) {
        const { type = 'info', message, title = '', duration = 3000 } = notification;
        
        // Create notification element
        const notificationElement = document.createElement('div');
        notificationElement.className = `notification notification-${type}`;
        
        // Add title if provided
        if (title) {
            const titleElement = document.createElement('div');
            titleElement.className = 'notification-title';
            titleElement.textContent = title;
            notificationElement.appendChild(titleElement);
        }
        
        // Add message
        const messageElement = document.createElement('div');
        messageElement.className = 'notification-message';
        messageElement.textContent = message;
        notificationElement.appendChild(messageElement);
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.className = 'notification-close';
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', () => {
            this.removeNotification(notificationElement);
        });
        notificationElement.appendChild(closeButton);
        
        // Add to container
        const container = document.getElementById('notification-container');
        container.appendChild(notificationElement);
        
        // Automatically remove after duration
        setTimeout(() => {
            this.removeNotification(notificationElement);
        }, duration);
    },
    
    /**
     * Remove a notification element
     * @param {HTMLElement} notificationElement - The notification element to remove
     */
    removeNotification(notificationElement) {
        notificationElement.classList.add('notification-hiding');
        
        // Remove after animation completes
        setTimeout(() => {
            if (notificationElement.parentNode) {
                notificationElement.parentNode.removeChild(notificationElement);
            }
        }, 300);
    },
    
    // Set up event listeners
    setupEventListeners() {
        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                this.navigateTo(page);
            });
        });
        
        // Login/logout buttons
        document.getElementById('login-button').addEventListener('click', () => {
            this.showLoginModal();
        });
        
        document.getElementById('logout-button').addEventListener('click', () => {
            this.logout();
        });
        
        // Get started button
        document.getElementById('get-started-btn').addEventListener('click', () => {
            if (this.currentUser) {
                this.navigateTo('exercises');
            } else {
                this.showLoginModal();
            }
        });
        
        // Find partner button
        document.getElementById('find-partner-btn').addEventListener('click', () => {
            this.navigateTo('profile');
        });
        
        // Handle browser back/forward navigation
        window.addEventListener('popstate', () => {
            this.handleNavigation();
        });
    },
    
    // Navigate to a page
    navigateTo(page) {
        // Update URL
        history.pushState({ page }, '', `#${page}`);
        
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });
        
        // Show the selected page
        const pageElement = document.getElementById(`${page}-page`);
        if (pageElement) {
            pageElement.classList.add('active');
        }
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === page) {
                link.classList.add('active');
            }
        });
        
        // Perform page-specific initialization
        this.initPageContent(page);
    },
    
    // Handle navigation based on URL
    handleNavigation() {
        let page = 'home';
        
        // Get page from URL hash
        const hash = window.location.hash.substring(1);
        if (hash) {
            page = hash;
        }
        
        this.navigateTo(page);
    },
    
    // Initialize page-specific content
    initPageContent(page) {
        switch (page) {
            case 'profile':
                if (typeof ProfilePage !== 'undefined') {
                    ProfilePage.init();
                }
                break;
            case 'exercises':
                if (typeof ExercisesPage !== 'undefined') {
                    ExercisesPage.init();
                }
                break;
            case 'progress':
                if (typeof ProgressPage !== 'undefined') {
                    ProgressPage.init();
                }
                break;
            case 'cultural':
                if (typeof CulturalPage !== 'undefined') {
                    CulturalPage.init();
                }
                break;
        }
    },
    
    // Load current user from local storage
    loadCurrentUser() {
        const userId = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_ID);
        const userData = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA);
        
        if (userId && userData) {
            try {
                this.currentUser = JSON.parse(userData);
                console.log('User loaded from storage:', this.currentUser.name);
            } catch (error) {
                console.error('Failed to parse user data:', error);
                this.currentUser = null;
            }
        }
    },
    
    // Update UI based on authentication state
    updateAuthUI() {
        const loginButton = document.getElementById('login-button');
        const logoutButton = document.getElementById('logout-button');
        const currentUserSpan = document.getElementById('current-user');
        
        if (this.currentUser) {
            // User is logged in
            loginButton.style.display = 'none';
            logoutButton.style.display = 'block';
            currentUserSpan.textContent = this.currentUser.name;
        } else {
            // User is not logged in
            loginButton.style.display = 'block';
            logoutButton.style.display = 'none';
            currentUserSpan.textContent = 'Not logged in';
        }
    },
    
    // Show login/signup modal
    showLoginModal() {
        // For simplicity in this prototype, we'll use a prompt instead of a proper modal
        const userEmail = prompt('Enter your email to log in or sign up:');
        
        if (!userEmail) return;
        
        // Simple validation
        if (!this.isValidEmail(userEmail)) {
            alert('Please enter a valid email address');
            return;
        }
        
        // Search for existing user or create new one
        this.findOrCreateUser(userEmail);
    },
    
    // Find existing user or create a new one
    async findOrCreateUser(email) {
        try {
            // First try to find the user
            const users = await API.users.getAll();
            const existingUser = users.find(user => user.email === email);
            
            if (existingUser) {
                // Log in as existing user
                this.setCurrentUser(existingUser);
                alert(`Welcome back, ${existingUser.name || email}!`);
            } else {
                // Create new user
                const name = prompt('Welcome! Please enter your name:');
                if (!name) return;
                
                const newUser = await API.users.create({
                    name,
                    email,
                    nativeLanguage: '',
                    learningLanguage: '',
                    proficiencyLevel: '',
                    interests: '',
                    learningGoals: ''
                });
                
                this.setCurrentUser(newUser);
                alert(`Welcome, ${name}! Please complete your profile.`);
                this.navigateTo('profile');
            }
        } catch (error) {
            // Handle API errors
            console.error('Error during login/signup:', error);
            
            // For prototype testing, create a mock user if API is not available
            const mockUserId = 'user_' + Date.now();
            const mockUser = {
                id: mockUserId,
                name: email.split('@')[0],
                email,
                nativeLanguage: '',
                learningLanguage: '',
                proficiencyLevel: '',
                interests: '',
                learningGoals: ''
            };
            
            this.setCurrentUser(mockUser);
            alert('Using mock user for testing. API connection failed.');
            this.navigateTo('profile');
        }
    },
    
    // Set current user and update storage
    setCurrentUser(user) {
        this.currentUser = user;
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER_ID, user.id);
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
        this.updateAuthUI();
    },
    
    // Logout the current user
    logout() {
        this.currentUser = null;
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_ID);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
        this.updateAuthUI();
        this.navigateTo('home');
    },
    
    // Validate email format
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    },
    
    // Check if the user is authenticated
    requireAuth() {
        if (!this.currentUser) {
            this.showNotification('Please log in to access this feature', 'error');
            this.navigateTo('home');
            return false;
        }
        return true;
    },
    
    // Show welcome message on first visit
    showWelcomeMessage() {
        // Check if we've shown the welcome message before
        const hasShownWelcome = localStorage.getItem('tandem_welcome_shown');
        
        if (!hasShownWelcome) {
            // Show welcome notification
            this.showNotification({
                type: 'info',
                title: 'Welcome to Language Tandem!',
                message: 'Get started by creating an account and setting up your profile.',
                duration: 8000
            });
            
            // Mark welcome as shown
            localStorage.setItem('tandem_welcome_shown', 'true');
        }
    }
}; 