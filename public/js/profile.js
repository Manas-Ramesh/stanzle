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

    async checkAuthStatus() {
        try {
            const token = localStorage.getItem('authToken');
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
        if (usernameDisplay) {
            usernameDisplay.textContent = this.user.username;
        }

        // Update user stats
        const gamesPlayed = document.getElementById('gamesPlayed');
        const bestScore = document.getElementById('bestScore');
        const totalScore = document.getElementById('totalScore');

        if (gamesPlayed) gamesPlayed.textContent = this.user.games_played || 0;
        if (bestScore) bestScore.textContent = this.user.best_score || 0;
        if (totalScore) totalScore.textContent = this.user.total_score || 0;

        // Update daily status
        this.loadDailyScoreInfo();
    }

    async loadDailyScoreInfo() {
        try {
            const token = localStorage.getItem('authToken');
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
            const token = localStorage.getItem('authToken');
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

        const scoreClass = this.getScoreClass(submission.score);
        const poemPreview = submission.poem_text.substring(0, 150) + (submission.poem_text.length > 150 ? '...' : '');

        return `
            <div class="game-card" onclick="profilePage.showGameDetail('${submission.date}')">
                <div class="game-header">
                    <div class="game-date">
                        <i class="fas fa-calendar"></i>
                        <span>${formattedDate}</span>
                    </div>
                    <div class="game-score ${scoreClass}">
                        <i class="fas fa-trophy"></i>
                        <span>${submission.score}/100</span>
                    </div>
                </div>
                
                <div class="game-tags">
                    <span class="tag tag-${submission.mode}">${submission.mode}</span>
                    ${submission.mode === 'easy' && submission.easy_selection ? 
                        `<span class="tag tag-${submission.easy_selection}">${submission.easy_selection}</span>` : 
                        `<span class="tag tag-theme">Theme: ${submission.theme}</span>
                         <span class="tag tag-emotion">Emotion: ${submission.emotion}</span>`
                    }
                    ${submission.word_bank_used ? '<span class="tag tag-wordbank">Word Bank</span>' : ''}
                </div>
                
                <div class="poem-preview">
                    ${poemPreview}
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
            <div class="detail-section">
                <h3><i class="fas fa-cog"></i> Game Settings</h3>
                <div class="game-tags">
                    <span class="tag tag-${submission.mode}">${submission.mode} - ${submission.mode === 'easy' ? 
                        (submission.easy_selection === 'theme' ? 'Theme Only' : 'Emotion Only') : 
                        'Theme AND Emotion'
                    }</span>
                    ${submission.word_bank_used ? '<span class="tag tag-wordbank">Word Bank Challenge</span>' : ''}
                </div>
            </div>

            <div class="detail-section">
                <h3><i class="fas fa-puzzle-piece"></i> Prompts Used</h3>
                <div class="challenge-cards">
                    <div class="challenge-card theme">
                        <h4>Theme</h4>
                        <div class="value">${submission.theme}</div>
                    </div>
                    <div class="challenge-card emotion">
                        <h4>Emotion</h4>
                        <div class="value">${submission.emotion}</div>
                    </div>
                </div>
            </div>

            ${submission.required_words && submission.required_words.length > 0 ? `
                <div class="detail-section">
                    <h3><i class="fas fa-list"></i> Required Words</h3>
                    <div class="words-grid">
                        ${submission.required_words.map(word => 
                            `<div class="word-item">${word}</div>`
                        ).join('')}
                    </div>
                </div>
            ` : ''}

            <div class="detail-section">
                <h3><i class="fas fa-feather-alt"></i> Your Poem</h3>
                <div class="poem-content">${submission.poem_text}</div>
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
            const token = localStorage.getItem('authToken');
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
