const studentForm = document.getElementById('studentForm');
const studentBody = document.getElementById('studentBody');

const fetchStudents = async () => {
  const res = await fetch('/api/students');
  const data = await res.json();

  console.log('Fetched Data:', data); // ✅ Confirm what you're getting

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
};

studentForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const course = document.getElementById('course').value;
  const year = document.getElementById('year').value;

  await fetch('/api/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, course, year })
  });

  studentForm.reset();
  fetchStudents();
});

const deleteStudent = async (id) => {
  await fetch(`/api/students/${id}`, { method: 'DELETE' });
  fetchStudents();
};

// Call once page loads
fetchStudents();
