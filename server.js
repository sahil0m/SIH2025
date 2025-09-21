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
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
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
      'GET /api/emergency-alerts - Get emergency alerts'
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

app.get('/api/leaderboard', async (req, res) => {
  try {
    const UserPoints = mongoose.model('UserPoints', new mongoose.Schema({
      userId: String,
      points: Number,
      source: String,
      videoId: String,
      completionPercentage: Number,
      createdAt: { type: Date, default: Date.now }
    }));

    const leaderboard = await UserPoints.aggregate([
      {
        $group: {
          _id: '$userId',
          totalPoints: { $sum: '$points' },
          videosWatched: { $sum: 1 }
        }
      },
      { $sort: { totalPoints: -1 } },
      { $limit: 50 }
    ]);

    res.json({ 
      success: true, 
      data: leaderboard
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Drill announcements routes
app.get('/api/drill-announcements', async (req, res) => {
  try {
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

    const announcements = await DrillAnnouncement.find().sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      data: { announcements }
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

    const alerts = await EmergencyAlert.find().sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      data: { alerts }
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
app.get('/api/statistics/user/:userId', async (req, res) => {
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

    const userPoints = await UserPoints.find({ userId });
    const totalPoints = userPoints.reduce((sum, point) => sum + point.points, 0);
    const modulesCompleted = userPoints.filter(point => point.source === 'module_completion').length;
    const drillsCompleted = userPoints.filter(point => point.source === 'drill_completion').length;
    const preparednessScore = Math.min(100, Math.floor(totalPoints / 10));

    res.json({ 
      success: true, 
      data: {
        modulesCompleted,
        drillsCompleted,
        totalPoints,
        preparednessScore
      }
    });

  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

app.get('/api/statistics/platform', async (req, res) => {
  try {
    const UserPoints = mongoose.model('UserPoints', new mongoose.Schema({
      userId: String,
      points: Number,
      source: String,
      videoId: String,
      completionPercentage: Number,
      createdAt: { type: Date, default: Date.now }
    }));

    const totalStudents = await UserPoints.distinct('userId').then(users => users.length);
    const totalModulesCompleted = await UserPoints.countDocuments({ source: 'module_completion' });
    const totalDrillsCompleted = await UserPoints.countDocuments({ source: 'drill_completion' });
    const averagePreparedness = await UserPoints.aggregate([
      {
        $group: {
          _id: '$userId',
          totalPoints: { $sum: '$points' }
        }
      },
      {
        $group: {
          _id: null,
          averagePoints: { $avg: '$totalPoints' }
        }
      }
    ]).then(result => Math.min(100, Math.floor((result[0]?.averagePoints || 0) / 10)));

    res.json({ 
      success: true, 
      data: {
        totalStudents,
        totalModulesCompleted,
        totalDrillsCompleted,
        averagePreparedness
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
app.get('/api/teacher-actions/confirmed-drills', async (req, res) => {
  try {
    const ConfirmedDrill = mongoose.model('ConfirmedDrill', new mongoose.Schema({
      drillType: String,
      date: String,
      time: String,
      venue: String,
      teacherId: String,
      teacherName: String,
      createdAt: { type: Date, default: Date.now }
    }));

    const drills = await ConfirmedDrill.find().sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      data: { drills }
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

    const assignments = await Assignment.find().sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      data: { assignments }
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