const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 10000;

// Import student routes
const studentRoutes = require('./routes/studentRoutes');

// MongoDB connection
mongoose.connect('mongodb+srv://sarthakchua29:nCvaeHrd983kHdEp@student-cluster.ya1freq.mongodb.net/test?retryWrites=true&w=majority&appName=student-cluster', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.log('❌ MongoDB Connection Error:', err));

// Middlewares
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// 🔥 API Routes - ADD THIS BEFORE static files
app.use('/api/students', studentRoutes);

// 🔥 Serve static files (HTML, CSS, JS) from the 'public' folder
app.use(express.static(path.join(__dirname, '..', 'public')));

// ⭐ Fallback route: send index.html for unmatched routes (e.g. /home, /about)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});