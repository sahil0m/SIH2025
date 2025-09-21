const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const server = createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000", 
      "http://localhost:5001",
      "https://*.vercel.app",
      "https://sih-2025.vercel.app"
    ],
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5001',
    'https://*.vercel.app',
    'https://sih-2025.vercel.app',
    'https://sih-2025-hm4z6k9fd-sahil-dewanis-projects.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

// Handle CORS preflight requests
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
  } else {
    next();
  }
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/disaster-prep';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
})
.catch((error) => {
  console.error('❌ MongoDB Connection Error:', error);
});

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'backend', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'backend', 'uploads')));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Disaster Prep API Server is running!',
    status: 'OK',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    endpoints: [
      'GET /api/health - Health check',
      'POST /api/points/award - Award points',
      'GET /api/points/user/:userId - Get user points',
      'GET /api/leaderboard - Get leaderboard',
      'GET /api/drill-announcements - Get drill announcements',
      'GET /api/emergency-alerts - Get emergency alerts',
      'GET /api/teacher-actions/assigned-modules - Get assigned modules',
      'GET /api/teacher-actions/confirmed-drills - Get confirmed drills',
      'GET /api/statistics/platform - Get platform statistics',
      'GET /api/statistics/user/:userId - Get user statistics',
      'GET /api/assignments - Get assignments'
    ]
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      fileUrl: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Points routes
app.post('/api/points/award', async (req, res) => {
  try {
    const { userId, points, source, videoId, completionPercentage } = req.body;
    
    if (!userId || !points || !source) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const UserPoints = mongoose.model('UserPoints', new mongoose.Schema({
      userId: String,
      points: Number,
      source: String,
      videoId: String,
      completionPercentage: Number,
      createdAt: { type: Date, default: Date.now }
    }));

    // Check if points already awarded for this video
    if (videoId) {
      const existingPoints = await UserPoints.findOne({ userId, videoId });
      if (existingPoints) {
        return res.json({ 
          success: true, 
          message: 'Points already awarded for this video',
          totalPoints: await UserPoints.aggregate([
            { $match: { userId } },
            { $group: { _id: null, total: { $sum: '$points' } } }
          ]).then(result => result[0]?.total || 0)
        });
      }
    }

    // Award points
    const userPoints = new UserPoints({
      userId,
      points,
      source,
      videoId,
      completionPercentage
    });

    await userPoints.save();

    // Get total points for user
    const totalPoints = await UserPoints.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: '$points' } } }
    ]);

    res.json({ 
      success: true, 
      message: 'Points awarded successfully',
      totalPoints: totalPoints[0]?.total || 0
    });

  } catch (error) {
    console.error('Error awarding points:', error);
    res.status(500).json({ error: 'Failed to award points' });
  }
});

app.get('/api/points/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const UserPoints = mongoose.model('UserPoints', new mongoose.Schema({
      userId: String,
      points: Number,
      source: String,
      videoId: String,
      completionPercentage: Number,
      createdAt: { type: Date, default: Date.now }
    }));

    const userPoints = await UserPoints.find({ userId }).sort({ createdAt: -1 });
    const totalPoints = userPoints.reduce((sum, point) => sum + point.points, 0);

    res.json({ 
      success: true, 
      data: {
        userId,
        totalPoints,
        points: userPoints
      }
    });

  } catch (error) {
    console.error('Error fetching user points:', error);
    res.status(500).json({ error: 'Failed to fetch user points' });
  }
});

// Alternative points endpoint for compatibility (without /api prefix)
app.get('/points/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Return mock data for now to prevent errors
    res.json({ 
      success: true, 
      data: {
        userId,
        totalPoints: 0,
        points: []
      }
    });

  } catch (error) {
    console.error('Error fetching user points:', error);
    res.status(500).json({ error: 'Failed to fetch user points' });
  }
});

