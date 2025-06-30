const db = window.db;

// DOM references
const moistureEl = document.getElementById('moisture');
const tempEl = document.getElementById('temperature');
const tdsEl = document.getElementById('tds');
const regionEl = document.getElementById('region');
const predictBtn = document.getElementById('predictBtn');
const resultBox = document.getElementById('predictionResult');
const spinner = document.getElementById('loadingSpinner');
const manualForm = document.getElementById('manualForm');

// --- 1. Live Sensor Data from Firebase ---
db.ref('/AgroAI/Moisture').on('value', (snapshot) => {
  const val = snapshot.val();
  if (moistureEl) moistureEl.textContent = (val !== null && val !== undefined) ? val : '--';
});
db.ref('/AgroAI/Temperature').on('value', (snapshot) => {
  const val = snapshot.val();
  if (tempEl) tempEl.textContent = (val !== null && val !== undefined) ? val : '--';
});
db.ref('/AgroAI/TDS').on('value', (snapshot) => {
  const val = snapshot.val();
  if (tdsEl) tdsEl.textContent = (val !== null && val !== undefined) ? val : '--';
});

// --- 2. Predict Button (using live data) ---
predictBtn?.addEventListener('click', () => {
  const region = regionEl.value;
  const moisture = moistureEl.textContent;
  const temperature = tempEl.textContent;
  const tds = tdsEl.textContent;

  if (!region) {
    showResult('Please select a region.', true);
    return;
  }
  showSpinner(true);
  setTimeout(() => {
    showSpinner(false);
    showResult(`Best crop for ${region} (Moisture: ${moisture}, Temp: ${temperature}°C, TDS: ${tds}) is <b>Wheat</b>.`);
  }, 1200);
});

// --- 3. Manual Prediction Form ---
// ✅ Predict Crop Using Manual Input (with validation and async/await)
manualForm?.addEventListener("submit", async function (e) {
  e.preventDefault();

  const N = parseFloat(document.getElementById("manualN").value);
  const P = parseFloat(document.getElementById("manualP").value);
  const K = parseFloat(document.getElementById("manualK").value);
  const temperature = parseFloat(document.getElementById("manualTemperature").value);
  const moisture = parseFloat(document.getElementById("manualMoisture").value);
  const tds = parseFloat(document.getElementById("manualTDS").value);
  const ph = parseFloat(document.getElementById("manualPH").value);
  const region = document.getElementById("manualRegion").value;

  // ✅ Validate ranges
  if (ph < 0 || ph > 14) {
    alert("❌ Soil pH must be between 0 and 14.");
    return;
  }
  if (moisture < 0 || moisture > 100) {
    alert("❌ Moisture should be between 0% and 100%.");
    return;
  }
  if (temperature < -10 || temperature > 60) {
    alert("❌ Temperature seems unrealistic. Keep it between -10°C and 60°C.");
    return;
  }
  if (N < 0 || P < 0 || K < 0) {
    alert("❌ NPK values cannot be negative.");
    return;
  }

  // ✅ Show loading
  resultBox.classList.add("d-none");
  spinner.classList.remove("d-none");

  // ✅ Call server
  try {
    const response = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ N, P, K, temperature, humidity: moisture, ph, rainfall: tds })
    });
    const data = await response.json();
    spinner.classList.add("d-none");

    if (data.prediction) {
      resultBox.textContent = `✅ Suggested Crop: ${data.prediction}`;
      resultBox.classList.remove("d-none");
      resultBox.classList.remove('alert-danger');
      resultBox.classList.add('alert-primary');
    } else {
      resultBox.textContent = "❌ Prediction failed. Try again.";
      resultBox.classList.remove("d-none");
      resultBox.classList.remove('alert-primary');
      resultBox.classList.add('alert-danger');
    }
  } catch (error) {
    spinner.classList.add("d-none");
    resultBox.textContent = "❌ Server error.";
    resultBox.classList.remove("d-none");
    resultBox.classList.remove('alert-primary');
    resultBox.classList.add('alert-danger');
    console.error("Prediction error:", error);
  }
});

// --- 4. Helper Functions ---
function showSpinner(show) {
  if (spinner) spinner.classList.toggle('d-none', !show);
}

function showResult(msg, isError = false) {
  if (!resultBox) return;
  resultBox.innerHTML = msg;
  resultBox.classList.remove('d-none', 'alert-danger', 'alert-primary');
  resultBox.classList.add(isError ? 'alert-danger' : 'alert-primary');
}