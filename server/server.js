const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 10000;

// Import routes
const studentRoutes = require('./routes/studentRoutes');
const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const resultRoutes = require('./routes/resultRoutes');

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://sarthakchua29:nCvaeHrd983kHdEp@student-cluster.ya1freq.mongodb.net/test?retryWrites=true&w=majority&appName=student-cluster', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ MongoDB Connected Successfully');
  console.log('🏫 Antoniv University Backend is Ready!');
}).catch((err) => console.log('❌ MongoDB Connection Error:', err));

// Middlewares
app.use(express.json());

// Enable CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// 🔥 API Routes
app.use('/api/students', studentRoutes);      // Original student CRUD
app.use('/api/auth', authRoutes);             // Authentication & user management
app.use('/api/attendance', attendanceRoutes); // Attendance management
app.use('/api/results', resultRoutes);        // Results management

// 🔥 Serve static files (HTML, CSS, JS) from the 'public' folder
app.use(express.static(path.join(__dirname, '..', 'public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Antoniv University Server is running!',
    timestamp: new Date().toISOString(),
    endpoints: {
      students: '/api/students',
      auth: '/api/auth',
      attendance: '/api/attendance',
      results: '/api/results'
    }
  });
});

// ⭐ Fallback route: send index.html for unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`🏫 Antoniv University Management System`);
  console.log(`📚 Available endpoints:`);
  console.log(`   - /api/students (CRUD operations)`);
  console.log(`   - /api/auth (Authentication)`);
  console.log(`   - /api/attendance (Attendance management)`);
  console.log(`   - /api/results (Results management)`);
  console.log(`   - /api/health (Health check)`);
});