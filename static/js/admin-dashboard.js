// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const hamburger = document.querySelector('.hamburger');

  // Toggle sidebar when hamburger is clicked
  hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });

  // Close sidebar when clicking outside (only on small screens)
  document.addEventListener('click', (e) => {
    if (
      window.innerWidth <= 768 && // only on mobile/tablet
      !sidebar.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      sidebar.classList.remove('active');
    }
  });

  // Optional: handle window resize to reset sidebar
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      sidebar.classList.remove('active'); // ensure sidebar is visible on desktop
    }
  });

  // Optional: remember sidebar state per teacher using localStorage
  const teacherId = document.body.dataset.teacherId; // set this in your backend template
  const sidebarKey = `sidebar_state_${teacherId}`;

  // Load previous state
  if (localStorage.getItem(sidebarKey) === 'active') {
    sidebar.classList.add('active');
  }

  // Save state whenever toggled
  hamburger.addEventListener('click', () => {
    const isActive = sidebar.classList.contains('active');
    localStorage.setItem(sidebarKey, isActive ? 'active' : 'inactive');
  });
});

// Expose a global toggle for inline onclick handlers
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.classList.toggle('active');
  }
}