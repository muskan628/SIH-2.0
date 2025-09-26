// Sidebar toggle for small screens
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('toggleBtn');
  const overlay = document.getElementById('overlay');

  toggleBtn.addEventListener('click', () => {
    const isOpen = sidebar.classList.toggle('open');
    overlay.classList.toggle('show', isOpen);
  });

  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  }

  // Student data with UID (roll no + name)
  const studentsData = {
    "BCA 1st Year": [
      { uid: "BCA101", name: "Rahul" },
      { uid: "BCA102", name: "Muskan" },
      { uid: "BCA103", name: "Aman" },
      { uid: "BCA104", name: "Priya" },
      { uid: "BCA105", name: "Sohan" }
    ],
    "BCA 2nd Year": [
      { uid: "BCA201", name: "Ritika" },
      { uid: "BCA202", name: "Manoj" },
      { uid: "BCA203", name: "Kunal" },
      { uid: "BCA204", name: "Neha" }
    ],
    "B.Tech CSE 1st Year": [
      { uid: "CSE101", name: "Ankit" },
      { uid: "CSE102", name: "Simran" },
      { uid: "CSE103", name: "Raj" },
      { uid: "CSE104", name: "Vikas" },
      { uid: "CSE105", name: "Ishita" }
    ]
  };

  function openClass(className) {
    // close sidebar on mobile for better UX
    if (window.innerWidth <= 800) closeSidebar();

    document.getElementById("classList").style.display = "none";
    document.getElementById("studentList").style.display = "block";
    document.getElementById("classTitle").innerText = "Class: " + className;

    let students = studentsData[className] || [];
    let studentHTML = "";
    students.forEach(stu => {
      studentHTML += `
        <tr>
          <td>${stu.uid}</td>
          <td>${stu.name}</td>
          <td>
            <button class="btn btn-present" onclick="markAttendance(this, 'Present')">Present</button>
            <button class="btn btn-absent" onclick="markAttendance(this, 'Absent')">Absent</button>
          </td>
          <td class="status"></td>
        </tr>
      `;
    });
    document.getElementById("students").innerHTML = studentHTML;
    document.getElementById("summary").innerHTML = ""; // clear previous summary
  }

  function markAttendance(button, status) {
    let statusCell = button.closest("tr").querySelector(".status");
    if (status === "Present") {
      statusCell.innerHTML = "✔ Present";
      statusCell.className = "status present";
    } else {
      statusCell.innerHTML = "✘ Absent";
      statusCell.className = "status absent";
    }
  }

  function saveAttendance() {
    const rows = document.querySelectorAll("#students tr");
    if (rows.length === 0) return;

    let summaryHTML = `
      <h3>Attendance Summary</h3>
      <table>
        <thead>
          <tr>
            <th>UID</th><th>Name</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
    `;

    rows.forEach(row => {
      const uid = row.cells[0].innerText;
      const name = row.cells[1].innerText;
      const status = row.querySelector(".status").innerText || "Not Marked";
      summaryHTML += `
        <tr>
          <td>${uid}</td><td>${name}</td><td>${status}</td>
        </tr>
      `;
    });

    summaryHTML +='</tbody></table>';
    document.getElementById("summary").innerHTML = summaryHTML;
  }

  function goBack() {
    document.getElementById("classList").style.display = "block";
    document.getElementById("studentList").style.display = "none";
  }

  // close sidebar if window resizes to large screen (clean state)
  window.addEventListener('resize', () => {
    if (window.innerWidth > 800) {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
    }
  });