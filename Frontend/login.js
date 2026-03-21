document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorBox = document.getElementById('errorMessage'); 

    errorBox.textContent = '';

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            errorBox.textContent = data.message || 'Invalid credentials';
            return;
        }

    
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('loginTime', Date.now());
        window.location.href = 'dashboard.html';

    } catch (err) {
        console.error(err);
        errorBox.textContent = 'Unable to connect to server. Try again later.';
    }
});
