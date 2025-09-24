function uploadAssignment() {
  const fileInput = document.getElementById('fileInput');
  const table = document.getElementById('assignmentTable');
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const row = table.insertRow();
    row.insertCell(0).innerText = file.name;
    row.insertCell(1).innerText = new Date().toLocaleDateString();
    fileInput.value = ""; // clear input
  } else {
    alert("Please select a file first.");
  }
}

function logout() {
  alert("You have been logged out.");
  window.location.href = "/"; // redirect to login page
}
function uploadAssignment() {
  const fileInput = document.getElementById('fileInput');
  const table = document.getElementById('assignmentTable');
  
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const row = table.insertRow();
    
    row.insertCell(0).innerText = file.name;
    row.insertCell(1).innerText = new Date().toLocaleDateString();
    row.insertCell(2).innerHTML = `<button class="download-btn">Download</button>`;
    
    fileInput.value = "";
  } else {
    alert("Please select a file first.");
  }
}

