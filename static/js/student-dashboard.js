// Sidebar toggle for mobile
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("active");
}

// Load student data from backend API
async function loadStudentData() {
  try {
    const response = await fetch("/api/student/me");
    const studentData = await response.json();

    // Populate Dashboard
    if (studentData && studentData.ok) {
      document.getElementById('welcomeMsg').innerText = `Welcome, ${studentData.name || ''} 👋`;
      document.getElementById('studentName').innerText = studentData.name || '';
      document.getElementById('studentStream').innerText = studentData.stream || '';
      document.getElementById('studentRoll').innerText = `Roll No: ${studentData.roll_no || ''}`;
      document.getElementById('studentContact').innerText = studentData.contact || '';
      document.getElementById('fatherName').innerText = studentData.father_name || '';
      document.getElementById('fatherContact').innerText = studentData.father_contact || '';

      // Cards
      document.getElementById('attendanceCard').innerText = (studentData.attendance ?? 0) + "%";
      document.getElementById('feesCard').innerText = "₹" + (studentData.pending_fees ?? 0);
      document.getElementById('performanceCard').innerText = studentData.performance || '';

      // Attendance bar
      const att = studentData.attendance ?? 0;
      document.getElementById('attendanceBar').style.width = att + "%";
      document.getElementById('attendanceBar').innerText = att + "%";

      // Exam Table
      const examTable = document.getElementById('examTable');
      if (examTable) {
        examTable.querySelectorAll("tr:not(:first-child)").forEach(row => row.remove());
        (studentData.exams || []).forEach(exam => {
          const row = examTable.insertRow();
          row.insertCell(0).innerText = exam.exam || '';
          row.insertCell(1).innerText = exam.date || '';
          row.insertCell(2).innerText = exam.time || '';
        });
      }
    }

  } catch (error) {
    console.error("Error loading student data:", error);
  }
}

// Page load par data fetch karo
document.addEventListener("DOMContentLoaded", loadStudentData);

