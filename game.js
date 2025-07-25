// Pixel Jeopardy Game Logic
class JeopardyGame {
    constructor() {
        this.gameState = {
            rounds: [],
            currentRound: 0,
            scores: { player1: 0, player2: 0 },
            usedCells: new Set(),
            settings: { sfx: true, music: true }
        };
        
        this.currentSetupRound = 0;
        this.editingCell = { round: 0, category: 0, value: 0 };
        this.currentQuestion = { question: '', answer: '', value: 0 };
        
        this.init();
    }
    
    init() {
        this.initializeGame();
        this.setupEventListeners();
        this.initializeParallaxBackgrounds();
        this.loadGameState();
        this.showHomeScreen();
    }
    
    initializeGame() {
        // Initialize with default round
        this.gameState.rounds = [{
            name: "Round 1",
            categories: ["Category 1", "Category 2", "Category 3", "Category 4", "Category 5"],
            questions: this.createEmptyQuestions()
        }];
        
        this.updateSetupUI();
        this.updateRoundTabs();
    }
    
    createEmptyQuestions() {
        const questions = {};
        const values = [100, 200, 300, 400, 500];
        
        for (let i = 0; i < 5; i++) {
            const categoryName = `Category ${i + 1}`;
            questions[categoryName] = {};
            values.forEach(value => {
                questions[categoryName][value] = { question: '', answer: '' };
            });
        }
        
        return questions;
    }
    
