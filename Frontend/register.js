document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullname = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();
    const errorMsg = document.getElementById('error-msg');
    errorMsg.innerText = '';

    if (password !== confirmPassword) {
        errorMsg.innerText = 'Passwords do not match!';
        return;
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullname, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            errorMsg.innerText = data.message || 'Registration failed';
            return;
        }

        localStorage.setItem('user', JSON.stringify({ fullname,email}));
        window.location.href = 'dashboard.html';

    } catch (err) {
        console.error(err);
        errorMsg.innerText = 'Unable to connect to server. Try again later.';
    }
});
