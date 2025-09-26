 
    document.getElementById('examinationForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const payload = {};
      form.querySelectorAll('input, textarea, select').forEach((el, idx) => {
        const key = el.name && el.name.trim() ? el.name : `field_${idx}`;
        payload[key] = el.value;
      });
      try {
        const res = await fetch('/api/examination-form', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.ok) {
          alert('Examination form saved (ID: ' + data.id + ')');
        } else {
          alert('Save failed: ' + (data.error || 'Unknown error'));
        }
      } catch (err) {
        alert('Network error: ' + err.message);
      }
    });