    setupEventListeners() {
        // Number of rounds change
        document.getElementById('numRounds').addEventListener('change', (e) => {
            this.updateNumberOfRounds(parseInt(e.target.value));
        });
        
        // Category inputs
        for (let i = 1; i <= 5; i++) {
            document.getElementById(`cat${i}`).addEventListener('input', (e) => {
                this.updateCategory(i - 1, e.target.value);
            });
        }
        
        // Question editor preview functionality
        document.getElementById('questionInput').addEventListener('input', (e) => {
            this.updateQuestionPreview();
        });
        
        document.getElementById('answerInput').addEventListener('input', (e) => {
            this.updateQuestionPreview();
        });
        
        // Modal close on overlay click
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideAllModals();
                }
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });
    }

    // Screen Navigation
    showHomeScreen() {
        this.hideAllScreens();
        document.getElementById('homeScreen').classList.remove('hidden');
    }

    showSetupScreen() {
        this.hideAllScreens();
        document.getElementById('setupScreen').classList.remove('hidden');
        this.updateSetupUI();
    }

    showGameScreen() {
        this.hideAllScreens();
        document.getElementById('gameScreen').classList.remove('hidden');
        this.initializePlayMode();
    }

    hideAllScreens() {
        document.getElementById('homeScreen').classList.add('hidden');
        document.getElementById('setupScreen').classList.add('hidden');
        document.getElementById('gameScreen').classList.add('hidden');
    }
    
    updateNumberOfRounds(numRounds) {
        while (this.gameState.rounds.length < numRounds) {
            const roundNum = this.gameState.rounds.length + 1;
            this.gameState.rounds.push({
                name: `Round ${roundNum}`,
                categories: [`Category 1`, `Category 2`, `Category 3`, `Category 4`, `Category 5`],
                questions: this.createEmptyQuestions()
            });
        }
        
        while (this.gameState.rounds.length > numRounds) {
            this.gameState.rounds.pop();
        }
        
        // Ensure current setup round is valid
        this.currentSetupRound = Math.min(this.currentSetupRound, numRounds - 1);
        
        // Update UI components
        this.updateRoundTabs();
        this.updateSetupUI();
        this.saveGameState();
    }
    
    updateCategory(index, value) {
        const currentRound = this.gameState.rounds[this.currentSetupRound];
        const oldCategory = currentRound.categories[index];
        const newCategory = value || `Category ${index + 1}`;
        
        // Update category name
        currentRound.categories[index] = newCategory;
        
        // Update questions object key
        if (currentRound.questions[oldCategory]) {
            currentRound.questions[newCategory] = currentRound.questions[oldCategory];
            delete currentRound.questions[oldCategory];
        } else {
            currentRound.questions[newCategory] = {};
            [100, 200, 300, 400, 500].forEach(val => {
                currentRound.questions[newCategory][val] = { question: '', answer: '' };
            });
        }
        
        this.updateSetupGrid();
    }
    
    updateRoundTabs() {
        const setupTabs = document.getElementById('roundTabs');
        const playTabs = document.getElementById('playRoundTabs');
        
        if (setupTabs) {
            setupTabs.innerHTML = '';
            
            this.gameState.rounds.forEach((round, index) => {
                const setupTab = document.createElement('div');
                setupTab.className = `round-tab ${index === this.currentSetupRound ? 'active' : ''}`;
                setupTab.textContent = round.name;
                setupTab.onclick = () => this.switchSetupRound(index);
                setupTabs.appendChild(setupTab);
            });
        }
        
        if (playTabs) {
            playTabs.innerHTML = '';
            
            this.gameState.rounds.forEach((round, index) => {
                const playTab = document.createElement('div');
                playTab.className = `round-tab ${index === this.gameState.currentRound ? 'active' : ''}`;
                playTab.textContent = round.name;
                playTab.onclick = () => this.switchPlayRound(index);
                playTabs.appendChild(playTab);
            });
        }
    }
    
    switchSetupRound(roundIndex) {
        this.currentSetupRound = roundIndex;
        this.updateSetupUI();
        this.updateRoundTabs();
    }
    
    switchPlayRound(roundIndex) {
        this.gameState.currentRound = roundIndex;
        this.updatePlayUI();
        this.updateRoundTabs();
    }
    
    updateSetupUI() {
        const currentRound = this.gameState.rounds[this.currentSetupRound];
        
        // Update category inputs
        for (let i = 0; i < 5; i++) {
            document.getElementById(`cat${i + 1}`).value = currentRound.categories[i];
        }
        
        this.updateSetupGrid();
    }
    
    updateSetupGrid() {
        const currentRound = this.gameState.rounds[this.currentSetupRound];
        const headers = document.getElementById('categoryHeaders');
        const grid = document.getElementById('questionsGrid');
        
        // Update category headers
        headers.innerHTML = '';
        currentRound.categories.forEach(category => {
            const header = document.createElement('div');
            header.className = 'category-header';
            header.textContent = category || 'Category';
            headers.appendChild(header);
        });
        
        // Update questions grid
        grid.innerHTML = '';
        const values = [100, 200, 300, 400, 500];
        
        values.forEach(value => {
            currentRound.categories.forEach((category, catIndex) => {
                const cell = document.createElement('div');
                cell.className = 'question-cell';
                
                const questionData = currentRound.questions[category] && 
                                   currentRound.questions[category][value];
                
                if (questionData && questionData.question.trim() !== '') {
                    cell.classList.add('filled');
                    
                    const valueDiv = document.createElement('div');
                    valueDiv.className = 'question-value';
                    valueDiv.textContent = `$${value}`;
                    
                    const questionDiv = document.createElement('div');
                    questionDiv.className = 'question-preview';
                    questionDiv.textContent = questionData.question.length > 60 ? 
                        questionData.question.substring(0, 60) + '...' : 
                        questionData.question;
                    
                    const statusDiv = document.createElement('div');
                    statusDiv.className = 'question-status';
                    statusDiv.textContent = '✓ Complete';
                    
                    cell.appendChild(valueDiv);
                    cell.appendChild(questionDiv);
                    cell.appendChild(statusDiv);
                } else {
                    cell.classList.add('empty');
                    
                    const emptyContent = document.createElement('div');
                    emptyContent.className = 'empty-cell-content';
                    emptyContent.innerHTML = `
                        <div class="question-value">$${value}</div>
                        <div>?</div>
                    `;
                    cell.appendChild(emptyContent);
                }
                
                cell.onclick = () => this.editQuestion(this.currentSetupRound, catIndex, value);
                grid.appendChild(cell);
            });
        });
    }
    
    editQuestion(roundIndex, categoryIndex, value) {
        this.editingCell = { round: roundIndex, category: categoryIndex, value: value };
        
        const round = this.gameState.rounds[roundIndex];
        const category = round.categories[categoryIndex];
        const questionData = round.questions[category][value];
        
        document.getElementById('questionInput').value = questionData.question || '';
        document.getElementById('answerInput').value = questionData.answer || '';
        
        // Update preview immediately
        this.updateQuestionPreview();
        
        this.showModal('setupQuestionModal');
    }
    
    saveQuestion() {
        const question = document.getElementById('questionInput').value.trim();
        const answer = document.getElementById('answerInput').value.trim();
        
        if (!question || !answer) {
            alert('Please enter both question and answer!');
            return;
        }
        
        const { round, category, value } = this.editingCell;
        const currentRound = this.gameState.rounds[round];
        const categoryName = currentRound.categories[category];
        
        if (!currentRound.questions[categoryName]) {
            currentRound.questions[categoryName] = {};
        }
        
        currentRound.questions[categoryName][value] = { question, answer };
        
        this.hideModal('setupQuestionModal');
        this.updateSetupGrid();
        this.playSound('save');
    }
    
    cancelQuestion() {
        this.hideModal('setupQuestionModal');
    }
    
    deleteQuestion() {
        if (confirm('Are you sure you want to delete this question?')) {
            const { round, category, value } = this.editingCell;
            const currentRound = this.gameState.rounds[round];
            const categoryName = currentRound.categories[category];
            
            if (currentRound.questions[categoryName] && currentRound.questions[categoryName][value]) {
                currentRound.questions[categoryName][value] = { question: '', answer: '' };
            }
            
            this.hideModal('setupQuestionModal');
            this.updateSetupGrid();
            this.playSound('save');
        }
    }
    
    updateQuestionPreview() {
        const question = document.getElementById('questionInput').value;
        const answer = document.getElementById('answerInput').value;
        
        document.getElementById('questionPreview').textContent = 
            question || 'Type your question above';
        document.getElementById('answerPreview').textContent = 
            answer || 'Type your answer above';
    }
    
    initializeParallaxBackgrounds() {
        // Set up random cloud backgrounds for parallax layers
        const cloudFolders = ['Clouds 1', 'Clouds 2', 'Clouds 3', 'Clouds 4', 'Clouds 5', 'Clouds 6', 'Clouds 7', 'Clouds 8'];
        
        // Randomly select different cloud sets for each screen and layer
        const homeBackClouds = cloudFolders[Math.floor(Math.random() * cloudFolders.length)];
        const homeMiddleClouds = cloudFolders[Math.floor(Math.random() * cloudFolders.length)];
        const homeFrontClouds = cloudFolders[Math.floor(Math.random() * cloudFolders.length)];
        
        const setupBackClouds = cloudFolders[Math.floor(Math.random() * cloudFolders.length)];
        const setupMiddleClouds = cloudFolders[Math.floor(Math.random() * cloudFolders.length)];
        const setupFrontClouds = cloudFolders[Math.floor(Math.random() * cloudFolders.length)];
        
        const gameBackClouds = cloudFolders[Math.floor(Math.random() * cloudFolders.length)];
        const gameMiddleClouds = cloudFolders[Math.floor(Math.random() * cloudFolders.length)];
        const gameFrontClouds = cloudFolders[Math.floor(Math.random() * cloudFolders.length)];
        
        // Set background images for home screen
        const homeBackLayer = document.getElementById('parallax-back-home');
        const homeMiddleLayer = document.getElementById('parallax-middle-home');
        const homeFrontLayer = document.getElementById('parallax-front-home');
        
        if (homeBackLayer) {
            homeBackLayer.style.backgroundImage = `url('assets/Backgrounds/${homeBackClouds}/1.png')`;
        }
        if (homeMiddleLayer) {
            homeMiddleLayer.style.backgroundImage = `url('assets/Backgrounds/${homeMiddleClouds}/2.png')`;
        }
        if (homeFrontLayer) {
            homeFrontLayer.style.backgroundImage = `url('assets/Backgrounds/${homeFrontClouds}/3.png')`;
        }
        
        // Set background images for setup screen
        const setupBackLayer = document.getElementById('parallax-back');
        const setupMiddleLayer = document.getElementById('parallax-middle');
        const setupFrontLayer = document.getElementById('parallax-front');
        
        if (setupBackLayer) {
            setupBackLayer.style.backgroundImage = `url('assets/Backgrounds/${setupBackClouds}/1.png')`;
        }
        if (setupMiddleLayer) {
            setupMiddleLayer.style.backgroundImage = `url('assets/Backgrounds/${setupMiddleClouds}/2.png')`;
        }
        if (setupFrontLayer) {
            setupFrontLayer.style.backgroundImage = `url('assets/Backgrounds/${setupFrontClouds}/3.png')`;
        }
        
        // Set background images for game screen
        const gameBackLayer = document.getElementById('parallax-back-game');
        const gameMiddleLayer = document.getElementById('parallax-middle-game');
        const gameFrontLayer = document.getElementById('parallax-front-game');
        
        if (gameBackLayer) {
            gameBackLayer.style.backgroundImage = `url('assets/Backgrounds/${gameBackClouds}/1.png')`;
        }
        if (gameMiddleLayer) {
            gameMiddleLayer.style.backgroundImage = `url('assets/Backgrounds/${gameMiddleClouds}/2.png')`;
        }
        if (gameFrontLayer) {
            gameFrontLayer.style.backgroundImage = `url('assets/Backgrounds/${gameFrontClouds}/3.png')`;
        }
    }
    
    startGame() {
        // Validate that all questions are filled
        let allFilled = true;
        const missingQuestions = [];
        
        this.gameState.rounds.forEach((round, roundIndex) => {
            round.categories.forEach((category, catIndex) => {
                [100, 200, 300, 400, 500].forEach(value => {
                    const questionData = round.questions[category][value];
                    if (!questionData.question.trim() || !questionData.answer.trim()) {
                        allFilled = false;
                        missingQuestions.push(`${round.name} - ${category} - $${value}`);
                    }
                });
            });
        });
        
        if (!allFilled) {
            const message = `Please fill in all questions and answers!\n\nMissing:\n${missingQuestions.slice(0, 5).join('\n')}${missingQuestions.length > 5 ? `\n... and ${missingQuestions.length - 5} more` : ''}`;
            alert(message);
            return;
        }
        
        this.showGameScreen();
        this.playSound('start');
    }
    
    initializePlayMode() {
        this.gameState.usedCells = new Set();
        this.gameState.scores = { player1: 0, player2: 0 };
        this.updatePlayUI();
        this.updateScoreboard();
        this.loadPlayerNames();
        this.setupPlayerNameListeners();
    }
    
    setupPlayerNameListeners() {
        document.getElementById('player1Name').addEventListener('change', () => {
            this.savePlayerNames();
        });
        
        document.getElementById('player2Name').addEventListener('change', () => {
            this.savePlayerNames();
        });
    }
    
    updatePlayUI() {
        const currentRound = this.gameState.rounds[this.gameState.currentRound];
        document.getElementById('currentRoundTitle').textContent = currentRound.name.toUpperCase();
        
        this.updateGameGrid();
    }
    
    updateGameGrid() {
        const currentRound = this.gameState.rounds[this.gameState.currentRound];
        const headers = document.getElementById('gameHeaders');
        const body = document.getElementById('gameBody');
        
        // Update headers
        headers.innerHTML = '';
        currentRound.categories.forEach(category => {
            const th = document.createElement('th');
            th.textContent = category.toUpperCase();
            headers.appendChild(th);
        });
        
        // Update body
        body.innerHTML = '';
        const values = [100, 200, 300, 400, 500];
        
        values.forEach(value => {
            const row = document.createElement('tr');
            currentRound.categories.forEach((category, catIndex) => {
                const cell = document.createElement('td');
                cell.textContent = `$${value}`;
                
                const cellId = `${this.gameState.currentRound}-${catIndex}-${value}`;
                if (this.gameState.usedCells.has(cellId)) {
                    cell.classList.add('used');
                } else {
                    cell.onclick = () => this.showQuestion(this.gameState.currentRound, catIndex, value);
                }
                
                row.appendChild(cell);
            });
            body.appendChild(row);
        });
    }
    
    showQuestion(roundIndex, categoryIndex, value) {
        const round = this.gameState.rounds[roundIndex];
        const category = round.categories[categoryIndex];
        const questionData = round.questions[category][value];
        
        this.currentQuestion = { ...questionData, value };
        
        document.getElementById('questionText').textContent = questionData.question;
        document.getElementById('answerText').textContent = questionData.answer;
        document.getElementById('answerSection').classList.add('hidden');
        document.getElementById('revealBtn').style.display = 'inline-block';
        
        // Mark cell as used
        const cellId = `${roundIndex}-${categoryIndex}-${value}`;
        this.gameState.usedCells.add(cellId);
        
        this.showModal('questionModal');
        this.updateGameGrid();
        this.playSound('question');
    }
    
    revealAnswer() {
        document.getElementById('answerSection').classList.remove('hidden');
        document.getElementById('revealBtn').style.display = 'none';
        this.playSound('reveal');
    }
    
    closeQuestion() {
        this.hideModal('questionModal');
    }

    getCurrentQuestionValue() {
        return this.currentQuestion.value || 0;
    }
    
    updateScore(player, amount) {
        this.gameState.scores[`player${player}`] += amount;
        this.updateScoreboard();
        this.playSound('score');
        this.saveGameState();
    }
    
    changeScore(player, amount) {
        this.gameState.scores[`player${player}`] += amount;
        this.updateScoreboard();
        this.playSound('score');
        this.saveGameState();
    }
    
    updateScoreboard() {
        document.getElementById('player1Score').textContent = this.gameState.scores.player1;
        document.getElementById('player2Score').textContent = this.gameState.scores.player2;
    }
    
    loadPlayerNames() {
        const player1Name = localStorage.getItem('player1Name') || 'Player 1';
        const player2Name = localStorage.getItem('player2Name') || 'Player 2';
        
        document.getElementById('player1Name').value = player1Name;
        document.getElementById('player2Name').value = player2Name;
    }
    
    savePlayerNames() {
        const player1Name = document.getElementById('player1Name').value;
        const player2Name = document.getElementById('player2Name').value;
        
        localStorage.setItem('player1Name', player1Name);
        localStorage.setItem('player2Name', player2Name);
    }
    
    // Modal Management
    showModal(modalId) {
        this.hideAllModals();
        document.getElementById(modalId).classList.remove('hidden');
    }
    
    hideModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }
    
    hideAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.add('hidden');
        });
    }
    
    // Settings Functions
    showSettings() {
        this.showModal('settingsModal');
    }
    
    hideSettings() {
        this.hideModal('settingsModal');
    }

    // Help Functions
    showHelp() {
        this.showModal('helpModal');
    }
    
    hideHelp() {
        this.hideModal('helpModal');
    }
    
    // Game Management
    newGame() {
        if (confirm('Are you sure you want to start a new game? All progress will be lost.')) {
            this.resetGameState();
            this.showSetupScreen();
            this.playSound('reset');
        }
    }

    resetGameState() {
        this.initializeGame();
        this.gameState.scores = { player1: 0, player2: 0 };
        this.gameState.usedCells = new Set();
        this.currentSetupRound = 0;
        this.gameState.currentRound = 0;
        
        // Reset form
        document.getElementById('numRounds').value = 1;
        for (let i = 1; i <= 5; i++) {
            document.getElementById(`cat${i}`).value = '';
        }
    }

    quitGame() {
        if (confirm('Are you sure you want to quit? Any unsaved progress will be lost.')) {
            this.showHomeScreen();
        }
    }

    goHome() {
        if (confirm('Return to home screen? Any unsaved progress will be lost.')) {
            this.showHomeScreen();
        }
    }

    loadSavedGame() {
        alert('Load saved game feature coming soon!');
    }
    
    toggleSFX() {
        this.gameState.settings.sfx = !this.gameState.settings.sfx;
        document.getElementById('sfxStatus').textContent = `SFX: ${this.gameState.settings.sfx ? 'ON' : 'OFF'}`;
        this.saveGameState();
    }
    
    toggleMusic() {
        this.gameState.settings.music = !this.gameState.settings.music;
        document.getElementById('musicStatus').textContent = `Music: ${this.gameState.settings.music ? 'ON' : 'OFF'}`;
        this.saveGameState();
    }
    
    // Sound Effects
    playSound(type) {
        if (!this.gameState.settings.sfx) return;
        
        try {
            // Create different pitched beeps for different actions
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            let frequency = 440; // Default A note
            let duration = 0.1;
            
            switch (type) {
                case 'question':
                    frequency = 659.25; // E note
                    duration = 0.3;
                    break;
                case 'reveal':
                    frequency = 523.25; // C note
                    duration = 0.2;
                    break;
                case 'score':
                    frequency = 783.99; // G note
                    duration = 0.15;
                    break;
                case 'save':
                    frequency = 880; // A note higher octave
                    duration = 0.1;
                    break;
                case 'start':
                    frequency = 1046.5; // C note higher octave
                    duration = 0.4;
                    break;
                case 'reset':
                    frequency = 220; // A note lower octave
                    duration = 0.3;
                    break;
            }
            
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (e) {
            console.log('Audio playback failed:', e);
        }
    }
    
    // Local Storage
    saveGameState() {
        try {
            localStorage.setItem('pixelJeopardyGame', JSON.stringify({
                gameState: this.gameState,
                currentSetupRound: this.currentSetupRound
            }));
        } catch (e) {
            console.error('Failed to save game state:', e);
        }
    }
    
    loadGameState() {
        try {
            const saved = localStorage.getItem('pixelJeopardyGame');
            if (saved) {
                const data = JSON.parse(saved);
                this.gameState = { ...this.gameState, ...data.gameState };
                this.currentSetupRound = data.currentSetupRound || 0;
                
                // Update UI elements
                document.getElementById('sfxStatus').textContent = `SFX: ${this.gameState.settings.sfx ? 'ON' : 'OFF'}`;
                document.getElementById('musicStatus').textContent = `Music: ${this.gameState.settings.music ? 'ON' : 'OFF'}`;
                
                if (this.gameState.rounds.length > 0) {
                    this.updateSetupUI();
                    this.updateRoundTabs();
                    this.updateScoreboard();
                }
            }
        } catch (e) {
            console.error('Failed to load game state:', e);
        }
    }
}

