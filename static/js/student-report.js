// Ensure code runs after DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
  const ctx = document.getElementById('reportChart').getContext('2d');
  
  let chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Rahul', 'Priya', 'Amit', 'Simran', 'Arjun'],
      datasets: [{
        label: 'Marks (%)',
        data: [85, 92, 76, 95, 60],
        backgroundColor: '#4facfe'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true } }
    }
  });

  // Dropdown listener
  document.getElementById("reportType").addEventListener("change", function(){
    if(this.value === "performance"){
      chart.config.type = "bar";
      chart.data.labels = ['Rahul','Priya','Amit','Simran','Arjun'];
      chart.data.datasets[0].label = "Marks (%)";
      chart.data.datasets[0].data = [85,92,76,95,60];
      chart.data.datasets[0].backgroundColor = "#4facfe";
    } else if(this.value === "attendance"){
      chart.config.type = "line";
      chart.data.labels = ['Rahul','Priya','Amit','Simran','Arjun'];
      chart.data.datasets[0].label = "Attendance (%)";
      chart.data.datasets[0].data = [88,92,80,95,60];
      chart.data.datasets[0].backgroundColor = "#2ecc71";
    } else if(this.value === "fees"){
      chart.config.type = "pie";
      chart.data.labels = ['Paid','Pending'];
      chart.data.datasets[0].label = "Fees Status";
      chart.data.datasets[0].data = [200000,250000];
      chart.data.datasets[0].backgroundColor = ["#4facfe","#ff6b6b"];
    }
    chart.update();
  });

  // Fake Export PDF
  window.exportPDF = function() {
    alert("PDF Export feature will be integrated with backend later!");
  }
});
