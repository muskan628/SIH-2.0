// Sidebar toggle
const sidebar = document.getElementById("sidebar");
const hamburger = document.getElementById("hamburger");
hamburger.addEventListener("click", () => sidebar.classList.toggle("active"));

// Close sidebar when clicking outside
document.addEventListener("click", (e) => {
  if (window.innerWidth <= 768 && sidebar.classList.contains("active")) {
    if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
      sidebar.classList.remove("active");
    }
  }
});

// Course expand/collapse
document.querySelectorAll('.course-header').forEach(header => {
  header.addEventListener('click', () => {
    const content = header.nextElementSibling;
    content.style.display = (content.style.display === 'block') ? 'none' : 'block';
    header.querySelector('span').textContent = (content.style.display === 'block') ? '−' : '+';
  });
});