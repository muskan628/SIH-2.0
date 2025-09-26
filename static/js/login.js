// Login form handling
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            // Get form values
            const role = document.getElementById('role').value.trim();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            
            // Basic validation
            if (!role || !username || !password) {
                alert("Please fill all fields");
                e.preventDefault();
                return;
            }
            
            // Show loading state
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'Logging in...';
                submitBtn.disabled = true;
            }
            
            // Let the form submit normally
            console.log('Login form submitted:', { role, username });
        });
    }
    
    // Check for flash messages and display them
    const flashMessages = document.querySelectorAll('.flash-messages li');
    flashMessages.forEach(function(message) {
        const category = message.className;
        if (category === 'success') {
            message.style.color = 'green';
            message.style.backgroundColor = '#d4edda';
            message.style.border = '1px solid #c3e6cb';
            message.style.padding = '10px';
            message.style.borderRadius = '4px';
            message.style.margin = '10px 0';
        } else if (category === 'danger') {
            message.style.color = 'red';
            message.style.backgroundColor = '#f8d7da';
            message.style.border = '1px solid #f5c6cb';
            message.style.padding = '10px';
            message.style.borderRadius = '4px';
            message.style.margin = '10px 0';
        }
    });
});
