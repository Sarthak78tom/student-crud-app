// DOM Elements
const studentForm = document.getElementById('studentForm');
const studentBody = document.getElementById('studentBody');
const submitButton = studentForm.querySelector('button[type="submit"]');
const cancelButton = document.getElementById('cancelBtn');
const studentCount = document.getElementById('studentCount');
const emptyState = document.getElementById('emptyState');
const studentTable = document.getElementById('studentTable');

// API Configuration
const API_BASE = 'https://student-crud-backend-u0nb.onrender.com/api/students';


// State Management
let editingStudent = null;
let students = [];

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  fetchStudents();
  setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
  studentForm.addEventListener('submit', handleFormSubmit);
  cancelButton.addEventListener('click', cancelEdit);
}

// Fetch all students from API
async function fetchStudents() {
  try {
    showLoading(true);
    const response = await fetch(API_BASE);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    students = await response.json();
    renderStudents();
    updateStudentCount();
    
  } catch (error) {
    console.error('❌ Error fetching students:', error);
    showError('Failed to load students. Please try again.');
  } finally {
    showLoading(false);
  }
}

// Render students in table
function renderStudents() {
  if (students.length === 0) {
    showEmptyState();
    return;
  }
  
  hideEmptyState();
  studentBody.innerHTML = '';
  
  students.forEach(student => {
    const row = createStudentRow(student);
    studentBody.appendChild(row);
  });
}

// Create student table row
function createStudentRow(student) {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${escapeHtml(student.name)}</td>
    <td>${escapeHtml(student.email)}</td>
    <td>${escapeHtml(student.course)}</td>
    <td>${student.year}</td>
    <td>
      <button onclick="editStudent('${student._id}')" class="action-btn edit-btn">
        <i class="fas fa-edit"></i> Edit
      </button>
      <button onclick="deleteStudent('${student._id}')" class="action-btn delete-btn">
        <i class="fas fa-trash"></i> Delete
      </button>
    </td>
  `;
  return row;
}

// Handle form submission
async function handleFormSubmit(event) {
  event.preventDefault();
  
  const formData = getFormData();
  if (!validateFormData(formData)) {
    return;
  }
  
  try {
    showButtonLoading(true);
    
    if (editingStudent) {
      await updateStudent(editingStudent, formData);
      showSuccess('Student updated successfully!');
    } else {
      await createStudent(formData);
      showSuccess('Student added successfully!');
    }
    
    resetForm();
    fetchStudents();
    
  } catch (error) {
    console.error('❌ Error saving student:', error);
    showError('Failed to save student. Please try again.');
  } finally {
    showButtonLoading(false);
  }
}

// Get form data
function getFormData() {
  return {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    course: document.getElementById('course').value.trim(),
    year: parseInt(document.getElementById('year').value)
  };
}

// Validate form data
function validateFormData(data) {
  if (!data.name || !data.email || !data.course || !data.year) {
    showError('Please fill in all fields.');
    return false;
  }
  
  if (data.year < 1 || data.year > 4) {
    showError('Academic year must be between 1 and 4.');
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    showError('Please enter a valid email address.');
    return false;
  }
  
  return true;
}

// Create new student
async function createStudent(studentData) {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(studentData)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create student');
  }
  
  return response.json();
}

// Update existing student
async function updateStudent(id, studentData) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(studentData)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update student');
  }
  
  return response.json();
}

// Edit student
function editStudent(id) {
  const student = students.find(s => s._id === id);
  if (!student) {
    showError('Student not found.');
    return;
  }
  
  // Fill form with student data
  document.getElementById('name').value = student.name;
  document.getElementById('email').value = student.email;
  document.getElementById('course').value = student.course;
  document.getElementById('year').value = student.year;
  
  // Update UI for editing mode
  editingStudent = id;
  submitButton.innerHTML = '<i class="fas fa-save"></i> Update Student';
  submitButton.style.background = 'linear-gradient(135deg, #ffc107, #e0a800)';
  cancelButton.style.display = 'inline-flex';
  
  // Scroll to form
  document.querySelector('.form-section').scrollIntoView({ 
    behavior: 'smooth' 
  });
}

// Cancel editing
function cancelEdit() {
  resetForm();
}

// Delete student
async function deleteStudent(id) {
  const student = students.find(s => s._id === id);
  if (!student) {
    showError('Student not found.');
    return;
  }
  
  const confirmMessage = `Are you sure you want to delete ${student.name}?`;
  if (!confirm(confirmMessage)) {
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete student');
    }
    
    showSuccess('Student deleted successfully!');
    fetchStudents();
    
  } catch (error) {
    console.error('❌ Error deleting student:', error);
    showError('Failed to delete student. Please try again.');
  }
}

// Reset form to initial state
function resetForm() {
  studentForm.reset();
  editingStudent = null;
  submitButton.innerHTML = '<i class="fas fa-save"></i> Save Student';
  submitButton.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
  cancelButton.style.display = 'none';
}

// Update student count
function updateStudentCount() {
  studentCount.textContent = students.length;
}

// Show/hide empty state
function showEmptyState() {
  emptyState.style.display = 'block';
  studentTable.style.display = 'none';
}

function hideEmptyState() {
  emptyState.style.display = 'none';
  studentTable.style.display = 'table';
}

// Loading states
function showLoading(isLoading) {
  if (isLoading) {
    studentBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 40px;">
          <div class="loading"></div>
          <span style="margin-left: 10px;">Loading students...</span>
        </td>
      </tr>
    `;
  }
}

function showButtonLoading(isLoading) {
  if (isLoading) {
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<div class="loading"></div> Saving...';
    submitButton.disabled = true;
    
    // Store original text for restoration
    submitButton.dataset.originalText = originalText;
  } else {
    submitButton.innerHTML = submitButton.dataset.originalText || 
      '<i class="fas fa-save"></i> Save Student';
    submitButton.disabled = false;
  }
}

// Utility functions
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Notification functions
function showSuccess(message) {
  showNotification(message, 'success');
}

function showError(message) {
  showNotification(message, 'error');
}

function showNotification(message, type) {
  // Remove existing notifications
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
    <span>${message}</span>
  `;
  
  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#28a745' : '#dc3545'};
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 500;
    animation: slideIn 0.3s ease-out forwards;
  `;
  
  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Add to page
  document.body.appendChild(notification);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideIn 0.3s ease-out reverse forwards';
      setTimeout(() => {
        notification.remove();
        style.remove();
      }, 300);
    }
  }, 3000);
}