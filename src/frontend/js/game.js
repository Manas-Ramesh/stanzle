/**
 * Stanzle Game Frontend
 * Main game logic and UI interactions
 */

class StanzleGame {
    constructor() {
        this.currentMode = 'easy';
        this.selectedFocus = 'theme'; // 'theme' or 'emotion' for easy mode
        this.wordBankEnabled = false;
        this.currentTheme = 'Adventure';
        this.currentEmotion = 'Joy';
        this.requiredWords = ['mountain', 'journey', 'discover', 'freedom'];
        this.poemContent = '';
        
        this.initializeElements();
        this.setupEventListeners();
        this.generateDailyChallenge();
    }

    initializeElements() {
        // Game controls
        this.difficultyButtons = document.querySelectorAll('.toggle-btn');
        this.wordBankToggle = document.getElementById('wordBankToggle');
        this.wordBankDisplay = document.getElementById('wordBankDisplay');
        this.wordList = document.getElementById('wordList');
        
        // Editor
        this.poemEditor = document.getElementById('poemEditor');
        this.submitBtn = document.getElementById('submitBtn');
        this.wordBankStatus = document.getElementById('wordBankStatus');
        this.resultsContainer = document.getElementById('resultsContainer');
        
        // Challenge display
        this.themeWord = document.getElementById('themeWord');
        this.emotionWord = document.getElementById('emotionWord');
        this.easyModeSelection = document.getElementById('easyModeSelection');
        this.challengeDisplay = document.getElementById('challengeDisplay');
        this.focusButtons = document.querySelectorAll('.focus-btn');
        this.easyThemeWord = document.getElementById('easyThemeWord');
        this.easyEmotionWord = document.getElementById('easyEmotionWord');
        
        // Writing features
        this.findReplaceModal = document.getElementById('findReplaceModal');
        this.writingStats = document.getElementById('writingStats');
        this.writingPrompts = document.getElementById('writingPrompts');
        this.fontFamily = document.getElementById('fontFamily');
        this.textColor = document.getElementById('textColor');
        this.backgroundColor = document.getElementById('backgroundColor');
    }

