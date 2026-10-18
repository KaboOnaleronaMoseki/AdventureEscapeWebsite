const form = document.getElementById("accountForm");
const message = document.getElementById("accountMessage");
const switchModeButton = document.getElementById("switchMode");
const resendButton = document.getElementById("resendVerification");
const signOutButton = document.getElementById("signOut");
const formPanel = document.getElementById("accountFormPanel");
const signedInPanel = document.getElementById("signedInPanel");
const nameGroup = document.getElementById("nameGroup");
const phoneGroup = document.getElementById("phoneGroup");
const heading = document.getElementById("accountHeading");
const submitButton = document.getElementById("accountSubmit");
const noteEl = document.getElementById("accountNote");
const apiBaseUrl =
  document.querySelector('meta[name="account-api-url"]')?.content.trim().replace(/\/+$/, "") || "";
const verificationToken = new URLSearchParams(window.location.search).get("token");

const SESSION_KEY = "adventure-escape-client-session";
const PROFILE_KEY = "adventure-escape-client-profile";
let mode = "register";

function setMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("is-error", isError);
  message.classList.toggle("is-success", Boolean(text) && !isError);
}

async function apiRequest(path, options) {
  let response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, options);
  } catch {
    throw new Error("We could not reach the account service. Your request was not submitted.");
  }

  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error("The account service returned an invalid response.");
  }
  if (!body || typeof body !== "object") {
    throw new Error("The account service returned an invalid response.");
  }
  return { response, body };
}

function showSignedIn(account) {
  formPanel.hidden = true;
  signedInPanel.hidden = false;
  document.getElementById("accountName").textContent = account.fullName;
  document.getElementById("accountEmail").textContent = account.email;
  document.getElementById("accountPhone").textContent = account.phone || "";
  sessionStorage.setItem(PROFILE_KEY, JSON.stringify(account));
}

function setMode(nextMode) {
  mode = nextMode;
  const registering = mode === "register";
  nameGroup.hidden = !registering;
  phoneGroup.hidden = !registering;
  document.getElementById("fullName").required = registering;
  heading.textContent = registering ? "Create your account" : "Sign in";
  document.getElementById("password").autocomplete = registering ? "new-password" : "current-password";
  document.getElementById("password").minLength = registering ? 12 : 0;
  submitButton.textContent = registering ? "Create account" : "Sign in";
  switchModeButton.textContent = registering
    ? "Already registered? Sign in"
    : "New here? Create an account";
  if (noteEl) {
    noteEl.textContent = registering
      ? "Your account is stored securely on our server. Email verification is required before you can sign in."
      : "";
  }
  setMessage("");
}

switchModeButton.addEventListener("click", () => {
  setMode(mode === "register" ? "signIn" : "register");
});

resendButton.addEventListener("click", async () => {
  submitButton.disabled = true;
  try {
    const { response, body } = await apiRequest("/account-verification", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: document.getElementById("email").value.trim() }),
    });
    setMessage(
      response.ok ? body.message : body.error || "Unable to request verification.",
      !response.ok,
    );
  } catch (error) {
    setMessage(error.message, true);
  } finally {
    submitButton.disabled = false;
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  submitButton.disabled = true;
  setMessage("");

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value;

  try {
    if (mode === "register") {
      const { response, body } = await apiRequest("/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, password }),
      });
      if (!response.ok) {
        setMessage(body.error || "Unable to create your account.", true);
        return;
      }

      document.getElementById("password").value = "";
      setMode("signIn");
      resendButton.hidden = false;
      setMessage(
        body.message || "Account created. Check your email to verify your address.",
        !body.verificationEmailSent,
      );
      return;
    }

    const { response, body } = await apiRequest("/account-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok || !body.account || !body.token) {
      if (body.code === "email_not_verified") resendButton.hidden = false;
      setMessage(body.error || "Unable to sign in.", true);
      return;
    }

    sessionStorage.setItem(SESSION_KEY, body.token);
    showSignedIn(body.account);
    document.getElementById("password").value = "";
    resendButton.hidden = true;
    setMessage("You are signed in.");
  } catch (error) {
    setMessage(error instanceof Error ? error.message : "The account service is unavailable.", true);
  } finally {
    submitButton.disabled = false;
  }
});

signOutButton.addEventListener("click", async () => {
  const token = sessionStorage.getItem(SESSION_KEY);
  let signOutError = "";
  try {
    if (token) {
      const { response } = await apiRequest("/account-session", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("The server could not revoke the session.");
    }
  } catch (error) {
    signOutError = error instanceof Error
      ? `${error.message} The session was cleared from this browser.`
      : "The server could not revoke the session. The session was cleared from this browser.";
  } finally {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(PROFILE_KEY);
    signedInPanel.hidden = true;
    formPanel.hidden = false;
    setMode("signIn");
    if (signOutError) setMessage(signOutError, true);
  }
});

async function verifyEmailToken() {
  if (!verificationToken) return;
  window.history.replaceState({}, document.title, window.location.pathname);
  try {
    const { response, body } = await apiRequest("/account-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: verificationToken }),
    });
    if (!response.ok) {
      setMessage(body.error || "Unable to verify this email address.", true);
      return;
    }
    document.getElementById("email").value = body.account?.email || "";
    setMode("signIn");
    setMessage(body.message || "Email verified. You can now sign in.");
  } catch (error) {
    setMessage(error instanceof Error ? error.message : "The account service is unavailable.", true);
  }
}

async function restoreSession() {
  const token = sessionStorage.getItem(SESSION_KEY);
  if (!token) return;
  try {
    const { response, body } = await apiRequest("/account-session", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok && body.account) {
      showSignedIn(body.account);
      return;
    }
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(PROFILE_KEY);
  } catch (error) {
    setMessage(error instanceof Error ? error.message : "Unable to restore your account session.", true);
  }
}

void verifyEmailToken().then(() => restoreSession());
