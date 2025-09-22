// Handle registration
document.getElementById('registerForm').addEventListener('submit', function(e){
  e.preventDefault();
  const role = document.getElementById('role').value;
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if(!role || !username || !email || !password || !confirmPassword){
    alert("Please fill all fields");
    return;
  }
  if(password !== confirmPassword){
    alert("Passwords do not match!");
    return;
  }

  alert(`Registered as ${role}!\nUsername: ${username}\nEmail: ${email}`);
  // Future: send data to backend and redirect to login
});