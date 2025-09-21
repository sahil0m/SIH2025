const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// Email functionality removed - only storing emails in database
require('dotenv').config();

const app = express();
const server = createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:5001",
      "https://sih-2025.vercel.app" // Only allow your deployed Vercel frontend
    ],
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5001',
    'https://sih-2025.vercel.app' // Only allow your deployed Vercel frontend
  ],
  credentials: true
}));
app.use(express.json());

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

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow video and PDF files
    const allowedTypes = /video\/|application\/pdf/;
    const extname = allowedTypes.test(file.mimetype);
    
    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only video and PDF files are allowed'));
    }
  }
});

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://sahildewani75_db_user:Sahil%40123@cluster0.uowncgx.mongodb.net/disaster-prep?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4 // Use IPv4, skip trying IPv6
})
  .then(() => console.log('✅ MongoDB Connected Successfully!'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    console.log('⚠️  Continuing without MongoDB - using fallback storage');
  });

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join user to their role room
  socket.on('join-role', (role) => {
    socket.join(`role_${role}`);
    console.log(`User joined role: ${role}`);
  });
  
  // Join user to their institution room
  socket.on('join-institution', (institution) => {
    socket.join(`institution_${institution}`);
    console.log(`User joined institution: ${institution}`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Routes
// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        url: fileUrl,
        size: req.file.size,
        type: req.file.mimetype
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Additional route to serve files with proper headers
app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  // Set appropriate headers based on file type
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.pdf') {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="' + filename + '"');
  } else if (['.mp4', '.avi', '.mov', '.wmv'].includes(ext)) {
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'inline; filename="' + filename + '"');
  }
  
  res.sendFile(filePath);
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Get alerts
app.get('/api/alerts', async (req, res) => {
  try {
    const { region, alertType, severity, page = 1, limit = 10 } = req.query;
    
    // Check if collection exists, if not return empty array
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionExists = collections.some(col => col.name === 'alerts');
    
    if (!collectionExists) {
      return res.json({
        success: true,
        data: {
          alerts: [],
          pagination: {
            current: parseInt(page),
            pages: 0,
            total: 0
          }
        }
      });
    }
    
    const filter = { status: 'active' };
    if (region) filter.region = region;
    if (alertType) filter.alertType = alertType;
    if (severity) filter.severity = severity;
    
    const alerts = await mongoose.connection.db.collection('alerts')
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .toArray();
    
    const total = await mongoose.connection.db.collection('alerts').countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        alerts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create alert
app.post('/api/alerts', async (req, res) => {
  try {
    const alertData = {
      ...req.body,
      status: 'active',
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Ensure collection exists
    await mongoose.connection.db.createCollection('alerts');
    
    const result = await mongoose.connection.db.collection('alerts').insertOne(alertData);
    
    // Broadcast to all users
    io.emit('newAlert', {
      type: 'alert',
      id: result.insertedId,
      title: alertData.title,
      description: alertData.description,
      alertType: alertData.alertType,
      severity: alertData.severity,
      region: alertData.region,
      affectedAreas: alertData.affectedAreas,
      validFrom: alertData.validFrom,
      validUntil: alertData.validUntil,
      createdAt: alertData.createdAt
    });
    
    res.status(201).json({
      success: true,
      message: 'Alert created and broadcasted successfully',
      data: { _id: result.insertedId, ...alertData }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create drill announcement
app.post('/api/drill-announcements', async (req, res) => {
  try {
    const announcementData = {
      ...req.body,
      type: 'drill_announcement',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Ensure collection exists
    await mongoose.connection.db.createCollection('drill_announcements');
    
    const result = await mongoose.connection.db.collection('drill_announcements').insertOne(announcementData);
    
    // Broadcast to all users
    io.emit('newDrillAnnouncement', {
      type: 'drill_announcement',
      id: result.insertedId,
      title: announcementData.title,
      message: announcementData.message,
      drillType: announcementData.drillType,
      priority: announcementData.priority,
      targetClasses: announcementData.targetClasses,
      teacherName: announcementData.teacherName,
      institution: announcementData.institution,
      createdAt: announcementData.createdAt
    });
    
    res.status(201).json({
      success: true,
      message: 'Drill announcement created and broadcasted successfully',
      data: { _id: result.insertedId, ...announcementData }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create emergency alert
app.post('/api/emergency-alerts', async (req, res) => {
  try {
    const emergencyData = {
      ...req.body,
      type: 'emergency_alert',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Ensure collection exists
    await mongoose.connection.db.createCollection('emergency_alerts');
    
    const result = await mongoose.connection.db.collection('emergency_alerts').insertOne(emergencyData);
    
    // Broadcast to all users
    io.emit('newEmergencyAlert', {
      type: 'emergency_alert',
      id: result.insertedId,
      title: emergencyData.title,
      message: emergencyData.message,
      severity: emergencyData.severity,
      region: emergencyData.region,
      affectedAreas: emergencyData.affectedAreas,
      createdAt: emergencyData.createdAt
    });
    
    res.status(201).json({
      success: true,
      message: 'Emergency alert created and broadcasted successfully',
      data: { _id: result.insertedId, ...emergencyData }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get drill announcements
app.get('/api/drill-announcements', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // Check if MongoDB is connected
    if (!mongoose.connection || !mongoose.connection.readyState || mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, using fallback data');
      
      // Return real data from your MongoDB (fallback when connection fails)
      const sampleAnnouncements = [
        {
          _id: '68cd1ef6c053c8dc2f4b3f76',
          title: "Drill Announcement",
          message: "vbxcbcvxx",
          drillType: "fire",
          priority: "normal",
          targetClasses: ["all"],
          teacherName: "Admin",
          institution: "BML Munjal University",
          type: "drill_announcement",
          status: "active",
          createdAt: new Date("2025-09-19T09:14:29.944Z"),
          updatedAt: new Date("2025-09-19T09:14:29.944Z")
        },
        {
          _id: '68cd2a0803268da2f7d65bd1',
          title: "Drill Announcement",
          message: "dndndnd",
          drillType: "fire",
          priority: "normal",
          targetClasses: ["all"],
          teacherName: "Admin",
          institution: "BML Munjal University",
          type: "drill_announcement",
          status: "active",
          createdAt: new Date("2025-09-19T10:01:44.319Z"),
          updatedAt: new Date("2025-09-19T10:01:44.319Z")
        },
        {
          _id: '68cd2a8503268da2f7d65bd4',
          title: "xcjnZCNn",
          message: "cx jkZ cZ",
          targetClasses: ["class1"],
          priority: "normal",
          scheduledFor: "",
          drillType: "fire",
          teacherId: "aOvWTz1uHrcXUNJuPKcqwYRWMwa2",
          teacherName: "Ms. Priya Sharma",
          institution: "JNU",
          createdAt: new Date("2025-09-19T10:03:49.277Z"),
          status: "active",
          type: "drill_announcement",
          updatedAt: new Date("2025-09-19T10:03:49.277Z")
        }
      ];
      
      return res.json({
        success: true,
        data: {
          announcements: sampleAnnouncements,
          pagination: {
            current: parseInt(page),
            pages: 1,
            total: sampleAnnouncements.length
          }
        }
      });
    }
    
    // Check if collection exists, if not return empty array
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionExists = collections.some(col => col.name === 'drill_announcements');
    
    if (!collectionExists) {
      return res.json({
        success: true,
        data: {
          announcements: [],
          pagination: {
            current: parseInt(page),
            pages: 0,
            total: 0
          }
        }
      });
    }
    
    const announcements = await mongoose.connection.db.collection('drill_announcements')
      .find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .toArray();
    
    const total = await mongoose.connection.db.collection('drill_announcements').countDocuments({ status: 'active' });
    
    res.json({
      success: true,
      data: {
        announcements,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get emergency alerts
app.get('/api/emergency-alerts', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // Check if MongoDB is connected
    if (!mongoose.connection || !mongoose.connection.readyState || mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, using fallback data for emergency alerts');
      
      // Return real data from your MongoDB (fallback when connection fails)
      const sampleAlerts = [
        {
          _id: '68cd2a1803268da2f7d65bd2',
          title: "Emergency Alert",
          message: "saksbkakd",
          severity: "high",
          region: "All Regions",
          affectedAreas: ["All Areas"],
          type: "emergency_alert",
          status: "active",
          createdAt: new Date("2025-09-19T10:02:00.249Z"),
          updatedAt: new Date("2025-09-19T10:02:00.249Z")
        }
      ];
      
      return res.json({
        success: true,
        data: {
          alerts: sampleAlerts,
          pagination: {
            current: parseInt(page),
            pages: 1,
            total: sampleAlerts.length
          }
        }
      });
    }
    
    // Check if collection exists, if not return empty array
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionExists = collections.some(col => col.name === 'emergency_alerts');
    
    if (!collectionExists) {
      return res.json({
        success: true,
        data: {
          alerts: [],
          pagination: {
            current: parseInt(page),
            pages: 0,
            total: 0
          }
        }
      });
    }
    
    const alerts = await mongoose.connection.db.collection('emergency_alerts')
      .find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .toArray();
    
    const total = await mongoose.connection.db.collection('emergency_alerts').countDocuments({ status: 'active' });
    
    res.json({
      success: true,
      data: {
        alerts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get alert statistics
app.get('/api/alerts/stats', async (req, res) => {
  try {
    // Check if collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionExists = collections.some(col => col.name === 'alerts');
    
    if (!collectionExists) {
      return res.json({
        success: true,
        data: {
          stats: {
            total: 0,
            active: 0,
            byType: {},
            bySeverity: {},
            byRegion: {},
            recent: 0
          }
        }
      });
    }
    
    const alerts = await mongoose.connection.db.collection('alerts').find({}).toArray();
    
    const stats = {
      total: alerts.length,
      active: alerts.filter(a => a.status === 'active').length,
      byType: {},
      bySeverity: {},
      byRegion: {},
      recent: alerts.filter(a => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(a.createdAt) > weekAgo;
      }).length
    };

    alerts.forEach(alert => {
      // Count by type
      stats.byType[alert.alertType] = (stats.byType[alert.alertType] || 0) + 1;
      
      // Count by severity
      stats.bySeverity[alert.severity] = (stats.bySeverity[alert.severity] || 0) + 1;
      
      // Count by region
      stats.byRegion[alert.region] = (stats.byRegion[alert.region] || 0) + 1;
    });

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Teacher Actions Endpoints

// Assign module to classes
app.post('/api/teacher-actions/assign-module', async (req, res) => {
  try {
    const moduleData = {
      ...req.body,
      type: 'module_assignment',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Check if MongoDB is connected
    if (!mongoose.connection.readyState || mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, using fallback storage');
      
      // Store in memory as fallback
      if (!global.assignedModules) {
        global.assignedModules = [];
      }
      
      const moduleWithId = {
        _id: new Date().getTime().toString(),
        ...moduleData
      };
      
      global.assignedModules.push(moduleWithId);
      
      // Broadcast to all users
      io.emit('moduleAssigned', {
        type: 'module_assignment',
        id: moduleWithId._id,
        title: moduleData.title,
        description: moduleData.description,
        dueDate: moduleData.dueDate,
        estimatedTime: moduleData.estimatedTime,
        targetClasses: moduleData.targetClasses,
        teacherName: moduleData.teacherName,
        files: moduleData.files,
        assignedAt: moduleData.createdAt
      });
      
      return res.status(201).json({
        success: true,
        message: 'Module assigned successfully (stored locally)',
        data: moduleWithId
      });
    }
    
    // MongoDB is connected, use database
    await mongoose.connection.db.createCollection('assigned_modules');
    const result = await mongoose.connection.db.collection('assigned_modules').insertOne(moduleData);
    
    // Broadcast to all users
    io.emit('moduleAssigned', {
      type: 'module_assignment',
      id: result.insertedId,
      title: moduleData.title,
      description: moduleData.description,
      dueDate: moduleData.dueDate,
      estimatedTime: moduleData.estimatedTime,
      targetClasses: moduleData.targetClasses,
      teacherName: moduleData.teacherName,
      files: moduleData.files,
      assignedAt: moduleData.createdAt
    });
    
    res.status(201).json({
      success: true,
      message: 'Module assigned successfully',
      data: { _id: result.insertedId, ...moduleData }
    });
  } catch (error) {
    console.error('Error assigning module:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to assign module: ' + error.message 
    });
  }
});

// Confirm drill slot
app.post('/api/teacher-actions/confirm-drill', async (req, res) => {
  try {
    const drillData = {
      ...req.body,
      type: 'drill_confirmation',
      status: 'confirmed',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Check if MongoDB is connected
    if (!mongoose.connection.readyState || mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, using fallback storage');
      
      // Store in memory as fallback
      if (!global.confirmedDrills) {
        global.confirmedDrills = [];
      }
      
      const drillWithId = {
        _id: new Date().getTime().toString(),
        ...drillData
      };
      
      global.confirmedDrills.push(drillWithId);
      
      // Broadcast to all users
      io.emit('drillConfirmed', {
        type: 'drill_confirmation',
        id: drillWithId._id,
        title: drillData.title,
        description: drillData.description,
        scheduledDate: drillData.scheduledDate,
        scheduledTime: drillData.scheduledTime,
        location: drillData.location,
        drillType: drillData.drillType,
        targetClasses: drillData.targetClasses,
        teacherName: drillData.teacherName,
        confirmedAt: drillData.createdAt
      });
      
      return res.status(201).json({
        success: true,
        message: 'Drill confirmed successfully (stored locally)',
        data: drillWithId
      });
    }
    
    // MongoDB is connected, use database
    await mongoose.connection.db.createCollection('confirmed_drills');
    const result = await mongoose.connection.db.collection('confirmed_drills').insertOne(drillData);
    
    // Broadcast to all users
    io.emit('drillConfirmed', {
      type: 'drill_confirmation',
      id: result.insertedId,
      title: drillData.title,
      description: drillData.description,
      scheduledDate: drillData.scheduledDate,
      scheduledTime: drillData.scheduledTime,
      location: drillData.location,
      drillType: drillData.drillType,
      targetClasses: drillData.targetClasses,
      teacherName: drillData.teacherName,
      confirmedAt: drillData.createdAt
    });
    
    res.status(201).json({
      success: true,
      message: 'Drill confirmed successfully',
      data: { _id: result.insertedId, ...drillData }
    });
  } catch (error) {
    console.error('Error confirming drill:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to confirm drill: ' + error.message 
    });
  }
});

// Get assigned modules for students
app.get('/api/teacher-actions/assigned-modules', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (!mongoose.connection.readyState || mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, using fallback storage');
      
      // Return modules from memory storage
      const modules = global.assignedModules || [];
      
      return res.json({
        success: true,
        data: { modules: modules }
      });
    }
    
    // MongoDB is connected, use database
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionExists = collections.some(col => col.name === 'assigned_modules');
    
    if (!collectionExists) {
      return res.json({
        success: true,
        data: { modules: [] }
      });
    }
    
    const modules = await mongoose.connection.db.collection('assigned_modules')
      .find({ status: 'active' })
      .sort({ createdAt: -1 })
      .toArray();
    
    // Add full URLs to files
    const modulesWithUrls = modules.map(module => {
      if (module.files) {
        if (module.files.video) {
          // If URL already exists, keep it; otherwise construct it
          if (!module.files.video.url) {
            if (module.files.video.filename) {
              module.files.video.url = `http://localhost:5000/uploads/${module.files.video.filename}`;
            } else {
              // For existing data without filename, use a default approach
              // Try to match by file type and size
              try {
                const uploadsDir = path.join(__dirname, 'uploads');
                if (fs.existsSync(uploadsDir)) {
                  const videoFiles = fs.readdirSync(uploadsDir)
                    .filter(file => file.includes('mp4') || file.includes('avi') || file.includes('mov') || file.includes('wmv'));
                  if (videoFiles.length > 0) {
                    module.files.video.url = `http://localhost:5000/uploads/${videoFiles[0]}`;
                  }
                }
              } catch (error) {
                console.error('Error reading uploads directory:', error);
              }
            }
          }
        }
        if (module.files.pdf) {
          // If URL already exists, keep it; otherwise construct it
          if (!module.files.pdf.url) {
            if (module.files.pdf.filename) {
              module.files.pdf.url = `http://localhost:5000/uploads/${module.files.pdf.filename}`;
            } else {
              // For existing data without filename, use a default approach
              try {
                const uploadsDir = path.join(__dirname, 'uploads');
                if (fs.existsSync(uploadsDir)) {
                  const pdfFiles = fs.readdirSync(uploadsDir)
                    .filter(file => file.includes('pdf'));
                  if (pdfFiles.length > 0) {
                    module.files.pdf.url = `http://localhost:5000/uploads/${pdfFiles[0]}`;
                  }
                }
              } catch (error) {
                console.error('Error reading uploads directory:', error);
              }
            }
          }
        }
      }
      return module;
    });
    
    res.json({
      success: true,
      data: { modules: modulesWithUrls }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get confirmed drills for students
app.get('/api/teacher-actions/confirmed-drills', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (!mongoose.connection.readyState || mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, using fallback storage');
      
      // Return drills from memory storage
      const drills = global.confirmedDrills || [];
      
      return res.json({
        success: true,
        data: { drills: drills }
      });
    }
    
    // MongoDB is connected, use database
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionExists = collections.some(col => col.name === 'confirmed_drills');
    
    if (!collectionExists) {
      return res.json({
        success: true,
        data: { drills: [] }
      });
    }
    
    const drills = await mongoose.connection.db.collection('confirmed_drills')
      .find({ status: 'confirmed' })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({
      success: true,
      data: { drills }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Email functionality removed - only storing emails in database

// Mailing List API Endpoints

// Subscribe to mailing list (email sending removed)
app.post('/api/mailing-list/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Check if MongoDB is connected
    if (!mongoose.connection.readyState || mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, using fallback storage for mailing list');
      
      // Store in memory as fallback
      if (!global.mailingList) {
        global.mailingList = [];
      }
      
      // Check if email already exists
      const existingEmail = global.mailingList.find(item => item.email === email);
      if (existingEmail) {
        return res.json({
          success: true,
          message: 'Email already subscribed to our mailing list'
        });
      }
      
      const subscriber = {
        email,
        subscribedAt: new Date(),
        status: 'active'
      };
      
      global.mailingList.push(subscriber);
      
      return res.json({
        success: true,
        message: 'Successfully subscribed to our mailing list!'
      });
    }

    // MongoDB is connected, use database
    await mongoose.connection.db.createCollection('mailing_list');
    
    // Check if email already exists
    const existingSubscriber = await mongoose.connection.db.collection('mailing_list')
      .findOne({ email: email });
    
    if (existingSubscriber) {
      return res.json({
        success: true,
        message: 'Email already subscribed to our mailing list'
      });
    }
    
    const subscriberData = {
      email,
      subscribedAt: new Date(),
      status: 'active'
    };
    
    const result = await mongoose.connection.db.collection('mailing_list')
      .insertOne(subscriberData);
    
    console.log('✅ Email added to mailing list:', email);
    
    res.json({
      success: true,
      message: 'Successfully subscribed to our mailing list!'
    });
    
  } catch (error) {
    console.error('Mailing list subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to mailing list'
    });
  }
});

// Get mailing list subscribers (admin only)
app.get('/api/mailing-list/subscribers', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (!mongoose.connection.readyState || mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, using fallback storage');
      
      const subscribers = global.mailingList || [];
      return res.json({
        success: true,
        data: { subscribers }
      });
    }

    // Check if collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionExists = collections.some(col => col.name === 'mailing_list');
    
    if (!collectionExists) {
      return res.json({
        success: true,
        data: { subscribers: [] }
      });
    }
    
    const subscribers = await mongoose.connection.db.collection('mailing_list')
      .find({ status: 'active' })
      .sort({ subscribedAt: -1 })
      .toArray();
    
    res.json({
      success: true,
      data: { subscribers }
    });
    
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscribers'
    });
  }
});

// Points and Leaderboard API Endpoints

// Helper function to calculate points based on completion percentage and video type
function calculatePoints(completionPercentage, videoType = 'module') {
  // For module_assignment type, use different point values
  if (videoType === 'module_assignment') {
    if (completionPercentage >= 100) {
      return 100; // Always 100 points for module assignment completion
    }
    return 0;
  }
  
  // For assignment completion, award 50 points only at 100% completion
  if (videoType === 'assignment') {
    if (completionPercentage >= 100) {
      return 50; // 50 points for assignment completion
    }
    return 0;
  }
  
  // For regular videos (module, drill), use progressive points
  if (completionPercentage >= 25 && completionPercentage < 50) {
    return 25; // 25% completion = 25 points
  } else if (completionPercentage >= 50 && completionPercentage < 75) {
    return 50; // 50% completion = 50 points
  } else if (completionPercentage >= 75 && completionPercentage < 100) {
    return 75; // 75% completion = 75 points
  } else if (completionPercentage >= 100) {
    return 100; // 100% completion = 100 points
  }
  return 0;
}

// Award points to user for watching a video
app.post('/api/points/award', async (req, res) => {
  try {
    const { userId, videoId, videoType, completionPercentage, points } = req.body;
    
    if (!userId || !videoId || !videoType || completionPercentage === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, videoId, videoType, completionPercentage'
      });
    }

    // Calculate points based on completion percentage and video type
    // If custom points are provided, use them instead
    const awardedPoints = points !== undefined ? points : calculatePoints(completionPercentage, videoType);

    // Check if MongoDB is connected
    if (!mongoose.connection.readyState || mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, using fallback storage for points');
      
      // Store in memory as fallback
      if (!global.userPoints) {
        global.userPoints = [];
      }
      
      // Check if user already has points for this video
      const existingEntry = global.userPoints.find(
        entry => entry.userId === userId && entry.videoId === videoId
      );
      
      if (existingEntry) {
        if (completionPercentage > existingEntry.completionPercentage) {
          // Update the completion percentage and recalculate points
          const newPoints = calculatePoints(completionPercentage, videoType);
          const pointsDifference = newPoints - existingEntry.points;
          
          // Update the existing entry
          existingEntry.completionPercentage = completionPercentage;
          existingEntry.points = newPoints;
          existingEntry.totalPoints += pointsDifference;
          existingEntry.lastUpdated = new Date();
          
          console.log('✅ Updated points for video:', videoId, 'to', completionPercentage + '%', '(+' + pointsDifference + ' points)');
          
          return res.json({
            success: true,
            message: `Points updated for ${completionPercentage}% completion`,
            points: existingEntry.totalPoints,
            awardedPoints: pointsDifference,
            updated: true
          });
        } else {
          return res.json({
            success: true,
            message: 'No new points awarded - completion percentage not higher',
            points: existingEntry.totalPoints,
            awardedPoints: 0
          });
        }
      }
      
      // Calculate total points for user
      const userTotalPoints = global.userPoints
        .filter(entry => entry.userId === userId)
        .reduce((sum, entry) => sum + entry.points, 0) + awardedPoints;
      
      const pointsEntry = {
        userId,
        videoId,
        videoType,
        completionPercentage,
        points: awardedPoints,
        totalPoints: userTotalPoints,
        awardedAt: new Date()
      };
      
      global.userPoints.push(pointsEntry);
      
      return res.json({
        success: true,
        message: `Points awarded for ${completionPercentage}% completion`,
        points: userTotalPoints,
        awardedPoints: awardedPoints
      });
    }

    // MongoDB is connected, use database
    // Check if collection exists, create if it doesn't
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionExists = collections.some(col => col.name === 'user_points');
    
    if (!collectionExists) {
      await mongoose.connection.db.createCollection('user_points');
      console.log('✅ Created user_points collection');
    }
    
    // Check if user already has points for this video
    const existingEntry = await mongoose.connection.db.collection('user_points')
      .findOne({ userId: userId, videoId: videoId });
    
    // If user already has points for this video, update the completion percentage if it's higher
    if (existingEntry) {
      if (completionPercentage > existingEntry.completionPercentage) {
        // Update the completion percentage and recalculate points
        const newPoints = calculatePoints(completionPercentage, videoType);
        const pointsDifference = newPoints - existingEntry.points;
        
        // Update the existing document
        await mongoose.connection.db.collection('user_points')
          .updateOne(
            { _id: existingEntry._id },
            { 
              $set: { 
                completionPercentage: completionPercentage,
                points: newPoints,
                totalPoints: existingEntry.totalPoints + pointsDifference,
                lastUpdated: new Date()
              }
            }
          );
        
        console.log('✅ Updated points for video:', videoId, 'to', completionPercentage + '%', '(+' + pointsDifference + ' points)');
        
        return res.json({
          success: true,
          message: `Points updated for ${completionPercentage}% completion`,
          points: existingEntry.totalPoints + pointsDifference,
          awardedPoints: pointsDifference,
          updated: true
        });
      } else {
        return res.json({
          success: true,
          message: 'No new points awarded - completion percentage not higher',
          points: existingEntry.totalPoints,
          awardedPoints: 0
        });
      }
    }
    
    // Calculate total points for user
    const userPoints = await mongoose.connection.db.collection('user_points')
      .find({ userId: userId })
      .toArray();
    
    const userTotalPoints = userPoints.reduce((sum, entry) => sum + entry.points, 0) + awardedPoints;
    
    const pointsData = {
      userId,
      videoId,
      videoType,
      completionPercentage,
      points: awardedPoints,
      totalPoints: userTotalPoints,
      awardedAt: new Date()
    };
    
    const result = await mongoose.connection.db.collection('user_points')
      .insertOne(pointsData);
    
    console.log('✅ Points awarded:', awardedPoints, 'to user:', userId, 'for video:', videoId, 'at', completionPercentage + '%');
    console.log('📊 Document inserted with ID:', result.insertedId);
    
    res.json({
      success: true,
      message: `Points awarded for ${completionPercentage}% completion`,
      points: userTotalPoints,
      awardedPoints: awardedPoints,
      documentId: result.insertedId
    });
    
  } catch (error) {
    console.error('Points awarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to award points'
    });
  }
});

// Get points for a specific video
app.get('/api/points/video/:userId/:videoId', async (req, res) => {
  try {
    const { userId, videoId } = req.params;
    
    if (!mongoose.connection.readyState || mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, using fallback storage');
      
      const userPoints = global.userPoints?.filter(entry => entry.userId === userId && entry.videoId === videoId) || [];
      const totalPoints = userPoints.reduce((sum, entry) => sum + entry.points, 0);
      const maxCompletion = Math.max(...userPoints.map(entry => entry.completionPercentage), 0);
      
      return res.json({
        success: true,
        data: { points: totalPoints, completionPercentage: maxCompletion }
      });
    }

    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionExists = collections.some(col => col.name === 'user_points');
    
    if (!collectionExists) {
      return res.json({
        success: true,
        data: { points: 0, completionPercentage: 0 }
      });
    }
    
    const userPoints = await mongoose.connection.db.collection('user_points')
      .find({ userId: userId, videoId: videoId })
      .toArray();
    
    const totalPoints = userPoints.reduce((sum, entry) => sum + entry.points, 0);
    const maxCompletion = Math.max(...userPoints.map(entry => entry.completionPercentage), 0);
    
    res.json({
      success: true,
      data: { points: totalPoints, completionPercentage: maxCompletion }
    });
    
  } catch (error) {
    console.error('Get video points error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get video points'
    });
  }
});

// Get user's total points
app.get('/api/points/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if MongoDB is connected
    if (!mongoose.connection.readyState || mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, using fallback storage');
      
      const userPoints = global.userPoints?.filter(entry => entry.userId === userId) || [];
      const totalPoints = userPoints.reduce((sum, entry) => sum + entry.points, 0);
      
      return res.json({
        success: true,
        data: { totalPoints, videosWatched: userPoints.length }
      });
    }

    // MongoDB is connected, use database
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionExists = collections.some(col => col.name === 'user_points');
    
    if (!collectionExists) {
      return res.json({
        success: true,
        data: { totalPoints: 0, videosWatched: 0 }
      });
    }
    
    const userPoints = await mongoose.connection.db.collection('user_points')
      .find({ userId: userId })
      .toArray();
    
    const totalPoints = userPoints.reduce((sum, entry) => sum + entry.points, 0);
    
    res.json({
      success: true,
      data: { totalPoints, videosWatched: userPoints.length }
    });
    
  } catch (error) {
    console.error('Get user points error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user points'
    });
  }
});

// Get user statistics
app.get('/api/statistics/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if MongoDB is connected
    if (!mongoose.connection.readyState || mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, using fallback data');
      
      // Return fallback data
      return res.json({
        success: true,
        data: {
          modulesCompleted: 0,
          drillsCompleted: 0,
          totalPoints: 0,
          preparednessScore: 0
        }
      });
    }

    // Get user points data
    const userPoints = await mongoose.connection.db.collection('user_points')
      .find({ userId: userId })
      .toArray();

    // Calculate statistics
    const modulesCompleted = userPoints.filter(point => 
      point.videoType === 'module' && point.completionPercentage >= 100
    ).length;

    const drillsCompleted = userPoints.filter(point => 
      point.videoType === 'drill' && point.completionPercentage >= 100
    ).length;

    const totalPoints = userPoints.reduce((sum, point) => sum + point.points, 0);

    // Calculate preparedness score based on completion rates
    const totalVideos = userPoints.length;
    const completedVideos = userPoints.filter(point => point.completionPercentage >= 100).length;
    const preparednessScore = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

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
    console.error('Get user statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user statistics'
    });
  }
});

// Assignment Management APIs

// Create assignment
app.post('/api/assignments/create', upload.single('pdfFile'), async (req, res) => {
  try {
    const { title, description, classId, dueDate, instructions } = req.body;
    const teacherName = req.body.teacherName || 'Admin';
    
    // Check if MongoDB is connected
    if (!mongoose.connection.readyState || mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, using fallback storage');
      
      // Store in fallback storage
      if (!global.assignments) global.assignments = [];
      
      const assignment = {
        _id: Date.now().toString(),
        title,
        description,
        classId,
        dueDate,
        instructions,
        teacherName,
        pdfFile: req.file ? `/uploads/${req.file.filename}` : null,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      global.assignments.push(assignment);
      
      return res.json({
        success: true,
        message: 'Assignment created successfully',
        data: assignment
      });
    }

    // MongoDB is connected, save to database
    const assignment = {
      title,
      description,
      classId,
      dueDate,
      instructions,
      teacherName,
      pdfFile: req.file ? `/uploads/${req.file.filename}` : null,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await mongoose.connection.db.collection('assignments').insertOne(assignment);
    
    res.json({
      success: true,
      message: 'Assignment created successfully',
      data: { ...assignment, _id: result.insertedId }
    });

  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create assignment'
    });
  }
});

// Get all assignments
app.get('/api/assignments', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (!mongoose.connection.readyState || mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, using fallback storage');
      
      const assignments = global.assignments || [];
      return res.json({
        success: true,
        data: assignments
      });
    }

    // MongoDB is connected, fetch from database
    const assignments = await mongoose.connection.db.collection('assignments')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      data: assignments
    });

  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get assignments'
    });
  }
});

// Get assignments by class
app.get('/api/assignments/class/:classId', async (req, res) => {
  try {
    const { classId } = req.params;
    
    // Check if MongoDB is connected
    if (!mongoose.connection.readyState || mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, using fallback storage');
      
      const assignments = (global.assignments || []).filter(a => a.classId === classId);
      return res.json({
        success: true,
        data: assignments
      });
    }

    // MongoDB is connected, fetch from database
    const assignments = await mongoose.connection.db.collection('assignments')
      .find({ classId })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      data: assignments
    });

  } catch (error) {
    console.error('Get assignments by class error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get assignments'
    });
  }
});

// Update assignment status
app.put('/api/assignments/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Check if MongoDB is connected
    if (!mongoose.connection.readyState || mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, using fallback storage');
      
      if (global.assignments) {
        const assignment = global.assignments.find(a => a._id === id);
        if (assignment) {
          assignment.status = status;
          assignment.updatedAt = new Date();
        }
      }
      
      return res.json({
        success: true,
        message: 'Assignment status updated'
      });
    }

    // MongoDB is connected, update in database
    await mongoose.connection.db.collection('assignments').updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { 
        $set: { 
          status,
          updatedAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: 'Assignment status updated'
    });

  } catch (error) {
    console.error('Update assignment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update assignment status'
    });
  }
});

// Get platform statistics
app.get('/api/statistics/platform', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (!mongoose.connection.readyState || mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, using fallback data');
      
      // Return fallback data
      return res.json({
        success: true,
        data: {
          totalStudents: 0,
          totalModulesCompleted: 0,
          totalDrillsCompleted: 0,
          averagePreparedness: 0
        }
      });
    }

    // Get all users count
    const totalStudents = await mongoose.connection.db.collection('users').countDocuments();

    // Get total modules completed
    const modulesCompleted = await mongoose.connection.db.collection('user_points')
      .countDocuments({ 
        videoType: 'module', 
        completionPercentage: { $gte: 100 } 
      });

    // Get total drills completed
    const drillsCompleted = await mongoose.connection.db.collection('user_points')
      .countDocuments({ 
        videoType: 'drill', 
        completionPercentage: { $gte: 100 } 
      });

    // Calculate average preparedness
    const userStats = await mongoose.connection.db.collection('user_points')
      .aggregate([
        {
          $group: {
            _id: '$userId',
            totalVideos: { $sum: 1 },
            completedVideos: {
              $sum: {
                $cond: [{ $gte: ['$completionPercentage', 100] }, 1, 0]
              }
            }
          }
        },
        {
          $project: {
            preparednessScore: {
              $cond: [
                { $gt: ['$totalVideos', 0] },
                { $multiply: [{ $divide: ['$completedVideos', '$totalVideos'] }, 100] },
                0
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            averagePreparedness: { $avg: '$preparednessScore' }
          }
        }
      ])
      .toArray();

    const averagePreparedness = userStats.length > 0 ? Math.round(userStats[0].averagePreparedness) : 0;

    res.json({
      success: true,
      data: {
        totalStudents,
        totalModulesCompleted: modulesCompleted,
        totalDrillsCompleted: drillsCompleted,
        averagePreparedness
      }
    });

  } catch (error) {
    console.error('Get platform statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get platform statistics'
    });
  }
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Check if MongoDB is connected
    if (!mongoose.connection.readyState || mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, using fallback storage');
      
      const userPoints = global.userPoints || [];
      
      // Group by user and calculate totals
      const userTotals = {};
      userPoints.forEach(entry => {
        if (!userTotals[entry.userId]) {
          userTotals[entry.userId] = {
            userId: entry.userId,
            totalPoints: 0,
            videosWatched: 0
          };
        }
        userTotals[entry.userId].totalPoints += entry.points;
        userTotals[entry.userId].videosWatched += 1;
      });
      
        // Convert to array and sort
        const leaderboard = Object.values(userTotals)
          .sort((a, b) => b.totalPoints - a.totalPoints)
          .slice(0, parseInt(limit));
      
      return res.json({
        success: true,
        data: { leaderboard }
      });
    }

    // MongoDB is connected, use database
    const collections = await mongoose.connection.db.listCollections().toArray();
    const userPointsExists = collections.some(col => col.name === 'user_points');
    
    // Get user points if collection exists
    let userPointsMap = {};
    if (userPointsExists) {
      const userPoints = await mongoose.connection.db.collection('user_points')
        .aggregate([
          {
            $group: {
              _id: '$userId',
              totalPoints: { $sum: '$points' },
              videosWatched: { $sum: 1 }
            }
          },
          {
            $project: {
              userId: '$_id',
              totalPoints: 1,
              videosWatched: 1,
              _id: 0
            }
          }
        ])
        .toArray();
      
      // Create a map for quick lookup
      userPointsMap = userPoints.reduce((acc, user) => {
        acc[user.userId] = user;
        return acc;
      }, {});
    }
    
    // Get all unique user IDs from user_points collection
    const uniqueUserIds = Object.keys(userPointsMap);
    
    // If no users have points yet, return empty leaderboard
    if (uniqueUserIds.length === 0) {
      return res.json({
        success: true,
        data: { leaderboard: [] }
      });
    }
    
    // Create leaderboard from actual users who have points
    const leaderboard = uniqueUserIds.map(userId => {
      const userPoints = userPointsMap[userId];
      return {
        userId: userId,
        totalPoints: userPoints.totalPoints || 0,
        videosWatched: userPoints.videosWatched || 0,
        userRole: 'Student', // Default role since we don't store roles in user_points
        userInstitution: 'Unknown' // Default institution since we don't store this in user_points
      };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: { leaderboard }
    });
    
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get leaderboard'
    });
  }
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`�� Server running on http://localhost:${PORT}`);
});