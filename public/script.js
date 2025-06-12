const studentForm = document.getElementById('studentForm');
const studentBody = document.getElementById('studentBody');

// ✅ Use full API base URL
const API_BASE = 'https://student-crud-backend-u0nb.onrender.com/api/students';

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
          <button onclick="deleteStudent('${student._id}')">Delete</button>
        </td>
      `;
      studentBody.appendChild(row);
    });
  } catch (err) {
    console.error('❌ Error fetching students:', err);
  }
};

studentForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const course = document.getElementById('course').value;
  const year = document.getElementById('year').value;

  try {
    await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, course, year })
    });

    studentForm.reset();
    fetchStudents(); // Refresh table
  } catch (err) {
    console.error('❌ Error adding student:', err);
  }
});

const deleteStudent = async (id) => {
  try {
    await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    fetchStudents();
  } catch (err) {
    console.error('❌ Error deleting student:', err);
  }
};

// ✅ Initial fetch on page load
fetchStudents();
