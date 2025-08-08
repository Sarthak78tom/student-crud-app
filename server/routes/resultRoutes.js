const express = require('express');
const router = express.Router();
const Result = require('../models/result');

// 👉 Create/Update Result Record
router.post('/', async (req, res) => {
  try {
    const { 
      studentId, 
      studentName, 
      course, 
      year, 
      semester, 
      subject, 
      subjectCode, 
      mid1, 
      mid2 
    } = req.body;
    
    // Check if record already exists
    const existingResult = await Result.findOne({ 
      studentId, 
      subject: subject,
      semester: semester
    });
    
    if (existingResult) {
      // Update existing record
      if (mid1) {
        existingResult.mid1.marksObtained = mid1.marksObtained || existingResult.mid1.marksObtained;
        existingResult.mid1.totalMarks = mid1.totalMarks || existingResult.mid1.totalMarks;
      }
      
      if (mid2) {
        existingResult.mid2.marksObtained = mid2.marksObtained || existingResult.mid2.marksObtained;
        existingResult.mid2.totalMarks = mid2.totalMarks || existingResult.mid2.totalMarks;
      }
      
      const updatedResult = await existingResult.save();
      res.json({
        message: 'Result updated successfully',
        result: updatedResult
      });
    } else {
      // Create new record
      const result = new Result({
        studentId,
        studentName,
        course,
        year,
        semester,
        subject,
        subjectCode,
        mid1: mid1 || { marksObtained: 0, totalMarks: 50 },
        mid2: mid2 || { marksObtained: 0, totalMarks: 50 }
      });
      
      const savedResult = await result.save();
      res.status(201).json({
        message: 'Result record created successfully',
        result: savedResult
      });
    }
    
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 👉 Get All Results
router.get('/', async (req, res) => {
  try {
    const results = await Result.find().sort({ studentId: 1, subject: 1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 👉 Get Results by Student ID
router.get('/student/:studentId', async (req, res) => {
  try {
    const results = await Result.find({ 
      studentId: req.params.studentId 
    }).sort({ subject: 1 });
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'No results found for this student' });
    }
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 👉 Get Results by Course and Year
router.get('/course/:course/year/:year', async (req, res) => {
  try {
    const { course, year } = req.params;
    const results = await Result.find({ 
      course: course.toUpperCase(), 
      year: parseInt(year) 
    }).sort({ studentName: 1, subject: 1 });
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 👉 Update Result Record
router.put('/:id', async (req, res) => {
  try {
    const { mid1, mid2 } = req.body;
    
    const result = await Result.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Result record not found' });
    }
    
    if (mid1) {
      result.mid1.marksObtained = mid1.marksObtained !== undefined ? mid1.marksObtained : result.mid1.marksObtained;
      result.mid1.totalMarks = mid1.totalMarks !== undefined ? mid1.totalMarks : result.mid1.totalMarks;
    }
    
    if (mid2) {
      result.mid2.marksObtained = mid2.marksObtained !== undefined ? mid2.marksObtained : result.mid2.marksObtained;
      result.mid2.totalMarks = mid2.totalMarks !== undefined ? mid2.totalMarks : result.mid2.totalMarks;
    }
    
    const updatedResult = await result.save();
    
    res.json({
      message: 'Result updated successfully',
      result: updatedResult
    });
    
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 👉 Delete Result Record
router.delete('/:id', async (req, res) => {
  try {
    const result = await Result.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Result record not found' });
    }
    
    res.json({ message: 'Result record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 👉 Bulk Create Result Records (for admin convenience)
router.post('/bulk', async (req, res) => {
  try {
    const { students, subject, subjectCode } = req.body;
    
    const resultRecords = students.map(student => ({
      studentId: student.studentId,
      studentName: student.name,
      course: student.course,
      year: student.year,
      semester: student.semester,
      subject,
      subjectCode,
      mid1: { marksObtained: 0, totalMarks: 50 },
      mid2: { marksObtained: 0, totalMarks: 50 }
    }));
    
    const savedRecords = await Result.insertMany(resultRecords);
    
    res.status(201).json({
      message: `${savedRecords.length} result records created successfully`,
      records: savedRecords
    });
    
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 👉 Get Results Summary for Dashboard
router.get('/summary/:studentId', async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const results = await Result.find({ studentId });
    
    if (results.length === 0) {
      return res.json({
        totalSubjects: 0,
        overallPercentage: 0,
        passedSubjects: 0,
        failedSubjects: 0,
        topPerformingSubjects: [],
        needImprovementSubjects: []
      });
    }
    
    const totalSubjects = results.length;
    const overallPercentage = results.reduce((sum, result) => sum + result.total.percentage, 0) / totalSubjects;
    const passedSubjects = results.filter(result => result.status === 'Pass').length;
    const failedSubjects = results.filter(result => result.status === 'Fail').length;
    
    const topPerformingSubjects = results
      .filter(result => result.total.percentage >= 80)
      .sort((a, b) => b.total.percentage - a.total.percentage)
      .slice(0, 3);
    
    const needImprovementSubjects = results
      .filter(result => result.total.percentage < 60)
      .sort((a, b) => a.total.percentage - b.total.percentage)
      .slice(0, 3);
    
    res.json({
      totalSubjects,
      overallPercentage: Math.round(overallPercentage * 100) / 100,
      passedSubjects,
      failedSubjects,
      topPerformingSubjects,
      needImprovementSubjects
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 👉 Get Subject-wise Statistics (for admin dashboard)
router.get('/statistics/subjects', async (req, res) => {
  try {
    const results = await Result.aggregate([
      {
        $group: {
          _id: { subject: '$subject', course: '$course', year: '$year' },
          averagePercentage: { $avg: '$total.percentage' },
          totalStudents: { $sum: 1 },
          passedStudents: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Pass'] }, 1, 0]
            }
          },
          failedStudents: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Fail'] }, 1, 0]
            }
          },
          highestMarks: { $max: '$total.percentage' },
          lowestMarks: { $min: '$total.percentage' }
        }
      },
      {
        $project: {
          subject: '$_id.subject',
          course: '$_id.course',
          year: '$_id.year',
          averagePercentage: { $round: ['$averagePercentage', 2] },
          totalStudents: 1,
          passedStudents: 1,
          failedStudents: 1,
          passPercentage: {
            $round: [
              { $multiply: [{ $divide: ['$passedStudents', '$totalStudents'] }, 100] },
              2
            ]
          },
          highestMarks: { $round: ['$highestMarks', 2] },
          lowestMarks: { $round: ['$lowestMarks', 2] },
          _id: 0
        }
      },
      { $sort: { course: 1, year: 1, subject: 1 } }
    ]);
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;