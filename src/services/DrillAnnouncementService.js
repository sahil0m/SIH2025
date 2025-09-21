// Mock service for drill announcements
// In production, this would connect to your MongoDB backend
import { API_ENDPOINTS } from '../config/api';

class DrillAnnouncementService {
  constructor() {
    this.baseURL = API_ENDPOINTS.DRILLS;
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
      console.error('Drill Announcement API Error:', error);
      throw error;
    }
  }

  // Send drill announcement
  async sendDrillAnnouncement(announcementData) {
    try {
      const response = await this.request('/drill-announcements', {
        method: 'POST',
        body: JSON.stringify(announcementData)
      });

      // Simulate real-time notification
      this.simulateRealTimeNotification(response.data);

      return response;
    } catch (error) {
      throw new Error('Failed to send drill announcement: ' + error.message);
    }
  }

  // Get drill announcements for teacher
  async getTeacherAnnouncements(teacherId) {
    try {
      const response = await this.request(`/drill-announcements?teacherId=${teacherId}`);
      return response.data.announcements;
    } catch (error) {
      throw new Error('Failed to fetch announcements: ' + error.message);
    }
  }

  // Get drill announcements for students
  async getStudentAnnouncements(studentId) {
    try {
      const response = await this.request('/drill-announcements');
      return response.data.announcements;
    } catch (error) {
      throw new Error('Failed to fetch announcements: ' + error.message);
    }
  }

  // Simulate real-time notification
  simulateRealTimeNotification(announcement) {
    // Create a custom event to simulate real-time notification
    const event = new CustomEvent('drillAnnouncement', {
      detail: {
        type: 'drill_announcement',
        title: announcement.title,
        message: announcement.message,
        drillType: announcement.drillType,
        priority: announcement.priority,
        teacherName: announcement.teacherName,
        sentAt: announcement.sentAt
      }
    });
    
    window.dispatchEvent(event);
    
    // Also show browser notification if permission is granted
    if (Notification.permission === 'granted') {
      new Notification(`Drill Announcement: ${announcement.title}`, {
        body: announcement.message,
        icon: '/favicon.ico',
        tag: 'drill-announcement'
      });
    }
  }

  // Request notification permission
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Get announcement statistics
  async getAnnouncementStats(teacherId) {
    try {
      const announcements = JSON.parse(localStorage.getItem('drillAnnouncements') || '[]');
      const teacherAnnouncements = announcements.filter(a => a.teacherId === teacherId);
      
      const stats = {
        total: teacherAnnouncements.length,
        thisWeek: teacherAnnouncements.filter(a => {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return new Date(a.sentAt) > weekAgo;
        }).length,
        byType: {},
        byPriority: {}
      };

      teacherAnnouncements.forEach(announcement => {
        // Count by drill type
        stats.byType[announcement.drillType] = (stats.byType[announcement.drillType] || 0) + 1;
        
        // Count by priority
        stats.byPriority[announcement.priority] = (stats.byPriority[announcement.priority] || 0) + 1;
      });

      return stats;
    } catch (error) {
      throw new Error('Failed to fetch announcement stats: ' + error.message);
    }
  }
}

export default new DrillAnnouncementService();
