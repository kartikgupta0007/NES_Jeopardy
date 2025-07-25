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
        this.currentQuestion = { question: '', answer: '' };
        
        this.init();
    }
    
    init() {
        this.initializeGame();
        this.setupEventListeners();
        this.loadGameState();
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
        
        this.currentSetupRound = Math.min(this.currentSetupRound, numRounds - 1);
        this.updateRoundTabs();
        this.updateSetupUI();
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
        
        setupTabs.innerHTML = '';
        playTabs.innerHTML = '';
        
        this.gameState.rounds.forEach((round, index) => {
            // Setup tabs
            const setupTab = document.createElement('div');
            setupTab.className = `round-tab ${index === this.currentSetupRound ? 'active' : ''}`;
            setupTab.textContent = round.name;
            setupTab.onclick = () => this.switchSetupRound(index);
            setupTabs.appendChild(setupTab);
            
            // Play tabs
            const playTab = document.createElement('div');
            playTab.className = `round-tab ${index === this.gameState.currentRound ? 'active' : ''}`;
            playTab.textContent = round.name;
            playTab.onclick = () => this.switchPlayRound(index);
            playTabs.appendChild(playTab);
        });
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
        const headers = document.getElementById('setupHeaders');
        const body = document.getElementById('setupBody');
        
        // Update headers
        headers.innerHTML = '';
        currentRound.categories.forEach(category => {
            const th = document.createElement('th');
            th.textContent = category;
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
                
                const hasData = currentRound.questions[category] && 
                               currentRound.questions[category][value] &&
                               currentRound.questions[category][value].question.trim() !== '';
                
                if (hasData) {
                    cell.classList.add('filled');
                }
                
                cell.onclick = () => this.editQuestion(this.currentSetupRound, catIndex, value);
                row.appendChild(cell);
            });
            body.appendChild(row);
        });
    }
    
    editQuestion(roundIndex, categoryIndex, value) {
        this.editingCell = { round: roundIndex, category: categoryIndex, value: value };
        
        const round = this.gameState.rounds[roundIndex];
        const category = round.categories[categoryIndex];
        const questionData = round.questions[category][value];
        
        document.getElementById('questionInput').value = questionData.question || '';
        document.getElementById('answerInput').value = questionData.answer || '';
        
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
    
    finishSetup() {
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
        
        document.getElementById('setupMode').classList.add('hidden');
        document.getElementById('playMode').classList.remove('hidden');
        
        this.initializePlayMode();
        this.playSound('start');
    }
    
    initializePlayMode() {
        this.gameState.usedCells = new Set();
        this.gameState.scores = { player1: 0, player2: 0 };
        this.updatePlayUI();
        this.updateScoreboard();
    }
    
    updatePlayUI() {
        const currentRound = this.gameState.rounds[this.gameState.currentRound];
        document.getElementById('currentRoundTitle').textContent = currentRound.name;
        
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
            th.textContent = category;
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
        
        this.currentQuestion = questionData;
        
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
    
    updateScore(player, amount) {
        this.gameState.scores[`player${player}`] += amount;
        this.updateScoreboard();
        this.playSound('score');
        this.saveGameState();
    }
    
    updateScoreboard() {
        document.getElementById('player1Score').textContent = `$${this.gameState.scores.player1}`;
        document.getElementById('player2Score').textContent = `$${this.gameState.scores.player2}`;
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
    
    // Menu Functions
    showMainMenu() {
        this.showModal('mainMenu');
    }
    
    hideMainMenu() {
        this.hideModal('mainMenu');
    }
    
    startNewGame() {
        this.hideAllModals();
        this.resetGame();
    }
    
    resetGame() {
        if (confirm('Are you sure you want to start a new game? All progress will be lost.')) {
            document.getElementById('setupMode').classList.remove('hidden');
            document.getElementById('playMode').classList.add('hidden');
            
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
            
            this.playSound('reset');
        }
    }
    
    showHelp() {
        this.hideModal('mainMenu');
        this.showModal('helpModal');
    }
    
    hideHelp() {
        this.hideModal('helpModal');
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

function showMainMenu() {
    game.showMainMenu();
}

function hideMainMenu() {
    game.hideMainMenu();
}

function startNewGame() {
    game.startNewGame();
}

function resetGame() {
    game.resetGame();
}

function showHelp() {
    game.showHelp();
}

function hideHelp() {
    game.hideHelp();
}

function toggleSFX() {
    game.toggleSFX();
}

function toggleMusic() {
    game.toggleMusic();
}

function finishSetup() {
    game.finishSetup();
}

function saveQuestion() {
    game.saveQuestion();
}

function cancelQuestion() {
    game.cancelQuestion();
}

function revealAnswer() {
    game.revealAnswer();
}

function closeQuestion() {
    game.closeQuestion();
}

function updateScore(player, amount) {
    game.updateScore(player, amount);
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