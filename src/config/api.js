// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://disaster-prep-backend.onrender.com';

// Debug log to check environment variable
console.log('🚀 API_BASE_URL:', API_BASE_URL);
console.log('🔧 REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('📅 Deployment timestamp:', new Date().toISOString());
console.log('🔄 Force deployment:', Math.random());
console.log('🌐 Current origin:', window.location.origin);
console.log('🔍 All env vars:', process.env);

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
