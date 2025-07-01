window.addEventListener('load', () => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await res.json();
        const temperature = data?.current_weather?.temperature;
        document.getElementById('temperature').value = temperature || '--';
      } catch (err) {
        console.error('Failed to fetch weather:', err);
      }
    });
  }
});

document.getElementById('fertilizerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const crop = document.getElementById('crop').value.trim();
  const N = parseFloat(document.getElementById('n').value);
  const P = parseFloat(document.getElementById('p').value);
  const K = parseFloat(document.getElementById('k').value);
  const temperature = parseFloat(document.getElementById('temperature').value);

  const resultBox = document.getElementById('resultBox');
  resultBox.classList.add('d-none');

  try {
    const response = await fetch('https://agroai-backend-ewof.onrender.com/fertilizer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ crop, N, P, K, temperature })
    });
    const data = await response.json();

    if (data?.recommendation) {
      resultBox.className = 'alert alert-success';
      resultBox.textContent = data.recommendation;
    } else {
      resultBox.className = 'alert alert-warning';
      resultBox.textContent = 'No recommendation found.';
    }
  } catch (err) {
    resultBox.className = 'alert alert-danger';
    resultBox.textContent = '❌ Server error. Please try again later.';
  }
  resultBox.classList.remove('d-none');
});
