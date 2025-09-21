// Points Service for managing user points and leaderboard
import { getCurrentUser } from './AuthService';

import { API_ENDPOINTS } from '../config/api';

class PointsService {
  constructor() {
    this.baseURL = API_ENDPOINTS.POINTS;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error('Points service error:', error);
      throw error;
    }
  }

  // Award points to user for watching a video
  async awardPoints(userId, videoId, videoType, completionPercentage) {
    try {
      console.log('🎯 Awarding points:', { userId, videoId, videoType, completionPercentage });
      
      const response = await this.request('/points/award', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          videoId,
          videoType,
          completionPercentage
        })
      });
      
      console.log('✅ Points API response:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to award points:', error);
      throw error;
    }
  }

  // Get current logged-in user ID
  getCurrentUserId() {
    // Try to get from AuthService first (most reliable)
    try {
      const currentUser = getCurrentUser();
      
      if (currentUser && currentUser.name) {
        console.log('👤 Using AuthService user ID:', currentUser.name);
        return currentUser.name;
      }
    } catch (error) {
      console.log('AuthService not available, trying localStorage');
    }
    
    // Try to get from localStorage as fallback
    const storedUser = localStorage.getItem('user');
    console.log('🔍 Stored user data:', storedUser);
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const userId = user.name || user.email || user.displayName || 'demo-user';
        console.log('👤 Using localStorage user ID:', userId);
        return userId;
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
    
    // Fallback to demo user
    console.log('👤 Using fallback user ID: demo-user');
    return 'demo-user';
  }

  // Get user's total points
  async getUserPoints(userId) {
    try {
      const response = await this.request(`/points/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get user points:', error);
      throw error;
    }
  }

  // Get points for a specific video
  async getVideoPoints(userId, videoId) {
    try {
      const response = await this.request(`/points/video/${userId}/${videoId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get video points:', error);
      return { points: 0, completionPercentage: 0 };
    }
  }

  // Get leaderboard
  async getLeaderboard(limit = 10) {
    try {
      const response = await this.request(`/leaderboard?limit=${limit}`);
      return response.data.leaderboard;
    } catch (error) {
      console.error('Failed to get leaderboard:', error);
      throw error;
    }
  }

  // Generate unique video ID for drill videos
  generateDrillVideoId(drillType, videoTitle) {
    return `drill-${drillType}-${videoTitle.toLowerCase().replace(/\s+/g, '-')}`;
  }

  // Generate unique video ID for module videos
  generateModuleVideoId(moduleType, videoTitle) {
    return `module-${moduleType}-${videoTitle.toLowerCase().replace(/\s+/g, '-')}`;
  }

  // Helper to generate unique video IDs for assignments
  generateAssignmentId(assignmentId, title) {
    return `assignment-${assignmentId}-${title.toLowerCase().replace(/\s/g, '-')}`;
  }
}

export default new PointsService();
