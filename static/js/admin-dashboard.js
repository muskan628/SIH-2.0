// Dynamic teacher profiles (future backend)
const teacherProfiles = {
  "anjali": {
    name:"Dr. Anjali Sharma",
    email:"anjali.sharma@university.edu",
    phone:"+91 9876543210",
    mentor:"BCA 2nd Year",
    qualification:"PhD in Computer Science"
  },
  "rajesh": {
    name:"Prof. Rajesh Kumar",
    email:"rajesh.kumar@university.edu",
    phone:"+91 9123456780",
    mentor:"B.Com 1st Year",
    qualification:"M.Com, NET Qualified"
  }
};

// Load teacher dynamically
function setTeacher(profile){
  const t = teacherProfiles[profile];
  if(t){
    document.getElementById("teacherDetails").innerHTML=`
      <h2>Teacher Details</h2>
      <div class="teacher-info">
        <div><strong>Name:</strong> ${t.name}</div>
        <div><strong>Email:</strong> ${t.email}</div>
        <div><strong>Phone:</strong> ${t.phone}</div>
        <div><strong>Mentor of:</strong> ${t.mentor}</div>
        <div><strong>Qualification:</strong> ${t.qualification}</div>
      </div>
    `;
  }
}

// Default teacher
setTeacher("anjali");