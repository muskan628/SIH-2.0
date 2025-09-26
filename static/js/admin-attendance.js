// Admin Attendance JavaScript

let currentClass = '';
let students = [];
let attendanceData = {};

// Sample student data for different classes
const sampleStudents = {
  'BCA 1st Year': [
    { uid: 'BCA001', name: 'John Doe', rollNo: 'BCA001' },
    { uid: 'BCA002', name: 'Jane Smith', rollNo: 'BCA002' },
    { uid: 'BCA003', name: 'Mike Johnson', rollNo: 'BCA003' },
    { uid: 'BCA004', name: 'Sarah Wilson', rollNo: 'BCA004' },
    { uid: 'BCA005', name: 'David Brown', rollNo: 'BCA005' }
  ],
  'BCA 2nd Year': [
    { uid: 'BCA201', name: 'Alice Johnson', rollNo: 'BCA201' },
    { uid: 'BCA202', name: 'Bob Smith', rollNo: 'BCA202' },
    { uid: 'BCA203', name: 'Carol Davis', rollNo: 'BCA203' },
    { uid: 'BCA204', name: 'Daniel Wilson', rollNo: 'BCA204' }
  ],
  'B.Tech CSE 1st Year': [
    { uid: 'CSE001', name: 'Emma Thompson', rollNo: 'CSE001' },
    { uid: 'CSE002', name: 'James Miller', rollNo: 'CSE002' },
    { uid: 'CSE003', name: 'Lisa Anderson', rollNo: 'CSE003' },
    { uid: 'CSE004', name: 'Tom Wilson', rollNo: 'CSE004' },
    { uid: 'CSE005', name: 'Amy Garcia', rollNo: 'CSE005' },
    { uid: 'CSE006', name: 'Chris Lee', rollNo: 'CSE006' }
  ]
};

function openClass(className) {
  currentClass = className;
  students = sampleStudents[className] || [];
  
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
