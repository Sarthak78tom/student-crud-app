const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 10000;

// Import student routes
const studentRoutes = require('./routes/studentRoutes');

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'your-mongo-uri', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.log('❌ MongoDB Connection Error:', err));

// Middlewares
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