/**
 * Cultural page functionality
 * Handles cultural content display and generation
 */
const CulturalPage = {
    // Cultural data
    culturalData: {
        notes: [],
        idioms: [],
        funFacts: []
    },
    
    // Current active tab
    activeTab: 'notes',
    
    // Initialize the cultural page
    init() {
        // Check if user is authenticated
        if (!App.requireAuth()) return;
        
        this.setupEventListeners();
        this.loadCulturalData();
    },
    
    // Set up event listeners
    setupEventListeners() {
        // Tab buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
        
        // Generate buttons
        document.getElementById('generate-notes-btn').addEventListener('click', () => {
            this.generateContent('notes');
        });
        
        document.getElementById('generate-idioms-btn').addEventListener('click', () => {
            this.generateContent('idioms');
        });
        
        document.getElementById('generate-fun-facts-btn').addEventListener('click', () => {
            this.generateContent('fun-facts');
        });
        
        // Close modal
        document.querySelector('#cultural-modal .close-modal').addEventListener('click', () => {
            this.closeCulturalModal();
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('cultural-modal');
            if (e.target === modal) {
                this.closeCulturalModal();
            }
        });
    },
    
    // Load cultural data from API
    async loadCulturalData() {
        if (!App.currentUser || !App.currentUser.learningLanguage) {
            App.showNotification('Please set your learning language in your profile', 'warning');
            return;
        }
        
        const language = App.currentUser.learningLanguage;
        
        try {
            // Show loading state
            document.querySelectorAll('.tab-content .loading').forEach(loader => {
                loader.style.display = 'block';
            });
            
            // Load cultural notes
            try {
                this.culturalData.notes = await API.cultural.getNotes(language);
            } catch (error) {
                console.error('Error loading cultural notes:', error);
                this.culturalData.notes = [];
            }
            
            // Load idioms
            try {
                this.culturalData.idioms = await API.cultural.getIdioms(language);
            } catch (error) {
                console.error('Error loading idioms:', error);
                this.culturalData.idioms = [];
            }
            
            // Load fun facts
            try {
                this.culturalData.funFacts = await API.cultural.getFunFacts(language);
            } catch (error) {
                console.error('Error loading fun facts:', error);
                this.culturalData.funFacts = [];
            }
            
            // If no data was found, generate mock data
            if (this.culturalData.notes.length === 0 && 
                this.culturalData.idioms.length === 0 && 
                this.culturalData.funFacts.length === 0) {
                this.generateMockCulturalData(language);
            }
            
            // Render the data
            this.renderCulturalNotes();
            this.renderIdioms();
            this.renderFunFacts();
            
        } catch (error) {
            console.error('Error loading cultural data:', error);
            
            // Generate mock data for testing
            this.generateMockCulturalData(language);
            
            // Render the mock data
            this.renderCulturalNotes();
            this.renderIdioms();
            this.renderFunFacts();
            
            App.showNotification('Using mock cultural data for testing', 'warning');
        } finally {
            // Hide loading states
            document.querySelectorAll('.tab-content .loading').forEach(loader => {
                loader.style.display = 'none';
            });
        }
    },
    
    // Switch between tabs
    switchTab(tabName) {
        // Update active tab
        this.activeTab = tabName;
        
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
            if (button.getAttribute('data-tab') === tabName) {
                button.classList.add('active');
            }
        });
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        document.getElementById(`${tabName}-tab`).classList.add('active');
    },
    
    // Render cultural notes
    renderCulturalNotes() {
        const container = document.getElementById('cultural-notes-container');
        container.innerHTML = '';
        
        if (!this.culturalData.notes || this.culturalData.notes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No cultural notes available. Generate new content to get started.</p>
                </div>
            `;
            return;
        }
        
        // Render each cultural note
        this.culturalData.notes.forEach(note => {
            const noteCard = document.createElement('div');
            noteCard.className = 'cultural-card';
            noteCard.dataset.id = note.id;
            
            noteCard.innerHTML = `
                <h3>${note.title}</h3>
                <p>${note.summary}</p>
            `;
            
            // Add click event to view detail
            noteCard.addEventListener('click', () => {
                this.viewCulturalItem('note', note.id);
            });
            
            container.appendChild(noteCard);
        });
    },
    
    // Render idioms
    renderIdioms() {
        const container = document.getElementById('idioms-container');
        container.innerHTML = '';
        
        if (!this.culturalData.idioms || this.culturalData.idioms.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No idioms available. Generate new content to get started.</p>
                </div>
            `;
            return;
        }
        
        // Render each idiom
        this.culturalData.idioms.forEach(idiom => {
            const idiomCard = document.createElement('div');
            idiomCard.className = 'cultural-card';
            idiomCard.dataset.id = idiom.id;
            
            idiomCard.innerHTML = `
                <h3>${idiom.phrase}</h3>
                <p>${idiom.translatedPhrase}</p>
            `;
            
            // Add click event to view detail
            idiomCard.addEventListener('click', () => {
                this.viewCulturalItem('idiom', idiom.id);
            });
            
            container.appendChild(idiomCard);
        });
    },
    
    // Render fun facts
    renderFunFacts() {
        const container = document.getElementById('fun-facts-container');
        container.innerHTML = '';
        
        if (!this.culturalData.funFacts || this.culturalData.funFacts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No fun facts available. Generate new content to get started.</p>
                </div>
            `;
            return;
        }
        
        // Render each fun fact
        this.culturalData.funFacts.forEach(fact => {
            const factCard = document.createElement('div');
            factCard.className = 'cultural-card';
            factCard.dataset.id = fact.id;
            
            factCard.innerHTML = `
                <h3>${fact.title}</h3>
                <p>${fact.content.substring(0, 100)}${fact.content.length > 100 ? '...' : ''}</p>
            `;
            
            // Add click event to view detail
            factCard.addEventListener('click', () => {
                this.viewCulturalItem('fact', fact.id);
            });
            
            container.appendChild(factCard);
        });
    },
    
    // View a cultural item in detail
    viewCulturalItem(type, id) {
        let item;
        
        // Find the item based on type and ID
        switch (type) {
            case 'note':
                item = this.culturalData.notes.find(note => note.id === id);
                break;
            case 'idiom':
                item = this.culturalData.idioms.find(idiom => idiom.id === id);
                break;
            case 'fact':
                item = this.culturalData.funFacts.find(fact => fact.id === id);
                break;
        }
        
        if (!item) {
            App.showNotification('Item not found', 'error');
            return;
        }
        
        const detailContainer = document.getElementById('cultural-detail-container');
        let contentHtml = '';
        
        // Create content based on item type
        switch (type) {
            case 'note':
                contentHtml = `
                    <h2>${item.title}</h2>
                    <div class="cultural-metadata">
                        <span>Language: ${this.getLanguageName(item.language)}</span>
                    </div>
                    <div class="cultural-content">
                        <p>${item.content}</p>
                    </div>
                    <div class="cultural-references">
                        ${item.references ? `<h4>References</h4><p>${item.references}</p>` : ''}
                    </div>
                `;
                break;
                
            case 'idiom':
                contentHtml = `
                    <h2>${item.phrase}</h2>
                    <div class="cultural-metadata">
                        <span>Language: ${this.getLanguageName(item.language)}</span>
                    </div>
                    <div class="cultural-translation">
                        <h4>Translation</h4>
                        <p>${item.translatedPhrase}</p>
                    </div>
                    <div class="cultural-content">
                        <h4>Meaning</h4>
                        <p>${item.meaning}</p>
                    </div>
                    <div class="cultural-examples">
                        <h4>Example Usage</h4>
                        <p>${item.example}</p>
                    </div>
                `;
                break;
                
            case 'fact':
                contentHtml = `
                    <h2>${item.title}</h2>
                    <div class="cultural-metadata">
                        <span>Language: ${this.getLanguageName(item.language)}</span>
                        ${item.category ? `<span>Category: ${item.category}</span>` : ''}
                    </div>
                    <div class="cultural-content">
                        <p>${item.content}</p>
                    </div>
                `;
                break;
        }
        
        detailContainer.innerHTML = contentHtml;
        
        // Show the modal
        document.getElementById('cultural-modal').style.display = 'block';
    },
    
    // Close the cultural modal
    closeCulturalModal() {
        document.getElementById('cultural-modal').style.display = 'none';
    },
    
    // Generate new content
    async generateContent(type) {
        if (!App.currentUser || !App.currentUser.learningLanguage) {
            App.showNotification('Please set your learning language in your profile', 'warning');
            return;
        }
        
        const language = App.currentUser.learningLanguage;
        
        // Show loading notification
        App.showNotification(`Generating new ${type}...`, 'info');
        
        try {
            // Request new content from the API
            const generatedContent = await API.cultural.generate(language, type);
            
            // Update the appropriate data array
            switch (type) {
                case 'notes':
                    this.culturalData.notes = [...generatedContent, ...this.culturalData.notes];
                    this.renderCulturalNotes();
                    break;
                case 'idioms':
                    this.culturalData.idioms = [...generatedContent, ...this.culturalData.idioms];
                    this.renderIdioms();
                    break;
                case 'fun-facts':
                    this.culturalData.funFacts = [...generatedContent, ...this.culturalData.funFacts];
                    this.renderFunFacts();
                    break;
            }
            
            App.showNotification(`New ${type} generated successfully`, 'success');
            
        } catch (error) {
            console.error(`Error generating ${type}:`, error);
            
            // Generate mock data if API fails
            let mockItems = [];
            
            switch (type) {
                case 'notes':
                    mockItems = this.generateMockNotes(language, 3);
                    this.culturalData.notes = [...mockItems, ...this.culturalData.notes];
                    this.renderCulturalNotes();
                    break;
                case 'idioms':
                    mockItems = this.generateMockIdioms(language, 3);
                    this.culturalData.idioms = [...mockItems, ...this.culturalData.idioms];
                    this.renderIdioms();
                    break;
                case 'fun-facts':
                    mockItems = this.generateMockFunFacts(language, 3);
                    this.culturalData.funFacts = [...mockItems, ...this.culturalData.funFacts];
                    this.renderFunFacts();
                    break;
            }
            
            App.showNotification(`Generated mock ${type} for testing`, 'warning');
        }
    },
    
    // Generate mock cultural data for testing
    generateMockCulturalData(language) {
        this.culturalData.notes = this.generateMockNotes(language, 5);
        this.culturalData.idioms = this.generateMockIdioms(language, 5);
        this.culturalData.funFacts = this.generateMockFunFacts(language, 5);
    },
    
    // Generate mock cultural notes
    generateMockNotes(language, count = 5) {
        const mockNotes = [];
        
        const topics = [
            'Greetings and Politeness',
            'Family Structure',
            'Dining Etiquette',
            'Business Customs',
            'Holidays and Celebrations',
            'Regional Differences',
            'Body Language',
            'Gifts and Gift-Giving'
        ];
        
        for (let i = 0; i < count; i++) {
            const topic = topics[Math.floor(Math.random() * topics.length)];
            
            mockNotes.push({
                id: `note_${Date.now()}_${i}`,
                language,
                title: `${topic} in ${this.getLanguageName(language)}`,
                summary: `Learn about ${topic.toLowerCase()} in ${this.getLanguageName(language)}-speaking cultures.`,
                content: `This is a detailed explanation about ${topic.toLowerCase()} in ${this.getLanguageName(language)}-speaking cultures. The content would include specific examples, cultural context, and practical advice for language learners.`,
                references: 'Cultural reference books and websites would be cited here.',
                createdAt: new Date().toISOString()
            });
        }
        
        return mockNotes;
    },
    
    // Generate mock idioms
    generateMockIdioms(language, count = 5) {
        const mockIdioms = [];
        
        // Sample idioms for each language
        const idiomsByLanguage = {
            'spanish': [
                {
                    phrase: 'Estar en las nubes',
                    translated: 'To be in the clouds',
                    meaning: 'To be distracted or not paying attention',
                    example: 'Durante la clase, Juan estaba en las nubes y no escuchó al profesor.'
                },
                {
                    phrase: 'Costar un ojo de la cara',
                    translated: 'To cost an eye from the face',
                    meaning: 'To be very expensive',
                    example: 'Ese coche nuevo le costó un ojo de la cara.'
                }
            ],
            'french': [
                {
                    phrase: 'Avoir un chat dans la gorge',
                    translated: 'To have a cat in the throat',
                    meaning: 'To have a frog in your throat (to be hoarse)',
                    example: 'Excusez-moi, j\'ai un chat dans la gorge.'
                },
                {
                    phrase: 'Être dans la lune',
                    translated: 'To be on the moon',
                    meaning: 'To be daydreaming or distracted',
                    example: 'Il est toujours dans la lune pendant les cours.'
                }
            ],
            'german': [
                {
                    phrase: 'Tomaten auf den Augen haben',
                    translated: 'To have tomatoes on your eyes',
                    meaning: 'To be unobservant or miss something obvious',
                    example: 'Hast du Tomaten auf den Augen? Das Buch liegt direkt vor dir!'
                },
                {
                    phrase: 'Die Daumen drücken',
                    translated: 'To press thumbs',
                    meaning: 'To keep fingers crossed (wish good luck)',
                    example: 'Ich drücke dir die Daumen für deine Prüfung morgen.'
                }
            ]
        };
        
        // Use language-specific idioms if available, or general placeholders
        const idiomExamples = idiomsByLanguage[language] || [
            {
                phrase: 'Example Idiom 1',
                translated: 'Translation of Idiom 1',
                meaning: 'This is what Idiom 1 means in the target culture',
                example: 'Here is how Idiom 1 would be used in a sentence.'
            },
            {
                phrase: 'Example Idiom 2',
                translated: 'Translation of Idiom 2',
                meaning: 'This is what Idiom 2 means in the target culture',
                example: 'Here is how Idiom 2 would be used in a sentence.'
            }
        ];
        
        for (let i = 0; i < count; i++) {
            const idiomIndex = i % idiomExamples.length;
            const idiomExample = idiomExamples[idiomIndex];
            
            mockIdioms.push({
                id: `idiom_${Date.now()}_${i}`,
                language,
                phrase: idiomExample.phrase,
                translatedPhrase: idiomExample.translated,
                meaning: idiomExample.meaning,
                example: idiomExample.example,
                createdAt: new Date().toISOString()
            });
        }
        
        return mockIdioms;
    },
    
    // Generate mock fun facts
    generateMockFunFacts(language, count = 5) {
        const mockFacts = [];
        
        const factTopics = [
            'Language Origin',
            'Writing System',
            'Dialects',
            'Unique Sounds',
            'Grammar Quirks',
            'Borrowed Words',
            'Food and Cuisine',
            'Famous Writers',
            'Popular Music',
            'Film Industry'
        ];
        
        for (let i = 0; i < count; i++) {
            const topic = factTopics[Math.floor(Math.random() * factTopics.length)];
            
            mockFacts.push({
                id: `fact_${Date.now()}_${i}`,
                language,
                title: `${topic} in ${this.getLanguageName(language)}`,
                content: `This is an interesting fun fact about ${topic.toLowerCase()} in ${this.getLanguageName(language)}. Did you know that [specific interesting fact related to the language and topic]? This kind of cultural knowledge helps language learners understand the context in which the language is used.`,
                category: topic,
                createdAt: new Date().toISOString()
            });
        }
        
        return mockFacts;
    },
    
    // Get language name from code
    getLanguageName(code) {
        const language = CONFIG.LANGUAGES.find(lang => lang.code === code);
        return language ? language.name : code;
    }
}; 