/**
 * Progress page functionality
 * Handles user progress tracking and display
 */
const ProgressPage = {
    // User progress data
    progressData: null,
    
    // Initialize the progress page
    init() {
        // Check if user is authenticated
        if (!App.requireAuth()) return;
        
        this.loadProgressData();
    },
    
    // Load progress data
    async loadProgressData() {
        try {
            // Try to load from API
            const progressData = await API.progress.get(App.currentUser.id);
            this.progressData = progressData;
            this.updateProgressUI();
            
        } catch (error) {
            console.error('Error loading progress data:', error);
            
            // Try to load from local storage
            const storedProgress = localStorage.getItem(CONFIG.STORAGE_KEYS.PROGRESS);
            if (storedProgress) {
                try {
                    this.progressData = JSON.parse(storedProgress);
                    this.updateProgressUI();
                } catch (e) {
                    console.error('Error parsing stored progress:', e);
                    // Generate mock data
                    this.generateMockProgress();
                }
            } else {
                // Generate mock data
                this.generateMockProgress();
            }
        }
    },
    
    // Update progress UI
    updateProgressUI() {
        if (!this.progressData) return;
        
        // Update stats
        document.getElementById('current-streak').textContent = this.progressData.streak || 0;
        document.getElementById('total-points').textContent = this.progressData.points || 0;
        document.getElementById('exercises-completed').textContent = this.progressData.exercisesCompleted || 0;
        document.getElementById('achievements-count').textContent = 
            this.progressData.achievements ? this.progressData.achievements.filter(a => a.unlocked).length : 0;
        
        // Render activity timeline
        this.renderActivityTimeline();
        
        // Render achievements
        this.renderAchievements();
        
        // Set up charts (if there's activity data)
        if (this.progressData.activityHistory && this.progressData.activityHistory.length > 0) {
            this.setupCharts();
        }
    },
    
    // Render activity timeline
    renderActivityTimeline() {
        const activityContainer = document.getElementById('activity-timeline');
        activityContainer.innerHTML = '';
        
        if (!this.progressData.activityHistory || this.progressData.activityHistory.length === 0) {
            activityContainer.innerHTML = '<p class="empty-state">No activity recorded yet.</p>';
            return;
        }
        
        // Sort activities by date (newest first)
        const sortedActivities = [...this.progressData.activityHistory].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
        
        // Limit to 10 most recent activities
        const recentActivities = sortedActivities.slice(0, 10);
        
        // Render each activity item
        recentActivities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            
            let iconColor = '';
            let iconText = '';
            
            // Set icon based on activity type
            switch (activity.type) {
                case 'exercise_completed':
                    iconColor = '#4285f4';
                    iconText = '✓';
                    break;
                case 'streak_continued':
                    iconColor = '#fbbc05';
                    iconText = '🔥';
                    break;
                case 'achievement_unlocked':
                    iconColor = '#34a853';
                    iconText = '🏆';
                    break;
                case 'points_earned':
                    iconColor = '#ea4335';
                    iconText = '⭐';
                    break;
                default:
                    iconColor = '#757575';
                    iconText = 'i';
            }
            
            // Format the date
            const activityDate = new Date(activity.date);
            const dateString = activityDate.toLocaleDateString();
            const timeString = activityDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            activityItem.innerHTML = `
                <div class="activity-icon" style="background-color: ${iconColor};">
                    ${iconText}
                </div>
                <div class="activity-details">
                    <p>${activity.description}</p>
                </div>
                <div class="activity-time">
                    ${dateString} ${timeString}
                </div>
            `;
            
            activityContainer.appendChild(activityItem);
        });
    },
    
    // Render achievements
    renderAchievements() {
        const achievementsContainer = document.querySelector('.achievements-grid');
        achievementsContainer.innerHTML = '';
        
        if (!this.progressData.achievements || this.progressData.achievements.length === 0) {
            achievementsContainer.innerHTML = '<p class="empty-state">No achievements available yet.</p>';
            return;
        }
        
        // Render each achievement
        this.progressData.achievements.forEach(achievement => {
            const achievementCard = document.createElement('div');
            achievementCard.className = `achievement-card ${!achievement.unlocked ? 'achievement-locked' : ''}`;
            
            // Set icon color based on achievement type
            let iconColor = '#4285f4';
            if (achievement.type === 'streak') {
                iconColor = '#fbbc05';
            } else if (achievement.type === 'exercise') {
                iconColor = '#34a853';
            } else if (achievement.type === 'points') {
                iconColor = '#ea4335';
            }
            
            achievementCard.innerHTML = `
                <div class="achievement-icon" style="background-color: ${iconColor};">
                    ${achievement.emoji || '🏆'}
                </div>
                <h3>${achievement.name}</h3>
                <p>${achievement.description}</p>
                ${achievement.unlocked ? 
                    `<p class="achievement-date">Unlocked on ${new Date(achievement.unlockedAt).toLocaleDateString()}</p>` : 
                    `<p class="achievement-locked-text">Locked</p>`
                }
            `;
            
            achievementsContainer.appendChild(achievementCard);
        });
    },
    
    // Set up progress charts
    setupCharts() {
        this.setupProgressChart();
        this.setupCategoryChart();
    },
    
    // Set up main progress chart
    setupProgressChart() {
        // Get the chart canvas
        const chartCanvas = document.getElementById('progress-chart');
        
        // Extract data from activity history
        const activityData = this.extractChartData();
        
        // Create context for Chart.js
        // Note: In a real app, you would include Chart.js library
        // For this prototype, we'll create a mock chart
        
        // Draw a simple representation of a chart
        const ctx = chartCanvas.getContext('2d');
        ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
        
        // Create mock chart
        this.drawMockLineChart(ctx, chartCanvas.width, chartCanvas.height, activityData.labels, activityData.data);
        
        // Add chart title
        ctx.fillStyle = '#333';
        ctx.font = '16px Roboto';
        ctx.textAlign = 'center';
        ctx.fillText('Activity Over Time', chartCanvas.width / 2, 20);
    },
    
    // Set up category breakdown chart
    setupCategoryChart() {
        // Get the chart canvas
        const chartCanvas = document.getElementById('category-chart');
        
        // Calculate the exercise type breakdown
        const categoryData = this.calculateCategoryBreakdown();
        
        // Create context for Chart.js
        // For this prototype, we'll create a mock chart
        
        // Draw a simple representation of a chart
        const ctx = chartCanvas.getContext('2d');
        ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
        
        // Create mock chart
        this.drawMockPieChart(ctx, chartCanvas.width, chartCanvas.height, categoryData.labels, categoryData.data);
        
        // Add chart title
        ctx.fillStyle = '#333';
        ctx.font = '16px Roboto';
        ctx.textAlign = 'center';
        ctx.fillText('Exercise Types Completed', chartCanvas.width / 2, 20);
    },
    
    // Extract chart data from activity history
    extractChartData() {
        // Get last 7 days of activity
        const now = new Date();
        const dates = [];
        const data = [];
        
        // Create array of last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            dates.push(date.toLocaleDateString([], { month: 'short', day: 'numeric' }));
            
            // Count activities on this day
            const activitiesOnDay = this.progressData.activityHistory.filter(activity => {
                const activityDate = new Date(activity.date);
                return activityDate.toDateString() === date.toDateString();
            });
            
            data.push(activitiesOnDay.length);
        }
        
        return {
            labels: dates,
            data: data
        };
    },
    
    // Calculate exercise type breakdown
    calculateCategoryBreakdown() {
        // Count exercises by type
        const typeCounts = {
            'flashcard': 0,
            'quiz': 0,
            'conversation': 0,
            'pronunciation': 0
        };
        
        // Extract type information from activity history
        this.progressData.activityHistory.forEach(activity => {
            if (activity.type === 'exercise_completed' && activity.exerciseType) {
                typeCounts[activity.exerciseType] = (typeCounts[activity.exerciseType] || 0) + 1;
            }
        });
        
        // Create arrays for chart
        return {
            labels: Object.keys(typeCounts).map(type => {
                // Get friendly names from config
                const typeObj = CONFIG.EXERCISE_TYPES.find(t => t.code === type);
                return typeObj ? typeObj.name : type;
            }),
            data: Object.values(typeCounts)
        };
    },
    
    // Draw a mock line chart for the prototype
    drawMockLineChart(ctx, width, height, labels, data) {
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        const maxValue = Math.max(...data, 5); // Ensure some height even with low values
        
        // Draw axis
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.strokeStyle = '#ccc';
        ctx.stroke();
        
        // Draw data points and lines
        ctx.beginPath();
        const pointWidth = chartWidth / (labels.length - 1);
        
        for (let i = 0; i < data.length; i++) {
            const x = padding + i * pointWidth;
            const y = height - padding - (data[i] / maxValue) * chartHeight;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            // Draw data point
            ctx.fillStyle = '#4285f4';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw label
            ctx.fillStyle = '#757575';
            ctx.font = '12px Roboto';
            ctx.textAlign = 'center';
            ctx.fillText(labels[i], x, height - padding + 15);
        }
        
        ctx.strokeStyle = '#4285f4';
        ctx.lineWidth = 2;
        ctx.stroke();
    },
    
    // Draw a mock pie chart for the prototype
    drawMockPieChart(ctx, width, height, labels, data) {
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY) - 50;
        
        const total = data.reduce((sum, value) => sum + value, 0);
        let startAngle = 0;
        
        // Colors for chart segments
        const colors = ['#4285f4', '#34a853', '#fbbc05', '#ea4335'];
        
        // Draw legend
        let legendY = 40;
        for (let i = 0; i < labels.length; i++) {
            ctx.fillStyle = colors[i % colors.length];
            ctx.fillRect(width - 150, legendY, 15, 15);
            
            ctx.fillStyle = '#333';
            ctx.font = '14px Roboto';
            ctx.textAlign = 'left';
            ctx.fillText(labels[i], width - 130, legendY + 12);
            
            legendY += 25;
        }
        
        // Draw pie segments
        for (let i = 0; i < data.length; i++) {
            const sliceAngle = (data[i] / total) * 2 * Math.PI;
            const endAngle = startAngle + sliceAngle;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            
            ctx.fillStyle = colors[i % colors.length];
            ctx.fill();
            
            startAngle = endAngle;
        }
    },
    
    // Generate mock progress data for testing
    generateMockProgress() {
        const today = new Date();
        const twoWeeksAgo = new Date(today);
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        
        // Create mock activity history
        const activityHistory = [];
        
        // Generate some random activities over the past 14 days
        for (let i = 0; i < 14; i++) {
            const date = new Date(twoWeeksAgo);
            date.setDate(date.getDate() + i);
            
            // Add 0-3 activities per day
            const activitiesPerDay = Math.floor(Math.random() * 4);
            
            for (let j = 0; j < activitiesPerDay; j++) {
                // Choose a random activity type
                const activityTypes = ['exercise_completed', 'streak_continued', 'points_earned'];
                const randomType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
                
                // Create activity object
                const activity = {
                    id: `activity_${Date.now()}_${i}_${j}`,
                    type: randomType,
                    date: new Date(date).toISOString()
                };
                
                // Add type-specific properties
                if (randomType === 'exercise_completed') {
                    const exerciseTypes = ['flashcard', 'quiz', 'conversation', 'pronunciation'];
                    activity.exerciseType = exerciseTypes[Math.floor(Math.random() * exerciseTypes.length)];
                    activity.description = `Completed a ${activity.exerciseType} exercise`;
                } else if (randomType === 'streak_continued') {
                    activity.streakDays = Math.floor(Math.random() * 10) + 1;
                    activity.description = `Continued your learning streak: ${activity.streakDays} days`;
                } else if (randomType === 'points_earned') {
                    activity.points = Math.floor(Math.random() * 50) + 10;
                    activity.description = `Earned ${activity.points} points`;
                }
                
                activityHistory.push(activity);
            }
        }
        
        // Create mock achievements
        const achievements = [
            {
                id: 'achievement_1',
                name: 'First Steps',
                description: 'Complete your first exercise',
                type: 'exercise',
                emoji: '👣',
                unlocked: true,
                unlockedAt: new Date(twoWeeksAgo).toISOString()
            },
            {
                id: 'achievement_2',
                name: '3-Day Streak',
                description: 'Practice for 3 days in a row',
                type: 'streak',
                emoji: '🔥',
                unlocked: true,
                unlockedAt: new Date(today).toISOString()
            },
            {
                id: 'achievement_3',
                name: 'Quiz Master',
                description: 'Complete 10 quiz exercises',
                type: 'exercise',
                emoji: '🧠',
                unlocked: false
            },
            {
                id: 'achievement_4',
                name: 'Conversation Pro',
                description: 'Complete 5 conversation exercises',
                type: 'exercise',
                emoji: '💬',
                unlocked: false
            },
            {
                id: 'achievement_5',
                name: 'Point Collector',
                description: 'Earn 500 points',
                type: 'points',
                emoji: '⭐',
                unlocked: false
            }
        ];
        
        // Create the mock progress data
        this.progressData = {
            userId: App.currentUser ? App.currentUser.id : 'user_mock',
            streak: 3,
            points: 240,
            exercisesCompleted: 12,
            achievements,
            activityHistory,
            lastUpdated: new Date().toISOString()
        };
        
        // Save to local storage
        localStorage.setItem(CONFIG.STORAGE_KEYS.PROGRESS, JSON.stringify(this.progressData));
        
        // Update the UI
        this.updateProgressUI();
        
        // Show notification
        App.showNotification('Using mock progress data for testing', 'warning');
    }
}; 