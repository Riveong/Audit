const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { pool, initDB } = require('./db');
const {
  upload,
  getAllSites,
  createSite,
  deleteSite,
  getAllViolations,
  createViolation,
  deleteViolation,
  updateViolationOrder,
  getAllChecklists,
  getChecklistById,
  createChecklist,
  updateChecklist,
  deleteChecklist,
  markChecklistAsCompleted,
  updateChecklistProgress,
  getChecklistProgress,
  resetChecklistProgress
} = require('./controller');

// Import auth controller - make sure this path is correct
const {
  loginUser,
  verifyToken
} = require('./authController');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Auth Routes (no token required)
app.post('/api/auth/login', loginUser);

// Sites Routes
app.get('/api/sites', getAllSites);
app.post('/api/sites', verifyToken, createSite);
app.delete('/api/sites/:id', verifyToken, deleteSite);

// Violations Routes
app.get('/api/violations', getAllViolations);
app.post('/api/violations', verifyToken, createViolation);
app.delete('/api/violations/:id', verifyToken, deleteViolation);
app.put('/api/violations/order', verifyToken, updateViolationOrder);

// Checklists Routes
app.get('/api/checklists', getAllChecklists);
app.get('/api/checklists/:id', getChecklistById);
app.post('/api/checklists', verifyToken, upload.single('image'), createChecklist);
app.put('/api/checklists/:id', verifyToken, upload.single('image'), updateChecklist);
app.delete('/api/checklists/:id', verifyToken, deleteChecklist);
app.put('/api/checklists/:id/complete', verifyToken, markChecklistAsCompleted);

// Checklist Progress Routes
app.put('/api/checklists/:checklistId/progress/:violationId', verifyToken, updateChecklistProgress);
app.get('/api/checklists/:checklistId/progress', getChecklistProgress);
app.post('/api/checklists/:checklistId/reset', verifyToken, resetChecklistProgress);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('Initializing database...');
    await initDB();
    
    console.log('Setting up authentication...');
    const { createAuthTables } = require('./auth-migrate');
    await createAuthTables();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log('📚 Available endpoints:');
      console.log('   - POST /api/auth/login - Login user');
      console.log('   - GET /api/sites - Get all sites');
      console.log('   - GET /api/violations - Get all violations');
      console.log('   - GET /api/checklists - Get all checklists');
      console.log('');
      console.log('🔐 Default login credentials:');
      console.log('   Employee ID: admin');
      console.log('   Password: admin123');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;