// Global functions for HTML onclick events
let game;

// Home Screen Functions
function showNewGameScreen() {
    game.showSetupScreen();
}

function loadSavedGame() {
    game.loadSavedGame();
}

function showSettings() {
    game.showSettings();
}

function hideSettings() {
    game.hideSettings();
}

function showHelp() {
    game.showHelp();
}

function hideHelp() {
    game.hideHelp();
}

function quitGame() {
    game.quitGame();
}

function goHome() {
    game.goHome();
}

function toggleSFX() {
    game.toggleSFX();
}

function toggleMusic() {
    game.toggleMusic();
}

// Setup Functions
function startGame() {
    game.startGame();
}

function saveQuestion() {
    game.saveQuestion();
}

function cancelQuestion() {
    game.cancelQuestion();
}

// Game Functions
function revealAnswer() {
    game.revealAnswer();
}

function closeQuestion() {
    game.closeQuestion();
}

function updateScore(player, amount) {
    game.updateScore(player, amount);
}

function changeScore(player, amount) {
    game.changeScore(player, amount);
}

function getCurrentQuestionValue() {
    return game.getCurrentQuestionValue();
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    game = new JeopardyGame();
    
    // Add some sample data for demonstration
    setTimeout(() => {
        if (confirm('Would you like to load sample questions for a quick demo?')) {
            loadSampleData();
        }
    }, 1000);
});

