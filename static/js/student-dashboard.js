// Sidebar toggle for mobile
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("active");
}

// Load student data from backend API
async function loadStudentData() {
  try {
    // Backend se data fetch (example: /api/student/10234)
    const response = await fetch("/api/student/10234");  
    const studentData = await response.json();

    // Populate Dashboard
    document.getElementById('welcomeMsg').innerText = `Welcome, ${studentData.name} 👋`;
    document.getElementById('studentName').innerText = studentData.name;
    document.getElementById('studentStream').innerText = studentData.stream;
    document.getElementById('studentRoll').innerText = `Roll No: ${studentData.roll_no}`;
    document.getElementById('studentContact').innerText = studentData.contact;
    document.getElementById('fatherName').innerText = studentData.father_name;
    document.getElementById('fatherContact').innerText = studentData.father_contact;

    // Cards
    document.getElementById('attendanceCard').innerText = studentData.attendance + "%";
    document.getElementById('feesCard').innerText = "₹" + studentData.pending_fees;
    document.getElementById('performanceCard').innerText = studentData.performance;

    // Attendance bar
    document.getElementById('attendanceBar').style.width = studentData.attendance + "%";
    document.getElementById('attendanceBar').innerText = studentData.attendance + "%";

    // Exam Table
    const examTable = document.getElementById('examTable');
    examTable.querySelectorAll("tr:not(:first-child)").forEach(row => row.remove()); // clear old rows

    studentData.exams.forEach(exam => {
      const row = examTable.insertRow();
      row.insertCell(0).innerText = exam.exam;
      row.insertCell(1).innerText = exam.date;
      row.insertCell(2).innerText = exam.time;
    });

  } catch (error) {
    console.error("Error loading student data:", error);
  }
}

// Page load par data fetch karo
document.addEventListener("DOMContentLoaded", loadStudentData);
