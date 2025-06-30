const db = window.db;

// DOM references
const humidityEl = document.getElementById('moisture');
const tempEl = document.getElementById('temperature');
const rainfallEl = document.getElementById('tds');
const regionEl = document.getElementById('region'); // used only for display
const predictBtn = document.getElementById('predictBtn');
const resultBox = document.getElementById('predictionResult');
const spinner = document.getElementById('loadingSpinner');
const manualForm = document.getElementById('manualForm');

// --- 1. Live Sensor Data from Firebase ---
db.ref('/AgroAI/Moisture').on('value', (snapshot) => {
  const val = snapshot.val();
  if (humidityEl) humidityEl.textContent = (val !== null && val !== undefined) ? val : '--';
});
db.ref('/AgroAI/Temperature').on('value', (snapshot) => {
  const val = snapshot.val();
  if (tempEl) tempEl.textContent = (val !== null && val !== undefined) ? val : '--';
});
db.ref('/AgroAI/TDS').on('value', (snapshot) => {
  const val = snapshot.val();
  if (rainfallEl) rainfallEl.textContent = (val !== null && val !== undefined) ? val : '--';
});

// --- 2. Predict Button (using live data only for display/demo) ---
predictBtn?.addEventListener('click', () => {
  const region = regionEl.value;
  const humidity = humidityEl.textContent;
  const temperature = tempEl.textContent;
  const rainfall = rainfallEl.textContent;

  if (!region) {
    showResult('Please select a region.', true);
    return;
  }

  showSpinner(true);
  setTimeout(() => {
    showSpinner(false);
    // Fake crop for demo, you can change it
    showResult(`Best crop for ${region} (Humidity: ${humidity}%, Temp: ${temperature}°C, Rainfall: ${rainfall}mm) is <b>Wheat</b>.`);
  }, 1200);
});

// --- 3. Manual Prediction Form ---
manualForm?.addEventListener("submit", async function (e) {
  e.preventDefault();

  const N = parseFloat(document.getElementById("manualN").value);
  const P = parseFloat(document.getElementById("manualP").value);
  const K = parseFloat(document.getElementById("manualK").value);
  const temperature = parseFloat(document.getElementById("manualTemperature").value);
  const humidity = parseFloat(document.getElementById("manualHumidity").value);  // ✅ Corrected
  const rainfall = parseFloat(document.getElementById("manualRainfall").value);  // ✅ Corrected
  const ph = parseFloat(document.getElementById("manualPH").value);
  // region is not used in prediction — only for display if needed

  // ✅ Validate ranges
  if (ph < 0 || ph > 14) {
    alert("❌ Soil pH must be between 0 and 14.");
    return;
  }
  if (humidity < 0 || humidity > 100) {
    alert("❌ Humidity should be between 0% and 100%.");
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

  // ✅ Call server with correct payload
  try {
    const response = await fetch("https://agroai-backend-ewof.onrender.com/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ N, P, K, temperature, humidity, ph, rainfall }) // ✅ Final correct structure
    });
    const data = await response.json();
    spinner.classList.add("d-none");

    if (data.prediction) {
      resultBox.textContent = `✅ Suggested Crop: ${data.prediction}`;
      resultBox.classList.remove("d-none", "alert-danger");
      resultBox.classList.add("alert-primary");
    } else {
      resultBox.textContent = "❌ Prediction failed. Try again.";
      resultBox.classList.remove("d-none", "alert-primary");
      resultBox.classList.add("alert-danger");
    }
  } catch (error) {
    spinner.classList.add("d-none");
    resultBox.textContent = "❌ Server error.";
    resultBox.classList.remove("d-none", "alert-primary");
    resultBox.classList.add("alert-danger");
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
