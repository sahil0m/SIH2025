# 🛡️ Disaster Preparedness Training System

A comprehensive React-based interactive training platform designed to teach emergency response procedures through engaging simulations and drills.

## 🎯 Features

### 🌍 Multi-Disaster Simulations
- **Earthquake Simulation**: Interactive scenario-based learning with Drop, Cover, and Hold techniques
- **Fire Drill Training**: Time-pressure simulation with 10-second response windows
- **Flood Simulation**: Water emergency response scenarios
- **Cyclone Simulation**: Storm preparedness training
- **Landslide Simulation**: Geological disaster response training

### 🎮 Interactive Features
- **Real-time Feedback**: Immediate correction and learning reinforcement
- **Sound Effects**: Realistic audio for each disaster type using Web Audio API
- **Visual Animations**: Engaging particle effects and disaster animations
- **Progress Tracking**: Local storage of performance data
- **Badge System**: Achievement-based learning with performance badges
- **Responsive Design**: Mobile-friendly interface

### 🏆 Gamification
- **Score Management**: Performance tracking across sessions
- **Achievement Badges**:
  - 🏆 Safety Expert (90%+)
  - ⭐ Safety Star (75%+)
  - 📚 Safety Learner (50%+)
  - 🎯 Safety Beginner (<50%)
- **Statistics Dashboard**: Track improvement over time

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation
1. Clone or extract the project files
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Open your browser to `http://localhost:3000`

### Standalone Demo
You can also run the standalone HTML demo by opening `public/disaster-simulation.html` directly in your browser.

## 🏗️ Project Structure

```
src/
├── components/
│   ├── DisasterPreparednessApp.jsx    # Main simulation component
│   └── DisasterSimulation.css         # Custom styles and animations
├── pages/
│   └── DisasterSimulation.jsx         # Page wrapper
├── utils/
│   └── DisasterSoundManager.js        # Sound effects manager
├── App.js                             # Main app component
├── index.js                           # React entry point
└── index.css                          # Global styles

public/
├── disaster-simulation.html           # Standalone demo
├── disaster_dataset.json              # Simulation data
├── index.html                         # Main HTML template
└── Videos/                            # Training video assets
    ├── Earthquake/
    ├── Fire Safety/
    ├── Flood/
    ├── Cyclone/
    └── Landslide/
```

## 🎨 Key Technologies

- **React 18**: Modern React with hooks
- **Bootstrap 5**: Responsive UI framework
- **CSS3**: Custom animations and styling
- **Web Audio API**: Realistic sound effects
- **Local Storage**: Score persistence
- **Responsive Design**: Mobile-first approach

## 🎮 How to Use

### Accessing Simulations
1. **Main App**: Navigate to the main application at `http://localhost:3000`
2. **Standalone Demo**: Open `public/disaster-simulation.html` directly

### Using the Simulations
1. Choose a disaster type from the dashboard
2. Read scenario descriptions carefully
3. Select the most appropriate emergency response
4. Receive immediate feedback on your choices
5. Progress through all scenarios
6. View your final score and earned badge

### Features Available
- **Interactive Scenarios**: Multiple choice questions based on real emergency procedures
- **Visual Feedback**: Animated responses and particle effects
- **Sound Effects**: Realistic audio for each disaster type
- **Progress Tracking**: Save and track your performance over time
- **Educational Content**: Learn proper emergency response procedures

## 🎓 Educational Value

- **Interactive Learning**: Hands-on experience with emergency scenarios
- **Immediate Feedback**: Learn from mistakes in real-time
- **Gamification**: Engaging badge system encourages repeated practice
- **Real-world Application**: Scenarios based on actual emergency procedures
- **Multi-modal Learning**: Visual, auditory, and interactive elements

## 🔧 Customization

### Adding New Simulations
1. Create a new simulation component following the existing pattern
2. Add it to the main `DisasterPreparednessApp` component
3. Update the dashboard to include the new activity
4. Add sound effects in `DisasterSoundManager.js`

### Styling
The app uses custom CSS classes for enhanced visual appeal:
- `disaster-card`: Main card styling with glassmorphism effect
- `disaster-header`: Gradient headers for different sections
- `disaster-btn`: Custom button styling with hover effects
- `disaster-emoji`: Animated emoji displays

## 📱 Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🚨 Emergency Response Learning Objectives

### Earthquake Safety
- Understand the Drop, Cover, and Hold technique
- Learn proper evacuation procedures
- Identify safe zones during and after earthquakes
- Recognize common earthquake safety mistakes

### Fire Safety
- Develop quick decision-making skills
- Learn proper fire evacuation procedures
- Understand the importance of speed in emergencies
- Practice staying calm under pressure

### Other Disasters
- Flood preparedness and response
- Cyclone safety procedures
- Landslide awareness and evacuation

## 🔮 Future Enhancements

- Additional disaster types (tsunami, volcanic eruption)
- Multiplayer competitive modes
- Teacher dashboard for classroom management
- Integration with real emergency alert systems
- Voice-guided instructions
- AR/VR simulation support
- Multi-language support

## 📞 Support

For technical issues or questions about the Disaster Preparedness Training System, please refer to the documentation or contact the development team.

---

**Built for SIH 2025 | Emergency Response Education Platform** 🛡️
