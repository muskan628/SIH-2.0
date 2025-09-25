// Hamburger toggle
const sidebar = document.getElementById('sidebar');
const hamburger = document.getElementById('hamburger');
hamburger.addEventListener('click', () => sidebar.classList.toggle('active'));

// Close sidebar on link click (mobile)
document.querySelectorAll('.sidebar ul li a').forEach(link => {
  link.addEventListener('click', () => {
    if(window.innerWidth <= 768) sidebar.classList.remove('active');
  });
});