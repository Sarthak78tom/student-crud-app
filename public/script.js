const studentForm = document.getElementById('studentForm');
const studentBody = document.getElementById('studentBody');
const submitButton = studentForm.querySelector('button');

// ✅ Use full API base URL
const API_BASE = 'https://student-crud-backend-u0nb.onrender.com/api/students';

let editingStudent = null; // Track which student we're editing

const fetchStudents = async () => {
  try {
    const res = await fetch(API_BASE);
    const data = await res.json();

    console.log('Fetched Data:', data);

    studentBody.innerHTML = '';
    data.forEach(student => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${student.name}</td>
        <td>${student.email}</td>
        <td>${student.course}</td>
        <td>${student.year}</td>
        <td>
          <button onclick="editStudent('${student._id}', '${student.name}', '${student.email}', '${student.course}', ${student.year})" class="edit-btn">✏️ Edit</button>
          <button onclick="deleteStudent('${student._id}')" class="delete-btn">🗑️ Delete</button>
        </td>
      `;
      studentBody.appendChild(row);
    });
  } catch (err) {
    console.error('❌ Error fetching students:', err);
  }
};

const editStudent = (id, name, email, course, year) => {
  // Fill form with existing data
  document.getElementById('name').value = name;
  document.getElementById('email').value = email;
  document.getElementById('course').value = course;
  document.getElementById('year').value = year;
  
  // Set editing mode
  editingStudent = id;
  submitButton.textContent = 'Update Student';
  submitButton.style.backgroundColor = '#ffc107';
};

const cancelEdit = () => {
  editingStudent = null;
  submitButton.textContent = 'Save Student';
  submitButton.style.backgroundColor = '#28a745';
  studentForm.reset();
};

studentForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const course = document.getElementById('course').value;
  const year = document.getElementById('year').value;

  try {
    if (editingStudent) {
      // Update existing student
      await fetch(`${API_BASE}/${editingStudent}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, course, year })
      });
      cancelEdit();
    } else {
      // Create new student
      await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, course, year })
      });
      studentForm.reset();
    }

    fetchStudents(); // Refresh table
  } catch (err) {
    console.error('❌ Error saving student:', err);
  }
});

const deleteStudent = async (id) => {
  if (confirm('Are you sure you want to delete this student?')) {
    try {
      await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      fetchStudents();
    } catch (err) {
      console.error('❌ Error deleting student:', err);
    }
  }
};

// ✅ Initial fetch on page load
fetchStudents();