const loginForm = document.getElementById("loginForm");
const loginPassword = document.getElementById("loginPassword");
const passwordToggle = document.getElementById("passwordToggle");
const loginStatus = document.getElementById("loginStatus");

if (loginForm && loginPassword && passwordToggle && loginStatus) {
  passwordToggle.addEventListener("click", function() {
    const showPassword = loginPassword.type === "password";
    loginPassword.type = showPassword ? "text" : "password";
    passwordToggle.textContent = showPassword ? "Hide" : "Show";
    passwordToggle.setAttribute("aria-label", showPassword ? "Hide password" : "Show password");
    passwordToggle.setAttribute("aria-pressed", String(showPassword));
  });

  loginForm.addEventListener("submit", function(event) {
    event.preventDefault();
    loginPassword.value = "";
    loginStatus.textContent =
      "This is a demo page. Sign-in is not connected, and no credentials were sent or saved. Contact our team for booking help.";
  });
}
