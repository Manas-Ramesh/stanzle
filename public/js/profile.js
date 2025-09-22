class ProfilePage {
    constructor() {
        this.submissions = [];
        this.user = null;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.checkAuthStatus();
        await this.loadSubmissionHistory();
    }

    setupEventListeners() {
        // User menu
        const userMenuBtn = document.getElementById('userMenuBtn');
        const userDropdown = document.getElementById('userDropdown');
        const logoutBtn = document.getElementById('logoutBtn');

        if (userMenuBtn && userDropdown) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('show');
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (userDropdown && !userDropdown.contains(e.target) && !userMenuBtn.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
        });

        // Modal close
        const closeModalBtn = document.getElementById('closeModalBtn');
        const modal = document.getElementById('gameDetailModal');

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.closeModal());
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
    }

    getAuthToken() {
        // Check localStorage first, then cookies
        let token = localStorage.getItem('authToken');
        if (!token) {
            // Try to get token from cookies
            const cookies = document.cookie.split(';');
            for (let cookie of cookies) {
                const [name, value] = cookie.trim().split('=');
                if (name === 'authToken') {
                    token = value;
                    break;
                }
            }
        }
        return token;
    }

    async checkAuthStatus() {
        try {
            const token = this.getAuthToken();
            if (!token) {
                window.location.href = '/landing';
                return;
            }

            const response = await fetch('/api/auth/verify', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                window.location.href = '/landing';
                return;
            }

            const result = await response.json();
            if (result.success) {
                this.user = result.user;
                this.updateUserDisplay();
            } else {
                window.location.href = '/landing';
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            window.location.href = '/landing';
        }
    }

    updateUserDisplay() {
        if (!this.user) return;

        // Update username display
        const usernameDisplay = document.getElementById('usernameDisplay');
        const userInitial = document.getElementById('userInitial');
        if (usernameDisplay) {
            usernameDisplay.textContent = this.user.username;
        }
        if (userInitial) {
            userInitial.textContent = (this.user.username || 'U').charAt(0).toUpperCase();
        }

        // Update daily status
        this.loadDailyScoreInfo();
    }

    updateStats() {
        const completedGames = this.submissions.filter(sub => sub.score > 0).length;
        const dayStreak = this.calculateDayStreak();
        const avgScore = this.calculateAvgScore();
        const totalWords = this.calculateTotalWords();

        // Debug logging to see actual values
        console.log('Stats calculation:', {
            submissions: this.submissions,
            completedGames,
            dayStreak,
            avgScore,
            totalWords
        });

        const completedGamesEl = document.getElementById('completedGames');
        const dayStreakEl = document.getElementById('dayStreak');
        const avgScoreEl = document.getElementById('avgScore');
        const totalWordsEl = document.getElementById('totalWords');

        // Update with correct values based on actual data
        if (completedGamesEl) completedGamesEl.textContent = completedGames;
        if (dayStreakEl) dayStreakEl.textContent = dayStreak;
        if (avgScoreEl) avgScoreEl.textContent = Math.round(avgScore);
        if (totalWordsEl) totalWordsEl.textContent = totalWords;
    }

    calculateDayStreak() {
        if (this.submissions.length === 0) return 0;
        
        const sortedSubmissions = this.submissions
            .filter(sub => sub.score > 0)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (sortedSubmissions.length === 0) return 0;
        
        let streak = 1;
        let currentDate = new Date(sortedSubmissions[0].date);
        
        for (let i = 1; i < sortedSubmissions.length; i++) {
            const submissionDate = new Date(sortedSubmissions[i].date);
            const dayDiff = Math.floor((currentDate - submissionDate) / (1000 * 60 * 60 * 24));
            
            if (dayDiff === 1) {
                streak++;
                currentDate = submissionDate;
            } else {
                break;
            }
        }
        
        return streak;
    }

    calculateAvgScore() {
        const scoredSubmissions = this.submissions.filter(sub => sub.score > 0);
        if (scoredSubmissions.length === 0) return 0;
        
        const totalScore = scoredSubmissions.reduce((sum, sub) => sum + sub.score, 0);
        return Math.round(totalScore / scoredSubmissions.length);
    }

    calculateTotalWords() {
        return this.submissions.reduce((total, sub) => {
            if (sub.poem_text) {
                return total + sub.poem_text.split(' ').length;
            }
            return total;
        }, 0);
    }

    async loadDailyScoreInfo() {
        try {
            const token = this.getAuthToken();
            const response = await fetch('/api/daily/submission-status', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                const dailyStatus = document.getElementById('dailyStatus');
                const dailyScore = document.getElementById('dailyScore');

                if (dailyStatus) {
                    if (result.can_submit) {
                        dailyStatus.textContent = 'Ready';
                        dailyStatus.style.color = '#10b981';
                    } else {
                        dailyStatus.textContent = 'Submitted';
                        dailyStatus.style.color = '#f59e0b';
                    }
                }

                if (dailyScore) {
                    if (result.daily_score !== undefined) {
                        dailyScore.textContent = result.daily_score;
                    } else {
                        dailyScore.textContent = '-';
                    }
                }
            }
        } catch (error) {
            console.error('Error loading daily score info:', error);
        }
    }

    async loadSubmissionHistory() {
        try {
            const token = this.getAuthToken();
            const response = await fetch('/api/user/submission-history', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load submission history');
            }

            const result = await response.json();
            
            if (result.success) {
                this.submissions = Object.values(result.submissions);
                this.renderGames();
                // Update stats after loading submissions
                this.updateStats();
            } else {
                console.error('Failed to load submissions:', result.message);
                this.showEmptyState();
            }
        } catch (error) {
            console.error('Error loading submission history:', error);
            this.showEmptyState();
        }
    }

    renderGames() {
        const loadingContainer = document.getElementById('loadingContainer');
        const emptyState = document.getElementById('emptyState');
        const gamesList = document.getElementById('gamesList');

        if (this.submissions.length === 0) {
            this.showEmptyState();
            return;
        }

        // Hide loading and empty states
        if (loadingContainer) loadingContainer.style.display = 'none';
        if (emptyState) emptyState.style.display = 'none';
        if (gamesList) {
            gamesList.style.display = 'block';
            gamesList.style.visibility = 'visible';
        }

        // Render game cards
        if (gamesList) {
            const gameCards = this.submissions.map(submission => this.createGameCard(submission));
            gamesList.innerHTML = gameCards.join('');
        }
    }

    createGameCard(submission) {
        // Use the actual submission date, not the date field which might be off
        const submissionDate = submission.submitted_at ? new Date(submission.submitted_at) : new Date(submission.date);
        const formattedDate = submissionDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });

        const poemPreview = submission.poem_text ? submission.poem_text.substring(0, 150) + (submission.poem_text.length > 150 ? '...' : '') : 'No poem submitted';
        const wordCount = submission.poem_text ? submission.poem_text.split(' ').length : 0;
        
        // Debug logging to see submission data
        console.log('Submission data for game card:', submission);
        
        // Determine status and styling
        const status = submission.score > 0 ? 'completed' : 'in-progress';
        const statusClass = submission.score > 0 ? 'score-completed' : 'score-in-progress';
        const statusBadge = submission.score > 0 ? 'Complete' : 'In Progress';
        const statusBadgeClass = submission.score > 0 ? 'status-completed' : 'status-in-progress';

        return `
            <div class="game-card" onclick="profilePage.showGameDetail('${submission.date}')">
                <div class="game-header">
                    <div class="game-info">
                        <div class="game-date">
                            <i class="fas fa-calendar"></i>
                            <span>${formattedDate}</span>
                        </div>
                        
                        <div class="game-score ${statusClass}">
                            <i class="fas fa-trophy"></i>
                            <span>${submission.score}/100</span>
                        </div>

                        <span class="status-badge ${statusBadgeClass}">${statusBadge}</span>
                    </div>

                    <button class="arrow-btn">
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
                
                <div class="game-details">
                    <div class="game-detail">
                        <span class="game-detail-label">Form:</span> <strong>${submission.difficulty || submission.mode || 'Easy'}</strong>
                    </div>
                    <div class="game-detail">
                        <span class="game-detail-label">Theme:</span> <strong>${submission.theme || 'Unknown'}</strong>
                    </div>
                    <div class="game-detail">
                        <span class="game-detail-label">Emotion:</span> <strong>${submission.emotion || 'Unknown'}</strong>
                    </div>
                </div>

                <div class="poem-preview">
                    "${poemPreview}"
                </div>

                <div class="game-meta">
                    <div class="word-count">
                        <i class="fas fa-clock"></i>
                        <span>${wordCount} words</span>
                    </div>
                </div>
            </div>
        `;
    }

    getScoreClass(score) {
        if (score >= 80) return 'score-excellent';
        if (score >= 60) return 'score-good';
        return 'score-fair';
    }

    showEmptyState() {
        const loadingContainer = document.getElementById('loadingContainer');
        const emptyState = document.getElementById('emptyState');
        const gamesList = document.getElementById('gamesList');

        if (loadingContainer) loadingContainer.style.display = 'none';
        if (gamesList) gamesList.style.display = 'none';
        if (emptyState) emptyState.style.display = 'flex';
    }

    showGameDetail(date) {
        const submission = this.submissions.find(s => s.date === date);
        if (!submission) return;

        const modal = document.getElementById('gameDetailModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        if (!modal || !modalTitle || !modalBody) return;

        const submissionDate = new Date(submission.date);
        const formattedDate = submissionDate.toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        modalTitle.textContent = `${formattedDate} - ${submission.score}/100`;

        modalBody.innerHTML = `
            <div class="modal-section">
                <div class="section-header">
                    <i class="fas fa-cog section-icon"></i>
                    <h3 class="section-title">Game Settings</h3>
                </div>
                <div class="game-settings-tags">
                    <span class="setting-tag tag-hard">${submission.difficulty || submission.mode || 'hard'} - Theme AND Emotion</span>
                    ${submission.required_words ? '<span class="setting-tag tag-wordbank">Word Bank Challenge</span>' : ''}
                </div>
            </div>

            <div class="modal-section">
                <div class="section-header">
                    <i class="fas fa-puzzle-piece section-icon"></i>
                    <h3 class="section-title">Prompts Used</h3>
                </div>
                <div class="prompts-section">
                    <div class="prompt-item">
                        <div class="prompt-label">Theme</div>
                        <div class="prompt-value">${submission.theme || 'Unknown'}</div>
                    </div>
                    <div class="prompt-item">
                        <div class="prompt-label">Emotion</div>
                        <div class="prompt-value">${submission.emotion || 'Unknown'}</div>
                    </div>
                </div>
            </div>

            ${submission.required_words && submission.required_words.length > 0 ? `
                <div class="modal-section">
                    <div class="section-header">
                        <span class="section-icon">≡</span>
                        <h3 class="section-title">Required Words</h3>
                    </div>
                    <div class="required-words">
                        ${submission.required_words.map(word => `
                            <div class="word-tag">${word}</div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <div class="modal-section">
                <div class="section-header">
                    <i class="fas fa-edit section-icon"></i>
                    <h3 class="section-title">Your Poem</h3>
                </div>
                <div class="poem-content" style="white-space: pre-wrap; font-family: inherit; line-height: 1.6;">${submission.poem_text || 'No poem submitted'}</div>
            </div>
        `;

        modal.classList.add('show');
    }

    closeModal() {
        const modal = document.getElementById('gameDetailModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    async logout() {
        try {
            const token = this.getAuthToken();
            if (token) {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/landing';
        }
    }
}

// Initialize the profile page
let profilePage;
document.addEventListener('DOMContentLoaded', () => {
    profilePage = new ProfilePage();
});
