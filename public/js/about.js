// ✅ Connect to global Firebase DB
const db = firebase.database();
window.db = db;

document.addEventListener('DOMContentLoaded', () => {
  // ✅ Inject Toast container if not already there
  if (!document.getElementById("toast-container")) {
    const toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.className = "toast-container position-fixed bottom-0 end-0 p-3";
    toastContainer.style.zIndex = "1055";
    document.body.appendChild(toastContainer);
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

  // ✅ Initialize tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // --- CountUp.js for statistics ---
  // Set your target numbers here
  const stats = [
    { id: "counter-features", endVal: 1222 },
    { id: "counter-farmers", endVal: 15022},
    { id: "counter-feedbacks", endVal: 3700 }
  ];

  stats.forEach(stat => {
    const el = document.getElementById(stat.id);
    // Use window.countUp.CountUp for your local UMD build
    if (el && window.countUp && window.countUp.CountUp) {
      const counter = new window.countUp.CountUp(stat.id, stat.endVal, { duration: 2 });
      if (!counter.error) {
        counter.start();
      }
    }
  });
});

// Optional: Dummy toggleDetails function for button
function toggleDetails() {
  alert("More details coming soon!");
}
