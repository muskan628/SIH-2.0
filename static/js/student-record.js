// SEARCH FUNCTION
document.getElementById("searchInput").addEventListener("keyup", function(){
  let value = this.value.toLowerCase();
  let rows = document.querySelectorAll("#recordsTable tr:not(:first-child)");
  rows.forEach(row=>{
    let text = row.innerText.toLowerCase();
    row.style.display = text.includes(value) ? "" : "none";
  });
});

// FILTER FUNCTION
document.getElementById("filterPerformance").addEventListener("change", function(){
  let filter = this.value;
  let rows = document.querySelectorAll("#recordsTable tr:not(:first-child)");
  rows.forEach(row=>{
    let performance = row.cells[6].innerText;
    row.style.display = (filter==="" || performance===filter) ? "" : "none";
  });
});
// Sidebar toggle for mobile
const sidebar = document.getElementById('sidebar');
document.getElementById('menuToggle').addEventListener('click', ()=> {
  sidebar.classList.toggle('active');
});

// Example student records
const students = [
  {roll: "101", name:"Rahul Sharma", stream:"BCA 2nd Year", contact:"9876543210", attendance:85, fees:12000, performance:"Good"},
  {roll: "102", name:"Priya Verma", stream:"B.Sc IT", contact:"9876509876", attendance:92, fees:0, performance:"Excellent"},
  {roll: "103", name:"Amit Kumar", stream:"BCA 1st Year", contact:"9856342211", attendance:76, fees:8000, performance:"Average"},
  {roll: "104", name:"Simran Kaur", stream:"B.Tech CSE", contact:"9812345678", attendance:95, fees:0, performance:"Excellent"},
  {roll: "105", name:"Arjun Singh", stream:"BCA 3rd Year", contact:"9876123450", attendance:60, fees:15000, performance:"Needs Improvement"}
];

// Populate table dynamically
const table = document.getElementById("recordsTable");
students.forEach(s=>{
  const row = table.insertRow();
  row.insertCell(0).innerText = s.roll;
  row.insertCell(1).innerText = s.name;
  row.insertCell(2).innerText = s.stream;
  row.insertCell(3).innerText = s.contact;

  // Attendance with progress bar
  const attendanceCell = row.insertCell(4);
  attendanceCell.innerHTML = `
    <div class="progress"><div class="progress-bar" style="width:${s.attendance}%"></div></div>
    <small>${s.attendance}%</small>
  `;

  row.insertCell(5).innerText = "₹" + s.fees;
  row.insertCell(6).innerText = s.performance;
});

 