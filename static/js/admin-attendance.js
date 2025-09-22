 document.getElementById('attendanceForm').addEventListener('submit', function(event) {
      event.preventDefault();

      const form = event.target;
      const formData = new FormData(form);
      const attendanceData = {};

      for (let [key, value] of formData.entries()) {
        const uid = key.replace('attendance_', '');
        attendanceData[uid] = value;
      }

      console.log("Attendance Submitted:", attendanceData);

      alert("Attendance submitted successfully!");

      // Here you can send this data to a server using fetch/ajax if needed
      // Example:
      // fetch('/submit-attendance', {
      //   method: 'POST',
      //   body: JSON.stringify(attendanceData),
      //   headers: {
      //     'Content-Type': 'application/json'
      //   }
      // }).then(response => response.json()).then(data => {
      //   console.log("Server response:", data);
      // });
    });
  