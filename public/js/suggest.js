// Firebase DB reference
const db = window.db;

// DOM references
const humidityEl = document.getElementById('moisture');
const tempEl = document.getElementById('temperature');
const rainfallEl = document.getElementById('tds');
const regionEl = document.getElementById('region');
const predictBtn = document.getElementById('predictBtn');
const resultBox = document.getElementById('predictionResult');
const spinner = document.getElementById('loadingSpinner');
const manualForm = document.getElementById('manualForm');

// 1. Live Sensor Data
if (db) {
  db.ref('/AgroAI/Moisture').on('value', snapshot => {
    humidityEl.textContent = snapshot.val() ?? '--';
  });

  db.ref('/AgroAI/Temperature').on('value', snapshot => {
    tempEl.textContent = snapshot.val() ?? '--';
  });

  db.ref('/AgroAI/TDS').on('value', snapshot => {
    rainfallEl.textContent = snapshot.val() ?? '--';
  });
}

// 2. Predict from Live Data
predictBtn?.addEventListener('click', async () => {
  const region = regionEl.value;
  const humidity = parseFloat(humidityEl.textContent);
  const temperature = parseFloat(tempEl.textContent);
  const rainfall = parseFloat(rainfallEl.textContent);

  if (!region) {
    showResult('❗ Please select a region.', true);
    return;
  }

  showSpinner(true);
  try {
    const res = await fetch('https://agroai-backend-ewof.onrender.com/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ N: 90, P: 45, K: 45, temperature, humidity, ph: 6.5, rainfall })
    });
    const data = await res.json();
    showSpinner(false);

    if (data.prediction) {
      typeWriter(`✅ Best crop for ${region}: ${data.prediction}`, resultBox);
    } else {
      showResult('❌ Prediction failed. Try again.', true);
    }
  } catch (err) {
    showSpinner(false);
    showResult('❌ Server error. Please try again.', true);
    console.error(err);
  }
});

// 3. Manual Prediction
manualForm?.addEventListener('submit', async e => {
  e.preventDefault();

  const N = parseFloat(document.getElementById('manualN').value);
  const P = parseFloat(document.getElementById('manualP').value);
  const K = parseFloat(document.getElementById('manualK').value);
  const ph = parseFloat(document.getElementById('manualPH').value);
  const humidity = parseFloat(document.getElementById('manualHumidity').value);
  const temperature = parseFloat(document.getElementById('manualTemperature').value);
  const rainfall = parseFloat(document.getElementById('manualRainfall').value);
  const region = document.getElementById('manualRegion').value;

  if (ph < 0 || ph > 14) return alert('❌ pH must be between 0–14.');
  if (humidity < 0 || humidity > 100) return alert('❌ Humidity must be between 0–100%.');
  if (temperature < -10 || temperature > 60) return alert('❌ Temperature must be between -10°C and 60°C.');
  if (N < 0 || P < 0 || K < 0) return alert('❌ NPK values must be positive.');

  showSpinner(true);
  try {
    const res = await fetch('https://agroai-backend-ewof.onrender.com/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ N, P, K, temperature, humidity, ph, rainfall })
    });
    const data = await res.json();
    showSpinner(false);

    if (data.prediction) {
      typeWriter(`✅ Best crop for ${region}: ${data.prediction}`, resultBox);
    } else {
      showResult('❌ Prediction failed. Try again.', true);
    }
  } catch (err) {
    showSpinner(false);
    showResult('❌ Server error. Please try again.', true);
    console.error(err);
  }
});

// 4. Helpers

function showSpinner(show) {
  if (spinner) spinner.classList.toggle('d-none', !show);
}

function showResult(msg, isError = false) {
  if (!resultBox) return;
  resultBox.innerHTML = msg;
  resultBox.classList.remove('d-none', 'bg-light', 'text-success', 'text-danger');
  resultBox.classList.add('p-3', 'rounded');

  if (isError) {
    resultBox.classList.add('bg-light', 'text-danger');
  } else {
    resultBox.classList.add('bg-light', 'text-success');
  }
}

function typeWriter(text, element, speed = 30) {
  element.innerHTML = '';
  element.classList.remove('d-none');
  let i = 0;
  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  type();
}
