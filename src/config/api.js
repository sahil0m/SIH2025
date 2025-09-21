// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://disaster-prep-backend.onrender.com';

// Force the correct URL for production
const PRODUCTION_API_URL = 'https://disaster-prep-backend.onrender.com';
const FINAL_API_URL = API_BASE_URL.includes('localhost') ? PRODUCTION_API_URL : API_BASE_URL;

// Debug log to check environment variable
console.log('🚀 API_BASE_URL:', API_BASE_URL);
console.log('🔧 REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('🌐 FINAL_API_URL:', FINAL_API_URL);
console.log('📅 Deployment timestamp:', new Date().toISOString());
console.log('🔄 Force deployment:', Math.random());
console.log('🌐 Current origin:', window.location.origin);

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: `${FINAL_API_URL}/api/auth`,
  
  // Points endpoints
  POINTS: `${FINAL_API_URL}/api/points`,
  
  // Statistics endpoints
  STATISTICS: `${FINAL_API_URL}/api/statistics`,
  
  // Alert endpoints
  ALERTS: `${FINAL_API_URL}/api/emergency-alerts`,
  
  // Drill endpoints
  DRILLS: `${FINAL_API_URL}/api/drill-announcements`,
  
  // Teacher actions endpoints
  TEACHER_ACTIONS: `${FINAL_API_URL}/api/teacher-actions`,
  
  // Assignment endpoints
  ASSIGNMENTS: `${FINAL_API_URL}/api/assignments`,
  
  // Upload endpoints
  UPLOAD: `${FINAL_API_URL}/api/upload`,
  
  // Mailing list endpoints
  MAILING: `${FINAL_API_URL}/api/mailing-list`,
  
  // File serving
  FILES: `${FINAL_API_URL}`,
  
  // Socket connection
  SOCKET: FINAL_API_URL
};

export default FINAL_API_URL;
