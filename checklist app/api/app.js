const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initDB } = require('./db');
const {
  upload,
  // Sites
  getAllSites,
  createSite,
  deleteSite,
  // Violations (renamed from criterions)
  getAllViolations,
  createViolation,
  deleteViolation,
  updateViolationOrder,
  // Checklists
  getAllChecklists,
  getChecklistById,
  createChecklist,
  updateChecklist,
  deleteChecklist,
  // Checklist Progress
  updateChecklistProgress,
  getChecklistProgress,
  resetChecklistProgress
} = require('./controller');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5174', 'http://localhost:3000'], 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// Routes

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running', timestamp: new Date().toISOString() });
});

// Sites Routes
app.get('/api/sites', getAllSites);
app.post('/api/sites', createSite);
app.delete('/api/sites/:id', deleteSite);

// Violations Routes (renamed from criterions)
app.get('/api/violations', getAllViolations);
app.post('/api/violations', createViolation);
app.delete('/api/violations/:id', deleteViolation);
app.put('/api/violations/order', updateViolationOrder);

// Checklists Routes
app.get('/api/checklists', getAllChecklists);
app.get('/api/checklists/:id', getChecklistById);
app.post('/api/checklists', upload.single('image'), createChecklist);
app.put('/api/checklists/:id', upload.single('image'), updateChecklist);
app.delete('/api/checklists/:id', deleteChecklist);

// Checklist Progress Routes (updated parameter names)
app.put('/api/checklists/:checklistId/progress/:violationId', updateChecklistProgress);
app.get('/api/checklists/:checklistId/progress', getChecklistProgress);
app.post('/api/checklists/:checklistId/reset', resetChecklistProgress);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      success: false, 
      error: 'File too large. Maximum size is 5MB.' 
    });
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
  
  // PostgreSQL errors
  if (error.code === '23505') {
    return res.status(400).json({ 
      success: false, 
      error: 'Duplicate entry' 
    });
  }
  
  if (error.code === '23503') {
    return res.status(400).json({ 
      success: false, 
      error: 'Foreign key constraint violation' 
    });
  }
  
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('Initializing database...');
    await initDB();
    console.log('Database initialized successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📂 Uploads directory: ${uploadsDir}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;