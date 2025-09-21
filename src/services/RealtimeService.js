import io from 'socket.io-client';
import { API_ENDPOINTS } from '../config/api';

class RealtimeService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(API_ENDPOINTS.SOCKET, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        cors: {
          origin: [
            "http://localhost:3000",
            "http://localhost:5001", 
            "https://*.vercel.app",
            "https://sih-2025.vercel.app",
            "https://sih-2025-hm4z6k9fd-sahil-dewanis-projects.vercel.app"
          ],
          credentials: true
        }
      });
      
      this.socket.on('connect', () => {
        console.log('✅ Connected to real-time server');
        this.isConnected = true;
      });
      
      this.socket.on('disconnect', () => {
        console.log('❌ Disconnected from real-time server');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
      });
    }
    return this.socket;
  }

  joinRole(role) {
    if (this.socket) {
      this.socket.emit('join-role', role);
    }
  }

  joinInstitution(institution) {
    if (this.socket) {
      this.socket.emit('join-institution', institution);
    }
  }

  onNewAlert(callback) {
    if (this.socket) {
      this.socket.on('newAlert', callback);
    }
  }

  onNewDrillAnnouncement(callback) {
    if (this.socket) {
      this.socket.on('newDrillAnnouncement', callback);
    }
  }

  onNewEmergencyAlert(callback) {
    if (this.socket) {
      this.socket.on('newEmergencyAlert', callback);
    }
  }

  onNewModuleAssignment(callback) {
    if (this.socket) {
      this.socket.on('moduleAssigned', callback);
    }
  }

  onNewDrillConfirmation(callback) {
    if (this.socket) {
      this.socket.on('drillConfirmed', callback);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

export default new RealtimeService();