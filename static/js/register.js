// Handle registration form submission
document.getElementById('registerForm').addEventListener('submit', function(e) {
  // Get form values
  const role = document.getElementById('role').value.trim();
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();

  // Client-side validation
  if (!role || !username || !email || !password || !confirmPassword) {
    alert("Please fill all fields");
    e.preventDefault(); // prevent form submission if fields are empty
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    e.preventDefault(); // prevent form submission if passwords don't match
    return;
  }

  // If validation passes, form will submit normally to Flask
});
