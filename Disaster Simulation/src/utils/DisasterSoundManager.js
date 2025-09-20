// Disaster Sound Manager for VR/AR Disaster Preparedness App
// Provides realistic sound effects for each disaster type

class DisasterSoundManager {
  constructor() {
    this.sounds = {};
    this.isEnabled = true;
    this.volume = 0.7; // Default volume (0.0 to 1.0)
    this.initializeSounds();
  }

  initializeSounds() {
    // Create audio contexts for each disaster type
    this.sounds = {
      earthquake: this.createEarthquakeSound(),
      fire: this.createFireSound(),
      flood: this.createFloodSound(),
      cyclone: this.createCycloneSound(),
      landslide: this.createLandslideSound(),
      success: this.createChildFriendlySuccessSound(),
      error: this.createChildFriendlyErrorSound()
    };
  }

  // Create realistic earthquake sound using Web Audio API
  createEarthquakeSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const duration = 2.0; // 2 seconds
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate earthquake rumble with multiple frequencies
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      
      // Low frequency rumble (earthquake base)
      const rumble = Math.sin(2 * Math.PI * 15 * t) * 0.3;
      
      // Mid frequency shaking
      const shake = Math.sin(2 * Math.PI * 45 * t) * 0.2;
      
      // High frequency crackling (building stress)
      const crackle = Math.sin(2 * Math.PI * 120 * t) * 0.1;
      
      // Random noise for realism
      const noise = (Math.random() - 0.5) * 0.15;
      
      // Envelope (fade in/out)
      const envelope = Math.sin(Math.PI * t / duration) * Math.sin(Math.PI * t / duration);
      