app.get('/api/leaderboard', (req, res) => {
  try {
    // Return mock leaderboard data
    const mockLeaderboard = [
      { userId: 'Sahil dewani', totalPoints: 150, videosWatched: 3 },
      { userId: 'John Doe', totalPoints: 100, videosWatched: 2 },
      { userId: 'Jane Smith', totalPoints: 75, videosWatched: 1 }
    ];

    res.json({ 
      success: true, 
      data: mockLeaderboard
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Drill announcements routes
app.get('/api/drill-announcements', async (req, res) => {
  try {
    // Return mock drill announcements data
    const mockAnnouncements = [
      {
        _id: 'drill-1',
        title: 'Monthly Earthquake Drill',
        message: 'Practice earthquake safety procedures including evacuation and assembly point procedures.',
        drillType: 'earthquake',
        priority: 'normal',
        targetClasses: ['CS-101', 'CS-102'],
        teacherName: 'Ms. Priya Sharma',
        createdAt: new Date().toISOString()
      },
      {
        _id: 'drill-2',
        title: 'Fire Safety Drill',
        message: 'Emergency evacuation drill to test fire safety procedures and assembly point protocols.',
        drillType: 'fire',
        priority: 'high',
        targetClasses: ['CS-101'],
        teacherName: 'Mr. Rajesh Kumar',
        createdAt: new Date().toISOString()
      }
    ];

    res.json({ 
      success: true, 
      data: { announcements: mockAnnouncements }
    });

  } catch (error) {
    console.error('Error fetching drill announcements:', error);
    res.status(500).json({ error: 'Failed to fetch drill announcements' });
  }
});

app.post('/api/drill-announcements', async (req, res) => {
  try {
    const announcementData = req.body;
    
    const DrillAnnouncement = mongoose.model('DrillAnnouncement', new mongoose.Schema({
      title: String,
      message: String,
      drillType: String,
      priority: String,
      targetClasses: [String],
      teacherId: String,
      teacherName: String,
      institution: String,
      createdAt: { type: Date, default: Date.now },
      status: String
    }));

    const announcement = new DrillAnnouncement(announcementData);
    await announcement.save();

    res.json({ 
      success: true, 
      message: 'Drill announcement created successfully',
      data: announcement
    });

  } catch (error) {
    console.error('Error creating drill announcement:', error);
    res.status(500).json({ error: 'Failed to create drill announcement' });
  }
});

// Emergency alerts routes
app.get('/api/emergency-alerts', async (req, res) => {
  try {
    // Return mock emergency alerts data
    const mockAlerts = [
      {
        _id: 'alert-1',
        title: 'Earthquake Alert',
        description: 'Moderate earthquake detected in your region',
        alertType: 'earthquake',
        severity: 'medium',
        region: 'Delhi',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        _id: 'alert-2',
        title: 'Flood Warning',
        description: 'Heavy rainfall expected, flood warning issued',
        alertType: 'flood',
        severity: 'high',
        region: 'Mumbai',
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];

    res.json({ 
      success: true, 
      data: { alerts: mockAlerts }
    });

  } catch (error) {
    console.error('Error fetching emergency alerts:', error);
    res.status(500).json({ error: 'Failed to fetch emergency alerts' });
  }
});

app.post('/api/emergency-alerts', async (req, res) => {
  try {
    const alertData = req.body;
    
    const EmergencyAlert = mongoose.model('EmergencyAlert', new mongoose.Schema({
      title: String,
      description: String,
      alertType: String,
      severity: String,
      region: String,
      coordinates: {
        lat: String,
        lng: String
      },
      affectedAreas: [String],
      validFrom: Date,
      validUntil: Date,
      isActive: Boolean,
      priority: String,
      createdAt: { type: Date, default: Date.now },
      createdBy: String,
      status: String
    }));

    const alert = new EmergencyAlert(alertData);
    await alert.save();

    res.json({ 
      success: true, 
      message: 'Emergency alert created successfully',
      data: alert
    });

  } catch (error) {
    console.error('Error creating emergency alert:', error);
    res.status(500).json({ error: 'Failed to create emergency alert' });
  }
});

// Statistics routes
app.get('/api/statistics/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    // Return mock data for now to prevent errors
    res.json({ 
      success: true, 
      data: {
        modulesCompleted: 5,
        drillsCompleted: 3,
        totalPoints: 150,
        preparednessScore: 75
      }
    });

  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

app.get('/api/statistics/platform', (req, res) => {
  try {
    // Return mock data for now to prevent errors
    res.json({ 
      success: true, 
      data: {
        totalStudents: 25,
        totalModulesCompleted: 120,
        totalDrillsCompleted: 45,
        averagePreparedness: 68
      }
    });

  } catch (error) {
    console.error('Error fetching platform statistics:', error);
    res.status(500).json({ error: 'Failed to fetch platform statistics' });
  }
});

// Mailing list routes
app.post('/api/mailing-list/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const MailingList = mongoose.model('MailingList', new mongoose.Schema({
      email: String,
      subscribedAt: { type: Date, default: Date.now }
    }));

    // Check if email already exists
    const existingEmail = await MailingList.findOne({ email });
    if (existingEmail) {
      return res.json({ 
        success: true, 
        message: 'Email already subscribed' 
      });
    }

    const mailingEntry = new MailingList({ email });
    await mailingEntry.save();

    res.json({ 
      success: true, 
      message: 'Successfully subscribed to mailing list' 
    });

  } catch (error) {
    console.error('Error subscribing to mailing list:', error);
    res.status(500).json({ error: 'Failed to subscribe to mailing list' });
  }
});

// Teacher actions routes
app.get('/api/teacher-actions/assigned-modules', async (req, res) => {
  try {
    // Mock assigned modules data
    const mockModules = [
      {
        _id: 'sample-1',
        title: 'Earthquake Safety Basics',
        description: 'Learn the fundamental safety procedures during an earthquake including the Drop, Cover, and Hold technique.',
        dueDate: '2024-01-15',
        estimatedTime: '15 min'
      },
      {
        _id: 'sample-2',
        title: 'Fire Evacuation Procedures',
        description: 'Comprehensive guide on fire safety, evacuation routes, and emergency response procedures.',
        dueDate: '2024-01-20',
        estimatedTime: '20 min'
      }
    ];

    res.json({ 
      success: true, 
      data: mockModules
    });

  } catch (error) {
    console.error('Error fetching assigned modules:', error);
    res.status(500).json({ error: 'Failed to fetch assigned modules' });
  }
});

app.get('/api/teacher-actions/confirmed-drills', async (req, res) => {
  try {
    // Mock confirmed drills data
    const mockDrills = [
      {
        _id: 'drill-1',
        title: 'Monthly Earthquake Drill',
        description: 'Practice earthquake safety procedures including evacuation and assembly point procedures.',
        scheduledDate: '2024-01-25',
        scheduledTime: '10:00',
        location: 'Main Campus'
      },
      {
        _id: 'drill-2',
        title: 'Fire Safety Drill',
        description: 'Emergency evacuation drill to test fire safety procedures and assembly point protocols.',
        scheduledDate: '2024-01-30',
        scheduledTime: '14:00',
        location: 'Science Building'
      }
    ];

    res.json({ 
      success: true, 
      data: mockDrills
    });

  } catch (error) {
    console.error('Error fetching confirmed drills:', error);
    res.status(500).json({ error: 'Failed to fetch confirmed drills' });
  }
});

app.post('/api/teacher-actions/confirmed-drills', async (req, res) => {
  try {
    const drillData = req.body;
    
    const ConfirmedDrill = mongoose.model('ConfirmedDrill', new mongoose.Schema({
      drillType: String,
      date: String,
      time: String,
      venue: String,
      teacherId: String,
      teacherName: String,
      createdAt: { type: Date, default: Date.now }
    }));

    const drill = new ConfirmedDrill(drillData);
    await drill.save();

    res.json({ 
      success: true, 
      message: 'Drill confirmed successfully',
      data: drill
    });

  } catch (error) {
    console.error('Error confirming drill:', error);
    res.status(500).json({ error: 'Failed to confirm drill' });
  }
});

// Assignment routes
app.get('/api/assignments', async (req, res) => {
  try {
    // Mock assignments data
    const mockAssignments = [
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

    res.json({ 
      success: true, 
      data: mockAssignments
    });

  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

app.post('/api/assignments', async (req, res) => {
  try {
    const assignmentData = req.body;
    
    const Assignment = mongoose.model('Assignment', new mongoose.Schema({
      title: String,
      description: String,
      dueDate: Date,
      pdfFile: String,
      teacherId: String,
      teacherName: String,
      createdAt: { type: Date, default: Date.now },
      status: String
    }));

    const assignment = new Assignment(assignmentData);
    await assignment.save();

    res.json({ 
      success: true, 
      message: 'Assignment created successfully',
      data: assignment
    });

  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});


// Additional missing API routes
app.get('/api/points/video/:userId/:videoId', async (req, res) => {
  try {
    const { userId, videoId } = req.params;
    
    // Return mock data for video points
    res.json({
      success: true,
      data: {
        userId,
        videoId,
        points: 0,
        completed: false,
        completionPercentage: 0
      }
    });
  } catch (error) {
    console.error('Error fetching video points:', error);
    res.status(500).json({ error: 'Failed to fetch video points' });
  }
});

app.get('/api/alerts/stats', async (req, res) => {
  try {
    // Return mock alert stats
    res.json({
      success: true,
      data: {
        totalAlerts: 5,
        activeAlerts: 2,
        resolvedAlerts: 3,
        highPriority: 1,
        mediumPriority: 2,
        lowPriority: 2
      }
    });
  } catch (error) {
    console.error('Error fetching alert stats:', error);
    res.status(500).json({ error: 'Failed to fetch alert stats' });
  }
});

app.get('/api/alerts', async (req, res) => {
  try {
    const { region, alertType, severity, page = 1, limit = 10 } = req.query;
    
    // Return mock alerts data
    const mockAlerts = [
      {
        _id: 'alert-1',
        title: 'Earthquake Alert',
        description: 'Moderate earthquake detected in your region',
        alertType: 'earthquake',
        severity: 'medium',
        region: 'Delhi',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        _id: 'alert-2',
        title: 'Flood Warning',
        description: 'Heavy rainfall expected, flood warning issued',
        alertType: 'flood',
        severity: 'high',
        region: 'Mumbai',
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: {
        alerts: mockAlerts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: mockAlerts.length,
          pages: Math.ceil(mockAlerts.length / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// 404 handler - catch all unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 MongoDB Status: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
});

module.exports = app;