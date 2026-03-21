
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/boot');
    const data = await res.json();
    const serverBootId = data.bootId;
    const localBootId = localStorage.getItem('bootId');

    if (localBootId && localBootId !== serverBootId) {
      localStorage.clear();
      alert('⚠️ The server has restarted.');
      window.location.href = 'index.html.html';
    }

    localStorage.setItem('bootId', serverBootId);
  } catch (err) {
    console.error('Boot check failed:', err);
  }
});
