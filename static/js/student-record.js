// Example student data
const students = [
  {roll: "101", name:"Rahul Sharma", stream:"BCA 2nd Year", contact:"9876543210", attendance:85, fees:12000, performance:"Good"},
  {roll: "102", name:"Priya Verma", stream:"B.Sc IT", contact:"9876509876", attendance:92, fees:0, performance:"Excellent"},
  {roll: "103", name:"Amit Kumar", stream:"BCA 1st Year", contact:"9856342211", attendance:76, fees:8000, performance:"Average"},
  {roll: "104", name:"Simran Kaur", stream:"B.Tech CSE", contact:"9812345678", attendance:95, fees:0, performance:"Excellent"},
  {roll: "105", name:"Arjun Singh", stream:"BCA 3rd Year", contact:"9876123450", attendance:60, fees:15000, performance:"Needs Improvement"}
];

// Populate table dynamically
const tableBody = document.querySelector("#recordsTable tbody");
students.forEach(s => {
  const row = document.createElement("tr");

  row.innerHTML = `
    <td data-label="Roll No">${s.roll}</td>
    <td data-label="Name">${s.name}</td>
    <td data-label="Stream">${s.stream}</td>
    <td data-label="Contact">${s.contact}</td>
    <td data-label="Attendance">
      <div class="progress"><div class="progress-bar" style="width:${s.attendance}%"></div></div>
      <small>${s.attendance}%</small>
    </td>
    <td data-label="Fees Pending">₹${s.fees}</td>
    <td data-label="Performance">${s.performance}</td>
  `;
  tableBody.appendChild(row);
});

// Search Function
document.getElementById("searchInput").addEventListener("keyup", function() {
  const value = this.value.toLowerCase();
  document.querySelectorAll("#recordsTable tbody tr").forEach(row => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(value) ? "" : "none";
  });
});

// Filter Function
document.getElementById("filterPerformance").addEventListener("change", function() {
  const filter = this.value;
  document.querySelectorAll("#recordsTable tbody tr").forEach(row => {
    const performance = row.cells[6].innerText;
    row.style.display = (filter === "" || performance === filter) ? "" : "none";
  });
});
