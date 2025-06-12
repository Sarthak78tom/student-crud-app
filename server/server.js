// server/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const studentRoutes = require('./routes/studentRoutes');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/students', studentRoutes);

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Catch-all route for SPA (serves index.html for non-API routes)
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
  });