    setupEventListeners() {
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

        // Focus selection for easy mode
        this.focusButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.focusButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.selectedFocus = e.target.dataset.focus;
                this.updateSubmitButton();
            });
        });

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

        // Font controls
        document.getElementById('fontSize').addEventListener('change', (e) => {
            this.executeCommand('fontSize', e.target.value);
        });

        this.fontFamily.addEventListener('change', (e) => {
            this.executeCommand('fontName', e.target.value);
        });

        // Color pickers
        this.textColor.addEventListener('change', (e) => {
            this.executeCommand('foreColor', e.target.value);
        });

        this.backgroundColor.addEventListener('change', (e) => {
            this.executeCommand('backColor', e.target.value);
        });

        // Advanced features
        document.getElementById('findReplaceBtn').addEventListener('click', () => {
            this.findReplaceModal.style.display = 'flex';
        });

        document.getElementById('wordCountBtn').addEventListener('click', () => {
            this.toggleWritingStats();
        });

        document.getElementById('writingPromptsBtn').addEventListener('click', () => {
            this.toggleWritingPrompts();
        });

        document.getElementById('rhymeHelperBtn').addEventListener('click', () => {
            this.showRhymeHelper();
        });

        document.getElementById('thesaurusBtn').addEventListener('click', () => {
            this.showThesaurus();
        });

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
            this.easyModeSelection.style.display = 'block';
            this.challengeDisplay.style.display = 'none';
            this.easyThemeWord.textContent = this.currentTheme;
            this.easyEmotionWord.textContent = this.currentEmotion;
        } else {
            this.easyModeSelection.style.display = 'none';
            this.challengeDisplay.style.display = 'flex';
        }
    }

    async generateDailyChallenge() {
        try {
            const response = await fetch('/api/challenge', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();
            
            if (result.success) {
                this.currentTheme = result.challenge.theme;
                this.currentEmotion = result.challenge.emotion;
                this.requiredWords = result.challenge.words;
            } else {
                // Fallback to predefined challenges if API fails
                this.useFallbackChallenge();
            }
        } catch (error) {
            console.error('Error fetching daily challenge:', error);
            this.useFallbackChallenge();
        }

        this.themeWord.textContent = this.currentTheme;
        this.emotionWord.textContent = this.currentEmotion;
        this.easyThemeWord.textContent = this.currentTheme;
        this.easyEmotionWord.textContent = this.currentEmotion;
        this.updateWordList();
        this.updateModeDisplay();
    }

    useFallbackChallenge() {
        // Fallback challenges when API is unavailable
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

    updateWordList() {
        this.wordList.innerHTML = '';
        this.requiredWords.forEach(word => {
            const wordElement = document.createElement('span');
            wordElement.className = 'word-item';
            wordElement.textContent = word;
            wordElement.dataset.word = word.toLowerCase();
            this.wordList.appendChild(wordElement);
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
        const hasContent = this.poemContent.trim().length > 0;
        let canSubmit = hasContent;

        if (this.wordBankEnabled && hasContent) {
            const missingWords = this.getMissingWords();
            const usedWords = this.requiredWords.filter(word => 
                this.poemEditor.textContent.toLowerCase().includes(word.toLowerCase())
            );
            
            canSubmit = missingWords.length === 0;
            
            if (missingWords.length > 0) {
                this.wordBankStatus.textContent = `Missing words: ${missingWords.join(', ')} (${usedWords.length}/${this.requiredWords.length} used)`;
                this.wordBankStatus.className = 'word-bank-status error';
            } else {
                this.wordBankStatus.textContent = `All required words included! (${usedWords.length}/${this.requiredWords.length} used)`;
                this.wordBankStatus.className = 'word-bank-status success';
            }
        } else if (this.wordBankEnabled && !hasContent) {
            this.wordBankStatus.textContent = 'Write a poem first';
            this.wordBankStatus.className = 'word-bank-status';
        } else {
            this.wordBankStatus.textContent = '';
        }

        this.submitBtn.disabled = !canSubmit;
    }

    getMissingWords() {
        const poemText = this.poemEditor.textContent.toLowerCase();
        return this.requiredWords.filter(word => 
            !poemText.includes(word.toLowerCase())
        );
    }

    async submitPoem() {
        if (this.submitBtn.disabled) return;

        this.submitBtn.innerHTML = '<div class="loading"></div> Processing...';
        this.submitBtn.disabled = true;

        try {
            // Get the poem content with formatting
            const poemWithFormatting = this.poemEditor.innerHTML;
            const poemText = this.poemEditor.textContent;

            // Step 1: Get AI's guess of theme/emotion
            const guess = await this.getAIGuess(poemWithFormatting);
            
            // Step 2: Calculate scores
            const scores = await this.calculateScores(guess, poemWithFormatting);
            
            // Step 3: Display results
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
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    poem: poemContent,
                    mode: this.currentMode,
                    focus: this.currentMode === 'easy' ? this.selectedFocus : null
                })
            });

            const result = await response.json();
            
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
            const response = await fetch('/api/score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    poem: poemContent,
                    intended_theme: this.currentTheme,
                    intended_emotion: this.currentEmotion,
                    ai_guess: guess,
                    difficulty: this.currentMode,
                    focus: this.currentMode === 'easy' ? this.selectedFocus : null
                })
            });

            const result = await response.json();
            
            if (result.success) {
                return result.result;
            } else {
                throw new Error(result.error || 'Failed to score poem');
            }
        } catch (error) {
            console.error('Error scoring poem:', error);
            // Fallback to mock scoring if server is not available
            if (this.currentMode === 'easy') {
                const focusMatch = this.calculateMatch(
                    this.selectedFocus === 'theme' ? this.currentTheme : this.currentEmotion,
                    guess[this.selectedFocus]
                );
                
                return {
                    [this.selectedFocus + 'Score']: Math.floor(focusMatch * 80),
                    creativityScore: Math.floor(Math.random() * 20) + 5,
                    feedback: this.generateFeedback(focusMatch, 0),
                    totalScore: 0
                };
            } else {
                const themeMatch = this.calculateMatch(this.currentTheme, guess.theme);
                const emotionMatch = this.calculateMatch(this.currentEmotion, guess.emotion);
                
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
        if (this.currentMode === 'easy') {
            // Hide the score item that's not being used
            const themeScoreItem = document.getElementById('themeScoreItem');
            const emotionScoreItem = document.getElementById('emotionScoreItem');
            
            if (this.selectedFocus === 'theme') {
                themeScoreItem.style.display = 'flex';
                emotionScoreItem.style.display = 'none';
                document.getElementById('themeScore').textContent = `${scores.themeScore || 0}/80`;
                document.getElementById('emotionScore').textContent = `0/80`;
            } else {
                themeScoreItem.style.display = 'none';
                emotionScoreItem.style.display = 'flex';
                document.getElementById('themeScore').textContent = `0/80`;
                document.getElementById('emotionScore').textContent = `${scores.emotionScore || 0}/80`;
            }
            
            const totalScore = scores.totalScore || ((scores.themeScore || scores.emotionScore || 0) + scores.creativityScore);
            document.getElementById('creativityScore').textContent = `${scores.creativityScore}/20`;
            document.getElementById('totalScore').textContent = `${totalScore}/100`;
            
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
            
            const totalScore = scores.totalScore || (scores.themeScore + scores.emotionScore + scores.creativityScore);
            
            document.getElementById('themeScore').textContent = `${scores.themeScore}/40`;
            document.getElementById('emotionScore').textContent = `${scores.emotionScore}/40`;
            document.getElementById('creativityScore').textContent = `${scores.creativityScore}/20`;
            document.getElementById('totalScore').textContent = `${totalScore}/100`;
            
            document.getElementById('aiFeedback').innerHTML = `
                <strong>AI Analysis:</strong><br>
                <strong>Guessed Theme:</strong> ${guess.theme}<br>
                <strong>Guessed Emotion:</strong> ${guess.emotion}<br>
                <strong>Confidence:</strong> ${Math.round((guess.confidence || 0.5) * 100)}%<br><br>
                <strong>Feedback:</strong> ${scores.feedback}
            `;
        }
        
        this.resultsContainer.style.display = 'block';
        this.resultsContainer.scrollIntoView({ behavior: 'smooth' });
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
        const closeBtn = document.getElementById('closeFindReplace');
        const findText = document.getElementById('findText');
        const replaceText = document.getElementById('replaceText');

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
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new StanzleGame();
});