function loadSampleData() {
    // Sample categories
    document.getElementById('cat1').value = 'SCIENCE';
    document.getElementById('cat2').value = 'HISTORY';
    document.getElementById('cat3').value = 'SPORTS';
    document.getElementById('cat4').value = 'MOVIES';
    document.getElementById('cat5').value = 'GEOGRAPHY';
    
    // Update categories in game state
    for (let i = 0; i < 5; i++) {
        const input = document.getElementById(`cat${i + 1}`);
        game.updateCategory(i, input.value);
    }
    
    // Sample questions
    const sampleQuestions = {
        'SCIENCE': {
            100: { question: 'This planet is closest to the Sun', answer: 'What is Mercury?' },
            200: { question: 'H2O is the chemical formula for this', answer: 'What is water?' },
            300: { question: 'This scientist developed the theory of relativity', answer: 'Who is Einstein?' },
            400: { question: 'The smallest unit of matter', answer: 'What is an atom?' },
            500: { question: 'This gas makes up about 78% of Earth\'s atmosphere', answer: 'What is nitrogen?' }
        },
        'HISTORY': {
            100: { question: 'This war ended in 1945', answer: 'What is World War II?' },
            200: { question: 'The first man on the moon', answer: 'Who is Neil Armstrong?' },
            300: { question: 'This wall fell in 1989', answer: 'What is the Berlin Wall?' },
            400: { question: 'The year America declared independence', answer: 'What is 1776?' },
            500: { question: 'This ancient wonder was located in Alexandria', answer: 'What is the Lighthouse?' }
        },
        'SPORTS': {
            100: { question: 'Number of players on a basketball team on court', answer: 'What is 5?' },
            200: { question: 'This sport uses a puck', answer: 'What is hockey?' },
            300: { question: 'The Olympics are held every this many years', answer: 'What is 4?' },
            400: { question: 'This tennis tournament is played on grass', answer: 'What is Wimbledon?' },
            500: { question: 'The maximum score in bowling', answer: 'What is 300?' }
        },
        'MOVIES': {
            100: { question: 'This movie features a shark', answer: 'What is Jaws?' },
            200: { question: 'The boy wizard with a lightning scar', answer: 'Who is Harry Potter?' },
            300: { question: 'This movie won Best Picture in 1994', answer: 'What is Forrest Gump?' },
            400: { question: 'This director made Jaws and E.T.', answer: 'Who is Steven Spielberg?' },
            500: { question: 'The highest-grossing movie of all time', answer: 'What is Avatar?' }
        },
        'GEOGRAPHY': {
            100: { question: 'The largest continent', answer: 'What is Asia?' },
            200: { question: 'This river is the longest in the world', answer: 'What is the Nile?' },
            300: { question: 'The capital of Australia', answer: 'What is Canberra?' },
            400: { question: 'This mountain range contains Everest', answer: 'What is the Himalayas?' },
            500: { question: 'The smallest country in the world', answer: 'What is Vatican City?' }
        }
    };
    
    // Load sample questions into current round
    const currentRound = game.gameState.rounds[0];
    currentRound.questions = sampleQuestions;
    
    game.updateSetupGrid();
    alert('Sample questions loaded! You can now start playing or modify them.');
} 