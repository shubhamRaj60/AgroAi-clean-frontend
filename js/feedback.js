// Initialize Firebase (make sure firebase-config.js is included before this script)
const db = firebase.database();

document.getElementById("feedbackForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("userName").value.trim();
  const email = document.getElementById("userEmail").value.trim();
  const message = document.getElementById("userMessage").value.trim();
  const statusText = document.getElementById("statusMessage");
  const submitBtn = document.getElementById("submitBtn");

  // Validate inputs
  if (!name || !email || !message) {
    Swal.fire({
      icon: "warning",
      title: "Incomplete Fields",
      text: "Please fill in all the fields.",
      confirmButtonColor: "#28a745"
    });
    return;
  }

  if (!validateEmail(email)) {
    Swal.fire({
      icon: "error",
      title: "Invalid Email",
      text: "Please enter a valid email address.",
      confirmButtonColor: "#dc3545"
    });
    return;
  }

  // Disable button during submission
  submitBtn.disabled = true;
  submitBtn.innerText = "Sending...";

  // Push to Firebase
  db.ref("feedbacks").push({
    name,
    email,
    message,
    timestamp: new Date().toISOString()
  })
  .then(() => {
    Swal.fire({
      icon: "success",
      title: "Feedback Submitted!",
      text: "Thank you for your valuable feedback 💚",
      confirmButtonColor: "#28a745"
    });

    // Reset form
    document.getElementById("feedbackForm").reset();
    submitBtn.innerText = "Submit Feedback";
    submitBtn.disabled = false;
    statusText.innerHTML = `<span class="text-success">✔️ Feedback received!</span>`;
  })
  .catch((error) => {
    console.error("Firebase Error:", error);
    Swal.fire({
      icon: "error",
      title: "Oops!",
      text: "Something went wrong. Please try again.",
      confirmButtonColor: "#dc3545"
    });

    submitBtn.innerText = "Submit Feedback";
    submitBtn.disabled = false;
  });
});

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
