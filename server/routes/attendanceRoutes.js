const express = require('express');
const router = express.Router();
const Attendance = require('../models/attendance');

// 👉 Create/Update Attendance Record
router.post('/', async (req, res) => {
  try {
    const { studentId, studentName, course, year, semester, subject, subjectCode, totalClasses, attendedClasses } = req.body;
    
    // Check if record already exists
    const existingRecord = await Attendance.findOne({ 
      studentId, 
      subject: subject,
      semester: semester
    });
    
    if (existingRecord) {
      // Update existing record
      existingRecord.totalClasses = totalClasses;
      existingRecord.attendedClasses = attendedClasses;
      existingRecord.lastUpdated = Date.now();
      
      const updatedRecord = await existingRecord.save();
      res.json({
        message: 'Attendance updated successfully',
        attendance: updatedRecord
      });
    } else {
      // Create new record
      const attendance = new Attendance({
        studentId,
        studentName,
        course,
        year,
        semester,
        subject,
        subjectCode,
        totalClasses,
        attendedClasses
      });
      
      const savedAttendance = await attendance.save();
      res.status(201).json({
        message: 'Attendance record created successfully',
        attendance: savedAttendance
      });
    }
    
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 👉 Get All Attendance Records
router.get('/', async (req, res) => {
  try {
    const attendance = await Attendance.find().sort({ studentId: 1, subject: 1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 👉 Get Attendance by Student ID
router.get('/student/:studentId', async (req, res) => {
  try {
    const attendance = await Attendance.find({ 
      studentId: req.params.studentId 
    }).sort({ subject: 1 });
    
    if (attendance.length === 0) {
      return res.status(404).json({ message: 'No attendance records found for this student' });
    }
    
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 👉 Get Attendance by Course and Year
router.get('/course/:course/year/:year', async (req, res) => {
  try {
    const { course, year } = req.params;
    const attendance = await Attendance.find({ 
      course: course.toUpperCase(), 
      year: parseInt(year) 
    }).sort({ studentName: 1, subject: 1 });
    
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 👉 Update Attendance Record
router.put('/:id', async (req, res) => {
  try {
    const { totalClasses, attendedClasses } = req.body;
    
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    
    attendance.totalClasses = totalClasses;
    attendance.attendedClasses = attendedClasses;
    attendance.lastUpdated = Date.now();
    
    const updatedAttendance = await attendance.save();
    
    res.json({
      message: 'Attendance updated successfully',
      attendance: updatedAttendance
    });
    
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 👉 Delete Attendance Record
router.delete('/:id', async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 👉 Bulk Create Attendance Records (for admin convenience)
router.post('/bulk', async (req, res) => {
  try {
    const { students, subject, subjectCode, totalClasses } = req.body;
    
    const attendanceRecords = students.map(student => ({
      studentId: student.studentId,
      studentName: student.name,
      course: student.course,
      year: student.year,
      semester: student.semester,
      subject,
      subjectCode,
      totalClasses,
      attendedClasses: 0 // Initially 0, admin can update later
    }));
    
    const savedRecords = await Attendance.insertMany(attendanceRecords);
    
    res.status(201).json({
      message: `${savedRecords.length} attendance records created successfully`,
      records: savedRecords
    });
    
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 👉 Get Attendance Summary for Dashboard
router.get('/summary/:studentId', async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const attendance = await Attendance.find({ studentId });
    
    if (attendance.length === 0) {
      return res.json({
        totalSubjects: 0,
        overallPercentage: 0,
        lowAttendanceSubjects: [],
        goodAttendanceSubjects: []
      });
    }
    
    const totalSubjects = attendance.length;
    const overallPercentage = attendance.reduce((sum, record) => sum + record.attendancePercentage, 0) / totalSubjects;
    
    const lowAttendanceSubjects = attendance.filter(record => record.attendancePercentage < 75);
    const goodAttendanceSubjects = attendance.filter(record => record.attendancePercentage >= 75);
    
    res.json({
      totalSubjects,
      overallPercentage: Math.round(overallPercentage * 100) / 100,
      lowAttendanceSubjects,
      goodAttendanceSubjects
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;