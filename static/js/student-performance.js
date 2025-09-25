// Sidebar toggle
const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");
menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

// Example performance data
const studentPerformance = {
  overall: 82,
  attendance: 88,
  assignments: 90,
  quizzes: 75,
  marks: [
    {subject:"Maths", obtained:78, total:100, grade:"A", date:"2025-09-15"},
    {subject:"DBMS", obtained:85, total:100, grade:"A+", date:"2025-09-16"},
    {subject:"Python", obtained:80, total:100, grade:"A", date:"2025-09-17"},
    {subject:"AI", obtained:65, total:100, grade:"B", date:"2025-09-18"}
  ],
  activities: [
    {activity:"Coding Competition", status:"Participated"},
    {activity:"Science Fair", status:"Won 2nd Prize"},
    {activity:"Sports Meet", status:"Active"},
    {activity:"Club Activities", status:"Active"}
  ]
};

// Populate cards
document.getElementById('overallMarks').innerText = studentPerformance.overall + "%";
document.getElementById('attendanceCard').innerText = studentPerformance.attendance + "%";
document.getElementById('assignmentMarks').innerText = studentPerformance.assignments + "%";
document.getElementById('quizMarks').innerText = studentPerformance.quizzes + "%";

// Populate marks table
const marksTable = document.getElementById('marksTable');
studentPerformance.marks.forEach(item => {
  const row = marksTable.insertRow();
  row.insertCell(0).innerText = item.subject;
  row.insertCell(1).innerText = item.obtained;
  row.insertCell(2).innerText = item.total;
  row.insertCell(3).innerText = item.grade;
  row.insertCell(4).innerText = item.date;
});

// Populate activities
const activityList = document.getElementById('activityList');
studentPerformance.activities.forEach(act => {
  const li = document.createElement('li');
  li.innerHTML = `<span>${act.activity}</span><strong>${act.status}</strong>`;
  activityList.appendChild(li);
});

// Chart.js - Performance chart
const ctx = document.getElementById('performanceChart').getContext('2d');
new Chart(ctx, {
  type:'bar',
  data:{
    labels: studentPerformance.marks.map(m=>m.subject),
    datasets:[
      {label:'Marks Obtained', data: studentPerformance.marks.map(m=>m.obtained), backgroundColor:'#4facfe'},
      {label:'Total Marks', data: studentPerformance.marks.map(m=>m.total), backgroundColor:'#a0c4ff'}
    ]
  },
  options:{
    responsive:true,
    plugins:{legend:{position:'top'}},
    scales:{y:{beginAtZero:true, max:100}}
  }
});