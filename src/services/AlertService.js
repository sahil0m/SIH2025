// Alert Service for MongoDB backend integration
// This service handles all alert-related operations
import { API_ENDPOINTS } from '../config/api';

class AlertService {
  constructor() {
    this.baseURL = API_ENDPOINTS.ALERTS;
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` })
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('Alert API Error:', error);
      throw error;
    }
  }

  // Create new alert
  async createAlert(alertData) {
    try {
      const response = await this.request('/alerts', {
        method: 'POST',
        body: JSON.stringify(alertData)
      });

      // Simulate real-time notification
      this.simulateRealTimeAlert(response.data);

      return response;
    } catch (error) {
      throw new Error('Failed to create alert: ' + error.message);
    }
  }

  // Get alerts with region filtering
  async getAlerts(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const url = `/alerts${queryString ? `?${queryString}` : ''}`;
      const response = await this.request(url);
      return response;
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw new Error('Failed to fetch alerts: ' + error.message);
    }
  }

  // Get alert by ID
  async getAlertById(alertId) {
    try {
      return await this.request(`/alerts/${alertId}`);
    } catch (error) {
      throw new Error('Failed to fetch alert: ' + error.message);
    }
  }

  // Update alert
  async updateAlert(alertId, updateData) {
    try {
      return await this.request(`/alerts/${alertId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
    } catch (error) {
      throw new Error('Failed to update alert: ' + error.message);
    }
  }

  // Delete alert
  async deleteAlert(alertId) {
    try {
      return await this.request(`/alerts/${alertId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      throw new Error('Failed to delete alert: ' + error.message);
    }
  }

  // Get alerts by region
  async getAlertsByRegion(region) {
    return this.getAlerts({ region });
  }

  // Get alert statistics
  async getAlertStats() {
    try {
      const response = await this.request('/alerts/stats');
      return response;
    } catch (error) {
      console.error('Error fetching alert stats:', error);
      throw new Error('Failed to fetch alert statistics: ' + error.message);
    }
  }

  // Simulate real-time alert notification
  simulateRealTimeAlert(alert) {
    // Create a custom event for real-time notification
    const event = new CustomEvent('newAlert', {
      detail: {
        type: 'alert',
        id: alert.id,
        title: alert.title,
        description: alert.description,
        alertType: alert.alertType,
        severity: alert.severity,
        region: alert.region,
        affectedAreas: alert.affectedAreas,
        validFrom: alert.validFrom,
        validUntil: alert.validUntil,
        createdAt: alert.createdAt
      }
    });
    
    window.dispatchEvent(event);
    
    // Also show browser notification if permission is granted
    if (Notification.permission === 'granted') {
      new Notification(`New Alert: ${alert.title}`, {
        body: alert.description,
        icon: '/favicon.ico',
        tag: 'alert-notification'
      });
    }
  }

  // Get current user ID (mock implementation)
  getCurrentUserId() {
    return localStorage.getItem('userId') || 'admin-user';
  }

  // Subscribe to real-time alerts
  subscribeToAlerts(callback) {
    const handleNewAlert = (event) => {
      callback(event.detail);
    };

    window.addEventListener('newAlert', handleNewAlert);
    
    // Return unsubscribe function
    return () => {
      window.removeEventListener('newAlert', handleNewAlert);
    };
  }
}

export default new AlertService();
