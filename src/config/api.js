// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://disaster-prep-backend.onrender.com';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: `${API_BASE_URL}/api/auth`,
  
  // Points endpoints
  POINTS: `${API_BASE_URL}/api/points`,
  
  // Statistics endpoints
  STATISTICS: `${API_BASE_URL}/api/statistics`,
  
  // Alert endpoints
  ALERTS: `${API_BASE_URL}/api/emergency-alerts`,
  
  // Drill endpoints
  DRILLS: `${API_BASE_URL}/api/drill-announcements`,
  
  // Teacher actions endpoints
  TEACHER_ACTIONS: `${API_BASE_URL}/api/teacher-actions`,
  
  // Assignment endpoints
  ASSIGNMENTS: `${API_BASE_URL}/api/assignments`,
  
  // Upload endpoints
  UPLOAD: `${API_BASE_URL}/api/upload`,
  
  // Mailing list endpoints
  MAILING: `${API_BASE_URL}/api/mailing-list`,
  
  // File serving
  FILES: `${API_BASE_URL}`,
  
  // Socket connection
  SOCKET: API_BASE_URL
};

export default API_BASE_URL;
