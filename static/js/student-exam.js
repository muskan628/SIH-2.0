

// Sidebar toggle for mobile
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');
menuToggle.addEventListener('click', ()=>{sidebar.classList.toggle('active');});

// Example: Button actions
function startExam(type){
  if(type === 'msd'){
    alert("Redirecting to MSD Exam...");
    // Here you can add your link or page redirect
    // window.location.href = "msd_exam.html";
  }
  else if(type === 'quiz'){
    alert("Redirecting to Quiz...");
    // window.location.href = "quiz_exam.html";
  }
}


