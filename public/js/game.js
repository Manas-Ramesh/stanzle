class StanzleGame {
    constructor() {
        this.currentMode = 'easy';
        this.selectedFocus = 'emotion'; // 'theme' or 'emotion' for easy mode - default to emotion
        this.wordBankEnabled = false;
        this.currentTheme = 'Adventure';
        this.currentEmotion = 'Joy';
        this.requiredWords = ['mountain', 'journey', 'discover', 'freedom'];
        this.poemContent = '';
        this.isUnlimitedMode = false;
        this.user = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.initializeUserMenu();
        
        // Check if we're in unlimited mode by looking at the URL or page title
        if (window.location.pathname.includes('unlimited') || document.title.includes('Unlimited')) {
            this.isUnlimitedMode = true;
            console.log('🎭 Unlimited mode detected - fresh challenges on every reload!');
        }
        
        this.generateDailyChallenge();
    }

    initializeElements() {
        this.difficultyButtons = document.querySelectorAll('.toggle-btn');
        this.wordBankToggle = document.getElementById('wordBankToggle');
        this.wordBankDisplay = document.getElementById('wordBankDisplay');
        this.wordList = document.getElementById('wordList');
        this.poemEditor = document.getElementById('poemEditor');
        this.submitBtn = document.getElementById('submitBtn');
        this.wordBankStatus = document.getElementById('wordBankStatus');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.themeWord = document.getElementById('themeWord');
        this.emotionWord = document.getElementById('emotionWord');
        this.easyModeSelection = document.getElementById('easyModeSelection');
        this.challengeDisplay = document.getElementById('challengeDisplay');
        this.focusButtons = document.querySelectorAll('.focus-btn');
        this.easyThemeWord = document.getElementById('easyThemeWord');
        this.easyEmotionWord = document.getElementById('easyEmotionWord');
        
        // New writing features (with null checks)
        this.findReplaceModal = document.getElementById('findReplaceModal');
        this.writingStats = document.getElementById('writingStats');
        this.writingPrompts = document.getElementById('writingPrompts');
        this.fontFamily = document.getElementById('fontFamily');
        this.textColor = document.getElementById('textColor');
        this.backgroundColor = document.getElementById('backgroundColor');
        
        // Log missing elements for debugging
        const missingElements = [];
        if (!this.findReplaceModal) missingElements.push('findReplaceModal');
        if (!this.writingStats) missingElements.push('writingStats');
        if (!this.writingPrompts) missingElements.push('writingPrompts');
        if (!this.fontFamily) missingElements.push('fontFamily');
        if (!this.textColor) missingElements.push('textColor');
        if (!this.backgroundColor) missingElements.push('backgroundColor');
        
        if (missingElements.length > 0) {
            console.log('Missing elements (will be handled gracefully):', missingElements);
        }
    }

    setupEventListeners() {
        // Play button (Continue Playing)
        const playBtn = document.getElementById('playBtn');
        console.log('🎮 Looking for playBtn:', playBtn);
        if (playBtn) {
            console.log('🎮 Found playBtn, adding click handler');
            playBtn.addEventListener('click', () => {
                console.log('🎮 Play button clicked!');
                this.startGame();
            });
        } else {
            console.log('🎮 No playBtn found - this might be the issue');
        }

        // Also add a document-level click handler as backup
        document.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'playBtn') {
                console.log('🎮 Play button clicked via document handler!');
                this.startGame();
            }
        });

        // Difficulty toggle
        this.difficultyButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.difficultyButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentMode = e.target.dataset.mode;
                this.updateModeDisplay();
                this.updateSubmitButton();
            });
        });

        // Set default emotion button as active
        const emotionBtn = document.querySelector('.focus-btn[data-focus="emotion"]');
        if (emotionBtn) {
            emotionBtn.classList.add('active');
        }

        // Focus selection for easy mode
        this.focusButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Remove active from all buttons
                this.focusButtons.forEach(b => b.classList.remove('active'));
                
                // Add active to clicked button
                btn.classList.add('active');
                
                // Set the selected focus
                this.selectedFocus = btn.dataset.focus;
                
                console.log('Focus selected:', this.selectedFocus);
                this.updateSubmitButton();
            });
        });

        // Theme and emotion section click handlers for easy mode
        const themeSection = document.querySelector('.theme-section');
        const emotionSection = document.querySelector('.emotion-section');
        
        if (themeSection) {
            themeSection.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (this.currentMode === 'easy') {
                    // Remove selection from emotion section
                    emotionSection.classList.remove('selected');
                    // Add selection to theme section
                    themeSection.classList.add('selected');
                    this.selectedFocus = 'theme';
                    
                    // Update focus buttons to match
                    this.focusButtons.forEach(b => b.classList.remove('active'));
                    const themeBtn = document.querySelector('.focus-btn[data-focus="theme"]');
                    if (themeBtn) themeBtn.classList.add('active');
                    
                    console.log('Theme selected via section click');
                    this.updateSubmitButton();
                }
            });
        }
        
        if (emotionSection) {
            emotionSection.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (this.currentMode === 'easy') {
                    // Remove selection from theme section
                    themeSection.classList.remove('selected');
                    // Add selection to emotion section
                    emotionSection.classList.add('selected');
                    this.selectedFocus = 'emotion';
                    
                    // Update focus buttons to match
                    this.focusButtons.forEach(b => b.classList.remove('active'));
                    const emotionBtn = document.querySelector('.focus-btn[data-focus="emotion"]');
                    if (emotionBtn) emotionBtn.classList.add('active');
                    
                    console.log('Emotion selected via section click');
                    this.updateSubmitButton();
                }
            });
        }

        // Word bank toggle
        this.wordBankToggle.addEventListener('change', (e) => {
            this.wordBankEnabled = e.target.checked;
            this.wordBankDisplay.style.display = this.wordBankEnabled ? 'block' : 'none';
            this.updateSubmitButton();
        });

        // Poem editor
        this.poemEditor.addEventListener('input', () => {
            this.poemContent = this.poemEditor.innerHTML;
            this.updateWordStatus();
            this.updateSubmitButton();
            this.updateWritingStats();
        });

        // Add visual feedback when typing
        this.poemEditor.addEventListener('keyup', () => {
            this.highlightUsedWords();
        });

        // Editor toolbar
        document.querySelectorAll('.toolbar-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const command = e.target.closest('.toolbar-btn').dataset.command;
                this.executeCommand(command);
            });
        });

        // Font size change
        const fontSizeSelect = document.getElementById('fontSize');
        if (fontSizeSelect) {
            fontSizeSelect.addEventListener('change', (e) => {
            this.executeCommand('fontSize', e.target.value);
        });
        }

        // Font family change
        if (this.fontFamily) {
        this.fontFamily.addEventListener('change', (e) => {
            this.executeCommand('fontName', e.target.value);
        });
        }

        // Color pickers
        if (this.textColor) {
        this.textColor.addEventListener('change', (e) => {
            this.executeCommand('foreColor', e.target.value);
        });
        }

        if (this.backgroundColor) {
        this.backgroundColor.addEventListener('change', (e) => {
            this.executeCommand('backColor', e.target.value);
        });
        }

        // Advanced features
        const findReplaceBtn = document.getElementById('findReplaceBtn');
        if (findReplaceBtn && this.findReplaceModal) {
            findReplaceBtn.addEventListener('click', () => {
            this.findReplaceModal.style.display = 'flex';
        });
        }

        const wordCountBtn = document.getElementById('wordCountBtn');
        if (wordCountBtn) {
            wordCountBtn.addEventListener('click', () => {
            this.toggleWritingStats();
        });
        }

        const writingPromptsBtn = document.getElementById('writingPromptsBtn');
        if (writingPromptsBtn) {
            writingPromptsBtn.addEventListener('click', () => {
            this.toggleWritingPrompts();
        });
        }

        const rhymeHelperBtn = document.getElementById('rhymeHelperBtn');
        if (rhymeHelperBtn) {
            rhymeHelperBtn.addEventListener('click', () => {
            this.showRhymeHelper();
        });
        }

        const thesaurusBtn = document.getElementById('thesaurusBtn');
        if (thesaurusBtn) {
            thesaurusBtn.addEventListener('click', () => {
            this.showThesaurus();
        });
        }

        // Find & Replace functionality
        this.setupFindReplace();

        // Submit button
        this.submitBtn.addEventListener('click', () => {
            this.submitPoem();
        });
    }

    executeCommand(command, value = null) {
        document.execCommand(command, false, value);
        this.poemEditor.focus();
    }

    updateModeDisplay() {
        if (this.currentMode === 'easy') {
            // Show easy mode selection (theme/emotion choice)
            this.easyModeSelection.style.display = 'block';
            this.challengeDisplay.style.display = 'none';
            
            // Clear any previous selections and reset focus
            document.querySelector('.theme-section')?.classList.remove('selected');
            document.querySelector('.emotion-section')?.classList.remove('selected');
            this.selectedFocus = null; // Reset focus selection - user MUST choose
            
            // Update submit button to be disabled until selection is made
            this.updateSubmitButton();
        } else {
            // Hide easy mode selection, show challenge display (uses both theme and emotion)
            this.easyModeSelection.style.display = 'none';
            this.challengeDisplay.style.display = 'flex';
            
            // Clear any previous selections
            document.querySelector('.theme-section')?.classList.remove('selected');
            document.querySelector('.emotion-section')?.classList.remove('selected');
            this.selectedFocus = 'both'; // Hard mode uses both
        }
    }

    startGame() {
        console.log('🎮 Starting game...');
        // Hide the landing page elements and show the game interface
        const landingElements = document.querySelectorAll('.landing-page, .game-intro');
        landingElements.forEach(el => {
            if (el) el.style.display = 'none';
        });
        
        // Show the game interface
        const gameInterface = document.querySelector('.game-interface');
        if (gameInterface) {
            gameInterface.style.display = 'block';
        }
        
        // Generate the challenge
        this.generateDailyChallenge();
    }

    async generateDailyChallenge() {
        // Clean up any existing word bank status elements first
        const allStatusElements = document.querySelectorAll('#wordBankStatus');
        allStatusElements.forEach(element => element.remove());
        
        if (this.isUnlimitedMode) {
            // Always generate new challenge for unlimited mode
            console.log('Unlimited mode: generating fresh challenge');
            await this.generateNewChallenge();
        } else {
            // Check if we have a saved daily challenge for today
            const today = new Date().toDateString();
            const savedChallenge = this.getSavedDailyChallenge();
            
            if (savedChallenge && savedChallenge.date === today) {
                // Use saved challenge for today
                this.currentTheme = savedChallenge.theme;
                this.currentEmotion = savedChallenge.emotion;
                this.requiredWords = savedChallenge.words;
                console.log('DEBUG: Using saved daily challenge for', today, '- Theme:', this.currentTheme, 'Emotion:', this.currentEmotion);
                console.log('DEBUG: Saved challenge data:', savedChallenge);
                
                // Track this challenge for archive purposes (in case it wasn't tracked before)
                console.log('DEBUG: Attempting to track existing challenge');
                this.trackChallengeForArchive({
                    theme: this.currentTheme,
                    emotion: this.currentEmotion,
                    words: this.requiredWords
                });
            } else {
                console.log('DEBUG: No saved challenge found, generating new one');
                await this.generateNewChallenge();
                
                // Save the challenge for today (only for daily mode)
                this.saveDailyChallenge({
                    date: today,
                    theme: this.currentTheme,
                    emotion: this.currentEmotion,
                    words: this.requiredWords
                });
                console.log('DEBUG: Saved new challenge to localStorage');
                
                // Track the challenge for archive purposes
                this.trackChallengeForArchive({
                    theme: this.currentTheme,
                    emotion: this.currentEmotion,
                    words: this.requiredWords
                });
            }
        }

        console.log('🔍 Updating UI with new challenge:', {
            theme: this.currentTheme,
            emotion: this.currentEmotion,
            words: this.requiredWords
        });
        
        this.themeWord.textContent = this.currentTheme;
        this.emotionWord.textContent = this.currentEmotion;
        this.easyThemeWord.textContent = this.currentTheme;
        this.easyEmotionWord.textContent = this.currentEmotion;
        
        console.log('🔍 UI elements updated:', {
            themeWord: this.themeWord.textContent,
            emotionWord: this.emotionWord.textContent,
            easyThemeWord: this.easyThemeWord.textContent,
            easyEmotionWord: this.easyEmotionWord.textContent
        });
        
        // Clear the poem editor for new challenge
        this.poemEditor.innerHTML = '';
        this.poemContent = '';
        
        // Clear word bank status before updating word list
        if (this.wordBankStatus) {
            this.wordBankStatus.textContent = '';
            this.wordBankStatus.className = 'word-bank-status';
            this.wordBankStatus.style.display = 'none';
            // Force a complete reset by removing and recreating the element
            this.wordBankStatus.remove();
        }
        
        // Create new word bank status element
        this.wordBankStatus = document.createElement('div');
        this.wordBankStatus.id = 'wordBankStatus';
        this.wordBankStatus.className = 'word-bank-status';
        this.wordBankStatus.style.display = 'none';
        // Re-insert it in the DOM
        this.poemEditor.parentNode.insertBefore(this.wordBankStatus, this.poemEditor.nextSibling);
        
        // Also remove any existing word bank status elements to prevent duplicates
        const existingStatusElements = document.querySelectorAll('#wordBankStatus');
        existingStatusElements.forEach(element => {
            if (element !== this.wordBankStatus) {
                element.remove();
            }
        });
        
        this.updateWordList();
        this.updateModeDisplay();
        
        // Force sync required words after updating word list in unlimited mode
        if (this.isUnlimitedMode) {
            // Immediate sync first
            const uiWords = Array.from(this.wordList.children).map(el => el.textContent);
            if (uiWords.length > 0 && JSON.stringify(this.requiredWords) !== JSON.stringify(uiWords)) {
                console.log('🔧 Immediate sync: Syncing required words from UI');
                this.requiredWords = uiWords;
            }
            
            // Then delayed sync as backup
            setTimeout(() => {
                const uiWordsDelayed = Array.from(this.wordList.children).map(el => el.textContent);
                if (uiWordsDelayed.length > 0 && JSON.stringify(this.requiredWords) !== JSON.stringify(uiWordsDelayed)) {
                    console.log('🔧 Delayed sync: Syncing required words from UI');
                    this.requiredWords = uiWordsDelayed;
                    this.updateSubmitButton();
                }
            }, 50);
        }
        
        // Reset submit button state
        this.updateSubmitButton();
        
        // Force update submit button state for unlimited mode
        if (this.isUnlimitedMode) {
            console.log('🎭 Unlimited mode: Forcing submit button update after challenge generation');
            setTimeout(() => {
                this.updateSubmitButton();
            }, 100);
        }
        
        // Clear any previous results
        if (this.resultsContainer) {
            this.resultsContainer.style.display = 'none';
        }
        
        // Remove any retry options from previous games
        const retryContainer = document.getElementById('retryOptions');
        if (retryContainer) {
            retryContainer.remove();
        }
    }

    async generateNewChallenge() {
        try {
            console.log('DEBUG: Calling /api/challenge endpoint');
            const response = await fetch('/api/challenge', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();
            console.log('DEBUG: API response:', result);
            
            if (result.success) {
                this.currentTheme = result.challenge.theme;
                this.currentEmotion = result.challenge.emotion;
                this.requiredWords = result.challenge.words;
                console.log('🔍 New challenge data received:', {
                    theme: this.currentTheme,
                    emotion: this.currentEmotion,
                    words: this.requiredWords
                });
            } else {
                // Fallback to predefined challenges if API fails
                console.log('DEBUG: API failed, using fallback');
                this.useFallbackChallenge();
            }
        } catch (error) {
            console.error('Error fetching daily challenge:', error);
            this.useFallbackChallenge();
        }
    }

    useFallbackChallenge() {
        // Fallback challenges when Wordnik API is unavailable
        const themes = ['Adventure', 'Love', 'Nature', 'Dreams', 'Time', 'Hope', 'Loss', 'Freedom'];
        const emotions = ['Joy', 'Sadness', 'Anger', 'Fear', 'Surprise', 'Peace', 'Excitement', 'Nostalgia'];
        const wordBanks = [
            ['mountain', 'journey', 'discover', 'freedom'],
            ['heart', 'soul', 'passion', 'forever'],
            ['tree', 'wind', 'ocean', 'sky'],
            ['sleep', 'dream', 'reality', 'awake'],
            ['clock', 'moment', 'eternity', 'now'],
            ['light', 'dark', 'shine', 'bright'],
            ['tear', 'smile', 'memory', 'goodbye'],
            ['bird', 'cage', 'fly', 'free']
        ];

        const randomIndex = Math.floor(Math.random() * themes.length);
        this.currentTheme = themes[randomIndex];
        this.currentEmotion = emotions[randomIndex];
        this.requiredWords = wordBanks[randomIndex];
    }

    saveDailyChallenge(challenge) {
        localStorage.setItem('stanzle_daily_challenge', JSON.stringify(challenge));
    }

    getSavedDailyChallenge() {
        const saved = localStorage.getItem('stanzle_daily_challenge');
        console.log('DEBUG: Raw localStorage data:', saved);
        const parsed = saved ? JSON.parse(saved) : null;
        console.log('DEBUG: Parsed challenge data:', parsed);
        return parsed;
    }

    async trackChallengeForArchive(challengeData) {
        try {
            console.log('DEBUG: trackChallengeForArchive called with:', challengeData);
            console.log('DEBUG: Making request to /api/archive/track');
            const response = await fetch('/api/archive/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(challengeData)
            });

            console.log('DEBUG: Response status:', response.status);
            const result = await response.json();
            console.log('DEBUG: Response data:', result);
            
            if (result.success) {
                console.log('DEBUG: Challenge tracked successfully');
            } else {
                console.error('DEBUG: Failed to track challenge:', result.error);
            }
        } catch (error) {
            console.error('DEBUG: Error tracking challenge:', error);
        }
    }

    // Method to clear localStorage for testing
    clearDailyChallenge() {
        localStorage.removeItem('stanzle_daily_challenge');
        console.log('DEBUG: Cleared daily challenge from localStorage');
    }

    // Method to force generate a new challenge (for testing)
    async forceNewChallenge() {
        console.log('🎭 Forcing new challenge generation');
        this.clearDailyChallenge();
        await this.generateNewChallenge();
        console.log('🎭 New challenge generated - Theme:', this.currentTheme, 'Emotion:', this.currentEmotion);
        
        // Update UI with new challenge data
        this.themeWord.textContent = this.currentTheme;
        this.emotionWord.textContent = this.currentEmotion;
        this.easyThemeWord.textContent = this.currentTheme;
        this.easyEmotionWord.textContent = this.currentEmotion;
        
        // Update word list
        this.updateWordList();
        
        // Update mode display
        this.updateModeDisplay();
        
        console.log('🎭 UI updated with new challenge data');
    }

    updateWordList() {
        console.log('🔍 updateWordList called with requiredWords:', this.requiredWords);
        this.wordList.innerHTML = '';
        this.requiredWords.forEach(word => {
            const wordElement = document.createElement('span');
            wordElement.className = 'word-item';
            wordElement.textContent = word;
            wordElement.dataset.word = word.toLowerCase();
            this.wordList.appendChild(wordElement);
        });
        console.log('🔍 Word list updated, children count:', this.wordList.children.length);
        
        // Debug logging for unlimited mode
        if (this.isUnlimitedMode) {
            console.log('🎭 updateWordList: Updated word list:', {
                requiredWords: this.requiredWords,
                wordListChildren: Array.from(this.wordList.children).map(el => el.textContent)
            });
            
            // Auto-sync required words from UI to fix state mismatch
            const uiWords = Array.from(this.wordList.children).map(el => el.textContent);
            if (JSON.stringify(this.requiredWords) !== JSON.stringify(uiWords)) {
                console.log('🔧 Auto-syncing required words from UI:', {
                    oldRequiredWords: this.requiredWords,
                    newRequiredWords: uiWords
                });
                this.requiredWords = uiWords;
            }
        }
        
        // Clear any previous word bank status when generating new challenge
        if (this.wordBankStatus) {
            this.wordBankStatus.textContent = '';
            this.wordBankStatus.className = 'word-bank-status';
            this.wordBankStatus.style.display = 'none';
            // Force clear any cached content
            this.wordBankStatus.innerHTML = '';
        }
        
        // Remove any duplicate word bank status elements
        const allStatusElements = document.querySelectorAll('#wordBankStatus');
        allStatusElements.forEach((element, index) => {
            if (index > 0) { // Keep only the first one
                element.remove();
            }
        });
        
        this.updateWordStatus();
    }

    updateWordStatus() {
        if (!this.wordBankEnabled) return;
        
        const poemText = this.poemEditor.textContent.toLowerCase();
        const wordElements = document.querySelectorAll('.word-item');
        
        wordElements.forEach(element => {
            const word = element.dataset.word;
            const isUsed = poemText.includes(word);
            
            // Remove existing status classes
            element.classList.remove('word-used', 'word-missing');
            
            if (isUsed) {
                element.classList.add('word-used');
            } else {
                element.classList.add('word-missing');
            }
        });
    }

    highlightUsedWords() {
        if (!this.wordBankEnabled) return;
        
        // Add a brief highlight effect to word items when they're used
        const poemText = this.poemEditor.textContent.toLowerCase();
        const wordElements = document.querySelectorAll('.word-item');
        
        wordElements.forEach(element => {
            const word = element.dataset.word;
            const isUsed = poemText.includes(word);
            
            if (isUsed && !element.classList.contains('word-used')) {
                // Add a brief flash effect when a word is first used
                element.classList.add('word-flash');
                setTimeout(() => {
                    element.classList.remove('word-flash');
                }, 1000);
            }
        });
    }

    updateSubmitButton() {
        // Use textContent for consistent checking
        const poemText = this.poemEditor.textContent.trim();
        const hasContent = poemText.length > 0;
        let canSubmit = hasContent;

        // In easy mode, require focus selection (theme or emotion)
        if (this.currentMode === 'easy' && !this.selectedFocus) {
            canSubmit = false;
        }

        // Auto-sync required words in unlimited mode before checking
        if (this.isUnlimitedMode && this.wordBankEnabled) {
            const uiWords = Array.from(this.wordList.children).map(el => el.textContent);
            if (uiWords.length > 0 && JSON.stringify(this.requiredWords) !== JSON.stringify(uiWords)) {
                console.log('🔧 Auto-sync in updateSubmitButton: Syncing required words');
                this.requiredWords = uiWords;
            }
        }

        // Check if wordBankStatus element exists
        if (!this.wordBankStatus) {
            this.wordBankStatus = document.getElementById('wordBankStatus');
        }

        if (this.wordBankEnabled && hasContent && this.wordBankStatus) {
            const missingWords = this.getMissingWords();
            const usedWords = this.requiredWords.filter(word => 
                poemText.toLowerCase().includes(word.toLowerCase())
            );
            
            canSubmit = missingWords.length === 0;
            
            if (missingWords.length > 0) {
                this.wordBankStatus.textContent = `Missing words: ${missingWords.join(', ')} (${usedWords.length}/${this.requiredWords.length} used)`;
                this.wordBankStatus.className = 'word-bank-status error';
                this.wordBankStatus.style.display = 'block';
            } else {
                this.wordBankStatus.textContent = `All required words included! (${usedWords.length}/${this.requiredWords.length} used)`;
                this.wordBankStatus.className = 'word-bank-status success';
                this.wordBankStatus.style.display = 'block';
            }
        } else if (this.wordBankEnabled && !hasContent && this.wordBankStatus) {
            this.wordBankStatus.textContent = 'Write a poem first';
            this.wordBankStatus.className = 'word-bank-status';
            this.wordBankStatus.style.display = 'block';
        } else if (this.wordBankStatus) {
            this.wordBankStatus.textContent = '';
            this.wordBankStatus.style.display = 'none';
        }

        this.submitBtn.disabled = !canSubmit;
        
        // Debug logging for unlimited mode
        if (this.isUnlimitedMode && this.wordBankEnabled) {
            console.log('🎭 Unlimited mode: Submit button update:', {
                hasContent: hasContent,
                poemText: poemText,
                canSubmit: canSubmit,
                submitBtnDisabled: this.submitBtn.disabled,
                requiredWords: this.requiredWords,
                missingWords: this.getMissingWords(),
                statusText: this.wordBankStatus ? this.wordBankStatus.textContent : 'No status element'
            });
        }
        
        // Add manual debug function to window for testing
        if (this.isUnlimitedMode) {
            window.debugSubmitButton = () => {
                console.log('🔧 Manual submit button debug:', {
                    poemText: this.poemEditor.textContent,
                    hasContent: this.poemEditor.textContent.trim().length > 0,
                    wordBankEnabled: this.wordBankEnabled,
                    requiredWords: this.requiredWords,
                    missingWords: this.getMissingWords(),
                    submitBtnDisabled: this.submitBtn.disabled,
                    submitBtnText: this.submitBtn.textContent
                });
                this.updateSubmitButton();
            };
            
            // Add force enable function
            window.forceEnableSubmit = () => {
                console.log('🔧 Force enabling submit button');
                this.submitBtn.disabled = false;
                this.submitBtn.style.opacity = '1';
                this.submitBtn.style.cursor = 'pointer';
            };
            
            // Add sync function to fix word mismatch
            window.syncRequiredWords = () => {
                console.log('🔧 Syncing required words from UI');
                const uiWords = Array.from(this.wordList.children).map(el => el.textContent);
                console.log('UI words:', uiWords);
                console.log('Current requiredWords:', this.requiredWords);
                this.requiredWords = uiWords;
                console.log('Updated requiredWords:', this.requiredWords);
                this.updateSubmitButton();
            };
        }
    }

    getMissingWords() {
        const poemText = this.poemEditor.textContent.toLowerCase();
        const missing = this.requiredWords.filter(word => 
            !poemText.includes(word.toLowerCase())
        );
        
        // Debug logging for unlimited mode
        if (this.isUnlimitedMode) {
            console.log('🔍 getMissingWords debug:', {
                poemText: poemText,
                requiredWords: this.requiredWords,
                missingWords: missing,
                wordChecks: this.requiredWords.map(word => ({
                    word: word,
                    found: poemText.includes(word.toLowerCase())
                }))
            });
        }
        
        return missing;
    }

    async submitPoem() {
        if (this.submitBtn.disabled) return;

        // Check daily submission status first (only for daily mode)
        if (!this.isUnlimitedMode) {
            const submissionStatus = await this.checkDailySubmissionStatus();
            if (!submissionStatus.can_submit) {
                alert(submissionStatus.message);
                return;
            }
        }

        this.submitBtn.innerHTML = '<div class="loading"></div> Processing...';
        this.submitBtn.disabled = true;

        try {
            // Get the poem content - clone the editor and remove any word bank elements
            const editorClone = this.poemEditor.cloneNode(true);
            const wordBankElements = editorClone.querySelectorAll('.word-item, .word-bank-display, [class*="word-"]');
            wordBankElements.forEach(el => el.remove());
            
            const poemWithFormatting = editorClone.innerHTML;
            const poemText = editorClone.textContent.trim();
            
            console.log('Poem text:', poemText);
            console.log('Poem length:', poemText.length);
            console.log('Required words:', this.requiredWords);
            console.log('Original editor content:', this.poemEditor.textContent);
            console.log('Cleaned poem content:', poemText);
            
            if (!poemText || poemText.trim().length === 0) {
                alert('Please write a poem before submitting!');
                this.submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Poem';
                this.submitBtn.disabled = false;
                return;
            }

            // Step 1: Get AI's guess of theme/emotion
            const guess = await this.getAIGuess(poemText);
            
            if (this.isUnlimitedMode) {
                console.log('🎭 Unlimited mode: AI guess received:', guess);
                console.log('🎭 Unlimited mode: Current theme/emotion:', this.currentTheme, this.currentEmotion);
            }
            
            // Step 2: Calculate scores
            const scores = await this.calculateScores(guess, poemText);
            
            // Step 3: Submit daily score (only for daily mode)
            if (!this.isUnlimitedMode) {
                await this.submitDailyScore(scores.totalScore, {
                    mode: this.currentMode,
                    easy_selection: this.currentMode === 'easy' ? this.easySelection : null,
                    word_bank_used: this.wordBankEnabled,
                    theme: this.currentTheme,
                    emotion: this.currentEmotion,
                    required_words: this.requiredWords,
                    poem_text: poemText,
                    poem_html: poemWithFormatting,
                    ai_guess: guess
                });
            }
            
            // Step 4: Display results
            this.displayResults(scores, guess);

        } catch (error) {
            console.error('Error submitting poem:', error);
            alert('There was an error processing your poem. Please try again.');
        } finally {
            this.submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Poem';
            this.submitBtn.disabled = false;
        }
    }

    async getAIGuess(poemContent) {
        try {
            const requestData = {
                poem: poemContent,
                mode: this.currentMode
            };
            
            // Only add focus for easy mode
            if (this.currentMode === 'easy') {
                requestData.focus = this.selectedFocus;
            }
            console.log('Sending analyze request:', requestData);
            if (this.isUnlimitedMode) {
                console.log('🎭 Unlimited mode: Getting AI guess for poem');
            }
            
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();
            
            if (this.isUnlimitedMode) {
                console.log('🎭 Unlimited mode: AI analysis result:', result);
            }
            
            if (result.success) {
                return result.result;
            } else {
                throw new Error(result.error || 'Failed to analyze poem');
            }
        } catch (error) {
            console.error('Error analyzing poem:', error);
            // Fallback to mock response if server is not available
            if (this.currentMode === 'easy') {
                return {
                    [this.selectedFocus]: this.selectedFocus === 'theme' ? this.getRandomTheme() : this.getRandomEmotion(),
                    confidence: 0.5
                };
            } else {
                return {
                    theme: this.getRandomTheme(),
                    emotion: this.getRandomEmotion(),
                    confidence: 0.5
                };
            }
        }
    }

    async calculateScores(guess, poemContent) {
        try {
            // Clean the ai_guess object to remove any contamination
            const cleanGuess = {
                theme: guess.theme,
                emotion: guess.emotion,
                confidence: guess.confidence
            };
            
            const requestData = {
                    poem: poemContent,
                    intended_theme: this.currentTheme,
                    intended_emotion: this.currentEmotion,
                    ai_guess: cleanGuess,
                difficulty: this.currentMode
            };
            
            // Only add focus for easy mode
            if (this.currentMode === 'easy') {
                requestData.focus = this.selectedFocus;
            }
            console.log('Sending score request:', requestData);
            if (this.isUnlimitedMode) {
                console.log('🎭 Unlimited mode: Calculating scores with guess:', guess);
                console.log('🎭 Unlimited mode: Full request data being sent:', JSON.stringify(requestData, null, 2));
            }
            
            const response = await fetch('/api/score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();
            
            if (this.isUnlimitedMode) {
                console.log('🎭 Unlimited mode: Scoring result:', result);
            }
            
            if (result.success) {
                return result.result;
            } else {
                throw new Error(result.error || 'Failed to score poem');
            }
        } catch (error) {
            console.error('Error scoring poem:', error);
            // Fallback to mock scoring if server is not available
            if (!guess) {
                console.error('No AI guess available for scoring');
                return {
                    themeScore: 0,
                    emotionScore: 0,
                    creativityScore: 0,
                    totalScore: 0,
                    feedback: "Unable to analyze poem - AI analysis failed"
                };
            }
            
            if (this.currentMode === 'easy') {
                const focusMatch = this.calculateMatch(
                    this.selectedFocus === 'theme' ? this.currentTheme : this.currentEmotion,
                    guess[this.selectedFocus] || ''
                );
                
                return {
                    [this.selectedFocus + 'Score']: Math.floor(focusMatch * 80),
                    creativityScore: Math.floor(Math.random() * 20) + 5,
                    feedback: this.generateFeedback(focusMatch, 0),
                    totalScore: 0
                };
            } else {
                const themeMatch = this.calculateMatch(this.currentTheme, guess.theme || '');
                const emotionMatch = this.calculateMatch(this.currentEmotion, guess.emotion || '');
                
                return {
                    themeScore: Math.floor(themeMatch * 40),
                    emotionScore: Math.floor(emotionMatch * 40),
                    creativityScore: Math.floor(Math.random() * 20) + 5,
                    feedback: this.generateFeedback(themeMatch, emotionMatch),
                    totalScore: 0
                };
            }
        }
    }

    calculateMatch(intended, guessed) {
        // Simple similarity calculation
        if (!intended || !guessed) return 0;
        
        const intendedWords = intended.toLowerCase().split(' ');
        const guessedWords = guessed.toLowerCase().split(' ');
        
        let matches = 0;
        intendedWords.forEach(word => {
            if (guessedWords.some(gWord => gWord.includes(word) || word.includes(gWord))) {
                matches++;
            }
        });
        
        return matches / Math.max(intendedWords.length, guessedWords.length);
    }

    generateFeedback(themeMatch, emotionMatch) {
        const feedbacks = [
            "Your poem beautifully captures the essence of the challenge!",
            "Great work! The imagery really brings the theme to life.",
            "Wonderful creativity! Your unique perspective shines through.",
            "Excellent use of language and emotion in your piece.",
            "Your poem demonstrates great understanding of the theme."
        ];
        
        return feedbacks[Math.floor(Math.random() * feedbacks.length)];
    }

    displayResults(scores, guess) {
        if (this.isUnlimitedMode) {
            console.log('🎭 Unlimited mode: Displaying results with scores:', scores, 'guess:', guess);
        }
        
        if (this.currentMode === 'easy') {
            // Hide the score item that's not being used
            const themeScoreItem = document.getElementById('themeScoreItem');
            const emotionScoreItem = document.getElementById('emotionScoreItem');
            
            if (this.selectedFocus === 'theme') {
                themeScoreItem.style.display = 'flex';
                emotionScoreItem.style.display = 'none';
                if (this.isUnlimitedMode) {
                    document.getElementById('unlimitedThemeScore').textContent = `${scores.themeScore || 0}/80`;
                    document.getElementById('unlimitedEmotionScore').textContent = `0/80`;
                } else {
                    document.getElementById('themeScore').textContent = `${scores.themeScore || 0}/80`;
                    document.getElementById('emotionScore').textContent = `0/80`;
                }
            } else {
                themeScoreItem.style.display = 'none';
                emotionScoreItem.style.display = 'flex';
                if (this.isUnlimitedMode) {
                    document.getElementById('unlimitedThemeScore').textContent = `0/80`;
                    document.getElementById('unlimitedEmotionScore').textContent = `${scores.emotionScore || 0}/80`;
                } else {
                    document.getElementById('themeScore').textContent = `0/80`;
                    document.getElementById('emotionScore').textContent = `${scores.emotionScore || 0}/80`;
                }
            }
            
            // For easy mode, only one score is used based on selected focus
            const focusScore = this.selectedFocus === 'theme' ? (scores.themeScore || 0) : (scores.emotionScore || 0);
            const creativityScore = scores.creativityScore || 0;
            const totalScore = (scores.totalScore !== undefined && scores.totalScore !== null) ? scores.totalScore : (focusScore + creativityScore);
            
            console.log('🎭 Easy mode scoring:', {
                focusScore,
                creativityScore,
                totalScore,
                scores,
                totalScoreType: typeof scores.totalScore,
                totalScoreValue: scores.totalScore
            });
            
            // Use different IDs for unlimited mode vs daily mode
            if (this.isUnlimitedMode) {
                document.getElementById('unlimitedCreativityScore').textContent = `${creativityScore}/20`;
                document.getElementById('unlimitedTotalScore').textContent = `${totalScore}/100`;
                console.log('🔧 SETTING UNLIMITED EASY MODE TOTAL SCORE TO:', `${totalScore}/100`);
            } else {
                document.getElementById('creativityScore').textContent = `${creativityScore}/20`;
                document.getElementById('totalScore').textContent = `${totalScore}/100`;
                console.log('🔧 SETTING DAILY EASY MODE TOTAL SCORE TO:', `${totalScore}/100`);
            }
            
            document.getElementById('aiFeedback').innerHTML = `
                <strong>AI Analysis:</strong><br>
                <strong>Guessed ${this.selectedFocus === 'theme' ? 'Theme' : 'Emotion'}:</strong> ${guess[this.selectedFocus]}<br>
                <strong>Confidence:</strong> ${Math.round((guess.confidence || 0.5) * 100)}%<br><br>
                <strong>Feedback:</strong> ${scores.feedback}
            `;
        } else {
            // Hard mode - show both scores
            const themeScoreItem = document.getElementById('themeScoreItem');
            const emotionScoreItem = document.getElementById('emotionScoreItem');
            themeScoreItem.style.display = 'flex';
            emotionScoreItem.style.display = 'flex';
            
            const themeScore = scores.themeScore || 0;
            const emotionScore = scores.emotionScore || 0;
            const creativityScore = scores.creativityScore || 0;
            const totalScore = (scores.totalScore !== undefined && scores.totalScore !== null) ? scores.totalScore : (themeScore + emotionScore + creativityScore);
            
            console.log('🔧 FIXED TOTAL SCORE CALCULATION:', totalScore);
            console.log('🎭 Hard mode scoring:', {
                themeScore,
                emotionScore,
                creativityScore,
                totalScore,
                scores,
                totalScoreType: typeof scores.totalScore,
                totalScoreValue: scores.totalScore
            });
            
            // Use different IDs for unlimited mode vs daily mode
            if (this.isUnlimitedMode) {
                document.getElementById('unlimitedThemeScore').textContent = `${themeScore}/40`;
                document.getElementById('unlimitedEmotionScore').textContent = `${emotionScore}/40`;
                document.getElementById('unlimitedCreativityScore').textContent = `${creativityScore}/20`;
                document.getElementById('unlimitedTotalScore').textContent = `${totalScore}/100`;
                console.log('🔧 SETTING UNLIMITED HTML TOTAL SCORE TO:', `${totalScore}/100`);
            } else {
                document.getElementById('themeScore').textContent = `${themeScore}/40`;
                document.getElementById('emotionScore').textContent = `${emotionScore}/40`;
                document.getElementById('creativityScore').textContent = `${creativityScore}/20`;
                document.getElementById('totalScore').textContent = `${totalScore}/100`;
                console.log('🔧 SETTING DAILY HTML TOTAL SCORE TO:', `${totalScore}/100`);
            }
            
            document.getElementById('aiFeedback').innerHTML = `
                <strong>AI Analysis:</strong><br>
                <strong>Guessed Theme:</strong> ${guess.theme}<br>
                <strong>Guessed Emotion:</strong> ${guess.emotion}<br>
                <strong>Confidence:</strong> ${Math.round((guess.confidence || 0.5) * 100)}%<br><br>
                <strong>Feedback:</strong> ${scores.feedback}
            `;
        }
        
        // Add retry options
        this.addRetryOptions();
        
        this.resultsContainer.style.display = 'block';
        this.resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    async addRetryOptions() {
        // Check if retry options already exist
        let retryContainer = document.getElementById('retryOptions');
        if (retryContainer) {
            retryContainer.remove();
        }

        // Create retry options container
        retryContainer = document.createElement('div');
        retryContainer.id = 'retryOptions';
        retryContainer.className = 'retry-options';
        
        let retryText;
        
        if (this.isUnlimitedMode) {
            retryText = `<h3>What's Next?</h3>
            <div class="retry-buttons">
                <button class="retry-btn daily-retry" id="dailyRetryBtn">
                    <i class="fas fa-calendar-day"></i>
                    Try This Challenge Again
                </button>
                <button class="retry-btn unlimited-retry" id="unlimitedRetryBtn">
                    <i class="fas fa-infinity"></i>
                    New Challenge
                </button>
            </div>`;
        } else {
            // For daily mode, check if user has already submitted today
            const submissionStatus = await this.checkDailySubmissionStatus();
            
            if (submissionStatus.can_submit) {
                // User can still submit daily challenge
                retryText = `<h3>What's Next?</h3>
                <div class="retry-buttons">
                    <button class="retry-btn daily-retry" id="dailyRetryBtn">
                        <i class="fas fa-calendar-day"></i>
                        Try Daily Challenge Again
                    </button>
                    <button class="retry-btn unlimited-retry" id="unlimitedRetryBtn">
                        <i class="fas fa-infinity"></i>
                        Try Unlimited Mode
                    </button>
                </div>`;
            } else {
                // User has already submitted today, show unlimited option prominently
                retryText = `<h3>Daily Challenge Complete! 🎉</h3>
                <p style="color: #6b7280; margin-bottom: 20px;">You've already submitted today's daily challenge. Keep practicing with unlimited mode!</p>
                <div class="retry-buttons">
                    <button class="retry-btn unlimited-retry primary" id="unlimitedRetryBtn">
                        <i class="fas fa-infinity"></i>
                        Try Unlimited Mode
                    </button>
                    <button class="retry-btn daily-retry secondary" id="dailyRetryBtn">
                        <i class="fas fa-calendar-day"></i>
                        View Daily Challenge
                    </button>
                </div>`;
            }
        }
        
        retryContainer.innerHTML = retryText;

        // Insert after results container
        this.resultsContainer.parentNode.insertBefore(retryContainer, this.resultsContainer.nextSibling);

        // Add event listeners
        document.getElementById('dailyRetryBtn').addEventListener('click', () => {
            this.resetForRetry();
        });

        document.getElementById('unlimitedRetryBtn').addEventListener('click', async () => {
            if (this.isUnlimitedMode) {
                // Generate a completely new challenge for unlimited mode
                console.log('🎭 New Challenge button clicked - generating new challenge');
                await this.forceNewChallenge();
                this.resetForRetry();
            } else {
                window.location.href = '/unlimited.html';
            }
        });
    }

    resetForRetry() {
        // Clear the poem editor
        this.poemEditor.innerHTML = '';
        
        // Hide results
        this.resultsContainer.style.display = 'none';
        
        // Remove retry options
        const retryContainer = document.getElementById('retryOptions');
        if (retryContainer) {
            retryContainer.remove();
        }
        
        // Reset submit button
        this.submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Poem';
        this.submitBtn.disabled = false;
        
        // Focus on editor
        this.poemEditor.focus();
    }

    getRandomTheme() {
        const themes = ['Adventure', 'Love', 'Nature', 'Dreams', 'Time', 'Hope', 'Loss', 'Freedom'];
        return themes[Math.floor(Math.random() * themes.length)];
    }

    getRandomEmotion() {
        const emotions = ['Joy', 'Sadness', 'Anger', 'Fear', 'Surprise', 'Peace', 'Excitement', 'Nostalgia'];
        return emotions[Math.floor(Math.random() * emotions.length)];
    }

    // Advanced Writing Features
    setupFindReplace() {
        const findBtn = document.getElementById('findBtn');
        const replaceBtn = document.getElementById('replaceBtn');
        const replaceAllBtn = document.getElementById('replaceAllBtn');
        const closeBtn = document.getElementById('closeModalBtn');
        const findText = document.getElementById('findText');
        const replaceText = document.getElementById('replaceText');
        
        // Check if elements exist before adding event listeners
        if (!findBtn || !replaceBtn || !replaceAllBtn || !closeBtn || !findText || !replaceText) {
            console.log('Find & Replace elements not found, skipping setup');
            return;
        }

        findBtn.addEventListener('click', () => {
            const text = findText.value;
            if (text) {
                this.findText(text);
            }
        });

        replaceBtn.addEventListener('click', () => {
            const find = findText.value;
            const replace = replaceText.value;
            if (find && replace) {
                this.replaceText(find, replace);
            }
        });

        replaceAllBtn.addEventListener('click', () => {
            const find = findText.value;
            const replace = replaceText.value;
            if (find && replace) {
                this.replaceAllText(find, replace);
            }
        });

        closeBtn.addEventListener('click', () => {
            this.findReplaceModal.style.display = 'none';
        });

        // Close modal when clicking outside
        this.findReplaceModal.addEventListener('click', (e) => {
            if (e.target === this.findReplaceModal) {
                this.findReplaceModal.style.display = 'none';
            }
        });
    }

    findText(text) {
        const content = this.poemEditor.innerHTML;
        const regex = new RegExp(`(${text})`, 'gi');
        const highlighted = content.replace(regex, '<mark style="background-color: yellow;">$1</mark>');
        this.poemEditor.innerHTML = highlighted;
    }

    replaceText(find, replace) {
        const content = this.poemEditor.innerHTML;
        const regex = new RegExp(find, 'gi');
        const replaced = content.replace(regex, replace);
        this.poemEditor.innerHTML = replaced;
    }

    replaceAllText(find, replace) {
        const content = this.poemEditor.innerHTML;
        const regex = new RegExp(find, 'gi');
        const replaced = content.replace(regex, replace);
        this.poemEditor.innerHTML = replaced;
    }

    toggleWritingStats() {
        if (this.writingStats.style.display === 'none' || this.writingStats.style.display === '') {
            this.updateWritingStats();
            this.writingStats.style.display = 'block';
        } else {
            this.writingStats.style.display = 'none';
        }
    }

    updateWritingStats() {
        const text = this.poemEditor.textContent;
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        const characters = text.length;
        const lines = text.split('\n').filter(line => line.trim().length > 0);
        const readingTime = Math.ceil(words.length / 200); // Average reading speed

        document.getElementById('wordCount').textContent = words.length;
        document.getElementById('charCount').textContent = characters;
        document.getElementById('lineCount').textContent = lines.length;
        document.getElementById('readingTime').textContent = `${readingTime} min`;
    }

    toggleWritingPrompts() {
        if (this.writingPrompts.style.display === 'none' || this.writingPrompts.style.display === '') {
            this.writingPrompts.style.display = 'block';
        } else {
            this.writingPrompts.style.display = 'none';
        }
    }

    showRhymeHelper() {
        const selectedText = window.getSelection().toString();
        if (selectedText) {
            // Simple rhyme suggestions (in a real app, you'd use a rhyme API)
            const rhymes = this.getRhymes(selectedText);
            alert(`Rhymes for "${selectedText}":\n${rhymes.join(', ')}`);
        } else {
            alert('Select a word to find rhymes for it!');
        }
    }

    getRhymes(word) {
        // Simple rhyme database (in a real app, you'd use a comprehensive API)
        const rhymeDatabase = {
            'love': ['dove', 'above', 'glove', 'shove'],
            'heart': ['start', 'art', 'part', 'smart'],
            'night': ['light', 'bright', 'sight', 'flight'],
            'day': ['way', 'say', 'play', 'stay'],
            'dream': ['stream', 'team', 'beam', 'cream'],
            'time': ['rhyme', 'climb', 'prime', 'sublime'],
            'free': ['tree', 'see', 'be', 'key'],
            'blue': ['true', 'new', 'few', 'view']
        };
        
        const lowerWord = word.toLowerCase();
        return rhymeDatabase[lowerWord] || ['No rhymes found'];
    }

    showThesaurus() {
        const selectedText = window.getSelection().toString();
        if (selectedText) {
            // Simple thesaurus suggestions
            const synonyms = this.getSynonyms(selectedText);
            alert(`Synonyms for "${selectedText}":\n${synonyms.join(', ')}`);
        } else {
            alert('Select a word to find synonyms for it!');
        }
    }

    getSynonyms(word) {
        // Simple synonym database
        const synonymDatabase = {
            'happy': ['joyful', 'cheerful', 'glad', 'elated'],
            'sad': ['melancholy', 'sorrowful', 'gloomy', 'dejected'],
            'beautiful': ['gorgeous', 'lovely', 'stunning', 'magnificent'],
            'big': ['large', 'huge', 'enormous', 'massive'],
            'small': ['tiny', 'little', 'miniature', 'petite'],
            'fast': ['quick', 'rapid', 'swift', 'speedy'],
            'slow': ['sluggish', 'leisurely', 'gradual', 'deliberate'],
            'bright': ['brilliant', 'luminous', 'radiant', 'dazzling']
        };
        
        const lowerWord = word.toLowerCase();
        return synonymDatabase[lowerWord] || ['No synonyms found'];
    }
    
    async initializeUserMenu() {
        // Load user data from localStorage first
        const userData = localStorage.getItem('user');
        if (userData) {
            this.user = JSON.parse(userData);
            this.updateUserDisplay();
        }
        
        // Also load fresh user data from server
        await this.loadUserData();
        
        // Setup user menu event listeners
        const userMenuBtn = document.getElementById('userMenuBtn');
        const userDropdown = document.getElementById('userDropdown');
        const logoutBtn = document.getElementById('logoutBtn');
        const profileBtn = document.getElementById('profileBtn');
        
        if (userMenuBtn && userDropdown) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('show');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                    userDropdown.classList.remove('show');
                }
            });
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
        
        // Profile button now navigates directly via href, no click handler needed
        
        // Load daily score information
        this.loadDailyScoreInfo();
    }
    
    async loadUserData() {
        try {
            const token = this.getAuthToken();
            if (!token) {
                console.log('No auth token found, skipping user data load');
                return;
            }

            const response = await fetch('/api/auth/verify', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.user = result.user;
                    // Save to localStorage
                    localStorage.setItem('user', JSON.stringify(this.user));
                    this.updateUserDisplay();
                    console.log('🔍 User data loaded:', this.user);
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }
    
    updateUserDisplay() {
        if (!this.user) return;
        
        console.log('🔍 Updating user display with:', this.user);
        
        const usernameDisplay = document.getElementById('usernameDisplay');
        const gamesPlayed = document.getElementById('gamesPlayed');
        const bestScore = document.getElementById('bestScore');
        const totalScore = document.getElementById('totalScore');
        
        if (usernameDisplay) {
            usernameDisplay.textContent = this.user.username || 'User';
            console.log('🔍 Set username to:', this.user.username);
        }
        
        if (gamesPlayed) {
            gamesPlayed.textContent = this.user.games_played || 0;
            console.log('🔍 Set games played to:', this.user.games_played);
        }
        
        if (bestScore) {
            bestScore.textContent = this.user.best_score || 0;
            console.log('🔍 Set best score to:', this.user.best_score);
        }
        
        if (totalScore) {
            totalScore.textContent = this.user.total_score || 0;
            console.log('🔍 Set total score to:', this.user.total_score);
        }
    }
    
    async logout() {
        try {
            const token = localStorage.getItem('authToken');
            if (token) {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local storage and cookies
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            
            // Redirect to landing page
            window.location.href = '/landing';
        }
    }
    
    // showProfile method removed - profile now navigates to dedicated page
    
    async updateUserStats(score) {
        if (!this.user) return;
        
        try {
            // Update local user data
            this.user.games_played = (this.user.games_played || 0) + 1;
            this.user.total_score = (this.user.total_score || 0) + score;
            if (score > (this.user.best_score || 0)) {
                this.user.best_score = score;
            }
            
            // Save to localStorage
            localStorage.setItem('user', JSON.stringify(this.user));
            
            // Update display
            this.updateUserDisplay();
            
            // TODO: Send to server for persistent storage
        } catch (error) {
            console.error('Error updating user stats:', error);
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

    async checkDailySubmissionStatus() {
        try {
            const token = this.getAuthToken();
            if (!token) {
                return { can_submit: false, message: 'Please log in to submit daily challenges' };
            }

            const response = await fetch('/api/daily/submission-status', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error checking daily submission status:', error);
            return { can_submit: false, message: 'Error checking submission status' };
        }
    }

    async submitDailyScore(score, submissionData = null) {
        try {
            const token = this.getAuthToken();
            if (!token) {
                console.error('No auth token found');
                return;
            }

            const requestBody = { score: score };
            if (submissionData) {
                Object.assign(requestBody, submissionData);
            }

            console.log('🔍 Submitting daily score:', {
                score: score,
                submissionData: submissionData,
                requestBody: requestBody,
                token: token ? token.substring(0, 20) + '...' : 'None'
            });

            const response = await fetch('/api/daily/submit', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json();
            
            console.log('🔍 Daily submit response:', {
                status: response.status,
                statusText: response.statusText,
                result: result
            });
            
            if (result.success) {
                console.log('Daily score submitted successfully:', result);
                // Update local user stats
                if (this.user) {
                    this.user.total_score = result.total_score;
                    this.user.best_score = result.best_score;
                    localStorage.setItem('user', JSON.stringify(this.user));
                    this.updateUserDisplay();
                }
            } else {
                console.error('Failed to submit daily score:', result.message || result.error);
                alert(result.message || result.error || 'Failed to submit daily score');
            }
        } catch (error) {
            console.error('Error submitting daily score:', error);
            alert('Error submitting daily score: ' + error.message);
        }
    }

    async loadDailyScoreHistory() {
        try {
            const token = this.getAuthToken();
            if (!token) {
                return null;
            }

            const response = await fetch('/api/daily/history', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();
            return result.success ? result : null;
        } catch (error) {
            console.error('Error loading daily score history:', error);
            return null;
        }
    }

    async loadDailyScoreInfo() {
        try {
            // Check daily submission status
            const submissionStatus = await this.checkDailySubmissionStatus();
            
            // Update daily status display
            const dailyStatusElement = document.getElementById('dailyStatus');
            const dailyScoreElement = document.getElementById('dailyScore');
            
            if (dailyStatusElement) {
                if (submissionStatus.can_submit) {
                    dailyStatusElement.textContent = 'Ready';
                    dailyStatusElement.style.color = '#10b981'; // Green
                } else {
                    dailyStatusElement.textContent = 'Submitted';
                    dailyStatusElement.style.color = '#f59e0b'; // Orange
                }
            }
            
            if (dailyScoreElement) {
                if (submissionStatus.daily_score !== undefined) {
                    dailyScoreElement.textContent = submissionStatus.daily_score;
                } else {
                    dailyScoreElement.textContent = '-';
                }
            }
            
        } catch (error) {
            console.error('Error loading daily score info:', error);
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new StanzleGame();
});
