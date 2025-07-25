# 🎮 Pixel Jeopardy Game

A retro-styled Jeopardy quiz game built with **NES.css** for authentic 8-bit aesthetics. Features a comprehensive setup mode for creating custom questions and an interactive play mode with scoring.

![NES Style](https://img.shields.io/badge/Style-NES.css-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![CSS3](https://img.shields.io/badge/CSS3-Responsive-blue)

## 🌟 Features

### 🔧 Setup Mode
- **Multiple Rounds**: Support for up to 3 rounds of play
- **Custom Categories**: Set 5 custom category names per round
- **Question Builder**: Easy-to-use modal interface for entering questions and answers
- **Visual Feedback**: Green checkmarks indicate completed questions
- **Round Switching**: Seamlessly switch between rounds during setup

### 🎯 Play Mode
- **Interactive Game Board**: Classic 5×5 Jeopardy grid with dollar values (100-500)
- **Question Modals**: NES-styled popups with reveal mechanics
- **Smart Cell Management**: Automatic marking of used questions
- **Round Navigation**: Switch between rounds during gameplay

### 📊 Scoring System
- **Two Player Support**: Dedicated score panels for Player 1 & Player 2
- **Manual Score Updates**: Flexible scoring with preset buttons (+$100, +$200, -$100)
- **Persistent Scores**: Scores maintained across round switches
- **Visual Indicators**: Color-coded score displays

### 🎨 NES-Style UI
- **Authentic Pixel Art Design**: Faithful to 8-bit aesthetics
- **Retro Color Palette**: Deep blues, vibrant greens, classic grays
- **CRT Scanline Effect**: Subtle overlay for authentic feel
- **Hover Animations**: Button presses and cell interactions
- **Responsive Design**: Works on desktop, tablet, and mobile

### 🔊 Audio Features
- **8-bit Sound Effects**: Authentic beep sounds for game actions
- **Contextual Audio**: Different tones for questions, answers, scoring
- **Audio Controls**: Toggle SFX and Music on/off
- **Web Audio API**: Modern browser-based sound generation

### 💾 Data Management
- **Local Storage**: Automatic saving of game state and preferences
- **Sample Data**: Quick-start option with pre-loaded questions
- **Export/Import Ready**: JSON-based structure for easy data management

## 🚀 Getting Started

### Quick Start
1. Open `index.html` in any modern web browser
2. Click "Yes" when prompted to load sample questions (optional)
3. Modify categories and questions in Setup Mode
4. Click "Start Playing!" to begin the game

### Manual Setup
1. **Set Number of Rounds**: Choose 1-3 rounds
2. **Enter Categories**: Type custom category names
3. **Add Questions**: Click on each dollar amount cell to add Q&A pairs
4. **Start Game**: Click "Start Playing!" when all questions are filled

## 🎮 How to Play

### Game Flow
1. **Choose Questions**: Click on dollar amount cells to reveal questions
2. **Read Aloud**: Question appears in a styled modal
3. **Reveal Answer**: Click "Reveal Answer" to show the correct response
4. **Update Scores**: Use score buttons to award or deduct points
5. **Continue Playing**: Close modal and select next question

### Scoring Tips
- **Correct Answer**: Award the dollar amount clicked
- **Incorrect Answer**: Deduct the dollar amount (or choose not to)
- **Manual Control**: Full flexibility in score management

## 🛠️ Technical Details

### File Structure
```
/pixel-jeopardy
├── index.html      # Main game interface
├── style.css       # Custom NES.css enhancements  
├── game.js         # Core game logic and state management
├── assets/         # Future assets (images, sounds)
└── README.md       # This documentation
```

### Dependencies
- **NES.css**: CSS framework for 8-bit styling
- **Press Start 2P**: Google Fonts for authentic pixel typography
- **Modern Browser**: ES6+ JavaScript support required

### Browser Compatibility
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+

## 🎨 Customization

### Color Themes
Modify CSS variables in `style.css`:
```css
:root {
    --retro-blue: #0066cc;
    --retro-purple: #8e44ad;
    --retro-green: #27ae60;
    --neon-green: #00ff41;
    /* ... more colors */
}
```

### Sound Effects
Audio generation uses Web Audio API. Modify frequencies in `game.js`:
```javascript
playSound(type) {
    // Customize frequencies for different actions
    let frequency = 440; // Change this value
}
```

### Question Values
Change dollar amounts by modifying the values array:
```javascript
const values = [100, 200, 300, 400, 500]; // Customize these
```

## 📱 Mobile Support

The game is fully responsive with:
- **Touch-friendly buttons**: Large tap targets
- **Optimized layouts**: Grid adjusts to screen size  
- **Readable fonts**: Scales appropriately
- **Mobile modals**: Full-screen on small devices

## 🔧 Advanced Features

### Local Storage
Game automatically saves:
- Current game state
- Player preferences (SFX/Music settings)
- Setup progress
- Question data

### Sample Data
Includes pre-built questions across 5 categories:
- **Science**: Basic scientific facts
- **History**: Historical events and figures
- **Sports**: Sports trivia and rules
- **Movies**: Film and entertainment
- **Geography**: World knowledge

### Accessibility
- **Keyboard Navigation**: ESC key closes modals
- **Screen Reader Friendly**: Semantic HTML structure
- **High Contrast**: Clear visual distinction between elements
- **Focus Management**: Proper tab order and focus states

## 🐛 Troubleshooting

### Common Issues

**Audio Not Working**
- Ensure browser allows autoplay audio
- Check if SFX is enabled in settings
- Try clicking elsewhere on page first (browser audio policy)

**Sample Data Won't Load**
- Refresh the page and try again
- Check browser console for JavaScript errors
- Ensure JavaScript is enabled

**Game State Not Saving**
- Check if browser allows local storage
- Clear browser cache and try again
- Ensure you're not in incognito/private mode

## 🎯 Future Enhancements

- **Daily Double**: Special question mechanics
- **Final Jeopardy**: Betting round
- **Timer Integration**: Question time limits
- **Sound Library**: Enhanced audio effects
- **Theme Editor**: Visual customization panel
- **Question Import**: CSV/JSON file upload
- **Multiplayer**: Network-based gameplay

## 📄 License

This project is open source. Feel free to modify and distribute according to your needs.

## 🙏 Credits

- **NES.css**: For the amazing retro CSS framework
- **Press Start 2P**: For the authentic pixel font
- **Web Audio API**: For 8-bit sound generation

---

**Enjoy your retro Jeopardy experience!** 🎮✨ 