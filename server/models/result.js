const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  course: {
    type: String,
    required: true,
    enum: ['CSE', 'IT', 'CE']
  },
  year: {
    type: Number,
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  subjectCode: {
    type: String,
    required: true
  },
  mid1: {
    marksObtained: {
      type: Number,
      default: 0,
      min: 0,
      max: 50
    },
    totalMarks: {
      type: Number,
      default: 50
    },
    percentage: {
      type: Number,
      default: 0
    }
  },
  mid2: {
    marksObtained: {
      type: Number,
      default: 0,
      min: 0,
      max: 50
    },
    totalMarks: {
      type: Number,
      default: 50
    },
    percentage: {
      type: Number,
      default: 0
    }
  },
  total: {
    marksObtained: {
      type: Number,
      default: 0
    },
    totalMarks: {
      type: Number,
      default: 100
    },
    percentage: {
      type: Number,
      default: 0
    }
  },
  grade: {
    type: String,
    default: 'F'
  },
  status: {
    type: String,
    enum: ['Pass', 'Fail', 'Pending'],
    default: 'Pending'
  }
}, { timestamps: true });

// Calculate percentages and grade before saving
resultSchema.pre('save', function(next) {
  // Calculate Mid-1 percentage
  if (this.mid1.totalMarks > 0) {
    this.mid1.percentage = (this.mid1.marksObtained / this.mid1.totalMarks) * 100;
  }
  
  // Calculate Mid-2 percentage
  if (this.mid2.totalMarks > 0) {
    this.mid2.percentage = (this.mid2.marksObtained / this.mid2.totalMarks) * 100;
  }
  
  // Calculate total
  this.total.marksObtained = this.mid1.marksObtained + this.mid2.marksObtained;
  this.total.percentage = (this.total.marksObtained / this.total.totalMarks) * 100;
  
  // Determine grade and status
  const percentage = this.total.percentage;
  if (percentage >= 90) {
    this.grade = 'A+';
  } else if (percentage >= 80) {
    this.grade = 'A';
  } else if (percentage >= 70) {
    this.grade = 'B+';
  } else if (percentage >= 60) {
    this.grade = 'B';
  } else if (percentage >= 50) {
    this.grade = 'C';
  } else if (percentage >= 40) {
    this.grade = 'D';
  } else {
    this.grade = 'F';
  }
  
  this.status = percentage >= 40 ? 'Pass' : 'Fail';
  
  next();
});

module.exports = mongoose.model('Result', resultSchema);