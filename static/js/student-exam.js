// Sidebar toggle for mobile
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("active");
}


fetch('/api/exams')
  .then(r=>r.json())
  .then(data => {
    if (!data.ok) return;
    const cards = document.querySelectorAll('.cards .card');
    // card[0] MST, card[1] Quiz by current template
    if (cards[0]) {
      cards[0].querySelector('button').disabled = !data.mst_unlocked;
    }
    if (cards[1]) {
      cards[1].querySelector('button').disabled = !data.quiz_unlocked;
    }
  })
  .catch(()=>{});
