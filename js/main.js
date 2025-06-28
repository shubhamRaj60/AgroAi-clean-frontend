// ✅ Connect to global Firebase DB
const db = window.db;

// ✅ Wait for DOM ready before attaching anything
document.addEventListener('DOMContentLoaded', () => {

  // ✅ Inject Toast container if not already there
  if (!document.getElementById("toast-container")) {
    const toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.className = "toast-container position-fixed bottom-0 end-0 p-3";
    toastContainer.style.zIndex = "1055";
    document.body.appendChild(toastContainer);
  }

  // 🔧 Thresholds
  let tempThreshold = 35;
  let moistureThreshold = 30;

  // 🌾 Crop Suggestion
  function suggestCrop(temp, moisture) {
    let crop = "--";
    if (moisture > 60 && temp < 30) crop = "Rice";
    else if (moisture > 40 && temp <= 32) crop = "Wheat";
    else if (moisture > 30 && temp < 35) crop = "Tomato";
    else crop = "Check Conditions";

    const suggestionDiv = document.getElementById("cropSuggestion");
    const cropText = document.getElementById("cropName");

    if (suggestionDiv && cropText) {
      cropText.innerText = crop;
      suggestionDiv.style.display = "block";
    }
  }

  // ✅ Toast function
  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-bg-${type} border-0 show mb-2`;
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
    toast.setAttribute("aria-atomic", "true");

    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;

    const container = document.getElementById("toast-container");
    container.appendChild(toast);

    const bsToast = new bootstrap.Toast(toast, { delay: 4000 });
    bsToast.show();

    toast.addEventListener("hidden.bs.toast", () => toast.remove());
  }

  // 🌐 Model Switcher
  const modelDropdown = document.getElementById("sensor-model");
  if (modelDropdown) {
    modelDropdown.addEventListener("change", function () {
      const model = this.value;
      tempThreshold = model === "advanced" ? 32 : 35;
      moistureThreshold = model === "advanced" ? 40 : 30;
    });
  }

  // 📡 Readings
  let latestTemperature = null;
  let latestMoisture = null;
  let lastPumpStatus = null;

  db.ref("/AgroAI/Temperature").on("value", snapshot => {
    const temp = snapshot.val();
    latestTemperature = temp;
    document.getElementById("temperature").innerText = `${temp} °C`;

    if (temp > tempThreshold) {
      showToast("🌡️ Temperature exceeds safe limit!", "danger");
    }

    if (latestMoisture !== null) {
      suggestCrop(temp, latestMoisture);
    }
  });

  db.ref("/AgroAI/Moisture").on("value", snapshot => {
    const moisture = snapshot.val();
    latestMoisture = moisture;
    document.getElementById("moisture").innerText = `${moisture} %`;

    if (moisture < moistureThreshold) {
      showToast("💧 Soil moisture is too low!", "warning");
    }

    if (latestTemperature !== null) {
      suggestCrop(latestTemperature, moisture);
    }
  });

  db.ref("/AgroAI/TDS").on("value", snapshot => {
    document.getElementById("tds").innerText = `${snapshot.val()} ppm`;
  });

  db.ref("/AgroAI/PumpStatus").on("value", snapshot => {
    const isOn = snapshot.val();
    const pump = document.getElementById("pumpStatus");

    pump.innerText = isOn ? "ON 🔵" : "OFF ⚪";
    pump.className = isOn ? "on" : "off";

    // ✅ Only notify if status changed
    if (isOn !== lastPumpStatus) {
      showToast(`🚿 Pump is now ${isOn ? "ON 🔵" : "OFF ⚪"}`, isOn ? "success" : "secondary");
      lastPumpStatus = isOn;
    }
  });

});
