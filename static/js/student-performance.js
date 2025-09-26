// Sidebar toggle
const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");
menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

fetch('/api/performance')
  .then(r=>r.json())
  .then(data => {
    if (!data.ok) throw new Error(data.error || 'Failed to load performance');
    document.getElementById('overallMarks').innerText = (data.overall||0) + "%";
    document.getElementById('attendanceCard').innerText = (data.attendance||0) + "%";
    document.getElementById('assignmentMarks').innerText = (data.assignments||0) + "%";
    document.getElementById('quizMarks').innerText = (data.quizzes||0) + "%";

    const marks = data.marks || [];
    const marksTable = document.getElementById('marksTable');
    marks.forEach(item => {
      const row = marksTable.insertRow();
      row.insertCell(0).innerText = item.subject;
      row.insertCell(1).innerText = item.obtained;
      row.insertCell(2).innerText = item.total;
      row.insertCell(3).innerText = item.grade;
      row.insertCell(4).innerText = item.date;
    });

    const activityList = document.getElementById('activityList');
    (data.activities||[]).forEach(act => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${act.activity}</span><strong>${act.status}</strong>`;
      activityList.appendChild(li);
    });

    const ctx = document.getElementById('performanceChart').getContext('2d');
    new Chart(ctx, {
      type:'bar',
      data:{
        labels: marks.map(m=>m.subject),
        datasets:[
          {label:'Marks Obtained', data: marks.map(m=>m.obtained||0), backgroundColor:'#4facfe'},
          {label:'Total Marks', data: marks.map(m=>m.total||100), backgroundColor:'#a0c4ff'}
        ]
      },
      options:{
        responsive:true,
        plugins:{legend:{position:'top'}},
        scales:{y:{beginAtZero:true, max:100}}
      }
    });
  })
  .catch(err => {
    console.error(err);
  });