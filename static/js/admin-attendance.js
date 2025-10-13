// Admin Attendance JavaScript

let currentClass = '';
let students = [];
let attendanceData = {};

async function openClass(className) {
  currentClass = className;
  // Try to fetch current roster for the class; fallback to attendance template
  try {
    let res = await fetch('/api/classes/' + encodeURIComponent(className) + '/students');
    if (res.ok) {
      const data = await res.json();
      if (data && data.ok && Array.isArray(data.students)) {
        students = data.students;
      }
    }
    if (!Array.isArray(students) || students.length === 0) {
      // fallback to template derived from previous attendance
      res = await fetch('/api/attendance/template?class_name=' + encodeURIComponent(className));
      const data2 = await res.json();
      students = (data2.students || []);
    }
  } catch (e) {
    console.error('Failed to load students for class', e);
    students = [];
  }
  
  // Show student list, hide class list
  document.getElementById('classList').style.display = 'none';
  document.getElementById('studentList').style.display = 'block';
  document.getElementById('classTitle').textContent = className;
  
  // Set today's date as default
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('attendanceDate').value = today;
  
  // Clear previous attendance data
  attendanceData = {};
  
  // Populate student table
  populateStudentTable();
}

function goBack() {
  // Show class list, hide student list
  document.getElementById('classList').style.display = 'block';
  document.getElementById('studentList').style.display = 'none';
  
  // Clear attendance data
  attendanceData = {};
}

function populateStudentTable() {
  const tbody = document.getElementById('students');
  tbody.innerHTML = '';
  
  students.forEach((student, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${student.uid}</td>
      <td>${student.name}</td>
      <td>
        <button class="present-btn" onclick="markAttendance(${index}, 'Present')">Present</button>
        <button class="absent-btn" onclick="markAttendance(${index}, 'Absent')">Absent</button>
      </td>
      <td id="status-${index}">Not Marked</td>
    `;
    tbody.appendChild(row);
  });
}

function markAttendance(index, status) {
  const student = students[index];
  attendanceData[student.uid] = status;
  
  // Update status display
  document.getElementById(`status-${index}`).textContent = status;
  document.getElementById(`status-${index}`).style.color = status === 'Present' ? 'green' : 'red';
  
  // Update button styles
  const row = document.getElementById(`status-${index}`).parentElement;
  const presentBtn = row.querySelector('.present-btn');
  const absentBtn = row.querySelector('.absent-btn');
  
  if (status === 'Present') {
    presentBtn.style.backgroundColor = 'green';
    absentBtn.style.backgroundColor = '';
  } else {
    absentBtn.style.backgroundColor = 'red';
    presentBtn.style.backgroundColor = '';
  }
  
  updateSummary();
}

function updateSummary() {
  const total = students.length;
  const present = Object.values(attendanceData).filter(status => status === 'Present').length;
  const absent = Object.values(attendanceData).filter(status => status === 'Absent').length;
  const notMarked = total - present - absent;
  
  document.getElementById('summary').innerHTML = `
    <div style="background: #f0f0f0; padding: 10px; border-radius: 5px;">
      <h3>Attendance Summary</h3>
      <p><strong>Total Students:</strong> ${total}</p>
      <p style="color: green;"><strong>Present:</strong> ${present}</p>
      <p style="color: red;"><strong>Absent:</strong> ${absent}</p>
      <p style="color: orange;"><strong>Not Marked:</strong> ${notMarked}</p>
      <p><strong>Attendance Rate:</strong> ${total > 0 ? Math.round((present / total) * 100) : 0}%</p>
    </div>
  `;
}

function markAllPresent() {
  students.forEach((student, index) => {
    markAttendance(index, 'Present');
  });
}

function markAllAbsent() {
  students.forEach((student, index) => {
    markAttendance(index, 'Absent');
  });
}

async function saveAttendance() {
  if (Object.keys(attendanceData).length === 0) {
    alert('Please mark attendance for at least one student.');
    return;
  }
  
  const date = document.getElementById('attendanceDate').value;
  const subject = document.getElementById('attendanceSubject').value;
  
  if (!date) {
    alert('Please select a date.');
    return;
  }
  
  if (!subject) {
    alert('Please select a subject.');
    return;
  }
  
  try {
    const attendanceRecords = students
      .filter(student => attendanceData[student.uid])
      .map(student => ({
        uid: student.uid,
        name: student.name,
        status: attendanceData[student.uid]
      }));
    
    const response = await fetch('/api/attendance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        class_name: currentClass,
        date: date,
        subject: subject,
        students: attendanceRecords
      })
    });
    
    const result = await response.json();
    
    if (result.ok) {
      alert(`Attendance saved successfully for ${result.saved} students!`);
      // Clear attendance data after saving
      attendanceData = {};
      populateStudentTable();
      updateSummary();
    } else {
      alert('Failed to save attendance. Please try again.');
    }
  } catch (error) {
    console.error('Error saving attendance:', error);
    alert('Error saving attendance. Please check console for details.');
  }
}

// Initialize summary on page load
document.addEventListener('DOMContentLoaded', function() {
  updateSummary();
});
