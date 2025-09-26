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

function loadUnlocks(){
  fetch('/api/feature-flags').then(r=>r.json()).then(flags => {
    const $ = (id)=>document.getElementById(id);
    if ($('unlockMentor')) $('unlockMentor').checked = !!flags.mentor_form;
    if ($('unlockExamForm')) $('unlockExamForm').checked = !!flags.examination_form;
    if ($('unlockMst')) $('unlockMst').checked = !!flags.mst_exam;
    if ($('unlockQuiz')) $('unlockQuiz').checked = !!flags.quiz_exam;
  }).catch(()=>{});
}

function saveUnlocks(){
  const updates = [];
  const push = (key, val) => updates.push(fetch(`/api/feature-flags/${key}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ is_unlocked: val }) }).then(r=>r.json()));
  const $ = (id)=>document.getElementById(id);
  if ($('unlockMentor')) push('mentor_form', $('unlockMentor').checked);
  if ($('unlockExamForm')) push('examination_form', $('unlockExamForm').checked);
  if ($('unlockMst')) push('mst_exam', $('unlockMst').checked);
  if ($('unlockQuiz')) push('quiz_exam', $('unlockQuiz').checked);
  Promise.all(updates).then(()=>alert('Saved')).catch(()=>alert('Failed'));
}

document.addEventListener('DOMContentLoaded', loadUnlocks);
