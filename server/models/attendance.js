const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
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
  totalClasses: {
    type: Number,
    required: true,
    default: 0
  },
  attendedClasses: {
    type: Number,
    required: true,
    default: 0
  },
  attendancePercentage: {
    type: Number,
    default: function() {
      return this.totalClasses > 0 ? (this.attendedClasses / this.totalClasses) * 100 : 0;
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Update percentage before saving
attendanceSchema.pre('save', function(next) {
  if (this.totalClasses > 0) {
    this.attendancePercentage = (this.attendedClasses / this.totalClasses) * 100;
  }
  this.lastUpdated = Date.now();
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);