// Sidebar toggle
document.getElementById("hamburger").addEventListener("click", function() {
  document.getElementById("sidebar").classList.toggle("active");
});


// Close sidebar on link click (mobile)
document.querySelectorAll('.sidebar ul li a').forEach(link => {
  link.addEventListener('click', () => {
    if(window.innerWidth <= 768) sidebar.classList.remove('active');
  });
});