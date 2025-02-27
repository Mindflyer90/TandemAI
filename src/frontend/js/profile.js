/**
 * Profile page functionality
 * Handles user profile creation and updates
 */
const ProfilePage = {
    // Initialize the profile page
    init() {
        // Check if user is authenticated
        if (!App.requireAuth()) return;
        
        this.setupForm();
        this.loadProfileData();
        this.setupEventListeners();
    },
    
    // Set up the profile form
    setupForm() {
        // Populate language select options
        const nativeLanguageSelect = document.getElementById('native-language');
        const learningLanguageSelect = document.getElementById('learning-language');
        
        // Clear existing options except the first one
        while (nativeLanguageSelect.options.length > 1) {
            nativeLanguageSelect.remove(1);
        }
        
        while (learningLanguageSelect.options.length > 1) {
            learningLanguageSelect.remove(1);
        }
        
        // Add language options
        CONFIG.LANGUAGES.forEach(language => {
            const nativeOption = document.createElement('option');
            nativeOption.value = language.code;
            nativeOption.textContent = language.name;
            nativeLanguageSelect.appendChild(nativeOption);
            
            const learningOption = document.createElement('option');
            learningOption.value = language.code;
            learningOption.textContent = language.name;
            learningLanguageSelect.appendChild(learningOption);
        });
        
        // Populate proficiency level options
        const proficiencySelect = document.getElementById('proficiency-level');
        
        // Clear existing options except the first one
        while (proficiencySelect.options.length > 1) {
            proficiencySelect.remove(1);
        }
        
        // Add proficiency level options
        CONFIG.PROFICIENCY_LEVELS.forEach(level => {
            const option = document.createElement('option');
            option.value = level.code;
            option.textContent = level.name;
            proficiencySelect.appendChild(option);
        });
    },
    
    // Load profile data from the current user
    loadProfileData() {
        const user = App.currentUser;
        if (!user) return;
        
        // Populate form fields with user data
        document.getElementById('name').value = user.name || '';
        document.getElementById('email').value = user.email || '';
        
        // Set select values
        if (user.nativeLanguage) {
            document.getElementById('native-language').value = user.nativeLanguage;
        }
        
        if (user.learningLanguage) {
            document.getElementById('learning-language').value = user.learningLanguage;
        }
        
        if (user.proficiencyLevel) {
            document.getElementById('proficiency-level').value = user.proficiencyLevel;
        }
        
        // Set other fields
        document.getElementById('interests').value = user.interests || '';
        document.getElementById('learning-goals').value = user.learningGoals || '';
        document.getElementById('partner-id').value = user.partnerId || '';
    },
    
    // Set up event listeners
    setupEventListeners() {
        // Form submission
        const profileForm = document.getElementById('profile-form');
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfile();
        });
    },
    
    // Save profile data
    async saveProfile() {
        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            nativeLanguage: document.getElementById('native-language').value,
            learningLanguage: document.getElementById('learning-language').value,
            proficiencyLevel: document.getElementById('proficiency-level').value,
            interests: document.getElementById('interests').value,
            learningGoals: document.getElementById('learning-goals').value,
            partnerId: document.getElementById('partner-id').value
        };
        
        try {
            // Validate required fields
            if (!formData.name || !formData.email || !formData.nativeLanguage || 
                !formData.learningLanguage || !formData.proficiencyLevel) {
                App.showNotification('Please fill out all required fields', 'error');
                return;
            }
            
            // Update user on the server
            if (App.currentUser && App.currentUser.id) {
                const updatedUser = await API.users.update(App.currentUser.id, formData);
                App.setCurrentUser(updatedUser);
                App.showNotification('Profile updated successfully', 'success');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            
            // For prototype testing, update the local user if API fails
            if (App.currentUser) {
                const mockUser = {
                    ...App.currentUser,
                    ...formData
                };
                
                App.setCurrentUser(mockUser);
                App.showNotification('Profile updated in local storage (API unavailable)', 'warning');
            }
        }
        
        // If partner ID was added, store it separately
        if (formData.partnerId) {
            localStorage.setItem(CONFIG.STORAGE_KEYS.PARTNER_ID, formData.partnerId);
        }
    }
}; 