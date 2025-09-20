# 🛡️ Disaster Preparedness Training System

A gamified React application designed to teach emergency response procedures through interactive simulations and drills.

## 🎯 Features

### 🌍 Earthquake Simulation
- **Scenario-based learning**: Interactive decision-making scenarios
- **Progressive difficulty**: Step-by-step emergency response training
- **Real-time feedback**: Immediate correction and learning reinforcement
- **Skills covered**:
  - Drop, Cover, and Hold techniques
  - Safe evacuation procedures
  - Identifying safe zones
  - Post-earthquake safety measures

### 🔥 Fire Drill Training
- **Time-pressure simulation**: 10-second response window
- **Speed-based scoring**: Faster correct responses earn higher scores
- **Emergency procedures**: Learn proper fire evacuation techniques
- **Realistic scenarios**: Simulated fire alarm situations

### 📊 Progress Tracking
- **Score management**: Local storage of performance data
- **Badge system**: Earn achievements based on performance
  - 🏆 Safety Expert (90%+)
  - ⭐ Safety Star (75%+)
  - 📚 Safety Learner (50%+)
  - 🎯 Safety Beginner (<50%)
- **Statistics dashboard**: Track improvement over time

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation
1. Navigate to the project directory:
   ```bash
   cd /Users/manan/sih-2025
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   - Main app: `http://localhost:3000`
   - Disaster simulation: `http://localhost:3000/disaster-simulation`
   - Standalone demo: `http://localhost:3000/disaster-simulation.html`

## 🎮 How to Use

### Accessing the Disaster Preparedness App
1. **Through the main app**: Navigate to `/disaster-simulation` route
2. **Standalone**: Open `disaster-simulation.html` directly in your browser

### Using the Simulations

#### Earthquake Simulation
1. Click "🚀 Start Simulation" on the dashboard
2. Read each scenario carefully
3. Choose the most appropriate response
4. Receive immediate feedback on your choice
5. Progress through all scenarios
6. View your final score and earned badge

#### Fire Drill
1. Click "🚨 Start Drill" on the dashboard
2. Wait for the fire alarm simulation
3. Quickly choose the correct emergency response
4. Your score depends on both accuracy and speed
5. Review your performance and reaction time

### Dashboard Features
- **Activity Overview**: See available training modules
- **Progress Tracking**: View completed activities and scores
- **Achievement Display**: Show earned badges and statistics
- **Quick Stats**: Overall performance metrics

## 🏗️ Technical Architecture

### Components Structure
```
DisasterPreparednessApp.jsx
├── ScoreManager (Utility)
├── EarthquakeSimulation
├── FireDrill
└── Dashboard
```

### Key Technologies
- **React 18**: Modern React with hooks
- **Bootstrap 5**: Responsive UI framework
- **CSS3**: Custom animations and styling
- **Local Storage**: Score persistence
- **Framer Motion**: Smooth page transitions

### File Structure
```
src/
├── components/
│   ├── DisasterPreparednessApp.jsx    # Main component
│   └── DisasterPreparednessApp.css    # Custom styles
├── App.js                             # Updated with new route
public/
├── index.html                         # Updated with Bootstrap CDN
└── disaster-simulation.html           # Standalone demo
```

## 🎨 Customization

### Styling
The app uses custom CSS classes for enhanced visual appeal:
- `disaster-card`: Main card styling with glassmorphism effect
- `disaster-header`: Gradient headers for different sections
- `disaster-btn`: Custom button styling with hover effects
- `disaster-emoji`: Animated emoji displays

### Adding New Simulations
1. Create a new component following the existing pattern
2. Add it to the main `DisasterPreparednessApp` component
3. Update the dashboard to include the new activity
4. Add routing in `App.js` if needed

### Score Management
The `ScoreManager` utility handles:
- Saving scores to localStorage
- Retrieving historical data
- Badge calculation based on performance
- Progress tracking across sessions

## 🔧 Configuration

### Bootstrap Integration
- **CDN**: Bootstrap 5.3.2 via CDN for faster loading
- **Icons**: Bootstrap Icons for consistent iconography
- **Animations**: Animate.css for smooth transitions

### Responsive Design
- Mobile-first approach
- Breakpoints: 768px, 992px, 1200px
- Touch-friendly interface for mobile devices

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

## 🎓 Educational Value
- **Interactive Learning**: Hands-on experience with emergency scenarios
- **Immediate Feedback**: Learn from mistakes in real-time
- **Gamification**: Engaging badge system encourages repeated practice
- **Real-world Application**: Scenarios based on actual emergency procedures

## 🔮 Future Enhancements
- Additional disaster types (floods, cyclones, landslides)
- Multiplayer competitive modes
- Teacher dashboard for classroom management
- Integration with real emergency alert systems
- Voice-guided instructions
- AR/VR simulation support

## 📞 Support
For technical issues or questions about the Disaster Preparedness Training System, please refer to the main project documentation or contact the development team.

---

**Built for SIH Demo | Emergency Response Education Platform** 🛡️

