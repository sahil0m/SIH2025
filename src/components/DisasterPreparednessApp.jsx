import React, { useState, useEffect } from 'react';
import './DisasterSimulation.css';
import disasterSoundManager from '../utils/DisasterSoundManager';

// Particle Effect Component
const ParticleEffect = ({ type, trigger, position = { x: 50, y: 50 } }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (trigger) {
      const newParticles = [];
      const particleCount = type === 'success' ? 15 : type === 'error' ? 8 : 12;
      
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: i,
          x: position.x + (Math.random() - 0.5) * 20,
          y: position.y + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4 - 2,
          life: 1,
          decay: 0.02 + Math.random() * 0.01,
          size: Math.random() * 4 + 2,
          color: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'
        });
      }
      
      setParticles(newParticles);
      
      const interval = setInterval(() => {
        setParticles(prev => 
          prev.map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life - particle.decay,
            vy: particle.vy + 0.1 // gravity
          })).filter(particle => particle.life > 0)
        );
      }, 16);
      
      setTimeout(() => clearInterval(interval), 2000);
    }
  }, [trigger, type, position]);

  return (
    <div className="particle-container" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1000 }}>
      {particles.map(particle => (
        <div
          key={particle.id}
          className="particle"
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            borderRadius: '50%',
            opacity: particle.life,
            transform: `translate(-50%, -50%) scale(${particle.life})`,
            transition: 'all 0.1s ease-out'
          }}
        />
      ))}
    </div>
  );
};

// Interactive Button Component with Visual Feedback
const InteractiveButton = ({ children, onClick, className = '', type = 'default', disabled = false }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 50, y: 50 });

  const handleClick = (e) => {
    if (disabled) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
    const y = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
    
    setButtonPosition({ x, y });
    setShowParticles(true);
    setIsPressed(true);
    
    setTimeout(() => {
      setIsPressed(false);
      setShowParticles(false);
    }, 600);
    
    onClick?.(e);
  };

  const buttonClasses = `interactive-button ${className} ${isPressed ? 'pressed' : ''} ${disabled ? 'disabled' : ''}`;

  return (
    <>
      <button
        className={buttonClasses}
        onClick={handleClick}
        disabled={disabled}
        style={{
          transform: isPressed ? 'scale(0.95)' : 'scale(1)',
          transition: 'all 0.1s ease-out'
        }}
      >
        {children}
      </button>
      <ParticleEffect 
        type={type} 
        trigger={showParticles} 
        position={buttonPosition}
      />
    </>
  );
};

// Utility functions for score management
const ScoreManager = {
  saveScore: (type, score, maxScore) => {
    const scores = JSON.parse(localStorage.getItem('disasterScores') || '{}');
    scores[type] = { score, maxScore, timestamp: new Date().toISOString() };
    localStorage.setItem('disasterScores', JSON.stringify(scores));
  },
  
  getScores: () => {
    return JSON.parse(localStorage.getItem('disasterScores') || '{}');
  },
  
  getBadge: (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return { name: 'Safety Expert', icon: '🏆', color: 'warning' };
    if (percentage >= 75) return { name: 'Safety Star', icon: '⭐', color: 'success' };
    if (percentage >= 50) return { name: 'Safety Learner', icon: '📚', color: 'info' };
    return { name: 'Safety Beginner', icon: '🎯', color: 'secondary' };
  }
};