      data[i] = (rumble + shake + crackle + noise) * envelope * this.volume;
    }

    return { audioContext, buffer };
  }

  // Create realistic fire sound using Web Audio API
  createFireSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const duration = 2.5; // 2.5 seconds
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate fire crackling and roaring
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      
      // Fire roar (low frequency)
      const roar = Math.sin(2 * Math.PI * 80 * t) * 0.25;
      
      // Crackling (high frequency bursts)
      const crackle = Math.sin(2 * Math.PI * 200 * t) * 0.2;
      
      // Hissing (mid frequency)
      const hiss = Math.sin(2 * Math.PI * 150 * t) * 0.15;
      
      // Random fire pops
      const pops = Math.random() > 0.95 ? (Math.random() - 0.5) * 0.3 : 0;
      
      // Envelope (build up and fade out)
      const envelope = Math.min(t / 0.5, 1) * Math.max(0, 1 - (t - 2) / 0.5);
      
      data[i] = (roar + crackle + hiss + pops) * envelope * this.volume;
    }

    return { audioContext, buffer };
  }

  // Create realistic flood sound using Web Audio API
  createFloodSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const duration = 2.5; // 2.5 seconds
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate water rushing and splashing
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      
      // Water rushing (white noise filtered)
      const rushing = (Math.random() - 0.5) * 0.3;
      
      // Water splashing (bursts)
      const splash = Math.sin(2 * Math.PI * 100 * t) * 0.2;
      
      // Water flow (mid frequency)
      const flow = Math.sin(2 * Math.PI * 60 * t) * 0.25;
      
      // Wave sounds
      const waves = Math.sin(2 * Math.PI * 30 * t) * 0.15;
      
      // Envelope (build up like rising water)
      const envelope = Math.min(t / 1.0, 1) * Math.max(0, 1 - (t - 1.5) / 1.0);
      
      data[i] = (rushing + splash + flow + waves) * envelope * this.volume;
    }

    return { audioContext, buffer };
  }

  // Create realistic cyclone sound using Web Audio API
  createCycloneSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const duration = 2.5; // 2.5 seconds
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate wind and storm sounds
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      
      // Wind howling (low frequency)
      const wind = Math.sin(2 * Math.PI * 40 * t) * 0.3;
      
      // Storm intensity (mid frequency)
      const storm = Math.sin(2 * Math.PI * 90 * t) * 0.25;
      
      // Rain and debris (high frequency noise)
      const debris = (Math.random() - 0.5) * 0.2;
      
      // Cyclone rotation effect (frequency modulation)
      const rotation = Math.sin(2 * Math.PI * 70 * t + Math.sin(2 * Math.PI * 5 * t)) * 0.2;
      
      // Envelope (build up like approaching storm)
      const envelope = Math.min(t / 0.8, 1) * Math.max(0, 1 - (t - 1.7) / 0.8);
      
      data[i] = (wind + storm + debris + rotation) * envelope * this.volume;
    }

    return { audioContext, buffer };
  }

  // Create realistic landslide sound using Web Audio API
  createLandslideSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const duration = 2.5; // 2.5 seconds
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate earth movement and debris sounds
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      
      // Earth rumbling (very low frequency)
      const rumble = Math.sin(2 * Math.PI * 25 * t) * 0.3;
      
      // Rocks sliding (mid frequency)
      const sliding = Math.sin(2 * Math.PI * 80 * t) * 0.25;
      
      // Debris falling (high frequency bursts)
      const debris = Math.sin(2 * Math.PI * 180 * t) * 0.2;
      
      // Earth cracking
      const cracking = Math.random() > 0.9 ? (Math.random() - 0.5) * 0.4 : 0;
      
      // Envelope (sudden start, gradual fade)
      const envelope = Math.min(t / 0.3, 1) * Math.max(0, 1 - (t - 1.5) / 1.0);
      
      data[i] = (rumble + sliding + debris + cracking) * envelope * this.volume;
    }

    return { audioContext, buffer };
  }

  // Create child-friendly success sound using Web Audio API
  createChildFriendlySuccessSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const duration = 0.8; // 0.8 seconds - short and cheerful
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate cheerful, bright success sound with marimba-like tones
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      
      // Main melody - ascending chime (C-E-G-C)
      const melody = 
        Math.sin(2 * Math.PI * 261.63 * t) * 0.15 + // C4 - soft
        Math.sin(2 * Math.PI * 329.63 * t) * 0.2 +  // E4 - bright
        Math.sin(2 * Math.PI * 392.00 * t) * 0.2 +  // G4 - bright
        Math.sin(2 * Math.PI * 523.25 * t) * 0.15;  // C5 - soft
      
      // Marimba-like harmonics (wooden, warm tone)
      const marimba = 
        Math.sin(2 * Math.PI * 523.25 * t * 1.5) * 0.1 + // Perfect fifth
        Math.sin(2 * Math.PI * 523.25 * t * 2) * 0.08;   // Octave
      
      // Soft chime sparkle (gentle high frequency)
      const sparkle = Math.sin(2 * Math.PI * 1200 * t) * 0.05;
      
      // Gentle envelope - quick attack, smooth decay
      const envelope = Math.min(t / 0.05, 1) * Math.exp(-t * 3);
      
      data[i] = (melody + marimba + sparkle) * envelope * this.volume * 0.8;
    }

    return { audioContext, buffer };
  }

  // Create child-friendly error sound using Web Audio API
  createChildFriendlyErrorSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const duration = 0.6; // 0.6 seconds - short and gentle
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate gentle, low-pitched error sound with muted xylophone
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      
      // Low-pitched, gentle tone (F3 - lower, softer)
      const baseTone = Math.sin(2 * Math.PI * 174.61 * t) * 0.2; // F3
      
      // Muted xylophone harmonics (wooden, soft)
      const xylophone = 
        Math.sin(2 * Math.PI * 174.61 * t * 1.2) * 0.1 + // Slightly higher
        Math.sin(2 * Math.PI * 174.61 * t * 1.5) * 0.08; // Perfect fifth
      
      // Soft percussion effect (gentle thud)
      const percussion = Math.sin(2 * Math.PI * 80 * t) * 0.1;
      
      // Gentle envelope - soft attack, smooth decay
      const envelope = Math.min(t / 0.1, 1) * Math.exp(-t * 4);
      
      data[i] = (baseTone + xylophone + percussion) * envelope * this.volume * 0.6;
    }

    return { audioContext, buffer };
  }

  // Play disaster sound
  playDisasterSound(disasterType) {
    if (!this.isEnabled || !this.sounds[disasterType]) {
      return;
    }

    try {
      const { audioContext, buffer } = this.sounds[disasterType];
      
      // Resume audio context if suspended (required for user interaction)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();
      
      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Set volume
      gainNode.gain.value = this.volume;
      
      // Play the sound
      source.start(0);
      
      // Clean up after playing
      source.onended = () => {
        source.disconnect();
        gainNode.disconnect();
      };
      
    } catch (error) {
      console.warn('Could not play disaster sound:', error);
    }
  }

  // Enable/disable sounds
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  // Set volume (0.0 to 1.0)
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  // Get current volume
  getVolume() {
    return this.volume;
  }

  // Check if sounds are enabled
  isSoundEnabled() {
    return this.isEnabled;
  }
}

// Create singleton instance
const disasterSoundManager = new DisasterSoundManager();

export default disasterSoundManager;

