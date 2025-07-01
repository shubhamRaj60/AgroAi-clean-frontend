// ✅ Wait for DOM ready before attaching anything
document.addEventListener('DOMContentLoaded', () => {
  const db = window.db; // ✅ Ensure db is defined inside DOMContentLoaded

  if (!db) {
    console.warn("Firebase DB is not initialized.");
    return;
  }

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

    const bsToast = new bootstrap.Toast(toast, { delay: 5000 });
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
      showToast(`⚙️ Model set to ${model}`, "primary");
    });
  }

  // 📡 Readings
  let lastPumpStatus = null;
  let lastTds = null;

  db.ref("/AgroAI/Temperature").on("value", snapshot => {
    const temp = snapshot.val();
    const tempEl = document.getElementById("temp-value");
    if (tempEl) tempEl.innerText = `${temp} °C`;

    if (temp > tempThreshold) {
      showToast(`🌡️ Temperature is high: ${temp}°C`, "danger");
    } else {
      showToast(`🌡️ Temperature: ${temp}°C`, "info");
    }
  });

  db.ref("/AgroAI/Moisture").on("value", snapshot => {
    const moisture = snapshot.val();
    const moistureEl = document.getElementById("moisture-value");
    if (moistureEl) moistureEl.innerText = `${moisture} %`;

    if (moisture < moistureThreshold) {
      showToast(`💧 Moisture is low: ${moisture}%`, "warning");
    } else {
      showToast(`💧 Moisture: ${moisture}%`, "info");
    }
  });

  db.ref("/AgroAI/TDS").on("value", snapshot => {
    const tds = snapshot.val();
    const tdsEl = document.getElementById("tds-value");
    if (tdsEl) tdsEl.innerText = `${tds} ppm`;

    if (tds !== lastTds) {
      showToast(`🧪 TDS Level updated: ${tds} ppm`, "secondary");
      lastTds = tds;
    }
  });

  db.ref("/AgroAI/PumpStatus").on("value", snapshot => {
    const isOn = snapshot.val();
    const pump = document.getElementById("pump-status");
    if (pump) {
      pump.innerText = isOn ? "ON 🔵" : "OFF ⚪";
      pump.classList.remove("text-success", "text-secondary");
      pump.classList.add(isOn ? "text-success" : "text-secondary");
    }

    if (isOn !== lastPumpStatus) {
      showToast(`🚿 Pump turned ${isOn ? "ON 🔵" : "OFF ⚪"}`, isOn ? "success" : "dark");
      lastPumpStatus = isOn;
    }
  });

  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
});
