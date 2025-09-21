// Service for handling teacher actions that affect students
import { toast } from 'react-toastify';

import { API_ENDPOINTS } from '../config/api';

class TeacherActionsService {
  constructor() {
    this.baseURL = API_ENDPOINTS.TEACHER_ACTIONS;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json'
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
      console.error('Teacher Actions API Error:', error);
      throw error;
    }
  }

  // Assign module to classes
  async assignModule(moduleData) {
    try {
      const response = await this.request('/teacher-actions/assign-module', {
        method: 'POST',
        body: JSON.stringify(moduleData)
      });

      // Simulate real-time notification
      this.simulateModuleAssignment(moduleData);

      return response;
    } catch (error) {
      throw new Error('Failed to assign module: ' + error.message);
    }
  }

  // Confirm drill slot
  async confirmDrill(drillData) {
    try {
      const response = await this.request('/teacher-actions/confirm-drill', {
        method: 'POST',
        body: JSON.stringify(drillData)
      });

      // Simulate real-time notification
      this.simulateDrillConfirmation(drillData);

      return response;
    } catch (error) {
      throw new Error('Failed to confirm drill: ' + error.message);
    }
  }

  // Get assigned modules for students
  async getAssignedModules() {
    try {
      console.log('Fetching assigned modules from:', `${this.baseURL}/teacher-actions/assigned-modules`);
      const response = await this.request('/teacher-actions/assigned-modules');
      console.log('Assigned modules response:', response);
      return response.data?.modules || [];
    } catch (error) {
      console.error('Failed to fetch assigned modules:', error);
      // Return sample data for testing
      return [
        {
          _id: 'sample-1',
          title: "Earthquake Safety Basics",
          description: "Learn the fundamental safety procedures during an earthquake including the Drop, Cover, and Hold technique.",
          dueDate: "2024-01-15",
          estimatedTime: "15 minutes",
          targetClasses: ["Class 9", "Class 10", "Class 11", "Class 12"],
          teacherName: "Dr. Sarah Johnson",
          files: {
            video: {
              originalName: "earthquake-safety-basics.mp4",
              filename: "earthquake-safety-basics.mp4",
              size: 15728640,
              type: "video/mp4",
              url: `${API_ENDPOINTS.FILES}/uploads/earthquake-safety-basics.mp4`
            },
            pdf: {
              originalName: "earthquake-safety-guide.pdf",
              filename: "earthquake-safety-guide.pdf",
              size: 2048576,
              type: "application/pdf",
              url: `${API_ENDPOINTS.FILES}/uploads/earthquake-safety-guide.pdf`
            }
          },
          type: "module_assignment",
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: 'sample-2',
          title: "Fire Evacuation Procedures",
          description: "Comprehensive guide on fire safety, evacuation routes, and emergency response procedures.",
          dueDate: "2024-01-20",
          estimatedTime: "20 minutes",
          targetClasses: ["Class 8", "Class 9", "Class 10"],
          teacherName: "Prof. Michael Chen",
          files: {
            video: {
              originalName: "fire-evacuation-procedures.mp4",
              filename: "fire-evacuation-procedures.mp4",
              size: 25165824,
              type: "video/mp4",
              url: `${API_ENDPOINTS.FILES}/uploads/fire-evacuation-procedures.mp4`
            }
          },
          type: "module_assignment",
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
    }
  }

  // Get confirmed drills for students
  async getConfirmedDrills() {
    try {
      console.log('Fetching confirmed drills from:', `${this.baseURL}/teacher-actions/confirmed-drills`);
      const response = await this.request('/teacher-actions/confirmed-drills');
      console.log('Confirmed drills response:', response);
      return response.data?.drills || [];
    } catch (error) {
      console.error('Failed to fetch confirmed drills:', error);
      // Return sample data for testing
      return [
        {
          _id: 'drill-1',
          title: "Monthly Earthquake Drill",
          description: "Practice earthquake safety procedures including evacuation and assembly point procedures.",
          scheduledDate: "2024-01-25",
          scheduledTime: "10:00",
          location: "Main Assembly Hall",
          drillType: "Earthquake",
          targetClasses: ["All Classes"],
          teacherName: "Dr. Sarah Johnson",
          type: "drill_confirmation",
          status: "confirmed",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: 'drill-2',
          title: "Fire Safety Drill",
          description: "Emergency evacuation drill to test fire safety procedures and assembly point protocols.",
          scheduledDate: "2024-01-30",
          scheduledTime: "14:30",
          location: "School Grounds",
          drillType: "Fire Safety",
          targetClasses: ["Class 9", "Class 10", "Class 11", "Class 12"],
          teacherName: "Prof. Michael Chen",
          type: "drill_confirmation",
          status: "confirmed",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
    }
  }

  // Simulate real-time module assignment notification
  simulateModuleAssignment(moduleData) {
    const event = new CustomEvent('moduleAssigned', {
      detail: {
        type: 'module_assignment',
        title: moduleData.title,
        description: moduleData.description,
        dueDate: moduleData.dueDate,
        estimatedTime: moduleData.estimatedTime,
        targetClasses: moduleData.targetClasses,
        teacherName: moduleData.teacherName,
        files: moduleData.files || {},
        assignedAt: new Date().toISOString()
      }
    });
    
    window.dispatchEvent(event);
    
    // Also show browser notification if permission is granted
    if (Notification.permission === 'granted') {
      new Notification(`New Module Assigned: ${moduleData.title}`, {
        body: `Due: ${moduleData.dueDate} • Estimated time: ${moduleData.estimatedTime}`,
        icon: '/favicon.ico',
        tag: 'module-assignment'
      });
    }
  }

  // Simulate real-time drill confirmation notification
  simulateDrillConfirmation(drillData) {
    const event = new CustomEvent('drillConfirmed', {
      detail: {
        type: 'drill_confirmation',
        title: drillData.title,
        description: drillData.description,
        scheduledDate: drillData.scheduledDate,
        scheduledTime: drillData.scheduledTime,
        location: drillData.location,
        drillType: drillData.drillType,
        targetClasses: drillData.targetClasses,
        teacherName: drillData.teacherName,
        confirmedAt: new Date().toISOString()
      }
    });
    
    window.dispatchEvent(event);
    
    // Also show browser notification if permission is granted
    if (Notification.permission === 'granted') {
      new Notification(`Drill Confirmed: ${drillData.title}`, {
        body: `Date: ${drillData.scheduledDate} at ${drillData.scheduledTime} • Location: ${drillData.location}`,
        icon: '/favicon.ico',
        tag: 'drill-confirmation'
      });
    }
  }
}

export default new TeacherActionsService();