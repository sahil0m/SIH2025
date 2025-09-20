// Assignment Service for managing assignments
class AssignmentService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
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

      console.log('Sending assignment data to:', `${this.baseURL}/assignments/create`);
      
      const response = await fetch(`${this.baseURL}/assignments/create`, {
        method: 'POST',
        body: formData
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        // Check if response is HTML (server error page)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          throw new Error('Server returned HTML instead of JSON. Please check if the backend server is running on port 5000.');
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
        throw new Error('Cannot connect to server. Please ensure the backend server is running on port 5000.');
      }
      
      throw error;
    }
  }

  // Get all assignments
  async getAllAssignments() {
    try {
      const response = await this.request('/assignments');
      return response.data;
    } catch (error) {
      console.error('Failed to get assignments:', error);
      throw error;
    }
  }

  // Get assignments by class
  async getAssignmentsByClass(classId) {
    try {
      const response = await this.request(`/assignments/class/${classId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get assignments by class:', error);
      throw error;
    }
  }

  // Update assignment status
  async updateAssignmentStatus(assignmentId, status) {
    try {
      const response = await this.request(`/assignments/${assignmentId}/status`, {
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
