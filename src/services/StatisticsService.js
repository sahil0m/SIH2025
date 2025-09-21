// Statistics Service for fetching user dashboard data
import { getCurrentUser } from './AuthService';

import { API_ENDPOINTS } from '../config/api';

class StatisticsService {
  constructor() {
    this.baseURL = API_ENDPOINTS.STATISTICS;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Statistics service error:', error);
      throw error;
    }
  }

  // Get user statistics
  async getUserStatistics(userId) {
    try {
      const response = await this.request(`/statistics/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get user statistics:', error);
      // Return fallback data
      return {
        modulesCompleted: 0,
        drillsCompleted: 0,
        totalPoints: 0,
        preparednessScore: 0
      };
    }
  }

  // Get overall platform statistics
  async getPlatformStatistics() {
    try {
      const response = await this.request('/statistics/platform');
      return response.data;
    } catch (error) {
      console.error('Failed to get platform statistics:', error);
      // Return fallback data
      return {
        totalStudents: 0,
        totalModulesCompleted: 0,
        totalDrillsCompleted: 0,
        averagePreparedness: 0
      };
    }
  }

  // Get current user ID
  getCurrentUserId() {
    try {
      const currentUser = getCurrentUser();
      if (currentUser && currentUser.name) {
        return currentUser.name;
      }
    } catch (error) {
      console.log('AuthService not available, trying localStorage');
    }
    
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        return user.name || user.email || user.displayName || 'demo-user';
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
    
    return 'demo-user';
  }
}

export default new StatisticsService();
