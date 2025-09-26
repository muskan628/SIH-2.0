// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const hamburger = document.querySelector('.hamburger');

  // Toggle sidebar when hamburger is clicked
  hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });

<<<<<<< HEAD
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
=======
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
>>>>>>> 68ec5a595287e655f665a128377d07d81e974354
