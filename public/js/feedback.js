// Submit feedback to backend with optional screenshot
const form = document.getElementById("feedbackForm");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const message = document.getElementById("message").value.trim();
  const screenshot = document.getElementById("screenshot").files[0];
  const stars = document.querySelector("input[name='stars']:checked")?.value || "";

  if (!name || !message) {
    Swal.fire({
      icon: "warning",
      title: "Missing Required Fields",
      text: "Please fill in your name and message.",
      confirmButtonColor: "#28a745"
    });
    return;
  }

  const formData = new FormData();
  formData.append("name", name);
  formData.append("email", email);
  formData.append("subject", subject);
  formData.append("message", message);
  formData.append("stars", stars);
  if (screenshot) formData.append("screenshot", screenshot);

  try {
    const res = await fetch("https://agroai-backend-ewof.onrender.com/api/feedback", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (data.success) {
      Swal.fire({
        icon: "success",
        title: "Feedback Submitted!",
        text: "Thank you for your valuable feedback 💚",
        confirmButtonColor: "#28a745"
      });
      form.reset();
      document.getElementById("star-value").innerText = "You selected: 0/5";
    } else {
      throw new Error("Failed to submit feedback");
    }
  } catch (error) {
    console.error("Submit error:", error);
    Swal.fire({
      icon: "error",
      title: "Oops!",
      text: "Something went wrong. Please try again.",
      confirmButtonColor: "#dc3545"
    });
  }
});

// Update star value display
document.querySelectorAll("input[name='stars']").forEach((input) => {
  input.addEventListener("change", () => {
    const value = input.value;
    document.getElementById("star-value").innerText = `You selected: ${value}/5`;
  });
});
