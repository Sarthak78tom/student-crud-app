const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken'); // Add this

const SECRET_KEY = 'PaajiSecretJWTKey123'; // Add this

// Generate Student ID
function generateStudentId(course, year) {
  const currentYear = new Date().getFullYear().toString().slice(-2);
  const courseCode = course.toUpperCase();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${courseCode}${currentYear}${year}${random}`;
}

// 👉 Register Student
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, course, year, semester, phone, address } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    // Generate unique student ID
    let studentId;
    let isUnique = false;
    while (!isUnique) {
      studentId = generateStudentId(course, year);
      const existingStudent = await User.findOne({ studentId });
      if (!existingStudent) {
        isUnique = true;
      }
    }
    
    // Create new user
    const user = new User({
      name,
      email,
      password, // In production, this should be hashed
      studentId,
      course,
      year,
      semester,
      phone,
      address,
      role: 'student'
    });
    
    const savedUser = await user.save();
    
    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        studentId: savedUser.studentId,
        course: savedUser.course,
        year: savedUser.year,
        semester: savedUser.semester,
        role: savedUser.role
      }
    });
    
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// �� Login - FIXED WITH JWT
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check for hardcoded admin
    if (email === 'admin@antoniv.edu' && password === 'admin123') {
      const adminToken = jwt.sign({ userId: 'admin', role: 'admin' }, SECRET_KEY, { expiresIn: '1h' });
      return res.json({
        message: 'Login successful',
        token: adminToken, // Add token
        user: {
          id: 'admin',
          name: 'Admin',
          email: 'admin@antoniv.edu',
          role: 'admin'
        }
      });
    }
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Check password (in production, use bcrypt.compare)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
    
    res.json({
      message: 'Login successful',
      token: token, // Add token
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        course: user.course,
        year: user.year,
        semester: user.semester,
        phone: user.phone,
        address: user.address,
        role: user.role
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 👉 Get User Profile
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 👉 Update User Profile
router.put('/profile/:id', async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, address },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
    
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// �� Get All Students (for admin)
router.get('/students', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;