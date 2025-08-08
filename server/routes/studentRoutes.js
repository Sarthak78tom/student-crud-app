const express = require('express');
const router = express.Router();
const Student = require('../models/student');
const authenticateToken = require('../middleware/authMiddleware'); 

//  Create a student
router.post('/', authenticateToken, async (req, res) => { // ← ADD authenticateToken HERE
  try {
    const student = new Student(req.body);
    const savedStudent = await student.save();
    res.status(201).json(savedStudent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//  Read all students
router.get('/', authenticateToken, async (req, res) => { // ← ADD authenticateToken HERE
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//  Update a student
router.put('/:id', authenticateToken, async (req, res) => { // ← ADD authenticateToken HERE
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 👉 Delete a student
router.delete('/:id', authenticateToken, async (req, res) => { // ← ADD authenticateToken HERE
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;