// Earthquake Simulation Component
const EarthquakeSimulation = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const scenarios = [
    {
      id: 1,
      situation: "🌍 You're doing your homework at home when suddenly everything starts shaking! Your favorite toy falls off the shelf. What should you do first?",
      options: [
        { text: "🏃‍♂️ Run to grab your toy before it breaks", correct: false, feedback: "❌ Oh no! Running during shaking is super dangerous - you could fall and get hurt! Toys can be replaced, but you can't!" },
        { text: "🛡️ Drop, Cover, and Hold On under the kitchen table", correct: true, feedback: "🎉 Awesome! You're a safety superstar! The table will protect you from falling objects like your toy." },
        { text: "🚪 Stand in the doorway", correct: false, feedback: "❌ Doorways aren't as safe as sturdy tables or desks. Find something strong to hide under!" },
        { text: "📱 Call your parents first", correct: false, feedback: "❌ Safety first! Get to safety immediately, then you can call for help." }
      ]
    },
    {
      id: 2,
      situation: "🏠 The shaking has stopped! You're still under the table. What should you do next?",
      options: [
        { text: "⏰ Stay under the table and wait for help", correct: false, feedback: "❌ After shaking stops, you should get to a safer place in case there are more shakes!" },
        { text: "🚶‍♂️ Calmly walk to the front door, watching for broken glass", correct: true, feedback: "🌟 Perfect! You're being so brave and smart! Watch out for broken things on the floor." },
        { text: "🛗 Use the elevator to get downstairs quickly", correct: false, feedback: "❌ Never use elevators after an earthquake - they might not work and you could get stuck!" },
        { text: "📺 Turn on the TV to see what happened", correct: false, feedback: "❌ Your safety is more important than watching TV right now!" }
      ]
    },
    {
      id: 3,
      situation: "🌳 You're now outside your building. Where should you go to be the safest?",
      options: [
        { text: "🏢 Stand close to the building wall", correct: false, feedback: "❌ Building walls can have things fall off them - stay away from buildings!" },
        { text: "🌱 Go to the open playground away from buildings and trees", correct: true, feedback: "🎯 Excellent choice! The playground is perfect - no buildings or trees to fall on you!" },
        { text: "🚗 Hide under a parked car", correct: false, feedback: "❌ Cars can be squished by falling things - open spaces are much safer!" },
        { text: "🏠 Go back inside to get your favorite blanket", correct: false, feedback: "❌ Never go back inside until adults say it's safe! Your blanket can wait." }
      ]
    },
    {
      id: 4,
      situation: "⚡ You're in the playground when the ground starts shaking again (aftershock)! What should you do?",
      options: [
        { text: "🏃‍♂️ Run back to the building for shelter", correct: false, feedback: "❌ Stay in the open playground - buildings might be wobbly after the big earthquake!" },
        { text: "🤲 Drop to the ground and cover your head with your hands", correct: true, feedback: "🛡️ You're doing great! Even in open areas, it's important to drop and cover during aftershocks!" },
        { text: "🧍‍♂️ Stand still and wait for it to pass", correct: false, feedback: "❌ You should drop and cover even in open areas - it's the safest thing to do!" },
        { text: "📞 Call 911 immediately", correct: false, feedback: "❌ Focus on staying safe first, then you can call for help if you need to!" }
      ]
    },
    {
      id: 5,
      situation: "👃 After the earthquake, you smell something funny like rotten eggs. What should you do?",
      options: [
        { text: "🔍 Go investigate where the smell is coming from", correct: false, feedback: "❌ Never investigate strange smells yourself - they could be very dangerous! Get away!" },
        { text: "🏃‍♂️ Run away from the area and tell an adult immediately", correct: true, feedback: "🚨 You're a safety hero! That smell could be gas which is very dangerous. You did exactly the right thing!" },
        { text: "💡 Turn on lights to see better", correct: false, feedback: "❌ Don't touch anything electrical - gas can catch fire! Get away and tell an adult!" },
        { text: "🪟 Open windows to let fresh air in", correct: false, feedback: "❌ Don't try to fix it yourself - get away from the area and tell an adult right away!" }
      ]
    }
  ];

  const handleAnswer = (optionIndex) => {
    setSelectedOption(optionIndex);
    setShowFeedback(true);
    
    const isCorrect = scenarios[currentStep].options[optionIndex].correct;
    if (isCorrect) {
      setScore(score + 1);
      // Play success sound effect
      disasterSoundManager.playDisasterSound('success');
    } else {
      // Play child-friendly error sound
      disasterSoundManager.playDisasterSound('error');
    }

    // Show feedback for 3 seconds then move to next step
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedOption(null);
      
      if (currentStep < scenarios.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Simulation complete
        ScoreManager.saveScore('earthquake', score + (isCorrect ? 1 : 0), scenarios.length);
        setShowResult(true);
      }
    }, 3000);
  };

  const resetSimulation = () => {
    setCurrentStep(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    setShowFeedback(false);
  };

  if (showResult) {
    const finalScore = score;
    const badge = ScoreManager.getBadge(finalScore, scenarios.length);
    
    return (
      <div className="game-card success-animation">
        <div className="game-header earthquake-header">
          <h4 className="mb-0 d-flex align-items-center gap-2">
            <i className="bi bi-check-circle-fill"></i>
            Training Complete
          </h4>
        </div>
        <div className="card-body text-center">
          {/* Professional Scene */}
          <div className="scene-container">
            <i className="bi bi-award scene-icon"></i>
          </div>

          <div className="achievement-badge mb-3">
            <i className="bi bi-award me-2"></i>
            {badge.name}
          </div>
          <h3 className="text-success mb-3">Score: {finalScore}/{scenarios.length}</h3>
          <div className="progress-container mb-4">
            <div 
              className="progress-bar" 
              style={{width: `${(finalScore/scenarios.length)*100}%`}}
            >
              {Math.round((finalScore/scenarios.length)*100)}%
            </div>
          </div>
          
          <div className="alert alert-success mb-4">
            <h5>Training Complete</h5>
            <p className="mb-0">You have successfully completed the earthquake safety training. Continue practicing to improve your emergency response skills.</p>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <button className="game-button w-100" onClick={resetSimulation}>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Retry Training
              </button>
            </div>
            <div className="col-md-6">
              <button className="game-button w-100" onClick={() => onComplete?.()}>
                <i className="bi bi-speedometer2 me-2"></i>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentScenario = scenarios[currentStep];
  
  return (
    <div className="game-card">
        <div className="game-header earthquake-header">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0 d-flex align-items-center gap-2">
              <i className="bi bi-shield-exclamation"></i>
              Earthquake Safety Training
            </h4>
          <div>
            <span className="badge bg-dark fs-6">Step {currentStep + 1}/{scenarios.length}</span>
            <span className="badge bg-success fs-6 ms-2">Score: {score}</span>
          </div>
        </div>
      </div>
      <div className="card-body">
        {/* Animated Earthquake Scene */}
        <div className="scene-container">
          <div className="earthquake-animation-container">
            <div className="earthquake-symbol">
              <div className="ground-layer">
                <div className="crack crack-1"></div>
                <div className="crack crack-2"></div>
                <div className="crack crack-3"></div>
              </div>
              <div className="seismic-waves">
                <div className="wave wave-1"></div>
                <div className="wave wave-2"></div>
                <div className="wave wave-3"></div>
              </div>
              <div className="epicenter">
                <div className="pulse pulse-1"></div>
                <div className="pulse pulse-2"></div>
                <div className="pulse pulse-3"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="alert alert-info">
          <h5 className="mb-0">{currentScenario.situation}</h5>
        </div>

        {!showFeedback ? (
          <div className="row g-3 mt-3">
            {currentScenario.options.map((option, index) => (
              <div key={index} className="col-12">
                <InteractiveButton 
                  className="option-button w-100 text-start interactive-element"
                  onClick={() => handleAnswer(index)}
                  type="default"
                >
                  <div className="d-flex align-items-center gap-3">
                    <div className="option-letter">
                      <span className="badge bg-secondary rounded-circle" style={{width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem'}}>
                        {String.fromCharCode(65 + index)}
                      </span>
                    </div>
                    <div className="option-text">
                      {option.text}
                    </div>
                  </div>
                </InteractiveButton>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 feedback-container">
            <div className={`alert ${scenarios[currentStep].options[selectedOption].correct ? 'alert-success' : 'alert-danger'}`}>
              <div className="d-flex align-items-start gap-2">
                <i className={`bi ${scenarios[currentStep].options[selectedOption].correct ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}></i>
                <div>
                  <strong>
                    {scenarios[currentStep].options[selectedOption].correct ? 'Correct!' : 'Incorrect'}
                  </strong>
                  <p className="mb-0 mt-2">{scenarios[currentStep].options[selectedOption].feedback}</p>
                </div>
              </div>
            </div>
            <div className="text-center loading-container">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <span className="ms-3 text-muted">Loading next question...</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// Fire Drill Component
const FireDrill = ({ onComplete }) => {
  const [gameState, setGameState] = useState('ready'); // ready, active, result
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const drillScenarios = [
    {
      id: 1,
      question: "🚨 FIRE ALARM! The loud beeping starts while you're playing with your toys! What should you do immediately?",
      options: [
        { text: "🦎 Stop, Drop, and Crawl like a lizard to the nearest exit", correct: true, feedback: "🎉 You're a fire safety champion! Crawling like a lizard keeps you below the smoke where the air is cleaner!" },
        { text: "🏃‍♂️ Run as fast as you can to get out", correct: false, feedback: "❌ Running can make you breathe in more smoke and you might fall! Stay calm and crawl like a lizard!" },
        { text: "🎒 Grab your favorite toy first", correct: false, feedback: "❌ Toys can be replaced, but you can't! Your safety is the most important thing!" },
        { text: "🛗 Use the elevator to get downstairs quickly", correct: false, feedback: "❌ Never use elevators during a fire - they might stop working and you could get stuck!" }
      ]
    },
    {
      id: 2,
      question: "💨 You're crawling down the hallway when you see thick gray smoke! It's hard to see. What should you do?",
      options: [
        { text: "🦎 Keep crawling on your hands and knees like a lizard", correct: true, feedback: "🌟 Awesome! You're being so smart! The air near the floor is much cleaner and easier to breathe!" },
        { text: "🏃‍♂️ Run through the smoke as fast as possible", correct: false, feedback: "❌ Running through smoke makes you breathe in more bad air! Keep crawling like a lizard!" },
        { text: "🚪 Go back to your room and wait for help", correct: false, feedback: "❌ Never go back into a burning building! Keep looking for a safe way out!" },
        { text: "🧻 Cover your mouth with a wet towel and walk normally", correct: false, feedback: "❌ While covering your mouth helps, you should still crawl like a lizard to stay below the smoke!" }
      ]
    },
    {
      id: 3,
      question: "🚪 You reach a closed door. What should you do before opening it?",
      options: [
        { text: "🤚 Feel the door with the back of your hand like a detective", correct: true, feedback: "🕵️‍♂️ You're a super detective! Checking if the door is hot helps you know if there's fire on the other side!" },
        { text: "🚪 Open the door immediately", correct: false, feedback: "❌ Always check if a door is hot first - it's like being a safety detective!" },
        { text: "👊 Knock on the door first", correct: false, feedback: "❌ Don't waste time knocking - be a detective and check the door temperature first!" },
        { text: "👁️ Look through the keyhole", correct: false, feedback: "❌ The back of your hand is the best detective tool to check door temperature safely!" }
      ]
    },
    {
      id: 4,
      question: "🔥 The door feels hot like a warm cookie! What should you do?",
      options: [
        { text: "🔄 Find a different door or window to escape through", correct: true, feedback: "🎯 Perfect! You're a fire escape expert! A hot door means fire is on the other side - find another way out!" },
        { text: "🚪 Open the door anyway", correct: false, feedback: "❌ Never open a hot door - it could make the fire spread faster! Find another way out!" },
        { text: "⏰ Wait for help at the door", correct: false, feedback: "❌ Don't wait - be an active escape artist and find another way out right now!" },
        { text: "💧 Try to cool the door with water", correct: false, feedback: "❌ Don't waste time - be a quick escape artist and find another way out immediately!" }
      ]
    },
    {
      id: 5,
      question: "🎉 You made it safely outside! The fire truck is coming! What should you do next?",
      options: [
        { text: "📍 Go to the meeting spot and wait for your teacher to call your name", correct: true, feedback: "🏆 You're a fire safety superstar! The meeting spot is where everyone goes so teachers can make sure everyone is safe!" },
        { text: "🏃‍♂️ Go back inside to help your friends", correct: false, feedback: "❌ Never go back into a burning building! Let the firefighters help - they have special equipment!" },
        { text: "🚗 Go to your car and leave immediately", correct: false, feedback: "❌ Stay at the meeting spot so your teacher knows you're safe and can tell your family!" },
        { text: "📱 Call your family first", correct: false, feedback: "❌ Go to the meeting spot first, then you can call your family once your teacher knows you're safe!" }
      ]
    }
  ];

  const handleAnswer = (optionIndex) => {
    setSelectedOption(optionIndex);
    setShowFeedback(true);
    
    const isCorrect = drillScenarios[currentStep].options[optionIndex].correct;
    if (isCorrect) {
      setScore(score + 1);
      // Play success sound effect
      disasterSoundManager.playDisasterSound('success');
    } else {
      // Play child-friendly error sound
      disasterSoundManager.playDisasterSound('error');
    }

    // Show feedback for 3 seconds then move to next step
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedOption(null);
      
      if (currentStep < drillScenarios.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Drill complete
        ScoreManager.saveScore('fireDrill', score + (isCorrect ? 1 : 0), drillScenarios.length);
        setGameState('result');
      }
    }, 3000);
  };

  const startDrill = () => {
    setGameState('active');
    setCurrentStep(0);
    setScore(0);
    setSelectedOption(null);
    setShowFeedback(false);
  };

  const resetDrill = () => {
    setGameState('ready');
    setCurrentStep(0);
    setScore(0);
    setSelectedOption(null);
    setShowFeedback(false);
  };

  if (gameState === 'ready') {
    return (
      <div className="game-card" style={{maxWidth: '800px', margin: '0 auto'}}>
        {/* Compact Header */}
        <div className="game-header fire-header" style={{
          padding: '16px 24px',
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
          borderRadius: '12px 12px 0 0'
        }}>
          <h4 className="mb-0 d-flex align-items-center gap-2 text-white" style={{fontSize: '1.4rem', fontWeight: '600'}}>
            <i className="bi bi-fire" style={{fontSize: '1.2rem'}}></i>
            Fire Safety Training
          </h4>
        </div>
        
        <div className="card-body" style={{padding: '32px 24px'}}>
          {/* Large Centered Illustration */}
          <div className="text-center mb-5">
            <div style={{
              width: '160px',
              height: '160px',
              margin: '0 auto 24px',
              background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
              borderRadius: '20px',
              border: '3px solid #dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(220, 38, 38, 0.3)'
            }}>
              {/* SVG Fire Safety Illustration */}
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Fire extinguisher */}
                <rect x="20" y="40" width="12" height="35" fill="#DC2626" rx="3"/>
                <rect x="17" y="35" width="18" height="8" fill="#DC2626" rx="3"/>
                <rect x="22" y="25" width="8" height="12" fill="#DC2626" rx="2"/>
                <circle cx="26" cy="31" r="2" fill="#FEF2F2"/>
                
                {/* Fire flames */}
                <path d="M55 65 Q65 45 75 65 Q85 55 95 65 L95 85 L55 85 Z" fill="#FF6B35"/>
                <path d="M57 65 Q67 50 77 65 Q87 57 97 65 L97 83 L57 83 Z" fill="#FF8C42"/>
                <path d="M59 65 Q69 55 79 65 Q89 59 99 65 L99 81 L59 81 Z" fill="#FFA726"/>
                
                {/* Firefighter helmet */}
                <ellipse cx="45" cy="30" rx="12" ry="8" fill="#DC2626"/>
                <rect x="38" y="25" width="14" height="4" fill="#FEF2F2" rx="2"/>
                
                {/* Safety shield */}
                <path d="M30 15 Q40 8 50 15 Q40 22 30 15 Z" fill="#10B981" stroke="#059669" strokeWidth="2"/>
                <text x="40" y="19" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">SAFE</text>
              </svg>
            </div>
          </div>
          
          {/* Enhanced Title */}
          <h2 className="text-center mb-4" style={{
            fontSize: '2.2rem',
            fontWeight: '700',
            color: '#1f2937',
            lineHeight: '1.2'
          }}>
            Fire Safety Training
          </h2>
          
          {/* Enhanced Description */}
          <div className="text-center mb-5" style={{maxWidth: '600px', margin: '0 auto'}}>
            <p style={{
              fontSize: '1.2rem',
              lineHeight: '1.7',
              color: '#4b5563',
              fontWeight: '400',
              margin: '0'
            }}>
              Learn proper fire safety procedures through scenario-based training. 
              Practice emergency response protocols and evacuation techniques.
            </p>
          </div>
          
          {/* Enhanced Safety Tip */}
          <div className="text-center mb-5">
            <div style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              border: '2px solid #f59e0b',
              borderRadius: '16px',
              padding: '20px 24px',
              maxWidth: '500px',
              margin: '0 auto',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.2)'
            }}>
              <div className="d-flex align-items-center justify-content-center gap-3">
                <i className="bi bi-lightbulb" style={{fontSize: '1.5rem', color: '#f59e0b'}}></i>
                <div className="text-start">
                  <strong style={{fontSize: '1.1rem', color: '#92400e'}}>Safety Tip:</strong>
                  <p className="mb-0 mt-1" style={{fontSize: '1rem', color: '#92400e', lineHeight: '1.5'}}>
                    In a real fire, stay low to avoid smoke and move quickly but safely to exits.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Action Button */}
          <div className="text-center">
            <button 
              className="btn btn-lg" 
              onClick={startDrill}
              style={{
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                border: 'none',
                borderRadius: '16px',
                padding: '16px 32px',
                fontSize: '1.3rem',
                fontWeight: '600',
                color: 'white',
                boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4)',
                transition: 'all 0.3s ease',
                minWidth: '200px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
              }}
            >
              <i className="bi bi-play-fill me-2" style={{fontSize: '1.4rem'}}></i>
              Start Training
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'active') {
    const currentScenario = drillScenarios[currentStep];
    
    return (
      <div className="game-card">
        <div className="game-header fire-header">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0 d-flex align-items-center gap-2">
              <i className="bi bi-fire"></i>
              Fire Emergency Training
            </h4>
            <div>
              <span className="badge bg-dark fs-6">Step {currentStep + 1}/{drillScenarios.length}</span>
              <span className="badge bg-success fs-6 ms-2">Score: {score}</span>
            </div>
          </div>
        </div>
        <div className="card-body">
          {/* Child-Friendly Fire Safety Scene */}
          <div className="scene-container">
            <div style={{
              width: '100%',
              height: '200px',
              background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
              borderRadius: '16px',
              border: '3px solid #dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(220, 38, 38, 0.3)',
              overflow: 'hidden',
              position: 'relative'
            }}>
              {/* Simple Fire Illustration */}
              <svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                {/* Fire Flames */}
                <path d="M100 120 Q120 80 140 120 Q160 100 180 120 Q200 90 220 120 L220 160 L100 160 Z" fill="#FF6B35"/>
                <path d="M102 120 Q122 85 142 120 Q162 105 182 120 Q202 95 222 120 L222 158 L102 158 Z" fill="#FF8C42"/>
                <path d="M104 120 Q124 90 144 120 Q164 110 184 120 Q204 100 224 120 L224 156 L104 156 Z" fill="#FFA726"/>
                
                <path d="M250 130 Q270 90 290 130 Q310 110 330 130 Q350 100 370 130 L370 170 L250 170 Z" fill="#FF6B35"/>
                <path d="M252 130 Q272 95 292 130 Q312 115 332 130 Q352 105 372 130 L372 168 L252 168 Z" fill="#FF8C42"/>
                <path d="M254 130 Q274 100 294 130 Q314 120 334 130 Q354 110 374 130 L374 166 L254 166 Z" fill="#FFA726"/>
                
                {/* Fire Extinguisher */}
                <rect x="50" y="100" width="15" height="50" fill="#DC2626" rx="3"/>
                <rect x="47" y="90" width="21" height="15" fill="#DC2626" rx="3"/>
                <rect x="52" y="80" width="11" height="15" fill="#DC2626" rx="2"/>
                <circle cx="57" cy="87" r="3" fill="#FEF2F2"/>
                
                {/* Smoke */}
                <ellipse cx="150" cy="60" rx="20" ry="10" fill="#6B7280" opacity="0.7"/>
                <ellipse cx="160" cy="50" rx="15" ry="8" fill="#9CA3AF" opacity="0.5"/>
                <ellipse cx="170" cy="40" rx="12" ry="6" fill="#D1D5DB" opacity="0.3"/>
                
                <ellipse cx="320" cy="70" rx="18" ry="9" fill="#6B7280" opacity="0.7"/>
                <ellipse cx="330" cy="60" rx="13" ry="7" fill="#9CA3AF" opacity="0.5"/>
                <ellipse cx="340" cy="50" rx="10" ry="5" fill="#D1D5DB" opacity="0.3"/>
              </svg>
            </div>
          </div>

          <div className="alert alert-danger">
            <h5 className="mb-0">{currentScenario.question}</h5>
          </div>

          {!showFeedback ? (
            <div className="row g-3 mt-3">
              {currentScenario.options.map((option, index) => (
                <div key={index} className="col-12">
                  <button 
                    className="option-button w-100 text-start interactive-element"
                    onClick={() => handleAnswer(index)}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className="option-letter">
                        <span className="badge bg-secondary rounded-circle" style={{width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem'}}>
                          {String.fromCharCode(65 + index)}
                        </span>
                      </div>
                      <div className="option-text">
                        {option.text}
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 feedback-container">
              <div className={`alert ${drillScenarios[currentStep].options[selectedOption].correct ? 'alert-success' : 'alert-danger'}`}>
                <div className="d-flex align-items-start gap-2">
                  <i className={`bi ${drillScenarios[currentStep].options[selectedOption].correct ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}></i>
                  <div>
                    <strong>
                      {drillScenarios[currentStep].options[selectedOption].correct ? 'Correct!' : 'Incorrect'}
                    </strong>
                    <p className="mb-0 mt-2">{drillScenarios[currentStep].options[selectedOption].feedback}</p>
                  </div>
                </div>
              </div>
              <div className="text-center loading-container">
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <span className="ms-3 text-muted">Loading next question...</span>
              </div>
            </div>
          )}

          <div className="progress-container mt-4">
            <div 
              className="progress-bar" 
              style={{width: `${((currentStep + 1)/drillScenarios.length)*100}%`}}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'result') {
    const finalScore = score;
    const badge = ScoreManager.getBadge(finalScore, drillScenarios.length);
    
    return (
      <div className="game-card success-animation">
        <div className="game-header fire-header">
          <h4 className="mb-0 d-flex align-items-center gap-2">
            <i className="bi bi-check-circle-fill"></i>
            Training Complete
          </h4>
        </div>
        <div className="card-body text-center">
          {/* Simple Scene */}
          <div className="scene-container">
            <i className="bi bi-award scene-icon text-success"></i>
          </div>

          <div className="achievement-badge mb-3">
            <i className="bi bi-award me-2"></i>
            {badge.name}
          </div>
          <h3 className="text-success mb-3">Score: {finalScore}/{drillScenarios.length}</h3>
          
          <div className="progress-container mb-4">
            <div 
              className="progress-bar" 
              style={{width: `${(finalScore/drillScenarios.length)*100}%`}}
            >
              {Math.round((finalScore/drillScenarios.length)*100)}%
            </div>
          </div>

          <div className={`alert ${finalScore >= 4 ? 'alert-success' : finalScore >= 3 ? 'alert-warning' : 'alert-danger'} mb-4`}>
            <h5>
              {finalScore >= 4 ? 'Excellent Performance' : 
               finalScore >= 3 ? 'Good Performance' : 
               'Keep Practicing'}
            </h5>
            <p className="mb-0">
              {finalScore >= 4 ? 
                "You have demonstrated strong fire safety knowledge and would be well-prepared in a real emergency." :
                finalScore >= 3 ?
                "Good effort! Review the feedback and practice more to improve your fire safety knowledge." :
                "Keep practicing! Fire safety knowledge is crucial for real emergency situations."
              }
            </p>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <button className="game-button w-100" onClick={resetDrill}>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Retry Training
              </button>
            </div>
            <div className="col-md-6">
              <button className="game-button w-100" onClick={() => onComplete?.()}>
                <i className="bi bi-speedometer2 me-2"></i>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

// EarthquakeDrill Component
const EarthquakeDrill = ({ onComplete }) => {
  const [gameState, setGameState] = useState('ready'); // ready, active, result
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const drillScenarios = [
    {
      id: 1,
      question: "🌍 EARTHQUAKE! The ground starts shaking while you're in your classroom! What should you do immediately?",
      options: [
        { text: "🦎 Drop, Cover, and Hold like a turtle under your desk", correct: true, feedback: "🎉 You're an earthquake safety champion! Dropping, covering, and holding protects you from falling objects!" },
        { text: "🏃‍♂️ Run outside as fast as you can", correct: false, feedback: "❌ Never run during an earthquake! You might fall or get hit by falling objects. Drop, cover, and hold!" },
        { text: "🚪 Stand in the doorway", correct: false, feedback: "❌ Doorways aren't the safest place anymore! Drop, cover, and hold under a sturdy desk or table!" },
        { text: "📱 Call your family first", correct: false, feedback: "❌ Don't use phones during an earthquake! Focus on protecting yourself first - drop, cover, and hold!" }
      ]
    },
    {
      id: 2,
      question: "🪑 You're under your desk when the shaking gets stronger! What should you do?",
      options: [
        { text: "🦎 Hold on tight to the desk legs like a koala", correct: true, feedback: "🌟 Awesome! You're being so smart! Holding onto the desk keeps you safe from moving around!" },
        { text: "👀 Look around to see what's happening", correct: false, feedback: "❌ Keep your head down and protected! Don't look around - just hold on tight!" },
        { text: "📢 Shout for help loudly", correct: false, feedback: "❌ Stay quiet and focused! Shouting won't help and you need to conserve energy!" },
        { text: "🚶‍♂️ Get up and move to a different spot", correct: false, feedback: "❌ Never move during an earthquake! Stay where you are and hold on tight!" }
      ]
    },
    {
      id: 3,
      question: "⏰ The shaking stops! What should you do next?",
      options: [
        { text: "⏳ Wait for your teacher's instructions like a patient penguin", correct: true, feedback: "🐧 You're a super patient penguin! Always wait for your teacher to tell you it's safe to move!" },
        { text: "🏃‍♂️ Get up and run outside immediately", correct: false, feedback: "❌ Don't run yet! There might be aftershocks. Wait for your teacher's instructions!" },
        { text: "📱 Call your family right away", correct: false, feedback: "❌ Wait for your teacher first! They need to check if it's safe and give you instructions!" },
        { text: "🔍 Look around to see if there's damage", correct: false, feedback: "❌ Stay put and wait! Your teacher will check for damage and tell you what to do!" }
      ]
    },
    {
      id: 4,
      question: "👩‍🏫 Your teacher says 'Evacuate!' What should you do?",
      options: [
        { text: "🚶‍♂️ Walk calmly to the meeting spot like a careful turtle", correct: true, feedback: "🐢 Perfect! You're a careful turtle! Walking calmly helps everyone stay safe during evacuation!" },
        { text: "🏃‍♂️ Run as fast as you can to get outside", correct: false, feedback: "❌ Don't run! Walking calmly prevents accidents and helps everyone stay safe!" },
        { text: "🎒 Grab your backpack first", correct: false, feedback: "❌ Leave your things behind! Your safety is more important than any belongings!" },
        { text: "👥 Help your friends carry their things", correct: false, feedback: "❌ Don't help with belongings! Focus on getting yourself to safety first!" }
      ]
    },
    {
      id: 5,
      question: "📍 You're at the meeting spot outside! What should you do now?",
      options: [
        { text: "👥 Stay with your class and wait for roll call like a good student", correct: true, feedback: "🏆 You're an earthquake safety superstar! Staying with your class helps teachers make sure everyone is safe!" },
        { text: "🏃‍♂️ Go find your family immediately", correct: false, feedback: "❌ Stay with your class! Your teacher needs to make sure everyone is accounted for first!" },
        { text: "📱 Call your family from your phone", correct: false, feedback: "❌ Wait for your teacher's permission! They need to check everyone is safe first!" },
        { text: "🏠 Try to walk home by yourself", correct: false, feedback: "❌ Never leave without permission! Stay with your class until your teacher says it's okay!" }
      ]
    }
  ];

  const handleAnswer = (optionIndex) => {
    setSelectedOption(optionIndex);
    setShowFeedback(true);
    
    const isCorrect = drillScenarios[currentStep].options[optionIndex].correct;
    if (isCorrect) {
      setScore(score + 1);
      // Play success sound effect
      disasterSoundManager.playDisasterSound('success');
    } else {
      // Play child-friendly error sound
      disasterSoundManager.playDisasterSound('error');
    }

    // Show feedback for 3 seconds then move to next step
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedOption(null);
      
      if (currentStep < drillScenarios.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Drill complete
        ScoreManager.saveScore('earthquakeDrill', score + (isCorrect ? 1 : 0), drillScenarios.length);
        setGameState('result');
      }
    }, 3000);
  };

  const startDrill = () => {
    setGameState('active');
    setCurrentStep(0);
    setScore(0);
    setSelectedOption(null);
    setShowFeedback(false);
  };

  const resetDrill = () => {
    setGameState('ready');
    setCurrentStep(0);
    setScore(0);
    setSelectedOption(null);
    setShowFeedback(false);
  };

  if (gameState === 'ready') {
    return (
      <div className="game-card" style={{maxWidth: '800px', margin: '0 auto'}}>
        {/* Compact Header */}
        <div className="game-header earthquake-header" style={{
          padding: '16px 24px',
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          borderRadius: '12px 12px 0 0'
        }}>
          <h4 className="mb-0 d-flex align-items-center gap-2 text-white" style={{fontSize: '1.4rem', fontWeight: '600'}}>
            <i className="bi bi-shield-exclamation" style={{fontSize: '1.2rem'}}></i>
            Earthquake Safety Training
          </h4>
        </div>
        
        <div className="card-body" style={{padding: '32px 24px'}}>
          {/* Large Centered Illustration */}
          <div className="text-center mb-5">
            <div style={{
              width: '160px',
              height: '160px',
              margin: '0 auto 24px',
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              borderRadius: '20px',
              border: '3px solid #f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)'
            }}>
              {/* SVG Earthquake Safety Illustration */}
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Ground with cracks */}
                <rect x="0" y="70" width="100" height="30" fill="#8B4513"/>
                <path d="M20 70 L25 100 M40 70 L45 100 M60 70 L65 100 M80 70 L85 100" stroke="#654321" strokeWidth="2" strokeLinecap="round"/>
                
                {/* Buildings with shaking effect */}
                <rect x="10" y="40" width="20" height="30" fill="#D2691E" rx="2"/>
                <rect x="12" y="42" width="16" height="6" fill="#87CEEB" rx="1"/>
                <rect x="12" y="52" width="16" height="6" fill="#87CEEB" rx="1"/>
                <rect x="12" y="62" width="16" height="6" fill="#87CEEB" rx="1"/>
                
                <rect x="40" y="35" width="18" height="35" fill="#D2691E" rx="2"/>
                <rect x="42" y="37" width="14" height="5" fill="#87CEEB" rx="1"/>
                <rect x="42" y="47" width="14" height="5" fill="#87CEEB" rx="1"/>
                <rect x="42" y="57" width="14" height="5" fill="#87CEEB" rx="1"/>
                <rect x="42" y="67" width="14" height="5" fill="#87CEEB" rx="1"/>
                
                <rect x="70" y="45" width="15" height="25" fill="#D2691E" rx="2"/>
                <rect x="72" y="47" width="11" height="4" fill="#87CEEB" rx="1"/>
                <rect x="72" y="55" width="11" height="4" fill="#87CEEB" rx="1"/>
                <rect x="72" y="63" width="11" height="4" fill="#87CEEB" rx="1"/>
                
                {/* Safety people under tables */}
                <rect x="15" y="60" width="8" height="6" fill="#8B4513" rx="1"/>
                <circle cx="19" cy="57" r="2" fill="#FFDBAC"/>
                <rect x="18" y="59" width="2" height="4" fill="#4169E1"/>
                
                <rect x="45" y="65" width="7" height="5" fill="#8B4513" rx="1"/>
                <circle cx="48" cy="62" r="1.8" fill="#FFDBAC"/>
                <rect x="47" y="64" width="2" height="3" fill="#4169E1"/>
                
                <rect x="75" y="62" width="6" height="5" fill="#8B4513" rx="1"/>
                <circle cx="78" cy="59" r="1.5" fill="#FFDBAC"/>
                <rect x="77" y="61" width="2" height="3" fill="#4169E1"/>
                
                {/* Shaking lines */}
                <path d="M5 50 Q25 45 50 50 Q75 45 95 50" stroke="#FF6B6B" strokeWidth="2" fill="none" opacity="0.8"/>
              </svg>
            </div>
          </div>
          
          {/* Enhanced Title */}
          <h2 className="text-center mb-4" style={{
            fontSize: '2.2rem',
            fontWeight: '700',
            color: '#1f2937',
            lineHeight: '1.2'
          }}>
            Earthquake Safety Training
          </h2>
          
          {/* Enhanced Description */}
          <div className="text-center mb-5" style={{maxWidth: '600px', margin: '0 auto'}}>
            <p style={{
              fontSize: '1.2rem',
              lineHeight: '1.7',
              color: '#4b5563',
              fontWeight: '400',
              margin: '0'
            }}>
              Learn proper earthquake safety procedures through scenario-based training. 
              Practice emergency response protocols and evacuation techniques.
            </p>
          </div>
          
          {/* Enhanced Safety Tip */}
          <div className="text-center mb-5">
            <div style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              border: '2px solid #f59e0b',
              borderRadius: '16px',
              padding: '20px 24px',
              maxWidth: '500px',
              margin: '0 auto',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.2)'
            }}>
              <div className="d-flex align-items-center justify-content-center gap-3">
                <i className="bi bi-lightbulb" style={{fontSize: '1.5rem', color: '#f59e0b'}}></i>
                <div className="text-start">
                  <strong style={{fontSize: '1.1rem', color: '#92400e'}}>Safety Tip:</strong>
                  <p className="mb-0 mt-1" style={{fontSize: '1rem', color: '#92400e', lineHeight: '1.5'}}>
                    In a real earthquake, drop to the ground, take cover under a sturdy desk or table, and hold on until the shaking stops.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Action Button */}
          <div className="text-center">
            <button 
              className="btn btn-lg" 
              onClick={startDrill}
              style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                border: 'none',
                borderRadius: '16px',
                padding: '16px 32px',
                fontSize: '1.3rem',
                fontWeight: '600',
                color: 'white',
                boxShadow: '0 6px 20px rgba(245, 158, 11, 0.4)',
                transition: 'all 0.3s ease',
                minWidth: '200px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(245, 158, 11, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.4)';
              }}
            >
              <i className="bi bi-play-fill me-2" style={{fontSize: '1.4rem'}}></i>
              Start Training
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'active') {
    const currentScenario = drillScenarios[currentStep];
    
    return (
      <div className="game-card">
        <div className="game-header earthquake-header">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0 d-flex align-items-center gap-2">
              <i className="bi bi-shield-exclamation"></i>
              Earthquake Emergency Training
            </h4>
            <div>
              <span className="badge bg-dark fs-6">Step {currentStep + 1}/{drillScenarios.length}</span>
              <span className="badge bg-success fs-6 ms-2">Score: {score}</span>
            </div>
          </div>
        </div>
        <div className="card-body">
          {/* Child-Friendly Earthquake Safety Scene */}
          <div className="scene-container">
            <div style={{
              width: '100%',
              height: '200px',
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              borderRadius: '16px',
              border: '3px solid #f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)',
              overflow: 'hidden',
              position: 'relative'
            }}>
              {/* Simple Earthquake Illustration */}
              <svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                {/* Ground */}
                <rect x="0" y="150" width="400" height="50" fill="#8B4513"/>
                
                {/* Ground Cracks */}
                <path d="M50 150 L60 200 M100 150 L110 200 M150 150 L160 200 M200 150 L210 200 M250 150 L260 200 M300 150 L310 200 M350 150 L360 200" stroke="#654321" strokeWidth="3" strokeLinecap="round"/>
                
                {/* Buildings */}
                <rect x="50" y="100" width="40" height="50" fill="#D2691E" rx="3"/>
                <rect x="55" y="105" width="30" height="8" fill="#87CEEB" rx="1"/>
                <rect x="55" y="118" width="30" height="8" fill="#87CEEB" rx="1"/>
                <rect x="55" y="131" width="30" height="8" fill="#87CEEB" rx="1"/>
                
                <rect x="150" y="80" width="35" height="70" fill="#D2691E" rx="3"/>
                <rect x="155" y="85" width="25" height="6" fill="#87CEEB" rx="1"/>
                <rect x="155" y="98" width="25" height="6" fill="#87CEEB" rx="1"/>
                <rect x="155" y="111" width="25" height="6" fill="#87CEEB" rx="1"/>
                <rect x="155" y="124" width="25" height="6" fill="#87CEEB" rx="1"/>
                <rect x="155" y="137" width="25" height="6" fill="#87CEEB" rx="1"/>
                
                <rect x="250" y="110" width="30" height="40" fill="#D2691E" rx="3"/>
                <rect x="255" y="115" width="20" height="6" fill="#87CEEB" rx="1"/>
                <rect x="255" y="128" width="20" height="6" fill="#87CEEB" rx="1"/>
                <rect x="255" y="141" width="20" height="6" fill="#87CEEB" rx="1"/>
                
                {/* Shaking Lines */}
                <path d="M20 50 Q100 45 200 50 Q300 45 380 50" stroke="#F59E0B" strokeWidth="3" fill="none" opacity="0.8"/>
                <path d="M20 60 Q100 55 200 60 Q300 55 380 60" stroke="#F59E0B" strokeWidth="2" fill="none" opacity="0.6"/>
              </svg>
            </div>
          </div>

          <div className="alert alert-warning">
            <h5 className="mb-0">{currentScenario.question}</h5>
          </div>

          {!showFeedback ? (
            <div className="row g-3 mt-3">
              {currentScenario.options.map((option, index) => (
                <div key={index} className="col-12">
                  <button 
                    className="option-button w-100 text-start interactive-element"
                    onClick={() => handleAnswer(index)}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className="option-letter">
                        <span className="badge bg-secondary rounded-circle" style={{width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem'}}>
                          {String.fromCharCode(65 + index)}
                        </span>
                      </div>
                      <div className="option-text">
                        {option.text}
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 feedback-container">
              <div className={`alert ${drillScenarios[currentStep].options[selectedOption].correct ? 'alert-success' : 'alert-danger'}`}>
                <div className="d-flex align-items-start gap-2">
                  <i className={`bi ${drillScenarios[currentStep].options[selectedOption].correct ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}></i>
                  <div>
                    <strong>
                      {drillScenarios[currentStep].options[selectedOption].correct ? 'Correct!' : 'Incorrect'}
                    </strong>
                    <p className="mb-0 mt-2">{drillScenarios[currentStep].options[selectedOption].feedback}</p>
                  </div>
                </div>
              </div>
              <div className="text-center loading-container">
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <span className="ms-3 text-muted">Loading next question...</span>
              </div>
            </div>
          )}

          <div className="progress-container mt-4">
            <div 
              className="progress-bar" 
              style={{width: `${((currentStep + 1)/drillScenarios.length)*100}%`}}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'result') {
    const finalScore = score;
    const badge = ScoreManager.getBadge(finalScore, drillScenarios.length);
    
    return (
      <div className="game-card success-animation">
        <div className="game-header earthquake-header">
          <h4 className="mb-0 d-flex align-items-center gap-2">
            <i className="bi bi-check-circle-fill"></i>
            Training Complete
          </h4>
        </div>
        <div className="card-body text-center">
          {/* Simple Scene */}
          <div className="scene-container">
            <i className="bi bi-award scene-icon text-success"></i>
          </div>

          <div className="achievement-badge mb-3">
            <i className="bi bi-award me-2"></i>
            {badge.name}
          </div>
          <h3 className="text-success mb-3">Score: {finalScore}/{drillScenarios.length}</h3>
          
          <div className="progress-container mb-4">
            <div 
              className="progress-bar" 
              style={{width: `${(finalScore/drillScenarios.length)*100}%`}}
            >
              {Math.round((finalScore/drillScenarios.length)*100)}%
            </div>
          </div>

          <div className={`alert ${finalScore >= 4 ? 'alert-success' : finalScore >= 3 ? 'alert-warning' : 'alert-danger'} mb-4`}>
            <h5>
              {finalScore >= 4 ? 'Excellent Performance' : 
               finalScore >= 3 ? 'Good Performance' : 
               'Keep Practicing'}
            </h5>
            <p className="mb-0">
              {finalScore >= 4 ? 
                "You have demonstrated strong earthquake safety knowledge and would be well-prepared in a real emergency." :
                finalScore >= 3 ?
                "Good effort! Review the feedback and practice more to improve your earthquake safety knowledge." :
                "Keep practicing! Earthquake safety knowledge is crucial for real emergency situations."
              }
            </p>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <button className="game-button w-100" onClick={resetDrill}>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Retry Training
              </button>
            </div>
            <div className="col-md-6">
              <button className="game-button w-100" onClick={() => onComplete?.()}>
                <i className="bi bi-speedometer2 me-2"></i>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

// FloodDrill Component
const FloodDrill = ({ onComplete }) => {
  const [gameState, setGameState] = useState('ready'); // ready, active, result
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const drillScenarios = [
    {
      id: 1,
      question: "🌊 FLOOD WARNING! Heavy rain is causing water to rise around your school! What should you do immediately?",
      options: [
        { text: "🏃‍♂️ Move to higher ground like a smart mountain goat", correct: true, feedback: "🐐 You're a flood safety champion! Moving to higher ground keeps you safe from rising water!" },
        { text: "🏊‍♂️ Try to swim through the water", correct: false, feedback: "❌ Never try to swim in flood water! It's dangerous and you might get swept away!" },
        { text: "🚗 Try to drive through the water", correct: false, feedback: "❌ Never drive through flood water! Cars can float away and you could get trapped!" },
        { text: "📱 Stay and call for help", correct: false, feedback: "❌ Don't wait to call! Move to higher ground first, then you can call for help!" }
      ]
    },
    {
      id: 2,
      question: "🚶‍♂️ You're walking to higher ground when you see fast-moving water ahead! What should you do?",
      options: [
        { text: "🔄 Turn around and find a different route like a smart explorer", correct: true, feedback: "🗺️ Awesome! You're a smart explorer! Never walk through fast-moving water - find a safer path!" },
        { text: "🏃‍♂️ Run through the water as fast as you can", correct: false, feedback: "❌ Never run through fast-moving water! You could slip and get swept away!" },
        { text: "🤚 Test the water depth with your hand", correct: false, feedback: "❌ Don't test the water! Even shallow water can be dangerous if it's moving fast!" },
        { text: "⏰ Wait for the water to slow down", correct: false, feedback: "❌ Don't wait! Find a different route immediately - flood water can get worse quickly!" }
      ]
    },
    {
      id: 3,
      question: "🏠 You reach a building on higher ground, but the water is still rising! What should you do?",
      options: [
        { text: "🏢 Go to the highest floor like a climbing monkey", correct: true, feedback: "🐒 You're a smart climbing monkey! The higher you go, the safer you'll be from rising water!" },
        { text: "🚪 Stay on the ground floor", correct: false, feedback: "❌ Don't stay on the ground floor! Water can still reach you there!" },
        { text: "🏃‍♂️ Go back outside to find help", correct: false, feedback: "❌ Don't go back outside! Stay in the building and go higher up!" },
        { text: "📱 Stay by the window to signal for help", correct: false, feedback: "❌ Don't stay by windows! Go to the highest floor first, then you can signal for help!" }
      ]
    },
    {
      id: 4,
      question: "🚨 You hear a flood evacuation order! What should you do?",
      options: [
        { text: "👥 Follow your teacher's instructions like a good team player", correct: true, feedback: "👥 Perfect! You're a great team player! Always follow your teacher's instructions during emergencies!" },
        { text: "🏃‍♂️ Run to your car to drive away", correct: false, feedback: "❌ Don't try to drive during a flood! Follow your teacher's evacuation plan!" },
        { text: "🎒 Pack your belongings first", correct: false, feedback: "❌ Don't pack belongings! Your safety is more important than any items!" },
        { text: "📞 Call your family before leaving", correct: false, feedback: "❌ Follow evacuation orders first! You can call your family once you're safe!" }
      ]
    },
    {
      id: 5,
      question: "🚤 You're in a rescue boat! What should you do to stay safe?",
      options: [
        { text: "🦎 Sit still and hold on tight like a calm turtle", correct: true, feedback: "🐢 You're a calm turtle! Sitting still and holding on helps the rescuers keep you safe!" },
        { text: "🏃‍♂️ Stand up to see better", correct: false, feedback: "❌ Don't stand up in a boat! You could fall into the water!" },
        { text: "📱 Take pictures of the flood", correct: false, feedback: "❌ Don't take pictures! Focus on staying safe and following instructions!" },
        { text: "🏊‍♂️ Jump out to swim to shore", correct: false, feedback: "❌ Never jump out of a rescue boat! Stay in the boat until you reach safety!" }
      ]
    }
  ];

  const handleAnswer = (optionIndex) => {
    setSelectedOption(optionIndex);
    setShowFeedback(true);
    
    const isCorrect = drillScenarios[currentStep].options[optionIndex].correct;
    if (isCorrect) {
      setScore(score + 1);
      // Play success sound effect
      disasterSoundManager.playDisasterSound('success');
    } else {
      // Play child-friendly error sound
      disasterSoundManager.playDisasterSound('error');
    }

    // Show feedback for 3 seconds then move to next step
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedOption(null);
      
      if (currentStep < drillScenarios.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Drill complete
        ScoreManager.saveScore('floodDrill', score + (isCorrect ? 1 : 0), drillScenarios.length);
        setGameState('result');
      }
    }, 3000);
  };

  const startDrill = () => {
    setGameState('active');
    setCurrentStep(0);
    setScore(0);
    setSelectedOption(null);
    setShowFeedback(false);
  };

  const resetDrill = () => {
    setGameState('ready');
    setCurrentStep(0);
    setScore(0);
    setSelectedOption(null);
    setShowFeedback(false);
  };

  if (gameState === 'ready') {
    return (
      <div className="game-card" style={{maxWidth: '800px', margin: '0 auto'}}>
        {/* Compact Header */}
        <div className="game-header flood-header" style={{
          padding: '16px 24px',
          background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
          borderRadius: '12px 12px 0 0'
        }}>
          <h4 className="mb-0 d-flex align-items-center gap-2 text-white" style={{fontSize: '1.4rem', fontWeight: '600'}}>
            <i className="bi bi-droplet" style={{fontSize: '1.2rem'}}></i>
            Flood Safety Training
          </h4>
        </div>
        
        <div className="card-body" style={{padding: '32px 24px'}}>
          {/* Large Centered Illustration */}
          <div className="text-center mb-5">
            <div style={{
              width: '160px',
              height: '160px',
              margin: '0 auto 24px',
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              borderRadius: '20px',
              border: '3px solid #0ea5e9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(14, 165, 233, 0.3)'
            }}>
              {/* SVG Flood Safety Illustration */}
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Houses with water */}
                <rect x="10" y="40" width="20" height="20" fill="#8B4513" rx="2"/>
                <polygon points="10,40 20,30 30,40" fill="#DC2626"/>
                <rect x="15" y="50" width="10" height="10" fill="#87CEEB" rx="1"/>
                
                <rect x="40" y="35" width="18" height="25" fill="#8B4513" rx="2"/>
                <polygon points="40,35 49,25 58,35" fill="#DC2626"/>
                <rect x="45" y="45" width="8" height="10" fill="#87CEEB" rx="1"/>
                
                <rect x="70" y="45" width="15" height="15" fill="#8B4513" rx="2"/>
                <polygon points="70,45 77,38 85,45" fill="#DC2626"/>
                <rect x="74" y="52" width="7" height="6" fill="#87CEEB" rx="1"/>
                
                {/* Water waves */}
                <path d="M0 60 Q25 50 50 60 Q75 50 100 60 L100 100 L0 100 Z" fill="#0EA5E9" opacity="0.7"/>
                <path d="M0 65 Q25 55 50 65 Q75 55 100 65 L100 100 L0 100 Z" fill="#0284C7" opacity="0.5"/>
                <path d="M0 70 Q25 60 50 70 Q75 60 100 70 L100 100 L0 100 Z" fill="#0369A1" opacity="0.3"/>
                
                {/* Life jacket people */}
                <circle cx="5" cy="25" r="3" fill="#FFDBAC"/>
                <rect x="3" y="28" width="4" height="6" fill="#FFD700"/>
                <rect x="2" y="29" width="6" height="4" fill="#FFD700" rx="1"/>
                
                <circle cx="35" cy="20" r="2.5" fill="#FFDBAC"/>
                <rect x="34" y="22" width="2" height="5" fill="#FFD700"/>
                <rect x="33" y="23" width="4" height="3" fill="#FFD700" rx="1"/>
                
                <circle cx="65" cy="25" r="3" fill="#FFDBAC"/>
                <rect x="63" y="28" width="4" height="6" fill="#FFD700"/>
                <rect x="62" y="29" width="6" height="4" fill="#FFD700" rx="1"/>
                
                {/* Safety waves */}
                <path d="M5 15 Q10 10 15 15 Q20 10 25 15" stroke="#10B981" strokeWidth="2" fill="none"/>
                <path d="M5 18 Q10 13 15 18 Q20 13 25 18" stroke="#10B981" strokeWidth="2" fill="none"/>
              </svg>
            </div>
          </div>
          
          {/* Enhanced Title */}
          <h2 className="text-center mb-4" style={{
            fontSize: '2.2rem',
            fontWeight: '700',
            color: '#1f2937',
            lineHeight: '1.2'
          }}>
            Flood Safety Training
          </h2>
          
          {/* Enhanced Description */}
          <div className="text-center mb-5" style={{maxWidth: '600px', margin: '0 auto'}}>
            <p style={{
              fontSize: '1.2rem',
              lineHeight: '1.7',
              color: '#4b5563',
              fontWeight: '400',
              margin: '0'
            }}>
              Learn proper flood safety procedures through scenario-based training. 
              Practice emergency response protocols and evacuation techniques.
            </p>
          </div>
          
          {/* Enhanced Safety Tip */}
          <div className="text-center mb-5">
            <div style={{
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              border: '2px solid #0ea5e9',
              borderRadius: '16px',
              padding: '20px 24px',
              maxWidth: '500px',
              margin: '0 auto',
              boxShadow: '0 4px 15px rgba(14, 165, 233, 0.2)'
            }}>
              <div className="d-flex align-items-center justify-content-center gap-3">
                <i className="bi bi-lightbulb" style={{fontSize: '1.5rem', color: '#0ea5e9'}}></i>
                <div className="text-start">
                  <strong style={{fontSize: '1.1rem', color: '#0369a1'}}>Safety Tip:</strong>
                  <p className="mb-0 mt-1" style={{fontSize: '1rem', color: '#0369a1', lineHeight: '1.5'}}>
                    In a real flood, move to higher ground immediately and never walk or drive through flood water.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Action Button */}
          <div className="text-center">
            <button 
              className="btn btn-lg" 
              onClick={startDrill}
              style={{
                background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
                border: 'none',
                borderRadius: '16px',
                padding: '16px 32px',
                fontSize: '1.3rem',
                fontWeight: '600',
                color: 'white',
                boxShadow: '0 6px 20px rgba(14, 165, 233, 0.4)',
                transition: 'all 0.3s ease',
                minWidth: '200px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(14, 165, 233, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 20px rgba(14, 165, 233, 0.4)';
              }}
            >
              <i className="bi bi-play-fill me-2" style={{fontSize: '1.4rem'}}></i>
              Start Training
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'active') {
    const currentScenario = drillScenarios[currentStep];
    
    return (
      <div className="game-card">
        <div className="game-header flood-header">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0 d-flex align-items-center gap-2">
              <i className="bi bi-droplet"></i>
              Flood Emergency Training
            </h4>
            <div>
              <span className="badge bg-dark fs-6">Step {currentStep + 1}/{drillScenarios.length}</span>
              <span className="badge bg-success fs-6 ms-2">Score: {score}</span>
            </div>
          </div>
        </div>
        <div className="card-body">
          {/* Child-Friendly Flood Safety Scene */}
          <div className="scene-container">
            <div style={{
              width: '100%',
              height: '200px',
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              borderRadius: '16px',
              border: '3px solid #0ea5e9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(14, 165, 233, 0.3)',
              overflow: 'hidden',
              position: 'relative'
            }}>
              {/* Simple Flood Illustration */}
              <svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                {/* Water */}
                <rect x="0" y="120" width="400" height="80" fill="#0EA5E9"/>
                
                {/* Water Waves */}
                <path d="M0 120 Q50 110 100 120 Q150 110 200 120 Q250 110 300 120 Q350 110 400 120 L400 200 L0 200 Z" fill="#0284C7" opacity="0.7"/>
                <path d="M0 130 Q50 120 100 130 Q150 120 200 130 Q250 120 300 130 Q350 120 400 130 L400 200 L0 200 Z" fill="#0369A1" opacity="0.5"/>
                
                {/* Houses Partially Submerged */}
                <rect x="50" y="100" width="40" height="30" fill="#8B4513" rx="3"/>
                <polygon points="50,100 70,85 90,100" fill="#DC2626"/>
                <rect x="60" y="110" width="20" height="15" fill="#87CEEB" rx="1"/>
                
                <rect x="150" y="90" width="35" height="40" fill="#8B4513" rx="3"/>
                <polygon points="150,90 167,75 185,90" fill="#DC2626"/>
                <rect x="160" y="100" width="15" height="20" fill="#87CEEB" rx="1"/>
                
                <rect x="250" y="105" width="30" height="25" fill="#8B4513" rx="3"/>
                <polygon points="250,105 265,92 280,105" fill="#DC2626"/>
                <rect x="258" y="112" width="14" height="12" fill="#87CEEB" rx="1"/>
                
                <rect x="320" y="95" width="25" height="35" fill="#8B4513" rx="3"/>
                <polygon points="320,95 332,82 345,95" fill="#DC2626"/>
                <rect x="327" y="102" width="11" height="18" fill="#87CEEB" rx="1"/>
              </svg>
            </div>
          </div>

          <div className="alert alert-info">
            <h5 className="mb-0">{currentScenario.question}</h5>
          </div>

          {!showFeedback ? (
            <div className="row g-3 mt-3">
              {currentScenario.options.map((option, index) => (
                <div key={index} className="col-12">
                  <button 
                    className="option-button w-100 text-start interactive-element"
                    onClick={() => handleAnswer(index)}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className="option-letter">
                        <span className="badge bg-secondary rounded-circle" style={{width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem'}}>
                          {String.fromCharCode(65 + index)}
                        </span>
                      </div>
                      <div className="option-text">
                        {option.text}
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 feedback-container">
              <div className={`alert ${drillScenarios[currentStep].options[selectedOption].correct ? 'alert-success' : 'alert-danger'}`}>
                <div className="d-flex align-items-start gap-2">
                  <i className={`bi ${drillScenarios[currentStep].options[selectedOption].correct ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}></i>
                  <div>
                    <strong>
                      {drillScenarios[currentStep].options[selectedOption].correct ? 'Correct!' : 'Incorrect'}
                    </strong>
                    <p className="mb-0 mt-2">{drillScenarios[currentStep].options[selectedOption].feedback}</p>
                  </div>
                </div>
              </div>
              <div className="text-center loading-container">
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <span className="ms-3 text-muted">Loading next question...</span>
              </div>
            </div>
          )}

          <div className="progress-container mt-4">
            <div 
              className="progress-bar" 
              style={{width: `${((currentStep + 1)/drillScenarios.length)*100}%`}}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'result') {
    const finalScore = score;
    const badge = ScoreManager.getBadge(finalScore, drillScenarios.length);
    
    return (
      <div className="game-card success-animation">
        <div className="game-header flood-header">
          <h4 className="mb-0 d-flex align-items-center gap-2">
            <i className="bi bi-check-circle-fill"></i>
            Training Complete
          </h4>
        </div>
        <div className="card-body text-center">
          {/* Simple Scene */}
          <div className="scene-container">
            <i className="bi bi-award scene-icon text-success"></i>
          </div>

          <div className="achievement-badge mb-3">
            <i className="bi bi-award me-2"></i>
            {badge.name}
          </div>
          <h3 className="text-success mb-3">Score: {finalScore}/{drillScenarios.length}</h3>
          
          <div className="progress-container mb-4">
            <div 
              className="progress-bar" 
              style={{width: `${(finalScore/drillScenarios.length)*100}%`}}
            >
              {Math.round((finalScore/drillScenarios.length)*100)}%
            </div>
          </div>

          <div className={`alert ${finalScore >= 4 ? 'alert-success' : finalScore >= 3 ? 'alert-warning' : 'alert-danger'} mb-4`}>
            <h5>
              {finalScore >= 4 ? 'Excellent Performance' : 
               finalScore >= 3 ? 'Good Performance' : 
               'Keep Practicing'}
            </h5>
            <p className="mb-0">
              {finalScore >= 4 ? 
                "You have demonstrated strong flood safety knowledge and would be well-prepared in a real emergency." :
                finalScore >= 3 ?
                "Good effort! Review the feedback and practice more to improve your flood safety knowledge." :
                "Keep practicing! Flood safety knowledge is crucial for real emergency situations."
              }
            </p>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <button className="game-button w-100" onClick={resetDrill}>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Retry Training
              </button>
            </div>
            <div className="col-md-6">
              <button className="game-button w-100" onClick={() => onComplete?.()}>
                <i className="bi bi-speedometer2 me-2"></i>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

// CycloneDrill Component
const CycloneDrill = ({ onComplete }) => {
  const [gameState, setGameState] = useState('ready'); // ready, active, result
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const drillScenarios = [
    {
      id: 1,
      question: "🌪️ CYCLONE WARNING! Strong winds are approaching your area! What should you do immediately?",
      options: [
        { text: "🏠 Go inside a strong building like a smart turtle in its shell", correct: true, feedback: "🐢 You're a cyclone safety champion! Going inside a strong building protects you from dangerous winds!" },
        { text: "🏃‍♂️ Run outside to see the cyclone", correct: false, feedback: "❌ Never go outside during a cyclone! The winds are very dangerous and can hurt you!" },
        { text: "🚗 Try to drive away from the cyclone", correct: false, feedback: "❌ Don't try to drive during a cyclone! It's too dangerous and you might get caught in the storm!" },
        { text: "📱 Stay outside to call for help", correct: false, feedback: "❌ Go inside first! You can call for help once you're safe inside a strong building!" }
      ]
    },
    {
      id: 2,
      question: "🏠 You're inside, but the winds are getting stronger! What should you do?",
      options: [
        { text: "🦎 Go to the lowest floor like a smart groundhog", correct: true, feedback: "🦫 Awesome! You're a smart groundhog! The lowest floor is the safest place during strong winds!" },
        { text: "🏃‍♂️ Go to the highest floor to see better", correct: false, feedback: "❌ Don't go to high floors! The winds are stronger up there and more dangerous!" },
        { text: "🚪 Stand by the windows to watch", correct: false, feedback: "❌ Stay away from windows! They can break and hurt you during strong winds!" },
        { text: "📱 Go to the roof to get better phone signal", correct: false, feedback: "❌ Never go to the roof during a cyclone! It's the most dangerous place!" }
      ]
    },
    {
      id: 3,
      question: "🚪 You're on the lowest floor when you hear the cyclone getting closer! What should you do?",
      options: [
        { text: "🦎 Hide in a small room like a bathroom like a smart mouse", correct: true, feedback: "🐭 You're a smart mouse! Small rooms like bathrooms are the safest places during cyclones!" },
        { text: "🏃‍♂️ Run to the garage", correct: false, feedback: "❌ Don't go to the garage! It's not safe during a cyclone - find a small interior room!" },
        { text: "🚪 Go to the kitchen", correct: false, feedback: "❌ The kitchen has windows and appliances that can be dangerous! Find a small interior room!" },
        { text: "📱 Stay in the living room", correct: false, feedback: "❌ Living rooms often have big windows! Find a small interior room without windows!" }
      ]
    },
    {
      id: 4,
      question: "🚨 You hear the cyclone evacuation order! What should you do?",
      options: [
        { text: "👥 Follow your teacher's evacuation plan like a good team player", correct: true, feedback: "👥 Perfect! You're a great team player! Always follow your teacher's evacuation plan during emergencies!" },
        { text: "🏃‍♂️ Run to your car to drive away", correct: false, feedback: "❌ Don't try to drive during a cyclone! Follow your teacher's evacuation plan instead!" },
        { text: "🎒 Pack your belongings first", correct: false, feedback: "❌ Don't pack belongings! Your safety is more important than any items!" },
        { text: "📞 Call your family before leaving", correct: false, feedback: "❌ Follow evacuation orders first! You can call your family once you're safe!" }
      ]
    },
    {
      id: 5,
      question: "🚌 You're in the evacuation bus! What should you do to stay safe?",
      options: [
        { text: "🦎 Sit still and hold on tight like a calm koala", correct: true, feedback: "🐨 You're a calm koala! Sitting still and holding on helps everyone stay safe during the evacuation!" },
        { text: "🏃‍♂️ Stand up to see out the window", correct: false, feedback: "❌ Don't stand up in a moving bus! You could fall and get hurt!" },
        { text: "📱 Take pictures of the cyclone", correct: false, feedback: "❌ Don't take pictures! Focus on staying safe and following instructions!" },
        { text: "🚪 Try to open the bus door", correct: false, feedback: "❌ Never try to open bus doors! Stay seated and let the driver handle everything!" }
      ]
    }
  ];

  const handleAnswer = (optionIndex) => {
    setSelectedOption(optionIndex);
    setShowFeedback(true);
    
    const isCorrect = drillScenarios[currentStep].options[optionIndex].correct;
    if (isCorrect) {
      setScore(score + 1);
      // Play success sound effect
      disasterSoundManager.playDisasterSound('success');
    } else {
      // Play child-friendly error sound
      disasterSoundManager.playDisasterSound('error');
    }

    // Show feedback for 3 seconds then move to next step
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedOption(null);
      
      if (currentStep < drillScenarios.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Drill complete
        ScoreManager.saveScore('cycloneDrill', score + (isCorrect ? 1 : 0), drillScenarios.length);
        setGameState('result');
      }
    }, 3000);
  };

  const startDrill = () => {
    setGameState('active');
    setCurrentStep(0);
    setScore(0);
    setSelectedOption(null);
    setShowFeedback(false);
  };

  const resetDrill = () => {
    setGameState('ready');
    setCurrentStep(0);
    setScore(0);
    setSelectedOption(null);
    setShowFeedback(false);
  };

  if (gameState === 'ready') {
    return (
      <div className="game-card" style={{maxWidth: '800px', margin: '0 auto'}}>
        {/* Compact Header */}
        <div className="game-header cyclone-header" style={{
          padding: '16px 24px',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          borderRadius: '12px 12px 0 0'
        }}>
          <h4 className="mb-0 d-flex align-items-center gap-2 text-white" style={{fontSize: '1.4rem', fontWeight: '600'}}>
            <i className="bi bi-tornado" style={{fontSize: '1.2rem'}}></i>
            Cyclone Safety Training
          </h4>
        </div>
        
        <div className="card-body" style={{padding: '32px 24px'}}>
          {/* Large Centered Illustration */}
          <div className="text-center mb-5">
            <div style={{
              width: '160px',
              height: '160px',
              margin: '0 auto 24px',
              background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
              borderRadius: '20px',
              border: '3px solid #8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)'
            }}>
              {/* SVG Cyclone Safety Illustration */}
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Cyclone spiral */}
                <path d="M50 20 Q60 30 50 40 Q40 50 50 60 Q60 70 50 80 Q40 90 50 100" stroke="#8B5CF6" strokeWidth="3" fill="none" opacity="0.8"/>
                <path d="M50 25 Q55 35 50 45 Q45 55 50 65 Q55 75 50 85 Q45 95 50 100" stroke="#A78BFA" strokeWidth="2" fill="none" opacity="0.6"/>
                <path d="M50 30 Q52 40 50 50 Q48 60 50 70 Q52 80 50 90 Q48 100 50 100" stroke="#C4B5FD" strokeWidth="1.5" fill="none" opacity="0.4"/>
                
                {/* Storm clouds */}
                <ellipse cx="30" cy="25" rx="15" ry="8" fill="#6B7280" opacity="0.7"/>
                <ellipse cx="70" cy="35" rx="12" ry="6" fill="#6B7280" opacity="0.7"/>
                <ellipse cx="20" cy="45" rx="10" ry="5" fill="#6B7280" opacity="0.7"/>
                <ellipse cx="80" cy="55" rx="14" ry="7" fill="#6B7280" opacity="0.7"/>
                
                {/* Safe house */}
                <rect x="40" y="60" width="20" height="25" fill="#8B4513" rx="2"/>
                <polygon points="40,60 50,50 60,60" fill="#DC2626"/>
                <rect x="45" y="70" width="10" height="15" fill="#87CEEB" rx="1"/>
                
                {/* Safety people inside */}
                <circle cx="50" cy="75" r="2" fill="#FFDBAC"/>
                <rect x="49" y="77" width="2" height="3" fill="#4169E1"/>
                
                {/* Wind lines */}
                <path d="M10 20 Q20 25 30 20 Q40 25 50 20" stroke="#8B5CF6" strokeWidth="2" fill="none" opacity="0.6"/>
                <path d="M10 30 Q20 35 30 30 Q40 35 50 30" stroke="#8B5CF6" strokeWidth="2" fill="none" opacity="0.6"/>
                <path d="M10 40 Q20 45 30 40 Q40 45 50 40" stroke="#8B5CF6" strokeWidth="2" fill="none" opacity="0.6"/>
                
                {/* Safety shield */}
                <path d="M70 15 Q80 8 90 15 Q80 22 70 15 Z" fill="#10B981" stroke="#059669" strokeWidth="2"/>
                <text x="80" y="19" textAnchor="middle" fontSize="6" fill="white" fontWeight="bold">SAFE</text>
              </svg>
            </div>
          </div>
          
          {/* Enhanced Title */}
          <h2 className="text-center mb-4" style={{
            fontSize: '2.2rem',
            fontWeight: '700',
            color: '#1f2937',
            lineHeight: '1.2'
          }}>
            Cyclone Safety Training
          </h2>
          
          {/* Enhanced Description */}
          <div className="text-center mb-5" style={{maxWidth: '600px', margin: '0 auto'}}>
            <p style={{
              fontSize: '1.2rem',
              lineHeight: '1.7',
              color: '#4b5563',
              fontWeight: '400',
              margin: '0'
            }}>
              Learn proper cyclone safety procedures through scenario-based training. 
              Practice emergency response protocols and evacuation techniques.
            </p>
          </div>
          
          {/* Enhanced Safety Tip */}
          <div className="text-center mb-5">
            <div style={{
              background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
              border: '2px solid #8b5cf6',
              borderRadius: '16px',
              padding: '20px 24px',
              maxWidth: '500px',
              margin: '0 auto',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.2)'
            }}>
              <div className="d-flex align-items-center justify-content-center gap-3">
                <i className="bi bi-lightbulb" style={{fontSize: '1.5rem', color: '#8b5cf6'}}></i>
                <div className="text-start">
                  <strong style={{fontSize: '1.1rem', color: '#7c3aed'}}>Safety Tip:</strong>
                  <p className="mb-0 mt-1" style={{fontSize: '1rem', color: '#7c3aed', lineHeight: '1.5'}}>
                    In a real cyclone, go to the lowest floor of a strong building and stay in a small interior room away from windows.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Action Button */}
          <div className="text-center">
            <button 
              className="btn btn-lg" 
              onClick={startDrill}
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                border: 'none',
                borderRadius: '16px',
                padding: '16px 32px',
                fontSize: '1.3rem',
                fontWeight: '600',
                color: 'white',
                boxShadow: '0 6px 20px rgba(139, 92, 246, 0.4)',
                transition: 'all 0.3s ease',
                minWidth: '200px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)';
              }}
            >
              <i className="bi bi-play-fill me-2" style={{fontSize: '1.4rem'}}></i>
              Start Training
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'active') {
    const currentScenario = drillScenarios[currentStep];
    
    return (
      <div className="game-card">
        <div className="game-header cyclone-header">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0 d-flex align-items-center gap-2">
              <i className="bi bi-tornado"></i>
              Cyclone Emergency Training
            </h4>
            <div>
              <span className="badge bg-dark fs-6">Step {currentStep + 1}/{drillScenarios.length}</span>
              <span className="badge bg-success fs-6 ms-2">Score: {score}</span>
            </div>
          </div>
        </div>
        <div className="card-body">
          {/* Child-Friendly Cyclone Safety Scene */}
          <div className="scene-container">
            <div style={{
              width: '100%',
              height: '200px',
              background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
              borderRadius: '16px',
              border: '3px solid #8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)',
              overflow: 'hidden',
              position: 'relative'
            }}>
              {/* Simple Cyclone Illustration */}
              <svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                {/* Cyclone Spiral */}
                <path d="M200 50 Q220 70 200 90 Q180 110 200 130 Q220 150 200 170" stroke="#8B5CF6" strokeWidth="4" fill="none" opacity="0.8"/>
                <path d="M200 60 Q215 75 200 90 Q185 105 200 120 Q215 135 200 150" stroke="#A78BFA" strokeWidth="3" fill="none" opacity="0.6"/>
                <path d="M200 70 Q210 80 200 90 Q190 100 200 110 Q210 120 200 130" stroke="#C4B5FD" strokeWidth="2" fill="none" opacity="0.4"/>
                
                {/* Storm Clouds */}
                <ellipse cx="100" cy="60" rx="25" ry="12" fill="#6B7280" opacity="0.8"/>
                <ellipse cx="110" cy="50" rx="20" ry="10" fill="#9CA3AF" opacity="0.6"/>
                <ellipse cx="120" cy="40" rx="15" ry="8" fill="#D1D5DB" opacity="0.4"/>
                
                <ellipse cx="300" cy="80" rx="22" ry="11" fill="#6B7280" opacity="0.8"/>
                <ellipse cx="310" cy="70" rx="18" ry="9" fill="#9CA3AF" opacity="0.6"/>
                <ellipse cx="320" cy="60" rx="12" ry="6" fill="#D1D5DB" opacity="0.4"/>
                
                <ellipse cx="50" cy="100" rx="20" ry="10" fill="#6B7280" opacity="0.8"/>
                <ellipse cx="60" cy="90" rx="15" ry="8" fill="#9CA3AF" opacity="0.6"/>
                
                <ellipse cx="350" cy="120" rx="18" ry="9" fill="#6B7280" opacity="0.8"/>
                <ellipse cx="360" cy="110" rx="12" ry="6" fill="#9CA3AF" opacity="0.6"/>
                
                {/* Wind Lines */}
                <path d="M50 40 Q100 35 150 40 Q200 35 250 40 Q300 35 350 40" stroke="#8B5CF6" strokeWidth="3" fill="none" opacity="0.6"/>
                <path d="M50 50 Q100 45 150 50 Q200 45 250 50 Q300 45 350 50" stroke="#A78BFA" strokeWidth="2" fill="none" opacity="0.4"/>
                <path d="M50 60 Q100 55 150 60 Q200 55 250 60 Q300 55 350 60" stroke="#C4B5FD" strokeWidth="2" fill="none" opacity="0.3"/>
              </svg>
            </div>
          </div>

          <div className="alert alert-secondary">
            <h5 className="mb-0">{currentScenario.question}</h5>
          </div>

          {!showFeedback ? (
            <div className="row g-3 mt-3">
              {currentScenario.options.map((option, index) => (
                <div key={index} className="col-12">
                  <button 
                    className="option-button w-100 text-start interactive-element"
                    onClick={() => handleAnswer(index)}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className="option-letter">
                        <span className="badge bg-secondary rounded-circle" style={{width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem'}}>
                          {String.fromCharCode(65 + index)}
                        </span>
                      </div>
                      <div className="option-text">
                        {option.text}
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 feedback-container">
              <div className={`alert ${drillScenarios[currentStep].options[selectedOption].correct ? 'alert-success' : 'alert-danger'}`}>
                <div className="d-flex align-items-start gap-2">
                  <i className={`bi ${drillScenarios[currentStep].options[selectedOption].correct ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}></i>
                  <div>
                    <strong>
                      {drillScenarios[currentStep].options[selectedOption].correct ? 'Correct!' : 'Incorrect'}
                    </strong>
                    <p className="mb-0 mt-2">{drillScenarios[currentStep].options[selectedOption].feedback}</p>
                  </div>
                </div>
              </div>
              <div className="text-center loading-container">
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <span className="ms-3 text-muted">Loading next question...</span>
              </div>
            </div>
          )}

          <div className="progress-container mt-4">
            <div 
              className="progress-bar" 
              style={{width: `${((currentStep + 1)/drillScenarios.length)*100}%`}}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'result') {
    const finalScore = score;
    const badge = ScoreManager.getBadge(finalScore, drillScenarios.length);
    
    return (
      <div className="game-card success-animation">
        <div className="game-header cyclone-header">
          <h4 className="mb-0 d-flex align-items-center gap-2">
            <i className="bi bi-check-circle-fill"></i>
            Training Complete
          </h4>
        </div>
        <div className="card-body text-center">
          {/* Simple Scene */}
          <div className="scene-container">
            <i className="bi bi-award scene-icon text-success"></i>
          </div>

          <div className="achievement-badge mb-3">
            <i className="bi bi-award me-2"></i>
            {badge.name}
          </div>
          <h3 className="text-success mb-3">Score: {finalScore}/{drillScenarios.length}</h3>
          
          <div className="progress-container mb-4">
            <div 
              className="progress-bar" 
              style={{width: `${(finalScore/drillScenarios.length)*100}%`}}
            >
              {Math.round((finalScore/drillScenarios.length)*100)}%
            </div>
          </div>

          <div className={`alert ${finalScore >= 4 ? 'alert-success' : finalScore >= 3 ? 'alert-warning' : 'alert-danger'} mb-4`}>
            <h5>
              {finalScore >= 4 ? 'Excellent Performance' : 
               finalScore >= 3 ? 'Good Performance' : 
               'Keep Practicing'}
            </h5>
            <p className="mb-0">
              {finalScore >= 4 ? 
                "You have demonstrated strong cyclone safety knowledge and would be well-prepared in a real emergency." :
                finalScore >= 3 ?
                "Good effort! Review the feedback and practice more to improve your cyclone safety knowledge." :
                "Keep practicing! Cyclone safety knowledge is crucial for real emergency situations."
              }
            </p>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <button className="game-button w-100" onClick={resetDrill}>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Retry Training
              </button>
            </div>
            <div className="col-md-6">
              <button className="game-button w-100" onClick={() => onComplete?.()}>
                <i className="bi bi-speedometer2 me-2"></i>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

// LandslideDrill Component
const LandslideDrill = ({ onComplete }) => {
  const [gameState, setGameState] = useState('ready'); // ready, active, result
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const drillScenarios = [
    {
      id: 1,
      question: "🏔️ LANDSLIDE WARNING! Heavy rain is making the hillside unstable! What should you do immediately?",
      options: [
        { text: "🏃‍♂️ Move away from the hillside like a smart mountain goat", correct: true, feedback: "🐐 You're a landslide safety champion! Moving away from unstable hillsides keeps you safe from falling rocks and mud!" },
        { text: "🏔️ Go up the hill to get higher", correct: false, feedback: "❌ Never go up a hill during a landslide warning! The ground might be unstable and dangerous!" },
        { text: "🚗 Try to drive through the area quickly", correct: false, feedback: "❌ Don't try to drive through landslide areas! The road might be blocked or unsafe!" },
        { text: "📱 Stay and call for help", correct: false, feedback: "❌ Don't wait to call! Move to safety first, then you can call for help!" }
      ]
    },
    {
      id: 2,
      question: "🚶‍♂️ You're walking away when you see rocks starting to fall! What should you do?",
      options: [
        { text: "🏃‍♂️ Run to the side like a quick rabbit", correct: true, feedback: "🐰 Awesome! You're a quick rabbit! Running to the side helps you avoid falling rocks and debris!" },
        { text: "🦎 Drop and cover like in an earthquake", correct: false, feedback: "❌ Don't drop and cover! You need to get away from falling rocks - run to the side!" },
        { text: "📢 Shout for help loudly", correct: false, feedback: "❌ Don't shout! Focus on getting to safety first - run to the side!" },
        { text: "⏰ Stop and wait for the rocks to stop falling", correct: false, feedback: "❌ Don't wait! Keep moving to safety - run to the side immediately!" }
      ]
    },
    {
      id: 3,
      question: "🏠 You reach a safe building, but the landslide is getting worse! What should you do?",
      options: [
        { text: "🦎 Go to the side of the building away from the hill like a smart squirrel", correct: true, feedback: "🐿️ You're a smart squirrel! Going to the side away from the hill keeps you safe from falling debris!" },
        { text: "🏃‍♂️ Go to the back of the building", correct: false, feedback: "❌ The back might be closer to the hill! Go to the side away from the landslide!" },
        { text: "🚪 Stay by the front door", correct: false, feedback: "❌ Don't stay by doors! Go to the side of the building away from the hill!" },
        { text: "📱 Go to the roof to get better signal", correct: false, feedback: "❌ Don't go to the roof! Stay on the ground floor on the side away from the hill!" }
      ]
    },
    {
      id: 4,
      question: "🚨 You hear a landslide evacuation order! What should you do?",
      options: [
        { text: "👥 Follow your teacher's evacuation plan like a good team player", correct: true, feedback: "👥 Perfect! You're a great team player! Always follow your teacher's evacuation plan during emergencies!" },
        { text: "🏃‍♂️ Run to your car to drive away", correct: false, feedback: "❌ Don't try to drive during a landslide! Follow your teacher's evacuation plan instead!" },
        { text: "🎒 Pack your belongings first", correct: false, feedback: "❌ Don't pack belongings! Your safety is more important than any items!" },
        { text: "📞 Call your family before leaving", correct: false, feedback: "❌ Follow evacuation orders first! You can call your family once you're safe!" }
      ]
    },
    {
      id: 5,
      question: "🚌 You're in the evacuation vehicle! What should you do to stay safe?",
      options: [
        { text: "🦎 Sit still and hold on tight like a calm turtle", correct: true, feedback: "🐢 You're a calm turtle! Sitting still and holding on helps everyone stay safe during the evacuation!" },
        { text: "🏃‍♂️ Stand up to see out the window", correct: false, feedback: "❌ Don't stand up in a moving vehicle! You could fall and get hurt!" },
        { text: "📱 Take pictures of the landslide", correct: false, feedback: "❌ Don't take pictures! Focus on staying safe and following instructions!" },
        { text: "🚪 Try to open the vehicle door", correct: false, feedback: "❌ Never try to open vehicle doors! Stay seated and let the driver handle everything!" }
      ]
    }
  ];

  const handleAnswer = (optionIndex) => {
    setSelectedOption(optionIndex);
    setShowFeedback(true);
    
    const isCorrect = drillScenarios[currentStep].options[optionIndex].correct;
    if (isCorrect) {
      setScore(score + 1);
      // Play success sound effect
      disasterSoundManager.playDisasterSound('success');
    } else {
      // Play child-friendly error sound
      disasterSoundManager.playDisasterSound('error');
    }

    // Show feedback for 3 seconds then move to next step
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedOption(null);
      
      if (currentStep < drillScenarios.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Drill complete
        ScoreManager.saveScore('landslideDrill', score + (isCorrect ? 1 : 0), drillScenarios.length);
        setGameState('result');
      }
    }, 3000);
  };

  const startDrill = () => {
    setGameState('active');
    setCurrentStep(0);
    setScore(0);
    setSelectedOption(null);
    setShowFeedback(false);
  };

  const resetDrill = () => {
    setGameState('ready');
    setCurrentStep(0);
    setScore(0);
    setSelectedOption(null);
    setShowFeedback(false);
  };

  if (gameState === 'ready') {
    return (
      <div className="game-card" style={{maxWidth: '800px', margin: '0 auto'}}>
        {/* Compact Header */}
        <div className="game-header landslide-header" style={{
          padding: '16px 24px',
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          borderRadius: '12px 12px 0 0'
        }}>
          <h4 className="mb-0 d-flex align-items-center gap-2 text-white" style={{fontSize: '1.4rem', fontWeight: '600'}}>
            <i className="bi bi-mountain" style={{fontSize: '1.2rem'}}></i>
            Landslide Safety Training
          </h4>
        </div>
        
        <div className="card-body" style={{padding: '32px 24px'}}>
          {/* Large Centered Illustration */}
          <div className="text-center mb-5">
            <div style={{
              width: '160px',
              height: '160px',
              margin: '0 auto 24px',
              background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
              borderRadius: '20px',
              border: '3px solid #059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(5, 150, 105, 0.3)'
            }}>
              {/* SVG Landslide Safety Illustration */}
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Mountain/hill */}
                <path d="M0 80 L20 40 L40 60 L60 30 L80 50 L100 70 L100 100 L0 100 Z" fill="#8B4513"/>
                <path d="M0 80 L20 40 L40 60 L60 30 L80 50 L100 70" stroke="#654321" strokeWidth="2" fill="none"/>
                
                {/* Rocks and debris */}
                <circle cx="15" cy="75" r="3" fill="#6B7280"/>
                <circle cx="25" cy="70" r="2" fill="#6B7280"/>
                <circle cx="35" cy="80" r="2.5" fill="#6B7280"/>
                <circle cx="45" cy="75" r="2" fill="#6B7280"/>
                <circle cx="55" cy="70" r="3" fill="#6B7280"/>
                <circle cx="65" cy="75" r="2" fill="#6B7280"/>
                <circle cx="75" cy="80" r="2.5" fill="#6B7280"/>
                <circle cx="85" cy="75" r="2" fill="#6B7280"/>
                
                {/* Safe house */}
                <rect x="70" y="60" width="15" height="20" fill="#8B4513" rx="2"/>
                <polygon points="70,60 77,50 85,60" fill="#DC2626"/>
                <rect x="73" y="68" width="9" height="12" fill="#87CEEB" rx="1"/>
                
                {/* Safety people inside */}
                <circle cx="77" cy="72" r="1.5" fill="#FFDBAC"/>
                <rect x="76" y="74" width="2" height="2" fill="#4169E1"/>
                
                {/* Warning signs */}
                <rect x="10" y="45" width="8" height="8" fill="#FEF3C7" rx="1"/>
                <text x="14" y="51" textAnchor="middle" fontSize="4" fill="#92400E" fontWeight="bold">!</text>
                
                <rect x="30" y="35" width="8" height="8" fill="#FEF3C7" rx="1"/>
                <text x="34" y="41" textAnchor="middle" fontSize="4" fill="#92400E" fontWeight="bold">!</text>
                
                {/* Safety shield */}
                <path d="M50 20 Q60 15 70 20 Q60 25 50 20 Z" fill="#10B981" stroke="#059669" strokeWidth="2"/>
                <text x="60" y="23" textAnchor="middle" fontSize="6" fill="white" fontWeight="bold">SAFE</text>
              </svg>
            </div>
          </div>
          
          {/* Enhanced Title */}
          <h2 className="text-center mb-4" style={{
            fontSize: '2.2rem',
            fontWeight: '700',
            color: '#1f2937',
            lineHeight: '1.2'
          }}>
            Landslide Safety Training
          </h2>
          
          {/* Enhanced Description */}
          <div className="text-center mb-5" style={{maxWidth: '600px', margin: '0 auto'}}>
            <p style={{
              fontSize: '1.2rem',
              lineHeight: '1.7',
              color: '#4b5563',
              fontWeight: '400',
              margin: '0'
            }}>
              Learn proper landslide safety procedures through scenario-based training. 
              Practice emergency response protocols and evacuation techniques.
            </p>
          </div>
          
          {/* Enhanced Safety Tip */}
          <div className="text-center mb-5">
            <div style={{
              background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
              border: '2px solid #059669',
              borderRadius: '16px',
              padding: '20px 24px',
              maxWidth: '500px',
              margin: '0 auto',
              boxShadow: '0 4px 15px rgba(5, 150, 105, 0.2)'
            }}>
              <div className="d-flex align-items-center justify-content-center gap-3">
                <i className="bi bi-lightbulb" style={{fontSize: '1.5rem', color: '#059669'}}></i>
                <div className="text-start">
                  <strong style={{fontSize: '1.1rem', color: '#047857'}}>Safety Tip:</strong>
                  <p className="mb-0 mt-1" style={{fontSize: '1rem', color: '#047857', lineHeight: '1.5'}}>
                    In a real landslide, move away from hillsides and unstable ground immediately, and go to the side of buildings away from the slope.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Action Button */}
          <div className="text-center">
            <button 
              className="btn btn-lg" 
              onClick={startDrill}
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                border: 'none',
                borderRadius: '16px',
                padding: '16px 32px',
                fontSize: '1.3rem',
                fontWeight: '600',
                color: 'white',
                boxShadow: '0 6px 20px rgba(5, 150, 105, 0.4)',
                transition: 'all 0.3s ease',
                minWidth: '200px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(5, 150, 105, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 20px rgba(5, 150, 105, 0.4)';
              }}
            >
              <i className="bi bi-play-fill me-2" style={{fontSize: '1.4rem'}}></i>
              Start Training
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'active') {
    const currentScenario = drillScenarios[currentStep];
    
    return (
      <div className="game-card">
        <div className="game-header landslide-header">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0 d-flex align-items-center gap-2">
              <i className="bi bi-mountain"></i>
              Landslide Emergency Training
            </h4>
            <div>
              <span className="badge bg-dark fs-6">Step {currentStep + 1}/{drillScenarios.length}</span>
              <span className="badge bg-success fs-6 ms-2">Score: {score}</span>
            </div>
          </div>
        </div>
        <div className="card-body">
          {/* Child-Friendly Landslide Safety Scene */}
          <div className="scene-container">
            <div style={{
              width: '100%',
              height: '200px',
              background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
              borderRadius: '16px',
              border: '3px solid #059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(5, 150, 105, 0.3)',
              overflow: 'hidden',
              position: 'relative'
            }}>
              {/* Simple Landslide Illustration */}
              <svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                {/* Hill/Mountain */}
                <path d="M0 100 Q100 60 200 80 Q300 50 400 70 L400 200 L0 200 Z" fill="#8B4513"/>
                <path d="M0 110 Q100 70 200 90 Q300 60 400 80 L400 200 L0 200 Z" fill="#A0522D" opacity="0.7"/>
                
                {/* Landslide Debris */}
                <ellipse cx="120" cy="140" rx="25" ry="15" fill="#654321" opacity="0.8"/>
                <ellipse cx="150" cy="150" rx="20" ry="12" fill="#8B4513" opacity="0.7"/>
                <ellipse cx="180" cy="145" rx="18" ry="10" fill="#A0522D" opacity="0.6"/>
                <ellipse cx="210" cy="155" rx="22" ry="13" fill="#654321" opacity="0.8"/>
                <ellipse cx="240" cy="148" rx="16" ry="9" fill="#8B4513" opacity="0.7"/>
                <ellipse cx="270" cy="152" rx="19" ry="11" fill="#A0522D" opacity="0.6"/>
                
                {/* Rocks */}
                <circle cx="100" cy="160" r="8" fill="#696969"/>
                <circle cx="130" cy="165" r="6" fill="#808080"/>
                <circle cx="160" cy="162" r="7" fill="#696969"/>
                <circle cx="190" cy="168" r="5" fill="#808080"/>
                <circle cx="220" cy="164" r="6" fill="#696969"/>
                <circle cx="250" cy="170" r="7" fill="#808080"/>
                <circle cx="280" cy="166" r="5" fill="#696969"/>
                
                {/* Ground Cracks */}
                <path d="M50 150 L60 200 M100 150 L110 200 M150 150 L160 200 M200 150 L210 200 M250 150 L260 200 M300 150 L310 200 M350 150 L360 200" stroke="#654321" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          <div className="alert alert-success">
            <h5 className="mb-0">{currentScenario.question}</h5>
          </div>

          {!showFeedback ? (
            <div className="row g-3 mt-3">
              {currentScenario.options.map((option, index) => (
                <div key={index} className="col-12">
                  <button 
                    className="option-button w-100 text-start interactive-element"
                    onClick={() => handleAnswer(index)}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className="option-letter">
                        <span className="badge bg-secondary rounded-circle" style={{width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem'}}>
                          {String.fromCharCode(65 + index)}
                        </span>
                      </div>
                      <div className="option-text">
                        {option.text}
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 feedback-container">
              <div className={`alert ${drillScenarios[currentStep].options[selectedOption].correct ? 'alert-success' : 'alert-danger'}`}>
                <div className="d-flex align-items-start gap-2">
                  <i className={`bi ${drillScenarios[currentStep].options[selectedOption].correct ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}></i>
                  <div>
                    <strong>
                      {drillScenarios[currentStep].options[selectedOption].correct ? 'Correct!' : 'Incorrect'}
                    </strong>
                    <p className="mb-0 mt-2">{drillScenarios[currentStep].options[selectedOption].feedback}</p>
                  </div>
                </div>
              </div>
              <div className="text-center loading-container">
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <span className="ms-3 text-muted">Loading next question...</span>
              </div>
            </div>
          )}

          <div className="progress-container mt-4">
            <div 
              className="progress-bar" 
              style={{width: `${((currentStep + 1)/drillScenarios.length)*100}%`}}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'result') {
    const finalScore = score;
    const badge = ScoreManager.getBadge(finalScore, drillScenarios.length);
    
    return (
      <div className="game-card success-animation">
        <div className="game-header landslide-header">
          <h4 className="mb-0 d-flex align-items-center gap-2">
            <i className="bi bi-check-circle-fill"></i>
            Training Complete
          </h4>
        </div>
        <div className="card-body text-center">
          {/* Simple Scene */}
          <div className="scene-container">
            <i className="bi bi-award scene-icon text-success"></i>
          </div>

          <div className="achievement-badge mb-3">
            <i className="bi bi-award me-2"></i>
            {badge.name}
          </div>
          <h3 className="text-success mb-3">Score: {finalScore}/{drillScenarios.length}</h3>
          
          <div className="progress-container mb-4">
            <div 
              className="progress-bar" 
              style={{width: `${(finalScore/drillScenarios.length)*100}%`}}
            >
              {Math.round((finalScore/drillScenarios.length)*100)}%
            </div>
          </div>

          <div className={`alert ${finalScore >= 4 ? 'alert-success' : finalScore >= 3 ? 'alert-warning' : 'alert-danger'} mb-4`}>
            <h5>
              {finalScore >= 4 ? 'Excellent Performance' : 
               finalScore >= 3 ? 'Good Performance' : 
               'Keep Practicing'}
            </h5>
            <p className="mb-0">
              {finalScore >= 4 ? 
                "You have demonstrated strong landslide safety knowledge and would be well-prepared in a real emergency." :
                finalScore >= 3 ?
                "Good effort! Review the feedback and practice more to improve your landslide safety knowledge." :
                "Keep practicing! Landslide safety knowledge is crucial for real emergency situations."
              }
            </p>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <button className="game-button w-100" onClick={resetDrill}>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Retry Training
              </button>
            </div>
            <div className="col-md-6">
              <button className="game-button w-100" onClick={() => onComplete?.()}>
                <i className="bi bi-speedometer2 me-2"></i>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

// Dashboard Component
const Dashboard = ({ onStartSimulation, onStartDrill, onStartFlood, onStartCyclone, onStartLandslide }) => {
  const [scores, setScores] = useState({});
  const [overallStats, setOverallStats] = useState({
    totalActivities: 5,
    completedActivities: 0,
    averageScore: 0,
    expertBadges: 0
  });

  useEffect(() => {
    setScores(ScoreManager.getScores());
    calculateOverallStats(ScoreManager.getScores());
  }, []);

  const refreshScores = () => {
    const newScores = ScoreManager.getScores();
    setScores(newScores);
    calculateOverallStats(newScores);
  };

  const calculateOverallStats = (scores) => {
    const disasterTypes = ['earthquake', 'fireDrill', 'flood', 'cyclone', 'landslide'];
    let completed = 0;
    let totalScore = 0;
    let totalMaxScore = 0;
    let expertBadges = 0;

    disasterTypes.forEach(type => {
      if (scores[type]) {
        completed++;
        totalScore += scores[type].score;
        totalMaxScore += scores[type].maxScore;
        if (scores[type].score >= 4) {
          expertBadges++;
        }
      }
    });

    const averageScore = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;

    setOverallStats({
      totalActivities: disasterTypes.length,
      completedActivities: completed,
      averageScore: averageScore,
      expertBadges: expertBadges
    });
  };

  const clearAllScores = () => {
    localStorage.removeItem('disasterScores');
    setScores({});
    setOverallStats({
      totalActivities: 5,
      completedActivities: 0,
      averageScore: 0,
      expertBadges: 0
    });
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="game-card mb-4">
            <div className="game-header dashboard-header">
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="mb-0 d-flex align-items-center gap-2">
                  <i className="bi bi-shield-check"></i>
                  Safety Training
                </h3>
                <div>
                  <button className="btn btn-outline-light btn-sm me-2" onClick={refreshScores}>
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Refresh
                  </button>
                  <button className="btn btn-outline-light btn-sm" onClick={clearAllScores}>
                    <i className="bi bi-trash me-1"></i>
                    Reset All
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body" style={{padding: '24px'}}>
              {/* Fun Welcome Message */}
              <div className="text-center mb-4 mt-2 px-4">
                <div className="d-inline-block p-5 rounded-4 shadow-sm" style={{
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)',
                  border: '3px solid #0ea5e9',
                  maxWidth: '600px',
                  minWidth: '400px'
                }}>
                  <h4 className="mb-4 text-info fw-bold">Choose Your Adventure!</h4>
                  <p className="mb-0 text-dark fs-5">Pick a training module to start learning about safety</p>
                </div>
              </div>
              
              <div className="row g-4">
                {/* Activities Section */}
                <div className="col-lg-8">
                  <div className="row g-4">
                    <div className="col-lg-6">
                      <div className="game-card training-card border-warning h-100 position-relative overflow-hidden d-flex flex-column">
                        {/* Simple Background */}
                        <div className="simple-bg position-absolute w-100 h-100" style={{
                          background: 'linear-gradient(45deg, #f59e0b 0%, #d97706 50%, #fbbf24 100%)',
                          opacity: 0.1
                        }}></div>
                        
                        <div className="card-body position-relative d-flex flex-column px-6 py-4" style={{flex: '1'}}>
                          {/* Title and Description */}
                          <div className="mb-4" style={{minHeight: '80px'}}>
                            <h5 className="card-title text-warning mb-3 fw-bold" style={{fontSize: '1.5rem', lineHeight: '1.3', fontWeight: '700'}}>
                              Earthquake Safety Training
                            </h5>
                            <p className="card-text mb-0" style={{fontSize: '0.9rem', lineHeight: '1.4', color: '#374151', fontWeight: '400'}}>Learn earthquake safety procedures through fun interactive scenarios!</p>
                          </div>
                          
                          {/* High-Quality Earthquake Illustration */}
                          <div className="simulation-preview mb-4" style={{
                            width: '100%',
                            height: '120px',
                            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                            borderRadius: '16px',
                            border: '3px solid #f59e0b',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)',
                            flexShrink: 0
                          }}>
                            {/* SVG Earthquake Illustration - Full Width */}
                            <svg width="100%" height="100%" viewBox="0 0 300 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                              {/* Ground with cracks */}
                              <rect x="0" y="80" width="300" height="40" fill="#8B4513"/>
                              <path d="M50 80 L60 120 M100 80 L110 120 M150 80 L160 120 M200 80 L210 120 M250 80 L260 120" stroke="#654321" strokeWidth="3" strokeLinecap="round"/>
                              
                              {/* Buildings with shaking effect */}
                              <rect x="20" y="50" width="40" height="30" fill="#D2691E" rx="3"/>
                              <rect x="25" y="55" width="30" height="8" fill="#87CEEB" rx="1"/>
                              <rect x="25" y="68" width="30" height="8" fill="#87CEEB" rx="1"/>
                              
                              <rect x="80" y="40" width="35" height="40" fill="#D2691E" rx="3"/>
                              <rect x="85" y="45" width="25" height="6" fill="#87CEEB" rx="1"/>
                              <rect x="85" y="58" width="25" height="6" fill="#87CEEB" rx="1"/>
                              <rect x="85" y="71" width="25" height="6" fill="#87CEEB" rx="1"/>
                              
                              <rect x="140" y="45" width="30" height="35" fill="#D2691E" rx="3"/>
                              <rect x="145" y="50" width="20" height="6" fill="#87CEEB" rx="1"/>
                              <rect x="145" y="63" width="20" height="6" fill="#87CEEB" rx="1"/>
                              <rect x="145" y="76" width="20" height="6" fill="#87CEEB" rx="1"/>
                              
                              <rect x="200" y="55" width="25" height="25" fill="#D2691E" rx="2"/>
                              <rect x="205" y="60" width="15" height="5" fill="#87CEEB" rx="1"/>
                              <rect x="205" y="70" width="15" height="5" fill="#87CEEB" rx="1"/>
                              
                              <rect x="250" y="50" width="30" height="30" fill="#D2691E" rx="3"/>
                              <rect x="255" y="55" width="20" height="5" fill="#87CEEB" rx="1"/>
                              <rect x="255" y="65" width="20" height="5" fill="#87CEEB" rx="1"/>
                              <rect x="255" y="75" width="20" height="5" fill="#87CEEB" rx="1"/>
                              
                              {/* Shaking lines */}
                              <path d="M10 60 Q50 55 100 60 Q150 55 200 60 Q250 55 290 60" stroke="#FF6B6B" strokeWidth="3" fill="none" opacity="0.8"/>
                              
                              {/* Safety people under tables */}
                              <rect x="15" y="70" width="12" height="8" fill="#8B4513" rx="1"/>
                              <circle cx="21" cy="65" r="3" fill="#FFDBAC"/>
                              <rect x="20" y="68" width="2" height="5" fill="#4169E1"/>
                              
                              <rect x="70" y="75" width="10" height="6" fill="#8B4513" rx="1"/>
                              <circle cx="75" cy="70" r="2.5" fill="#FFDBAC"/>
                              <rect x="74" y="73" width="2" height="4" fill="#4169E1"/>
                              
                              <rect x="130" y="72" width="11" height="7" fill="#8B4513" rx="1"/>
                              <circle cx="135" cy="67" r="2.8" fill="#FFDBAC"/>
                              <rect x="134" y="70" width="2" height="4" fill="#4169E1"/>
                              
                              <rect x="190" y="73" width="9" height="6" fill="#8B4513" rx="1"/>
                              <circle cx="194" cy="68" r="2.2" fill="#FFDBAC"/>
                              <rect x="193" y="71" width="2" height="4" fill="#4169E1"/>
                              
                              <rect x="240" y="70" width="13" height="8" fill="#8B4513" rx="1"/>
                              <circle cx="246" cy="65" r="3" fill="#FFDBAC"/>
                              <rect x="245" y="68" width="2" height="5" fill="#4169E1"/>
                            </svg>
                          </div>
                          
                          {/* Fun Challenge Badge */}
                          <div className="text-center mb-4">
                            <span className="badge bg-warning text-white px-4 py-2 rounded-pill fs-6 fw-semibold">
                              <i className="bi bi-shield-exclamation me-2"></i>
                              Quick Challenge
                            </span>
                          </div>
                          
                          {/* Features List */}
                          <div className="row g-3 mb-4" style={{flex: '1'}}>
                            <div className="col-6">
                              <div className="feature-item">
                                <small style={{fontSize: '0.95rem', fontWeight: '600'}}>Drop & Cover</small>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="feature-item">
                                <small style={{fontSize: '0.95rem', fontWeight: '600'}}>Safe Evacuation</small>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="feature-item">
                                <small style={{fontSize: '0.95rem', fontWeight: '600'}}>Emergency Plan</small>
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Button - Always at bottom */}
                          <div className="mt-auto">
                            <InteractiveButton 
                              className="start-training-btn w-100 mb-2 position-relative" 
                              onClick={onStartSimulation}
                              type="default"
                              style={{
                                padding: '16px 24px',
                                fontSize: '1.2rem',
                                fontWeight: '600',
                                borderRadius: '16px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                                color: 'white',
                                boxShadow: '0 6px 20px rgba(245, 158, 11, 0.4)',
                                transition: 'all 0.3s ease'
                              }}
                            >
                              <i className="bi bi-play-fill me-2" style={{fontSize: '1.3rem'}}></i>
                              Start Earthquake Training
                              <div className="button-glow"></div>
                            </InteractiveButton>
                            
                            {scores.earthquake && (
                              <div className="text-center">
                                <small className="text-success">
                                  <strong>Best Score:</strong> {scores.earthquake.score}/{scores.earthquake.maxScore} 
                                  ({Math.round((scores.earthquake.score/scores.earthquake.maxScore)*100)}%)
                                </small>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-6">
                      <div className="game-card training-card border-danger h-100 position-relative overflow-hidden d-flex flex-column">
                        {/* Simple Background */}
                        <div className="simple-bg position-absolute w-100 h-100" style={{
                          background: 'linear-gradient(45deg, #dc2626 0%, #ea580c 50%, #f59e0b 100%)',
                          opacity: 0.1
                        }}></div>
                        
                        <div className="card-body position-relative d-flex flex-column px-6 py-4" style={{flex: '1'}}>
                          {/* Title and Description */}
                          <div className="mb-4" style={{minHeight: '80px'}}>
                            <h5 className="card-title text-danger mb-3 fw-bold" style={{fontSize: '1.5rem', lineHeight: '1.3', fontWeight: '700'}}>
                              Fire Safety Training
                            </h5>
                            <p className="card-text mb-0" style={{fontSize: '0.9rem', lineHeight: '1.4', color: '#374151', fontWeight: '400'}}>Learn fire safety procedures and emergency response through exciting interactive training!</p>
                          </div>
                          
                          {/* High-Quality Fire Illustration */}
                          <div className="simulation-preview mb-4" style={{
                            width: '100%',
                            height: '120px',
                            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                            borderRadius: '16px',
                            border: '3px solid #dc2626',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 8px 25px rgba(220, 38, 38, 0.3)',
                            flexShrink: 0
                          }}>
                            {/* SVG Fire Illustration - Full Width */}
                            <svg width="100%" height="100%" viewBox="0 0 300 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                              {/* Fire extinguishers */}
                              <rect x="20" y="60" width="12" height="40" fill="#DC2626" rx="3"/>
                              <rect x="17" y="50" width="18" height="12" fill="#DC2626" rx="3"/>
                              <rect x="22" y="40" width="8" height="12" fill="#DC2626" rx="2"/>
                              <circle cx="26" cy="46" r="2" fill="#FEF2F2"/>
                              
                              <rect x="80" y="65" width="10" height="35" fill="#DC2626" rx="2"/>
                              <rect x="78" y="55" width="14" height="10" fill="#DC2626" rx="2"/>
                              <rect x="81" y="45" width="8" height="10" fill="#DC2626" rx="1"/>
                              <circle cx="85" cy="50" r="1.5" fill="#FEF2F2"/>
                              
                              <rect x="140" y="62" width="11" height="38" fill="#DC2626" rx="2"/>
                              <rect x="138" y="52" width="15" height="11" fill="#DC2626" rx="2"/>
                              <rect x="141" y="42" width="9" height="11" fill="#DC2626" rx="1"/>
                              <circle cx="145" cy="47" r="1.8" fill="#FEF2F2"/>
                              
                              {/* Fire flames - Multiple locations */}
                              <path d="M50 80 Q60 60 70 80 Q80 70 90 80 Q100 60 110 80 L110 100 L50 100 Z" fill="#FF6B35"/>
                              <path d="M52 80 Q62 65 72 80 Q82 72 92 80 Q102 65 112 80 L112 98 L52 98 Z" fill="#FF8C42"/>
                              <path d="M54 80 Q64 70 74 80 Q84 74 94 80 Q104 70 114 80 L114 96 L54 96 Z" fill="#FFA726"/>
                              
                              <path d="M120 85 Q130 65 140 85 Q150 75 160 85 Q170 65 180 85 L180 105 L120 105 Z" fill="#FF6B35"/>
                              <path d="M122 85 Q132 70 142 85 Q152 77 162 85 Q172 70 182 85 L182 103 L122 103 Z" fill="#FF8C42"/>
                              <path d="M124 85 Q134 75 144 85 Q154 79 164 85 Q174 75 184 85 L184 101 L124 101 Z" fill="#FFA726"/>
                              
                              <path d="M190 82 Q200 62 210 82 Q220 72 230 82 Q240 62 250 82 L250 102 L190 102 Z" fill="#FF6B35"/>
                              <path d="M192 82 Q202 67 212 82 Q222 74 232 82 Q242 67 252 82 L252 100 L192 100 Z" fill="#FF8C42"/>
                              <path d="M194 82 Q204 72 214 82 Q224 76 234 82 Q244 72 254 82 L254 98 L194 98 Z" fill="#FFA726"/>
                              
                              {/* Firefighter helmets */}
                              <ellipse cx="35" cy="35" rx="12" ry="8" fill="#DC2626"/>
                              <rect x="28" y="28" width="14" height="4" fill="#FEF2F2" rx="2"/>
                              
                              <ellipse cx="95" cy="40" rx="10" ry="7" fill="#DC2626"/>
                              <rect x="88" y="33" width="14" height="4" fill="#FEF2F2" rx="2"/>
                              
                              <ellipse cx="155" cy="37" rx="11" ry="7" fill="#DC2626"/>
                              <rect x="147" y="30" width="16" height="4" fill="#FEF2F2" rx="2"/>
                              
                              {/* Safety shields */}
                              <path d="M10 20 Q25 10 40 20 Q25 30 10 20 Z" fill="#10B981" stroke="#059669" strokeWidth="2"/>
                              <text x="25" y="25" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">SAFE</text>
                              
                              <path d="M70 25 Q85 15 100 25 Q85 35 70 25 Z" fill="#10B981" stroke="#059669" strokeWidth="2"/>
                              <text x="85" y="30" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">SAFE</text>
                              
                              <path d="M130 22 Q145 12 160 22 Q145 32 130 22 Z" fill="#10B981" stroke="#059669" strokeWidth="2"/>
                              <text x="145" y="27" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">SAFE</text>
                            </svg>
                          </div>
                          
                          {/* Fun Challenge Badge */}
                          <div className="text-center mb-4">
                            <span className="badge bg-danger text-white px-4 py-2 rounded-pill fs-6 fw-semibold">
                              <i className="bi bi-fire me-2"></i>
                              Hot Challenge
                            </span>
                          </div>
                          
                          {/* Features List */}
                          <div className="row g-3 mb-4" style={{flex: '1'}}>
                            <div className="col-6">
                              <div className="feature-item">
                                <small style={{fontSize: '0.95rem', fontWeight: '600'}}>Quick Decisions</small>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="feature-item">
                                <small style={{fontSize: '0.95rem', fontWeight: '600'}}>Emergency Routes</small>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="feature-item">
                                <small style={{fontSize: '0.95rem', fontWeight: '600'}}>Evacuation Tech</small>
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Button - Always at bottom */}
                          <div className="mt-auto">
                            <InteractiveButton 
                              className="start-training-btn w-100 mb-2 position-relative" 
                              onClick={onStartDrill}
                              type="default"
                              style={{
                                padding: '16px 24px',
                                fontSize: '1.2rem',
                                fontWeight: '600',
                                borderRadius: '16px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                                color: 'white',
                                boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4)',
                                transition: 'all 0.3s ease'
                              }}
                            >
                              <i className="bi bi-play-fill me-2" style={{fontSize: '1.3rem'}}></i>
                              Start Fire Training
                              <div className="button-glow"></div>
                            </InteractiveButton>
                            
                            {scores.fireDrill && (
                              <div className="text-center">
                                <small className="text-success">
                                  <strong>Best Score:</strong> {scores.fireDrill.score}/{scores.fireDrill.maxScore} 
                                  ({Math.round((scores.fireDrill.score/scores.fireDrill.maxScore)*100)}%)
                                </small>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-6">
                      <div className="game-card training-card border-info h-100 position-relative overflow-hidden d-flex flex-column">
                        {/* Simple Background */}
                        <div className="simple-bg position-absolute w-100 h-100" style={{
                          background: 'linear-gradient(45deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)',
                          opacity: 0.1
                        }}></div>
                        
                        <div className="card-body position-relative d-flex flex-column px-6 py-4" style={{flex: '1'}}>
                          {/* Title and Description */}
                          <div className="mb-4" style={{minHeight: '80px'}}>
                            <h5 className="card-title text-info mb-3 fw-bold" style={{fontSize: '1.5rem', lineHeight: '1.3', fontWeight: '700'}}>
                              Flood Safety Training
                            </h5>
                            <p className="card-text mb-0" style={{fontSize: '0.9rem', lineHeight: '1.4', color: '#374151', fontWeight: '400'}}>Learn flood safety procedures and emergency response through engaging interactive scenarios!</p>
                          </div>
                          
                          {/* High-Quality Flood Illustration */}
                          <div className="simulation-preview mb-4" style={{
                            width: '100%',
                            height: '120px',
                            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                            borderRadius: '16px',
                            border: '3px solid #0ea5e9',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 8px 25px rgba(14, 165, 233, 0.3)',
                            flexShrink: 0
                          }}>
                            {/* SVG Flood Illustration - Full Width */}
                            <svg width="100%" height="100%" viewBox="0 0 300 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                              {/* Houses with water */}
                              <rect x="20" y="50" width="40" height="25" fill="#8B4513" rx="3"/>
                              <polygon points="20,50 40,35 60,50" fill="#DC2626"/>
                              <rect x="30" y="60" width="20" height="15" fill="#87CEEB" rx="1"/>
                              
                              <rect x="80" y="45" width="35" height="30" fill="#8B4513" rx="3"/>
                              <polygon points="80,45 97,30 115,45" fill="#DC2626"/>
                              <rect x="90" y="55" width="15" height="15" fill="#87CEEB" rx="1"/>
                              
                              <rect x="140" y="40" width="30" height="35" fill="#8B4513" rx="3"/>
                              <polygon points="140,40 155,25 170,40" fill="#DC2626"/>
                              <rect x="148" y="50" width="14" height="20" fill="#87CEEB" rx="1"/>
                              
                              <rect x="200" y="55" width="25" height="20" fill="#8B4513" rx="2"/>
                              <polygon points="200,55 212,45 225,55" fill="#DC2626"/>
                              <rect x="207" y="62" width="11" height="10" fill="#87CEEB" rx="1"/>
                              
                              <rect x="250" y="50" width="30" height="25" fill="#8B4513" rx="3"/>
                              <polygon points="250,50 265,35 280,50" fill="#DC2626"/>
                              <rect x="258" y="60" width="14" height="10" fill="#87CEEB" rx="1"/>
                              
                              {/* Water waves */}
                              <path d="M0 70 Q50 60 100 70 Q150 60 200 70 Q250 60 300 70 L300 120 L0 120 Z" fill="#0EA5E9" opacity="0.7"/>
                              <path d="M0 75 Q50 65 100 75 Q150 65 200 75 Q250 65 300 75 L300 120 L0 120 Z" fill="#0284C7" opacity="0.5"/>
                              <path d="M0 80 Q50 70 100 80 Q150 70 200 80 Q250 70 300 80 L300 120 L0 120 Z" fill="#0369A1" opacity="0.3"/>
                              
                              {/* Life jacket people */}
                              <circle cx="10" cy="35" r="4" fill="#FFDBAC"/>
                              <rect x="7" y="39" width="6" height="8" fill="#FFD700"/>
                              <rect x="6" y="40" width="8" height="6" fill="#FFD700" rx="1"/>
                              
                              <circle cx="70" cy="30" r="3.5" fill="#FFDBAC"/>
                              <rect x="68" y="33" width="4" height="7" fill="#FFD700"/>
                              <rect x="67" y="34" width="6" height="5" fill="#FFD700" rx="1"/>
                              
                              <circle cx="130" cy="25" r="4" fill="#FFDBAC"/>
                              <rect x="127" y="29" width="6" height="8" fill="#FFD700"/>
                              <rect x="126" y="30" width="8" height="6" fill="#FFD700" rx="1"/>
                              
                              <circle cx="190" cy="30" r="3.5" fill="#FFDBAC"/>
                              <rect x="188" y="33" width="4" height="7" fill="#FFD700"/>
                              <rect x="187" y="34" width="6" height="5" fill="#FFD700" rx="1"/>
                              
                              <circle cx="240" cy="35" r="4" fill="#FFDBAC"/>
                              <rect x="237" y="39" width="6" height="8" fill="#FFD700"/>
                              <rect x="236" y="40" width="8" height="6" fill="#FFD700" rx="1"/>
                              
                              {/* Safety waves */}
                              <path d="M10 20 Q20 15 30 20 Q40 15 50 20" stroke="#10B981" strokeWidth="3" fill="none"/>
                              <path d="M10 25 Q20 20 30 25 Q40 20 50 25" stroke="#10B981" strokeWidth="3" fill="none"/>
                              
                              <path d="M80 15 Q90 10 100 15 Q110 10 120 15" stroke="#10B981" strokeWidth="3" fill="none"/>
                              <path d="M80 20 Q90 15 100 20 Q110 15 120 20" stroke="#10B981" strokeWidth="3" fill="none"/>
                              
                              <path d="M150 18 Q160 13 170 18 Q180 13 190 18" stroke="#10B981" strokeWidth="3" fill="none"/>
                              <path d="M150 23 Q160 18 170 23 Q180 18 190 23" stroke="#10B981" strokeWidth="3" fill="none"/>
                              
                              <path d="M220 16 Q230 11 240 16 Q250 11 260 16" stroke="#10B981" strokeWidth="3" fill="none"/>
                              <path d="M220 21 Q230 16 240 21 Q250 16 260 21" stroke="#10B981" strokeWidth="3" fill="none"/>
                            </svg>
                          </div>
                          
                          {/* Fun Challenge Badge */}
                          <div className="text-center mb-4">
                            <span className="badge bg-info text-white px-4 py-2 rounded-pill fs-6 fw-semibold">
                              <i className="bi bi-droplet me-2"></i>
                              Water Challenge
                            </span>
                          </div>
                          
                          {/* Features List */}
                          <div className="row g-3 mb-4" style={{flex: '1'}}>
                            <div className="col-6">
                              <div className="feature-item">
                                <small style={{fontSize: '0.95rem', fontWeight: '600'}}>Water Safety</small>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="feature-item">
                                <small style={{fontSize: '0.95rem', fontWeight: '600'}}>Evacuation Routes</small>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="feature-item">
                                <small style={{fontSize: '0.95rem', fontWeight: '600'}}>Rescue Techniques</small>
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Button - Always at bottom */}
                          <div className="mt-auto">
                            <InteractiveButton 
                              className="start-training-btn w-100 mb-2 position-relative" 
                              onClick={onStartFlood}
                              type="default"
                              style={{
                                padding: '16px 24px',
                                fontSize: '1.2rem',
                                fontWeight: '600',
                                borderRadius: '16px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
                                color: 'white',
                                boxShadow: '0 6px 20px rgba(14, 165, 233, 0.4)',
                                transition: 'all 0.3s ease'
                              }}
                            >
                              <i className="bi bi-play-fill me-2" style={{fontSize: '1.3rem'}}></i>
                              Start Flood Training
                              <div className="button-glow"></div>
                            </InteractiveButton>
                            
                            {scores.flood && (
                              <div className="text-center">
                                <small className="text-success">
                                  <strong>Best Score:</strong> {scores.flood.score}/{scores.flood.maxScore} 
                                  ({Math.round((scores.flood.score/scores.flood.maxScore)*100)}%)
                                </small>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-6">
                      <div className="game-card training-card border-purple h-100 position-relative overflow-hidden d-flex flex-column">
                        {/* Simple Background */}
                        <div className="simple-bg position-absolute w-100 h-100" style={{
                          background: 'linear-gradient(45deg, #8b5cf6 0%, #7c3aed 50%, #a855f7 100%)',
                          opacity: 0.1
                        }}></div>
                        
                        <div className="card-body position-relative d-flex flex-column px-6 py-4" style={{flex: '1'}}>
                          {/* Title and Description */}
                          <div className="mb-4" style={{minHeight: '80px'}}>
                            <h5 className="card-title text-purple mb-3 fw-bold" style={{fontSize: '1.5rem', lineHeight: '1.3', fontWeight: '700', color: '#8b5cf6'}}>
                              Cyclone Safety Training
                            </h5>
                            <p className="card-text mb-0" style={{fontSize: '0.9rem', lineHeight: '1.4', color: '#374151', fontWeight: '400'}}>Learn cyclone safety procedures and emergency response through fun interactive training!</p>
                          </div>
                          
                          {/* High-Quality Cyclone Illustration */}
                          <div className="simulation-preview mb-4" style={{
                            width: '100%',
                            height: '120px',
                            background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                            borderRadius: '16px',
                            border: '3px solid #8b5cf6',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)',
                            flexShrink: 0
                          }}>
                            {/* SVG Cyclone Illustration - Full Width */}
                            <svg width="100%" height="100%" viewBox="0 0 300 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                              {/* Cyclone spirals */}
                              <path d="M150 20 Q200 40 150 60 Q100 80 150 100 Q200 120 150 120" stroke="#8B5CF6" strokeWidth="4" fill="none" opacity="0.8"/>
                              <path d="M150 25 Q180 40 150 55 Q120 70 150 85 Q180 100 150 115" stroke="#A855F7" strokeWidth="3" fill="none" opacity="0.6"/>
                              <path d="M150 30 Q170 40 150 50 Q130 60 150 70 Q170 80 150 90" stroke="#C084FC" strokeWidth="2" fill="none" opacity="0.4"/>
                              
                              {/* Storm clouds */}
                              <ellipse cx="80" cy="30" rx="20" ry="10" fill="#6B7280" opacity="0.8"/>
                              <ellipse cx="70" cy="35" rx="15" ry="7" fill="#6B7280" opacity="0.6"/>
                              <ellipse cx="90" cy="35" rx="12" ry="5" fill="#6B7280" opacity="0.6"/>
                              
                              <ellipse cx="220" cy="25" rx="18" ry="9" fill="#6B7280" opacity="0.8"/>
                              <ellipse cx="210" cy="28" rx="12" ry="6" fill="#6B7280" opacity="0.6"/>
                              <ellipse cx="230" cy="28" rx="10" ry="4" fill="#6B7280" opacity="0.6"/>
                              
                              <ellipse cx="50" cy="35" rx="15" ry="8" fill="#6B7280" opacity="0.8"/>
                              <ellipse cx="42" cy="38" rx="10" ry="5" fill="#6B7280" opacity="0.6"/>
                              <ellipse cx="58" cy="38" rx="8" ry="4" fill="#6B7280" opacity="0.6"/>
                              
                              <ellipse cx="250" cy="30" rx="16" ry="8" fill="#6B7280" opacity="0.8"/>
                              <ellipse cx="242" cy="33" rx="11" ry="5" fill="#6B7280" opacity="0.6"/>
                              <ellipse cx="258" cy="33" rx="9" ry="4" fill="#6B7280" opacity="0.6"/>
                              
                              {/* Safe houses */}
                              <rect x="30" y="80" width="25" height="20" fill="#8B4513" rx="3"/>
                              <polygon points="30,80 42,65 55,80" fill="#DC2626"/>
                              <rect x="38" y="88" width="9" height="12" fill="#87CEEB" rx="1"/>
                              
                              <rect x="120" y="85" width="22" height="15" fill="#8B4513" rx="2"/>
                              <polygon points="120,85 131,75 142,85" fill="#DC2626"/>
                              <rect x="128" y="90" width="6" height="10" fill="#87CEEB" rx="1"/>
                              
                              <rect x="200" y="82" width="28" height="18" fill="#8B4513" rx="3"/>
                              <polygon points="200,82 214,70 228,82" fill="#DC2626"/>
                              <rect x="210" y="88" width="8" height="12" fill="#87CEEB" rx="1"/>
                              
                              <rect x="260" y="85" width="20" height="15" fill="#8B4513" rx="2"/>
                              <polygon points="260,85 270,75 280,85" fill="#DC2626"/>
                              <rect x="267" y="90" width="6" height="10" fill="#87CEEB" rx="1"/>
                              
                              {/* Wind lines */}
                              <path d="M10 25 L20 25 M10 30 L25 30 M10 35 L20 35" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
                              <path d="M100 20 L110 20 M100 25 L120 25 M100 30 L110 30" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
                              <path d="M190 22 L200 22 M190 27 L210 27 M190 32 L200 32" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
                              <path d="M280 25 L290 25 M280 30 L295 30 M280 35 L290 35" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
                              
                              {/* Safety shields */}
                              <path d="M160 15 Q170 10 180 15 Q170 20 160 15 Z" fill="#10B981" stroke="#059669" strokeWidth="2"/>
                              <text x="170" y="19" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">SAFE</text>
                              
                              <path d="M40 12 Q50 7 60 12 Q50 17 40 12 Z" fill="#10B981" stroke="#059669" strokeWidth="2"/>
                              <text x="50" y="16" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">SAFE</text>
                              
                              <path d="M240 10 Q250 5 260 10 Q250 15 240 10 Z" fill="#10B981" stroke="#059669" strokeWidth="2"/>
                              <text x="250" y="14" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">SAFE</text>
                            </svg>
                          </div>
                          
                          {/* Fun Challenge Badge */}
                          <div className="text-center mb-4">
                            <span className="badge bg-purple text-white px-4 py-2 rounded-pill fs-6 fw-semibold" style={{backgroundColor: '#8b5cf6'}}>
                              <i className="bi bi-tornado me-2"></i>
                              Wind Challenge
                            </span>
                          </div>
                          
                          {/* Features List */}
                          <div className="row g-3 mb-4" style={{flex: '1'}}>
                            <div className="col-6">
                              <div className="feature-item">
                                <small style={{fontSize: '0.95rem', fontWeight: '600'}}>Storm Shelter</small>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="feature-item">
                                <small style={{fontSize: '0.95rem', fontWeight: '600'}}>Secure Home</small>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="feature-item">
                                <small style={{fontSize: '0.95rem', fontWeight: '600'}}>Wind Safety</small>
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Button - Always at bottom */}
                          <div className="mt-auto">
                            <InteractiveButton 
                              className="start-training-btn w-100 mb-2 position-relative" 
                              onClick={onStartCyclone}
                              type="default"
                              style={{
                                padding: '16px 24px',
                                fontSize: '1.2rem',
                                fontWeight: '600',
                                borderRadius: '16px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                                color: 'white',
                                boxShadow: '0 6px 20px rgba(139, 92, 246, 0.4)',
                                transition: 'all 0.3s ease'
                              }}
                            >
                              <i className="bi bi-play-fill me-2" style={{fontSize: '1.3rem'}}></i>
                              Start Cyclone Training
                              <div className="button-glow"></div>
                            </InteractiveButton>
                            
                            {scores.cyclone && (
                              <div className="text-center">
                                <small className="text-success">
                                  <strong>Best Score:</strong> {scores.cyclone.score}/{scores.cyclone.maxScore} 
                                  ({Math.round((scores.cyclone.score/scores.cyclone.maxScore)*100)}%)
                                </small>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-6">
                      <div className="game-card training-card border-success h-100 position-relative overflow-hidden d-flex flex-column">
                        {/* Simple Background */}
                        <div className="simple-bg position-absolute w-100 h-100" style={{
                          background: 'linear-gradient(45deg, #059669 0%, #047857 50%, #10b981 100%)',
                          opacity: 0.1
                        }}></div>
                        
                        <div className="card-body position-relative d-flex flex-column px-6 py-4" style={{flex: '1'}}>
                          {/* Title and Description */}
                          <div className="mb-4" style={{minHeight: '80px'}}>
                            <h5 className="card-title text-success mb-3 fw-bold" style={{fontSize: '1.5rem', lineHeight: '1.3', fontWeight: '700'}}>
                              Landslide Safety Training
                            </h5>
                            <p className="card-text mb-0" style={{fontSize: '0.9rem', lineHeight: '1.4', color: '#374151', fontWeight: '400'}}>Learn landslide safety procedures and emergency response through exciting interactive scenarios!</p>
                          </div>
                          
                          {/* High-Quality Landslide Illustration */}
                          <div className="simulation-preview mb-4" style={{
                            width: '100%',
                            height: '120px',
                            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                            borderRadius: '16px',
                            border: '3px solid #059669',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 8px 25px rgba(5, 150, 105, 0.3)',
                            flexShrink: 0
                          }}>
                            {/* SVG Landslide Illustration - Full Width */}
                            <svg width="100%" height="100%" viewBox="0 0 300 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                              {/* Mountains */}
                              <polygon points="30,90 60,30 90,90" fill="#8B4513"/>
                              <polygon points="60,90 75,60 90,90" fill="#A0522D"/>
                              
                              <polygon points="120,95 160,35 200,95" fill="#8B4513"/>
                              <polygon points="160,95 170,70 180,95" fill="#A0522D"/>
                              
                              <polygon points="210,92 240,40 270,92" fill="#8B4513"/>
                              <polygon points="240,92 250,65 260,92" fill="#A0522D"/>
                              
                              {/* Landslide debris */}
                              <path d="M50 90 Q80 80 110 90 Q140 75 170 90 Q200 80 230 90 L230 120 L50 120 Z" fill="#D2691E" opacity="0.8"/>
                              <path d="M60 95 Q90 85 120 95 Q150 80 180 95 Q210 85 240 95 L240 120 L60 120 Z" fill="#CD853F" opacity="0.6"/>
                              <path d="M70 100 Q100 90 130 100 Q160 85 190 100 Q220 90 250 100 L250 120 L70 120 Z" fill="#DEB887" opacity="0.4"/>
                              
                              {/* Rocks scattered */}
                              <ellipse cx="80" cy="95" rx="4" ry="3" fill="#696969"/>
                              <ellipse cx="130" cy="98" rx="3" ry="2" fill="#696969"/>
                              <ellipse cx="170" cy="96" rx="4" ry="3" fill="#696969"/>
                              <ellipse cx="210" cy="97" rx="3" ry="2" fill="#696969"/>
                              <ellipse cx="250" cy="95" rx="4" ry="3" fill="#696969"/>
                              
                              {/* Warning signs */}
                              <rect x="40" cy="70" width="16" height="20" fill="#FFD700" rx="2"/>
                              <polygon points="48,60 40,70 56,70" fill="#FFD700"/>
                              <text x="48" y="84" textAnchor="middle" fontSize="10" fill="#DC2626" fontWeight="bold">!</text>
                              
                              <rect x="140" cy="80" width="12" height="16" fill="#FFD700" rx="2"/>
                              <polygon points="146,72 140,80 152,80" fill="#FFD700"/>
                              <text x="146" y="92" textAnchor="middle" fontSize="8" fill="#DC2626" fontWeight="bold">!</text>
                              
                              <rect x="230" cy="75" width="14" height="18" fill="#FFD700" rx="2"/>
                              <polygon points="237,67 230,75 244,75" fill="#FFD700"/>
                              <text x="237" y="88" textAnchor="middle" fontSize="9" fill="#DC2626" fontWeight="bold">!</text>
                              
                              {/* Safety houses */}
                              <rect x="15" cy="80" width="20" height="16" fill="#8B4513" rx="2"/>
                              <polygon points="15,80 25,70 35,80" fill="#DC2626"/>
                              <rect x="22" y="86" width="8" height="10" fill="#87CEEB" rx="1"/>
                              
                              <rect x="150" cy="82" width="18" height="14" fill="#8B4513" rx="2"/>
                              <polygon points="150,82 159,74 168,82" fill="#DC2626"/>
                              <rect x="156" y="87" width="6" height="8" fill="#87CEEB" rx="1"/>
                              
                              <rect x="260" cy="85" width="16" height="12" fill="#8B4513" rx="1"/>
                              <polygon points="260,85 268,78 276,85" fill="#DC2626"/>
                              <rect x="265" y="89" width="6" height="6" fill="#87CEEB" rx="1"/>
                              
                              {/* Safety shields */}
                              <path d="M90 50 Q100 45 110 50 Q100 55 90 50 Z" fill="#10B981" stroke="#059669" strokeWidth="2"/>
                              <text x="100" y="54" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">SAFE</text>
                              
                              <path d="M190 48 Q200 43 210 48 Q200 53 190 48 Z" fill="#10B981" stroke="#059669" strokeWidth="2"/>
                              <text x="200" y="52" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">SAFE</text>
                              
                              <path d="M50 45 Q60 40 70 45 Q60 50 50 45 Z" fill="#10B981" stroke="#059669" strokeWidth="2"/>
                              <text x="60" y="49" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">SAFE</text>
                              
                              <path d="M240 42 Q250 37 260 42 Q250 47 240 42 Z" fill="#10B981" stroke="#059669" strokeWidth="2"/>
                              <text x="250" y="46" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">SAFE</text>
                            </svg>
                          </div>
                          
                          {/* Fun Challenge Badge */}
                          <div className="text-center mb-4">
                            <span className="badge bg-success text-white px-4 py-2 rounded-pill fs-6 fw-semibold">
                              <i className="bi bi-mountain me-2"></i>
                              Rock Challenge
                            </span>
                          </div>
                          
                          {/* Features List */}
                          <div className="row g-3 mb-4" style={{flex: '1'}}>
                            <div className="col-6">
                              <div className="feature-item">
                                <small style={{fontSize: '0.95rem', fontWeight: '600'}}>Slope Stability</small>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="feature-item">
                                <small style={{fontSize: '0.95rem', fontWeight: '600'}}>Warning Signs</small>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="feature-item">
                                <small style={{fontSize: '0.95rem', fontWeight: '600'}}>Safe Routes</small>
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Button - Always at bottom */}
                          <div className="mt-auto">
                            <InteractiveButton 
                              className="start-training-btn w-100 mb-2 position-relative" 
                              onClick={onStartLandslide}
                              type="default"
                              style={{
                                padding: '16px 24px',
                                fontSize: '1.2rem',
                                fontWeight: '600',
                                borderRadius: '16px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                color: 'white',
                                boxShadow: '0 6px 20px rgba(5, 150, 105, 0.4)',
                                transition: 'all 0.3s ease'
                              }}
                            >
                              <i className="bi bi-play-fill me-2" style={{fontSize: '1.3rem'}}></i>
                              Start Landslide Training
                              <div className="button-glow"></div>
                            </InteractiveButton>
                            
                            {scores.landslide && (
                              <div className="text-center">
                                <small className="text-success">
                                  <strong>Best Score:</strong> {scores.landslide.score}/{scores.landslide.maxScore} 
                                  ({Math.round((scores.landslide.score/scores.landslide.maxScore)*100)}%)
                                </small>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Achievements Section */}
                <div className="col-lg-4">
                  <div className="card h-100 shadow-sm" style={{
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                    border: '2px solid #0ea5e9'
                  }}>
                    <div className="card-body">
                      <div className="text-center mb-3">
                        <div className="d-inline-block p-2 rounded-circle" style={{
                          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                          border: '2px solid #d97706'
                        }}>
                          <i className="bi bi-trophy text-white" style={{fontSize: '1.5rem'}}></i>
                        </div>
                        <h5 className="mt-2 mb-0 text-info">Your Progress</h5>
                      </div>
                      
                      {Object.keys(scores).length === 0 ? (
                        <div className="text-center text-muted">
                          <div style={{fontSize: '2.5rem', opacity: 0.6}}>
                            <i className="bi bi-star"></i>
                          </div>
                          <p className="mt-2">Start training to earn badges!</p>
                        </div>
                      ) : (
                        <div>
                          {scores.earthquake && (
                            <div className="mb-3 p-3 border rounded bg-white">
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <strong className="d-flex align-items-center gap-2">
                                    <i className="bi bi-shield-exclamation text-warning"></i>
                                    Earthquake Safety
                                  </strong>
                                  <br />
                                  <small className="text-muted">
                                    Completed: {new Date(scores.earthquake.timestamp).toLocaleDateString()}
                                  </small>
                                </div>
                                <span className={`badge bg-${ScoreManager.getBadge(scores.earthquake.score, scores.earthquake.maxScore).color} fs-6`}>
                                  <i className="bi bi-award me-1"></i>
                                  {ScoreManager.getBadge(scores.earthquake.score, scores.earthquake.maxScore).name}
                                </span>
                              </div>
                            </div>
                          )}
                          {scores.fireDrill && (
                            <div className="mb-3 p-3 border rounded bg-white">
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <strong className="d-flex align-items-center gap-2">
                                    <i className="bi bi-fire text-danger"></i>
                                    Fire Safety
                                  </strong>
                                  <br />
                                  <small className="text-muted">
                                    Completed: {new Date(scores.fireDrill.timestamp).toLocaleDateString()}
                                  </small>
                                </div>
                                <span className={`badge bg-${ScoreManager.getBadge(scores.fireDrill.score, scores.fireDrill.maxScore).color} fs-6`}>
                                  <i className="bi bi-award me-1"></i>
                                  {ScoreManager.getBadge(scores.fireDrill.score, scores.fireDrill.maxScore).name}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {/* Overall Progress */}
                          <div className="mt-4 p-3 bg-primary text-white rounded">
                            <h6 className="mb-2 d-flex align-items-center gap-2">
                              <i className="bi bi-graph-up"></i>
                              Overall Progress
                            </h6>
                            <div className="d-flex justify-content-between">
                              <span>Activities Completed:</span>
                              <strong>{Object.keys(scores).length}/2</strong>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="row mt-4">
                <div className="col-12">
                  <div className="card text-dark shadow-sm" style={{
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)',
                    border: '3px solid #0ea5e9'
                  }}>
                    <div className="card-body">
                      <h6 className="card-title d-flex align-items-center gap-2">
                        <i className="bi bi-bar-chart"></i>
                        Quick Stats
                      </h6>
                      <div className="row text-center">
                        <div className="col-md-4">
                          <div className="fs-5">{overallStats.completedActivities}</div>
                          <small>Activities Completed</small>
                        </div>
                        <div className="col-md-4">
                          <div className="fs-5">{overallStats.expertBadges}</div>
                          <small>Expert Badges</small>
                        </div>
                        <div className="col-md-4">
                          <div className="fs-5">{overallStats.averageScore}%</div>
                          <small>Average Score</small>
                        </div>
                      </div>
                      {/* Progress Graph */}
                      <div className="mt-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <small>Overall Progress</small>
                          <small>{overallStats.completedActivities}/{overallStats.totalActivities}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Flood Simulation Component
const FloodSimulation = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const scenarios = [
    {
      id: 1,
      situation: "🌧️ It's been raining for days and your backyard is starting to look like a swimming pool! Your parents say you need to leave home. What should you do first?",
      options: [
        { text: "🎒 Pack your emergency backpack with snacks, water, and your favorite stuffed animal", correct: true, feedback: "🎉 You're a flood safety hero! Having your emergency supplies ready helps keep you safe and comfortable!" },
        { text: "⏰ Wait until the water reaches your front door", correct: false, feedback: "❌ Don't wait for the water to come to you! Leave early when grown-ups say it's time to go!" },
        { text: "🚗 Drive through the flooded street to get to higher ground", correct: false, feedback: "❌ Never drive through water! Cars can float away like boats! Turn around and find a different way!" },
        { text: "🏠 Stay home and wait for a boat to rescue you", correct: false, feedback: "❌ Don't wait for rescue if you can safely leave! Listen to the grown-ups and evacuate early!" }
      ]
    },
    {
      id: 2,
      situation: "🚗 You're in the car with your family when you see a road covered with water ahead. What should you do?",
      options: [
        { text: "🔄 Turn around and find a different road like a smart driver", correct: true, feedback: "🌟 You're a super smart navigator! Never drive through water - even shallow water can be dangerous!" },
        { text: "🐌 Drive very slowly through the water", correct: false, feedback: "❌ Even going slow through water is dangerous! Cars can float away like toys in a bathtub!" },
        { text: "👀 Wait for another car to go first", correct: false, feedback: "❌ Don't follow others into danger! Be a smart driver and turn around!" },
        { text: "📞 Call for help and wait in the car", correct: false, feedback: "❌ If water is rising, get out of the car and move to higher ground! Don't wait in a car!" }
      ]
    },
    {
      id: 3,
      situation: "🏢 You're stuck in a building and the water is getting higher and higher! It's like the building is becoming a boat! What should you do?",
      options: [
        { text: "🏔️ Go to the highest floor or roof like climbing a mountain", correct: true, feedback: "🎯 Perfect! You're a flood escape expert! Go up, up, up to the highest safe place and wave for help!" },
        { text: "🏊‍♂️ Try to swim to safety like a fish", correct: false, feedback: "❌ Flood water can be dangerous and dirty! Stay put and let grown-ups help you!" },
        { text: "🪟 Break windows to escape like a superhero", correct: false, feedback: "❌ Only break windows if water is about to reach you and you can safely get out!" },
        { text: "🏠 Hide in the basement like a secret hideout", correct: false, feedback: "❌ Basements are the most dangerous place during floods! Go up, not down!" }
      ]
    },
    {
      id: 4,
      situation: "🏠 The flood is over and you're going back home! But first, what should you do before going inside?",
      options: [
        { text: "🔍 Look carefully for damage like a detective before going inside", correct: true, feedback: "🕵️‍♂️ You're a safety detective! Always check if the house is safe before going inside!" },
        { text: "🧹 Start cleaning up right away", correct: false, feedback: "❌ First make sure the house is safe! Check for broken things and dangerous stuff before cleaning!" },
        { text: "💡 Turn on all the lights and TV", correct: false, feedback: "❌ Don't use electrical things until a grown-up says it's safe! Electricity and water don't mix!" },
        { text: "🚰 Drink water from the tap to see if it's okay", correct: false, feedback: "❌ Don't drink tap water after a flood - it might be dirty! Wait for grown-ups to say it's safe!" }
      ]
    },
    {
      id: 5,
      situation: "📢 You hear on the radio that there's a flood warning for your area! What should you do to get ready?",
      options: [
        { text: "🎒 Make an emergency kit with snacks, water, and toys, and know where to go", correct: true, feedback: "🏆 You're a flood preparation champion! Being ready with supplies and knowing your escape plan keeps you safe!" },
        { text: "😴 Ignore the warning and keep playing", correct: false, feedback: "❌ Always listen to flood warnings! They help keep you safe like a superhero's warning!" },
        { text: "📦 Put your favorite toys in the basement", correct: false, feedback: "❌ Put your toys on higher floors, not the basement! Basements flood first!" },
        { text: "👀 Wait until you see water before doing anything", correct: false, feedback: "❌ Don't wait to see the water! Act early when warnings come - it's like being a safety superhero!" }
      ]
    }
  ];

  const handleAnswer = (optionIndex) => {
    setSelectedOption(optionIndex);
    setShowFeedback(true);
    
    const isCorrect = scenarios[currentStep].options[optionIndex].correct;
    if (isCorrect) {
      setScore(score + 1);
      // Play success sound effect
      disasterSoundManager.playDisasterSound('success');
    } else {
      // Play child-friendly error sound
      disasterSoundManager.playDisasterSound('error');
    }

    setTimeout(() => {
      setShowFeedback(false);
      setSelectedOption(null);
      
      if (currentStep < scenarios.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        ScoreManager.saveScore('flood', score + (isCorrect ? 1 : 0), scenarios.length);
        setShowResult(true);
      }
    }, 3000);
  };

  const resetSimulation = () => {
    setCurrentStep(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    setShowFeedback(false);
  };

  const startSimulation = () => {
    setCurrentStep(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    setShowFeedback(false);
  };

  // Ready state - show before simulation starts
  if (currentStep === 0 && !showResult && !showFeedback) {
    return (
      <div className="game-card" style={{maxWidth: '800px', margin: '0 auto'}}>
        {/* Compact Header */}
        <div className="game-header flood-header" style={{
          padding: '16px 24px',
          background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
          borderRadius: '12px 12px 0 0'
        }}>
          <h4 className="mb-0 d-flex align-items-center gap-2 text-white" style={{fontSize: '1.4rem', fontWeight: '600'}}>
            <i className="bi bi-droplet" style={{fontSize: '1.2rem'}}></i>
            Flood Safety Training
          </h4>
        </div>
        
        <div className="card-body" style={{padding: '32px 24px'}}>
          {/* Large Centered Illustration */}
          <div className="text-center mb-5">
            <div style={{
              width: '160px',
              height: '160px',
              margin: '0 auto 24px',
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              borderRadius: '20px',
              border: '3px solid #0ea5e9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(14, 165, 233, 0.3)'
            }}>
              {/* SVG Flood Illustration */}
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Houses with water */}
                <rect x="15" y="40" width="25" height="20" fill="#8B4513" rx="2"/>
                <polygon points="15,40 27,30 40,40" fill="#DC2626"/>
                <rect x="22" y="50" width="11" height="10" fill="#87CEEB" rx="1"/>
                
                <rect x="50" y="35" width="22" height="25" fill="#8B4513" rx="2"/>
                <polygon points="50,35 61,25 72,35" fill="#DC2626"/>
                <rect x="57" y="45" width="8" height="10" fill="#87CEEB" rx="1"/>
                
                {/* Water waves */}
                <path d="M0 60 Q20 50 40 60 Q60 50 80 60 Q100 50 100 60 L100 100 L0 100 Z" fill="#0EA5E9" opacity="0.7"/>
                <path d="M0 65 Q20 55 40 65 Q60 55 80 65 Q100 55 100 65 L100 100 L0 100 Z" fill="#0284C7" opacity="0.5"/>
                <path d="M0 70 Q20 60 40 70 Q60 60 80 70 Q100 60 100 70 L100 100 L0 100 Z" fill="#0369A1" opacity="0.3"/>
                
                {/* Life jacket people */}
                <circle cx="8" cy="30" r="3" fill="#FFDBAC"/>
                <rect x="6" y="33" width="4" height="6" fill="#FFD700"/>
                <rect x="5" y="34" width="6" height="5" fill="#FFD700" rx="1"/>
                
                <circle cx="45" cy="25" r="2.5" fill="#FFDBAC"/>
                <rect x="44" y="27" width="2" height="5" fill="#FFD700"/>
                <rect x="43" y="28" width="4" height="4" fill="#FFD700" rx="1"/>
                
                <circle cx="75" cy="28" r="3" fill="#FFDBAC"/>
                <rect x="73" y="31" width="4" height="6" fill="#FFD700"/>
                <rect x="72" y="32" width="6" height="5" fill="#FFD700" rx="1"/>
                
                {/* Safety waves */}
                <path d="M5 20 Q10 15 15 20 Q20 15 25 20" stroke="#10B981" strokeWidth="2" fill="none"/>
                <path d="M5 25 Q10 20 15 25 Q20 20 25 25" stroke="#10B981" strokeWidth="2" fill="none"/>
                
                <path d="M40 15 Q45 10 50 15 Q55 10 60 15" stroke="#10B981" strokeWidth="2" fill="none"/>
                <path d="M40 20 Q45 15 50 20 Q55 15 60 20" stroke="#10B981" strokeWidth="2" fill="none"/>
              </svg>
            </div>
          </div>
          
          {/* Enhanced Title */}
          <h2 className="text-center mb-4" style={{
            fontSize: '2.2rem',
            fontWeight: '700',
            color: '#1f2937',
            lineHeight: '1.2'
          }}>
            Flood Safety Training
          </h2>
          
          {/* Enhanced Description */}
          <div className="text-center mb-5" style={{maxWidth: '600px', margin: '0 auto'}}>
            <p style={{
              fontSize: '1.2rem',
              lineHeight: '1.7',
              color: '#4b5563',
              fontWeight: '400',
              margin: '0'
            }}>
              Learn flood safety procedures and emergency response through engaging interactive scenarios!
            </p>
          </div>
          
          {/* Enhanced Safety Tip */}
          <div className="text-center mb-5">
            <div style={{
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              border: '2px solid #0ea5e9',
              borderRadius: '16px',
              padding: '20px 24px',
              maxWidth: '500px',
              margin: '0 auto',
              boxShadow: '0 4px 15px rgba(14, 165, 233, 0.2)'
            }}>
              <div className="d-flex align-items-center justify-content-center gap-3">
                <i className="bi bi-lightbulb" style={{fontSize: '1.5rem', color: '#0ea5e9'}}></i>
                <div className="text-start">
                  <strong style={{fontSize: '1.1rem', color: '#0c4a6e'}}>Safety Tip:</strong>
                  <p className="mb-0 mt-1" style={{fontSize: '1rem', color: '#0c4a6e', lineHeight: '1.5'}}>
                    Never walk or drive through flood waters - they can be deeper and faster than they appear!
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Action Button */}
          <div className="text-center">
            <button 
              className="btn btn-lg" 
              onClick={startSimulation}
              style={{
                background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
                border: 'none',
                borderRadius: '16px',
                padding: '16px 32px',
                fontSize: '1.3rem',
                fontWeight: '600',
                color: 'white',
                boxShadow: '0 6px 20px rgba(14, 165, 233, 0.4)',
                transition: 'all 0.3s ease',
                minWidth: '200px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(14, 165, 233, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 20px rgba(14, 165, 233, 0.4)';
              }}
            >
              <i className="bi bi-play-fill me-2" style={{fontSize: '1.4rem'}}></i>
              Start Training
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResult) {
    const finalScore = score;
    const badge = ScoreManager.getBadge(finalScore, scenarios.length);
    
    return (
      <div className="game-card success-animation">
        <div className="game-header flood-header">
          <h4 className="mb-0 d-flex align-items-center gap-2">
            <i className="bi bi-check-circle-fill"></i>
            Training Complete
          </h4>
        </div>
        <div className="card-body text-center">
          <div className="scene-container">
            <i className="bi bi-award scene-icon"></i>
          </div>

          <div className="achievement-badge mb-3">
            <i className="bi bi-award me-2"></i>
            {badge.name}
          </div>
          <h3 className="text-success mb-3">Score: {finalScore}/{scenarios.length}</h3>
          <div className="progress-container mb-4">
            <div 
              className="progress-bar" 
              style={{width: `${(finalScore/scenarios.length)*100}%`}}
            >
              {Math.round((finalScore/scenarios.length)*100)}%
            </div>
          </div>
          
          <div className="alert alert-success mb-4">
            <h5>Training Complete</h5>
            <p className="mb-0">You have successfully completed the flood safety training. Continue practicing to improve your emergency response skills.</p>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <button className="game-button w-100" onClick={resetSimulation}>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Retry Training
              </button>
            </div>
            <div className="col-md-6">
              <button className="game-button w-100" onClick={() => onComplete?.()}>
                <i className="bi bi-speedometer2 me-2"></i>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentScenario = scenarios[currentStep];
  
  return (
    <div className="game-card">
      <div className="game-header flood-header">
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0 d-flex align-items-center gap-2">
            <i className="bi bi-droplet"></i>
            Flood Safety Training
          </h4>
          <div>
            <span className="badge bg-dark fs-6">Step {currentStep + 1}/{scenarios.length}</span>
            <span className="badge bg-success fs-6 ms-2">Score: {score}</span>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="scene-container">
          <div className="flood-animation-container">
            <div className="flood-symbol">
              <div className="water-wave wave-1"></div>
              <div className="water-wave wave-2"></div>
              <div className="water-wave wave-3"></div>
              <div className="water-drop drop-1"></div>
              <div className="water-drop drop-2"></div>
              <div className="water-drop drop-3"></div>
              <div className="water-drop drop-4"></div>
              <div className="water-drop drop-5"></div>
            </div>
          </div>
        </div>

        <div className="alert alert-info">
          <h5 className="mb-0">{currentScenario.situation}</h5>
        </div>

        {!showFeedback ? (
          <div className="row g-3 mt-3">
            {currentScenario.options.map((option, index) => (
              <div key={index} className="col-12">
                <InteractiveButton 
                  className="option-button w-100 text-start interactive-element"
                  onClick={() => handleAnswer(index)}
                  type="default"
                >
                  <div className="d-flex align-items-center gap-3">
                    <div className="option-letter">
                      <span className="badge bg-secondary rounded-circle" style={{width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem'}}>
                        {String.fromCharCode(65 + index)}
                      </span>
                    </div>
                    <div className="option-text">
                      {option.text}
                    </div>
                  </div>
                </InteractiveButton>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 feedback-container">
            <div className={`alert ${scenarios[currentStep].options[selectedOption].correct ? 'alert-success' : 'alert-danger'}`}>
              <div className="d-flex align-items-start gap-2">
                <i className={`bi ${scenarios[currentStep].options[selectedOption].correct ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}></i>
                <div>
                  <strong>
                    {scenarios[currentStep].options[selectedOption].correct ? 'Correct!' : 'Incorrect'}
                  </strong>
                  <p className="mb-0 mt-2">{scenarios[currentStep].options[selectedOption].feedback}</p>
                </div>
              </div>
            </div>
            <div className="text-center loading-container">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <span className="ms-3 text-muted">Loading next question...</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// Cyclone Simulation Component
const CycloneSimulation = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const scenarios = [
    {
      id: 1,
      situation: "🌪️ The weather person on TV says a big spinning storm called a cyclone is coming to your area! What should you do first?",
      options: [
        { text: "🏠 Put away your toys and bikes outside, and pack snacks and water", correct: true, feedback: "🎉 You're a cyclone preparation champion! Putting things away and having supplies ready keeps you safe!" },
        { text: "👀 Go outside to watch the clouds and wind", correct: false, feedback: "❌ Stay inside and away from windows! The wind can be very strong and dangerous!" },
        { text: "⚽ Keep playing soccer outside like normal", correct: false, feedback: "❌ Listen to cyclone warnings! They help keep you safe like a superhero's warning!" },
        { text: "⏰ Wait until you see the big spinning clouds before doing anything", correct: false, feedback: "❌ Don't wait to see the storm! Get ready early when grown-ups say a warning is coming!" }
      ]
    },
    {
      id: 2,
      situation: "🏠 The cyclone is getting closer and the wind is howling like a big wolf! Where should you hide in your house?",
      options: [
        { text: "🚪 In a small room inside the house with no windows, like a closet or bathroom", correct: true, feedback: "🛡️ Perfect! You're a cyclone shelter expert! Small rooms with no windows are the safest places!" },
        { text: "🪟 In a room with big windows to watch the storm", correct: false, feedback: "❌ Stay away from windows! They can break and hurt you with flying glass!" },
        { text: "🏠 In the attic or upstairs room", correct: false, feedback: "❌ Go downstairs, not upstairs! The lower floors are safer from the strong winds!" },
        { text: "🚗 In the garage or car", correct: false, feedback: "❌ Garages and cars aren't safe during cyclones! Stay inside the house in a safe room!" }
      ]
    },
    {
      id: 3,
      situation: "💥 During the cyclone, you hear a loud CRASH! It sounds like glass breaking. What should you do?",
      options: [
        { text: "🏃‍♂️ Move to a safer spot away from windows and glass", correct: true, feedback: "🌟 You're so smart! Moving away from broken glass keeps you safe from sharp pieces!" },
        { text: "🔍 Go look to see what made the noise", correct: false, feedback: "❌ Don't go exploring during the storm! Stay in your safe spot until it's over!" },
        { text: "🪟 Try to cover the broken window with a blanket", correct: false, feedback: "❌ Don't go near broken windows! The wind can blow more glass around!" },
        { text: "📞 Call 911 right away", correct: false, feedback: "❌ Only call 911 for really serious emergencies! Stay safe in your shelter first!" }
      ]
    },
    {
      id: 4,
      situation: "🌤️ The cyclone has passed and it's quiet outside now. You want to see what happened. What should you do first?",
      options: [
        { text: "⏰ Wait for grown-ups to say it's safe to go outside", correct: true, feedback: "🎯 You're a safety superstar! Always wait for grown-ups to say it's safe - there might be hidden dangers!" },
        { text: "🏃‍♂️ Run outside right away to see the damage", correct: false, feedback: "❌ Don't go outside yet! There might be broken glass, fallen trees, or other dangerous things!" },
        { text: "🧹 Start picking up broken branches and toys", correct: false, feedback: "❌ Wait for grown-ups to check for dangers first! There might be sharp things or electrical wires!" },
        { text: "🚗 Go for a drive to see what happened around town", correct: false, feedback: "❌ Stay off the roads! There might be fallen trees or broken power lines!" }
      ]
    },
    {
      id: 5,
      situation: "🚗 You're in the car with your family when you hear a cyclone warning on the radio! What should you do?",
      options: [
        { text: "🏢 Find a strong building like a school or store to hide in right away", correct: true, feedback: "🏆 You're a cyclone safety hero! Strong buildings are much safer than cars during cyclones!" },
        { text: "🚗 Keep driving to get home faster", correct: false, feedback: "❌ Don't keep driving! Find a safe building to hide in immediately!" },
        { text: "🌉 Park under a bridge or overpass", correct: false, feedback: "❌ Bridges aren't safe during cyclones! Find a strong building instead!" },
        { text: "🏎️ Drive super fast to get away from the storm", correct: false, feedback: "❌ You can't drive faster than a cyclone! Find a safe building to hide in right now!" }
      ]
    }
  ];

  const handleAnswer = (optionIndex) => {
    setSelectedOption(optionIndex);
    setShowFeedback(true);
    
    const isCorrect = scenarios[currentStep].options[optionIndex].correct;
    if (isCorrect) {
      setScore(score + 1);
      // Play success sound effect
      disasterSoundManager.playDisasterSound('success');
    } else {
      // Play child-friendly error sound
      disasterSoundManager.playDisasterSound('error');
    }

    setTimeout(() => {
      setShowFeedback(false);
      setSelectedOption(null);
      
      if (currentStep < scenarios.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        ScoreManager.saveScore('cyclone', score + (isCorrect ? 1 : 0), scenarios.length);
        setShowResult(true);
      }
    }, 3000);
  };

  const resetSimulation = () => {
    setCurrentStep(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    setShowFeedback(false);
  };

  const startSimulation = () => {
    setCurrentStep(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    setShowFeedback(false);
  };

  // Ready state - show before simulation starts
  if (currentStep === 0 && !showResult && !showFeedback) {
    return (
      <div className="game-card" style={{maxWidth: '800px', margin: '0 auto'}}>
        {/* Compact Header */}
        <div className="game-header cyclone-header" style={{
          padding: '16px 24px',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          borderRadius: '12px 12px 0 0'
        }}>
          <h4 className="mb-0 d-flex align-items-center gap-2 text-white" style={{fontSize: '1.4rem', fontWeight: '600'}}>
            <i className="bi bi-tornado" style={{fontSize: '1.2rem'}}></i>
            Cyclone Safety Training
          </h4>
        </div>
        
        <div className="card-body" style={{padding: '32px 24px'}}>
          {/* Large Centered Illustration */}
          <div className="text-center mb-5">
            <div style={{
              width: '160px',
              height: '160px',
              margin: '0 auto 24px',
              background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
              borderRadius: '20px',
              border: '3px solid #8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)'
            }}>
              {/* SVG Cyclone Illustration */}
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Cyclone spirals */}
                <path d="M50 15 Q70 30 50 45 Q30 60 50 75 Q70 90 50 100" stroke="#8B5CF6" strokeWidth="3" fill="none" opacity="0.8"/>
                <path d="M50 20 Q65 30 50 40 Q35 50 50 60 Q65 70 50 80" stroke="#A855F7" strokeWidth="2" fill="none" opacity="0.6"/>
                <path d="M50 25 Q60 30 50 35 Q40 40 50 45 Q60 50 50 55" stroke="#C084FC" strokeWidth="1.5" fill="none" opacity="0.4"/>
                
                {/* Storm clouds */}
                <ellipse cx="30" cy="25" rx="12" ry="6" fill="#6B7280" opacity="0.8"/>
                <ellipse cx="25" cy="28" rx="8" ry="4" fill="#6B7280" opacity="0.6"/>
                <ellipse cx="35" cy="28" rx="6" ry="3" fill="#6B7280" opacity="0.6"/>
                
                <ellipse cx="70" cy="20" rx="10" ry="5" fill="#6B7280" opacity="0.8"/>
                <ellipse cx="65" cy="22" rx="7" ry="3" fill="#6B7280" opacity="0.6"/>
                <ellipse cx="75" cy="22" rx="5" ry="2" fill="#6B7280" opacity="0.6"/>
                
                {/* Safe houses */}
                <rect x="15" y="60" width="15" height="12" fill="#8B4513" rx="2"/>
                <polygon points="15,60 22,50 30,60" fill="#DC2626"/>
                <rect x="20" y="65" width="5" height="7" fill="#87CEEB" rx="1"/>
                
                <rect x="60" y="65" width="13" height="10" fill="#8B4513" rx="1"/>
                <polygon points="60,65 66,57 73,65" fill="#DC2626"/>
                <rect x="65" y="69" width="3" height="6" fill="#87CEEB" rx="1"/>
                
                {/* Wind lines */}
                <path d="M5 20 L12 20 M5 25 L15 25 M5 30 L12 30" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
                <path d="M40 15 L47 15 M40 20 L50 20 M40 25 L47 25" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
                
                {/* Safety shields */}
                <path d="M80 15 Q85 10 90 15 Q85 20 80 15 Z" fill="#10B981" stroke="#059669" strokeWidth="1"/>
                <text x="85" y="18" textAnchor="middle" fontSize="6" fill="white" fontWeight="bold">SAFE</text>
                
                <path d="M20 10 Q25 5 30 10 Q25 15 20 10 Z" fill="#10B981" stroke="#059669" strokeWidth="1"/>
                <text x="25" y="13" textAnchor="middle" fontSize="6" fill="white" fontWeight="bold">SAFE</text>
              </svg>
            </div>
          </div>
          
          {/* Enhanced Title */}
          <h2 className="text-center mb-4" style={{
            fontSize: '2.2rem',
            fontWeight: '700',
            color: '#1f2937',
            lineHeight: '1.2'
          }}>
            Cyclone Safety Training
          </h2>
          
          {/* Enhanced Description */}
          <div className="text-center mb-5" style={{maxWidth: '600px', margin: '0 auto'}}>
            <p style={{
              fontSize: '1.2rem',
              lineHeight: '1.7',
              color: '#4b5563',
              fontWeight: '400',
              margin: '0'
            }}>
              Learn cyclone safety procedures and emergency response through fun interactive training!
            </p>
          </div>
          
          {/* Enhanced Safety Tip */}
          <div className="text-center mb-5">
            <div style={{
              background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
              border: '2px solid #8b5cf6',
              borderRadius: '16px',
              padding: '20px 24px',
              maxWidth: '500px',
              margin: '0 auto',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.2)'
            }}>
              <div className="d-flex align-items-center justify-content-center gap-3">
                <i className="bi bi-lightbulb" style={{fontSize: '1.5rem', color: '#8b5cf6'}}></i>
                <div className="text-start">
                  <strong style={{fontSize: '1.1rem', color: '#6b21a8'}}>Safety Tip:</strong>
                  <p className="mb-0 mt-1" style={{fontSize: '1rem', color: '#6b21a8', lineHeight: '1.5'}}>
                    Stay indoors during a cyclone and avoid windows. Find the strongest room in your house!
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Action Button */}
          <div className="text-center">
            <button 
              className="btn btn-lg" 
              onClick={startSimulation}
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                border: 'none',
                borderRadius: '16px',
                padding: '16px 32px',
                fontSize: '1.3rem',
                fontWeight: '600',
                color: 'white',
                boxShadow: '0 6px 20px rgba(139, 92, 246, 0.4)',
                transition: 'all 0.3s ease',
                minWidth: '200px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)';
              }}
            >
              <i className="bi bi-play-fill me-2" style={{fontSize: '1.4rem'}}></i>
              Start Training
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResult) {
    const finalScore = score;
    const badge = ScoreManager.getBadge(finalScore, scenarios.length);
    
    return (
      <div className="game-card success-animation">
        <div className="game-header cyclone-header">
          <h4 className="mb-0 d-flex align-items-center gap-2">
            <i className="bi bi-check-circle-fill"></i>
            Training Complete
          </h4>
        </div>
        <div className="card-body text-center">
          <div className="scene-container">
            <i className="bi bi-award scene-icon"></i>
          </div>

          <div className="achievement-badge mb-3">
            <i className="bi bi-award me-2"></i>
            {badge.name}
          </div>
          <h3 className="text-success mb-3">Score: {finalScore}/{scenarios.length}</h3>
          <div className="progress-container mb-4">
            <div 
              className="progress-bar" 
              style={{width: `${(finalScore/scenarios.length)*100}%`}}
            >
              {Math.round((finalScore/scenarios.length)*100)}%
            </div>
          </div>
          
          <div className="alert alert-success mb-4">
            <h5>Training Complete</h5>
            <p className="mb-0">You have successfully completed the cyclone safety training. Continue practicing to improve your emergency response skills.</p>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <button className="game-button w-100" onClick={resetSimulation}>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Retry Training
              </button>
            </div>
            <div className="col-md-6">
              <button className="game-button w-100" onClick={() => onComplete?.()}>
                <i className="bi bi-speedometer2 me-2"></i>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentScenario = scenarios[currentStep];
  
  return (
    <div className="game-card">
      <div className="game-header cyclone-header">
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0 d-flex align-items-center gap-2">
            <i className="bi bi-cloud-lightning"></i>
            Cyclone Safety Training
          </h4>
          <div>
            <span className="badge bg-dark fs-6">Step {currentStep + 1}/{scenarios.length}</span>
            <span className="badge bg-success fs-6 ms-2">Score: {score}</span>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="scene-container">
          <div className="cyclone-animation-container">
            <div className="cyclone-symbol">
              <div className="cyclone-spiral spiral-1"></div>
              <div className="cyclone-spiral spiral-2"></div>
              <div className="cyclone-spiral spiral-3"></div>
              <div className="cyclone-center"></div>
              <div className="wind-line wind-1"></div>
              <div className="wind-line wind-2"></div>
              <div className="wind-line wind-3"></div>
              <div className="wind-line wind-4"></div>
            </div>
          </div>
        </div>

        <div className="alert alert-info">
          <h5 className="mb-0">{currentScenario.situation}</h5>
        </div>

        {!showFeedback ? (
          <div className="row g-3 mt-3">
            {currentScenario.options.map((option, index) => (
              <div key={index} className="col-12">
                <InteractiveButton 
                  className="option-button w-100 text-start interactive-element"
                  onClick={() => handleAnswer(index)}
                  type="default"
                >
                  <div className="d-flex align-items-center gap-3">
                    <div className="option-letter">
                      <span className="badge bg-secondary rounded-circle" style={{width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem'}}>
                        {String.fromCharCode(65 + index)}
                      </span>
                    </div>
                    <div className="option-text">
                      {option.text}
                    </div>
                  </div>
                </InteractiveButton>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 feedback-container">
            <div className={`alert ${scenarios[currentStep].options[selectedOption].correct ? 'alert-success' : 'alert-danger'}`}>
              <div className="d-flex align-items-start gap-2">
                <i className={`bi ${scenarios[currentStep].options[selectedOption].correct ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}></i>
                <div>
                  <strong>
                    {scenarios[currentStep].options[selectedOption].correct ? 'Correct!' : 'Incorrect'}
                  </strong>
                  <p className="mb-0 mt-2">{scenarios[currentStep].options[selectedOption].feedback}</p>
                </div>
              </div>
            </div>
            <div className="text-center loading-container">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <span className="ms-3 text-muted">Loading next question...</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// Landslide Simulation Component
const LandslideSimulation = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const scenarios = [
    {
      id: 1,
      situation: "🌧️ It's been raining for days and you live on a big hill! Your parents are worried about landslides. What should you look for?",
      options: [
        { text: "🔍 Cracks in the ground, trees leaning over, and water coming out of the hill", correct: true, feedback: "🎉 You're a landslide detective! These are all warning signs that the ground might be moving!" },
        { text: "🐦 Birds flying away from the area", correct: false, feedback: "❌ While animals might sense danger, cracks in the ground and leaning trees are better warning signs!" },
        { text: "🔊 Loud rumbling sounds from the mountain", correct: false, feedback: "❌ While landslides can be noisy, looking for cracks and leaning trees is more important!" },
        { text: "🌊 The stream water changing color", correct: false, feedback: "❌ Water color changes aren't as reliable as looking for cracks and ground movement!" }
      ]
    },
    {
      id: 2,
      situation: "😟 You notice big cracks in your driveway and the ground around your house looks different! What should you do?",
      options: [
        { text: "🏃‍♂️ Leave immediately and tell a grown-up to call for help", correct: true, feedback: "🚨 You're a safety hero! Ground cracks are a serious warning - get away right away!" },
        { text: "🪣 Fill the cracks with dirt to stop water from getting in", correct: false, feedback: "❌ Don't try to fix the cracks! Get away from the area immediately!" },
        { text: "👀 Wait to see if the cracks get bigger", correct: false, feedback: "❌ Don't wait! Cracks in the ground mean danger - leave right now!" },
        { text: "🏠 Keep playing but watch the cracks carefully", correct: false, feedback: "❌ Ground cracks mean immediate danger! Don't stay - evacuate right away!" }
      ]
    },
    {
      id: 3,
      situation: "🚗 You're driving on a mountain road with your family when you see rocks and dirt on the road ahead! What should you do?",
      options: [
        { text: "🔄 Stop the car, turn around, and find a different road", correct: true, feedback: "🌟 You're a smart navigator! Rocks and dirt on the road might mean a landslide happened - find another way!" },
        { text: "🐌 Drive very slowly through the rocks and dirt", correct: false, feedback: "❌ Don't drive through debris! It might mean more rocks are coming down!" },
        { text: "🧹 Get out and move the rocks off the road", correct: false, feedback: "❌ Don't go near the debris! There might be more rocks falling down!" },
        { text: "📞 Call for help and wait in the car", correct: false, feedback: "❌ Don't wait! Turn around and leave the area immediately!" }
      ]
    },
    {
      id: 4,
      situation: "😱 Oh no! You're in the car when a landslide starts! Rocks and dirt are sliding down the hill! What should you do?",
      options: [
        { text: "🛡️ Stay in the car with your seatbelt on and cover your head", correct: true, feedback: "🎯 Perfect! You're a landslide safety expert! The car protects you from falling rocks!" },
        { text: "🏃‍♂️ Get out of the car and run away", correct: false, feedback: "❌ Stay in the car! It protects you from falling rocks and debris!" },
        { text: "🪟 Open all the windows so the car doesn't get squished", correct: false, feedback: "❌ Keep windows closed to protect you from rocks! Stay buckled up!" },
        { text: "🚗 Try to drive away from the landslide", correct: false, feedback: "❌ Don't try to drive! Stay in the car with your seatbelt on!" }
      ]
    },
    {
      id: 5,
      situation: "🏠 The landslide is over and you want to go back home to see what happened. What should you do first?",
      options: [
        { text: "⏰ Wait for grown-ups to say it's safe and check for more danger", correct: true, feedback: "🏆 You're a safety superstar! Always wait for grown-ups to say it's safe - there might be more landslides!" },
        { text: "🏃‍♂️ Go back right away to see what happened", correct: false, feedback: "❌ Don't go back yet! Wait for grown-ups to check if it's safe first!" },
        { text: "👥 Send a friend to check first", correct: false, feedback: "❌ Don't send anyone until grown-ups say the area is safe!" },
        { text: "🛣️ Drive around the landslide to get to your house", correct: false, feedback: "❌ Don't try to go around landslides! Wait for grown-ups to say it's safe!" }
      ]
    }
  ];

  const handleAnswer = (optionIndex) => {
    setSelectedOption(optionIndex);
    setShowFeedback(true);
    
    const isCorrect = scenarios[currentStep].options[optionIndex].correct;
    if (isCorrect) {
      setScore(score + 1);
      // Play success sound effect
      disasterSoundManager.playDisasterSound('success');
    } else {
      // Play child-friendly error sound
      disasterSoundManager.playDisasterSound('error');
    }

    setTimeout(() => {
      setShowFeedback(false);
      setSelectedOption(null);
      
      if (currentStep < scenarios.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        ScoreManager.saveScore('landslide', score + (isCorrect ? 1 : 0), scenarios.length);
        setShowResult(true);
      }
    }, 3000);
  };

  const resetSimulation = () => {
    setCurrentStep(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    setShowFeedback(false);
  };

  const startSimulation = () => {
    setCurrentStep(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    setShowFeedback(false);
  };

  // Ready state - show before simulation starts
  if (currentStep === 0 && !showResult && !showFeedback) {
    return (
      <div className="game-card" style={{maxWidth: '800px', margin: '0 auto'}}>
        {/* Compact Header */}
        <div className="game-header landslide-header" style={{
          padding: '16px 24px',
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          borderRadius: '12px 12px 0 0'
        }}>
          <h4 className="mb-0 d-flex align-items-center gap-2 text-white" style={{fontSize: '1.4rem', fontWeight: '600'}}>
            <i className="bi bi-mountain" style={{fontSize: '1.2rem'}}></i>
            Landslide Safety Training
          </h4>
        </div>
        
        <div className="card-body" style={{padding: '32px 24px'}}>
          {/* Large Centered Illustration */}
          <div className="text-center mb-5">
            <div style={{
              width: '160px',
              height: '160px',
              margin: '0 auto 24px',
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              borderRadius: '20px',
              border: '3px solid #059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(5, 150, 105, 0.3)'
            }}>
              {/* SVG Landslide Illustration */}
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Mountains */}
                <polygon points="15,70 35,25 55,70" fill="#8B4513"/>
                <polygon points="35,70 45,45 55,70" fill="#A0522D"/>
                
                <polygon points="60,75 80,30 100,75" fill="#8B4513"/>
                <polygon points="80,75 85,55 90,75" fill="#A0522D"/>
                
                {/* Landslide debris */}
                <path d="M25 70 Q40 60 55 70 Q75 55 95 70 L95 100 L25 100 Z" fill="#D2691E" opacity="0.8"/>
                <path d="M30 75 Q45 65 60 75 Q80 60 100 75 L100 100 L30 100 Z" fill="#CD853F" opacity="0.6"/>
                
                {/* Rocks scattered */}
                <ellipse cx="40" cy="75" rx="2" ry="1.5" fill="#696969"/>
                <ellipse cx="65" cy="78" rx="1.5" ry="1" fill="#696969"/>
                <ellipse cx="85" cy="76" rx="2" ry="1.5" fill="#696969"/>
                
                {/* Warning signs */}
                <rect x="20" cy="35" width="8" height="10" fill="#FFD700" rx="1"/>
                <polygon points="24,28 20,35 28,35" fill="#FFD700"/>
                <text x="24" y="42" textAnchor="middle" fontSize="5" fill="#DC2626" fontWeight="bold">!</text>
                
                <rect x="70" cy="40" width="6" height="8" fill="#FFD700" rx="1"/>
                <polygon points="73,35 70,40 76,40" fill="#FFD700"/>
                <text x="73" y="45" textAnchor="middle" fontSize="4" fill="#DC2626" fontWeight="bold">!</text>
                
                {/* Safety houses */}
                <rect x="8" cy="60" width="10" height="8" fill="#8B4513" rx="1"/>
                <polygon points="8,60 13,55 18,60" fill="#DC2626"/>
                <rect x="11" cy="63" width="4" height="5" fill="#87CEEB" rx="1"/>
                
                <rect x="75" cy="62" width="9" height="7" fill="#8B4513" rx="1"/>
                <polygon points="75,62 79,58 84,62" fill="#DC2626"/>
                <rect x="78" cy="65" width="3" height="4" fill="#87CEEB" rx="1"/>
                
                {/* Safety shields */}
                <path d="M45 20 Q50 15 55 20 Q50 25 45 20 Z" fill="#10B981" stroke="#059669" strokeWidth="1"/>
                <text x="50" y="23" textAnchor="middle" fontSize="4" fill="white" fontWeight="bold">SAFE</text>
                
                <path d="M85 18 Q90 13 95 18 Q90 23 85 18 Z" fill="#10B981" stroke="#059669" strokeWidth="1"/>
                <text x="90" y="21" textAnchor="middle" fontSize="4" fill="white" fontWeight="bold">SAFE</text>
              </svg>
            </div>
          </div>
          
          {/* Enhanced Title */}
          <h2 className="text-center mb-4" style={{
            fontSize: '2.2rem',
            fontWeight: '700',
            color: '#1f2937',
            lineHeight: '1.2'
          }}>
            Landslide Safety Training
          </h2>
          
          {/* Enhanced Description */}
          <div className="text-center mb-5" style={{maxWidth: '600px', margin: '0 auto'}}>
            <p style={{
              fontSize: '1.2rem',
              lineHeight: '1.7',
              color: '#4b5563',
              fontWeight: '400',
              margin: '0'
            }}>
              Learn landslide safety procedures and emergency response through exciting interactive scenarios!
            </p>
          </div>
          
          {/* Enhanced Safety Tip */}
          <div className="text-center mb-5">
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              border: '2px solid #059669',
              borderRadius: '16px',
              padding: '20px 24px',
              maxWidth: '500px',
              margin: '0 auto',
              boxShadow: '0 4px 15px rgba(5, 150, 105, 0.2)'
            }}>
              <div className="d-flex align-items-center justify-content-center gap-3">
                <i className="bi bi-lightbulb" style={{fontSize: '1.5rem', color: '#059669'}}></i>
                <div className="text-start">
                  <strong style={{fontSize: '1.1rem', color: '#065f46'}}>Safety Tip:</strong>
                  <p className="mb-0 mt-1" style={{fontSize: '1rem', color: '#065f46', lineHeight: '1.5'}}>
                    If you see signs of a landslide, move to higher ground immediately and stay away from steep slopes!
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Action Button */}
          <div className="text-center">
            <button 
              className="btn btn-lg" 
              onClick={startSimulation}
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                border: 'none',
                borderRadius: '16px',
                padding: '16px 32px',
                fontSize: '1.3rem',
                fontWeight: '600',
                color: 'white',
                boxShadow: '0 6px 20px rgba(5, 150, 105, 0.4)',
                transition: 'all 0.3s ease',
                minWidth: '200px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(5, 150, 105, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 20px rgba(5, 150, 105, 0.4)';
              }}
            >
              <i className="bi bi-play-fill me-2" style={{fontSize: '1.4rem'}}></i>
              Start Training
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResult) {
    const finalScore = score;
    const badge = ScoreManager.getBadge(finalScore, scenarios.length);
    
    return (
      <div className="game-card success-animation">
        <div className="game-header landslide-header">
          <h4 className="mb-0 d-flex align-items-center gap-2">
            <i className="bi bi-check-circle-fill"></i>
            Training Complete
          </h4>
        </div>
        <div className="card-body text-center">
          <div className="scene-container">
            <i className="bi bi-award scene-icon"></i>
          </div>

          <div className="achievement-badge mb-3">
            <i className="bi bi-award me-2"></i>
            {badge.name}
          </div>
          <h3 className="text-success mb-3">Score: {finalScore}/{scenarios.length}</h3>
          <div className="progress-container mb-4">
            <div 
              className="progress-bar" 
              style={{width: `${(finalScore/scenarios.length)*100}%`}}
            >
              {Math.round((finalScore/scenarios.length)*100)}%
            </div>
          </div>
          
          <div className="alert alert-success mb-4">
            <h5>Training Complete</h5>
            <p className="mb-0">You have successfully completed the landslide safety training. Continue practicing to improve your emergency response skills.</p>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <button className="game-button w-100" onClick={resetSimulation}>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Retry Training
              </button>
            </div>
            <div className="col-md-6">
              <button className="game-button w-100" onClick={() => onComplete?.()}>
                <i className="bi bi-speedometer2 me-2"></i>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentScenario = scenarios[currentStep];
  
  return (
    <div className="game-card">
      <div className="game-header landslide-header">
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0 d-flex align-items-center gap-2">
            <i className="bi bi-mountain"></i>
            Landslide Safety Training
          </h4>
          <div>
            <span className="badge bg-dark fs-6">Step {currentStep + 1}/{scenarios.length}</span>
            <span className="badge bg-success fs-6 ms-2">Score: {score}</span>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="scene-container">
          <div className="landslide-animation-container">
            <div className="landslide-symbol">
              <div className="mountain-slope"></div>
              <div className="rock rock-1"></div>
              <div className="rock rock-2"></div>
              <div className="rock rock-3"></div>
              <div className="debris debris-1"></div>
              <div className="debris debris-2"></div>
              <div className="debris debris-3"></div>
              <div className="dust-cloud dust-1"></div>
              <div className="dust-cloud dust-2"></div>
            </div>
          </div>
        </div>

        <div className="alert alert-info">
          <h5 className="mb-0">{currentScenario.situation}</h5>
        </div>

        {!showFeedback ? (
          <div className="row g-3 mt-3">
            {currentScenario.options.map((option, index) => (
              <div key={index} className="col-12">
                <InteractiveButton 
                  className="option-button w-100 text-start interactive-element"
                  onClick={() => handleAnswer(index)}
                  type="default"
                >
                  <div className="d-flex align-items-center gap-3">
                    <div className="option-letter">
                      <span className="badge bg-secondary rounded-circle" style={{width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem'}}>
                        {String.fromCharCode(65 + index)}
                      </span>
                    </div>
                    <div className="option-text">
                      {option.text}
                    </div>
                  </div>
                </InteractiveButton>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 feedback-container">
            <div className={`alert ${scenarios[currentStep].options[selectedOption].correct ? 'alert-success' : 'alert-danger'}`}>
              <div className="d-flex align-items-start gap-2">
                <i className={`bi ${scenarios[currentStep].options[selectedOption].correct ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}></i>
                <div>
                  <strong>
                    {scenarios[currentStep].options[selectedOption].correct ? 'Correct!' : 'Incorrect'}
                  </strong>
                  <p className="mb-0 mt-2">{scenarios[currentStep].options[selectedOption].feedback}</p>
                </div>
              </div>
            </div>
            <div className="text-center loading-container">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <span className="ms-3 text-muted">Loading next question...</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// Main App Component
const DisasterPreparednessApp = () => {
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, earthquake, fire, flood, cyclone, landslide

  const renderCurrentView = () => {
    switch (currentView) {
      case 'earthquake':
        return <EarthquakeDrill onComplete={() => setCurrentView('dashboard')} />;
      case 'fire':
        return <FireDrill onComplete={() => setCurrentView('dashboard')} />;
      case 'flood':
        return <FloodDrill onComplete={() => setCurrentView('dashboard')} />;
      case 'cyclone':
        return <CycloneDrill onComplete={() => setCurrentView('dashboard')} />;
      case 'landslide':
        return <LandslideDrill onComplete={() => setCurrentView('dashboard')} />;
      default:
        return (
          <Dashboard 
            onStartSimulation={() => setCurrentView('earthquake')}
            onStartDrill={() => setCurrentView('fire')}
            onStartFlood={() => setCurrentView('flood')}
            onStartCyclone={() => setCurrentView('cyclone')}
            onStartLandslide={() => setCurrentView('landslide')}
          />
        );
    }
  };

  return (
    <div className="disaster-simulation py-4">
      <div className="container">
        {/* Navigation */}
        {currentView !== 'dashboard' && (
          <div className="mb-4">
            <button 
              className="game-button"
              onClick={() => setCurrentView('dashboard')}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Dashboard
            </button>
          </div>
        )}
        
        {/* Main Content */}
        {renderCurrentView()}
      </div>
    </div>
  );
};

export default DisasterPreparednessApp;