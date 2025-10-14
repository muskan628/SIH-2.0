// Responsive Sidebar Toggle
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const sidebar = document.querySelector(".sidebar");

  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("active");
    });
  }

  // Redirect from Teacher → Student
  const goStudent = document.getElementById("goStudent");
  if (goStudent) {
    goStudent.addEventListener("click", () => {
      window.location.href = "/student/dashboard";
    });
  }

  // Redirect from Student → Teacher
  const goTeacher = document.getElementById("goTeacher");
  if (goTeacher) {
    goTeacher.addEventListener("click", () => {
      window.location.href = "/admin/dashboard";
    });
  }

  // Logout button redirect (goes back to login.html)
  const logoutBtn = document.querySelector(".logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      window.location.href = "/logout"; 
    });
  }
});