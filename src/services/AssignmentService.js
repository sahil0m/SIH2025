// Assignment Service for managing assignments
import { API_ENDPOINTS } from '../config/api';

class AssignmentService {
  constructor() {
    this.baseURL = API_ENDPOINTS.ASSIGNMENTS;
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
      console.error('Assignment service error:', error);
      throw error;
    }
  }

  // Create assignment
  async createAssignment(assignmentData) {
    try {
      const formData = new FormData();
      formData.append('title', assignmentData.title);
      formData.append('description', assignmentData.description);
      formData.append('classId', assignmentData.classId);
      formData.append('dueDate', assignmentData.dueDate);
      formData.append('instructions', assignmentData.instructions);
      formData.append('teacherName', assignmentData.teacherName);
      
      if (assignmentData.pdfFile) {
        formData.append('pdfFile', assignmentData.pdfFile);
      }

      // FIXED: Use /create endpoint instead of /assignments/create
      console.log('Sending assignment data to:', `${this.baseURL}/create`);
      
      const response = await fetch(`${this.baseURL}/create`, {
        method: 'POST',
        body: formData
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        // Check if response is HTML (server error page)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          throw new Error('Server returned HTML instead of JSON. Please check if the backend server is running.');
        }
        
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create assignment');
        } catch (jsonError) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
      }

      const result = await response.json();
      console.log('Assignment created successfully:', result);
      return result;
    } catch (error) {
      console.error('Failed to create assignment:', error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please ensure the backend server is running.');
      }
      
      throw error;
    }
  }

  // Get all assignments - FIXED: Use empty endpoint since baseURL already has /api/assignments
  async getAllAssignments() {
    try {
      const response = await this.request('');
      return response.data || [];
    } catch (error) {
      console.error('Failed to get assignments:', error);
      // Return sample data for testing
      return [
        {
          _id: 'assign-1',
          title: 'Disaster Preparedness Research',
          description: 'Research and write a report on disaster preparedness strategies for your region.',
          dueDate: '2024-02-01',
          classId: 'CS-101',
          pdfFile: null
        },
        {
          _id: 'assign-2',
          title: 'Emergency Response Plan',
          description: 'Create a comprehensive emergency response plan for your household.',
          dueDate: '2024-02-05',
          classId: 'CS-102',
          pdfFile: '/uploads/sample-assignment.pdf'
        }
      ];
    }
  }

  // Get assignments by class - FIXED: Use /class/:classId endpoint
  async getAssignmentsByClass(classId) {
    try {
      const response = await this.request(`/class/${classId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get assignments by class:', error);
      throw error;
    }
  }

  // Update assignment status - FIXED: Use correct endpoint path
  async updateAssignmentStatus(assignmentId, status) {
    try {
      const response = await this.request(`/${assignmentId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      return response;
    } catch (error) {
      console.error('Failed to update assignment status:', error);
      throw error;
    }
  }
}

export default new AssignmentService();