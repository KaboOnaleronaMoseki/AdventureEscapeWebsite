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
const bookingsMessage = document.getElementById("accountBookingsMessage");
const bookingsList = document.getElementById("accountBookingsList");

const PROFILE_KEY = "adventure-escape-client-profile";
let mode = "register";

function setMessage(text, isError = false) {
  if (!message) return;
  message.textContent = text;
  message.classList.toggle("is-error", isError);
  message.classList.toggle("is-success", Boolean(text) && !isError);
}

function formatBookingDate(booking) {
  const dateValue =
    booking.activity_date_time ||
    booking.activityDateTime ||
    booking.check_in_date ||
    booking.checkInDate ||
    booking.created_at ||
    booking.createdAt;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue || "Date unavailable";
  const options = {
    dateStyle: "medium",
    timeZone: "Africa/Johannesburg"
  };
  if (booking.activity_date_time || booking.activityDateTime) {
    options.timeStyle = "short";
  }
  return new Intl.DateTimeFormat("en-ZA", options).format(date);
}

function renderBookings(bookings) {
  if (!bookingsList) return;
  bookingsList.replaceChildren();

  if (!bookings || !bookings.length) {
    bookingsMessage.textContent = "You haven’t made any bookings yet.";
    return;
  }

  bookingsMessage.textContent = "";
  for (const booking of bookings) {
    const item = document.createElement("article");
    item.className = "account-booking";

    const title = document.createElement("h4");
    const rawActivities = booking.activity_ids || booking.activityIds || [];
    const rawAccommodations = booking.accommodation_ids || booking.accommodationIds || [];
    const bookingItems = [
      ...(Array.isArray(rawActivities) ? rawActivities : []),
      ...(Array.isArray(rawAccommodations) ? rawAccommodations : [])
    ];
    title.textContent = bookingItems.length ? bookingItems.join(", ") : "Adventure booking";

    const details = document.createElement("p");
    const statusText = booking.status ? (booking.status.charAt(0).toUpperCase() + booking.status.slice(1)) : "Pending";
    details.textContent = `Date: ${formatBookingDate(booking)} · Status: ${statusText}`;
    item.append(title, details);

    const total = booking.pricing?.total ?? booking.total_price;
    if (typeof total === "number") {
      const price = document.createElement("p");
      price.textContent = `Estimated total: R${total.toLocaleString("en-ZA")}`;
      item.append(price);
    }

    const reference = document.createElement("small");
    reference.textContent = `Reference: ${booking.id || "N/A"}`;
    item.append(reference);

    bookingsList.append(item);
  }
}

async function loadAccountBookings(user) {
  if (!bookingsMessage || !bookingsList) return;
  if (!user) {
    bookingsMessage.textContent = "Sign in to view your bookings.";
    bookingsList.replaceChildren();
    return;
  }

  bookingsMessage.textContent = "Loading your bookings…";
  bookingsList.replaceChildren();

  const supabase = typeof getSupabaseClient === "function" ? getSupabaseClient() : null;
  if (!supabase) {
    bookingsMessage.textContent = "Database connection not available.";
    return;
  }

  try {
    const filter = user.id ? `user_id.eq.${user.id},email.eq.${user.email}` : `email.eq.${user.email}`;
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .or(filter)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Could not query bookings:", error.message);
      bookingsMessage.textContent = "No bookings found or table pending setup in Supabase.";
      return;
    }
    renderBookings(data || []);
  } catch (err) {
    console.error("Error loading bookings:", err);
    bookingsMessage.textContent = "Unable to load your bookings.";
  }
}

function showSignedIn(user) {
  if (!formPanel || !signedInPanel) return;
  formPanel.hidden = true;
  signedInPanel.hidden = false;

  const profile = {
    id: user.id,
    fullName: user.user_metadata?.full_name || user.email.split("@")[0],
    email: user.email,
    phone: user.user_metadata?.phone || ""
  };

  const nameEl = document.getElementById("accountName");
  const emailEl = document.getElementById("accountEmail");
  const phoneEl = document.getElementById("accountPhone");

  if (nameEl) nameEl.textContent = profile.fullName;
  if (emailEl) emailEl.textContent = profile.email;
  if (phoneEl) phoneEl.textContent = profile.phone;

  sessionStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  void loadAccountBookings(user);
}

function setMode(nextMode) {
  mode = nextMode;
  const registering = mode === "register";

  if (nameGroup) nameGroup.hidden = !registering;
  if (phoneGroup) phoneGroup.hidden = !registering;

  const fullNameInput = document.getElementById("fullName");
  if (fullNameInput) fullNameInput.required = registering;

  if (heading) heading.textContent = registering ? "Create your account" : "Sign in";

  const passwordInput = document.getElementById("password");
  if (passwordInput) {
    passwordInput.autocomplete = registering ? "new-password" : "current-password";
    passwordInput.minLength = registering ? 8 : 0;
  }

  if (submitButton) submitButton.textContent = registering ? "Create account" : "Sign in";
  if (switchModeButton) {
    switchModeButton.textContent = registering
      ? "Already registered? Sign in"
      : "New here? Create an account";
  }

  if (noteEl) {
    noteEl.textContent = registering
      ? "Create an account to save your contact details for future adventure reservations."
      : "";
  }
  setMessage("");
}

switchModeButton?.addEventListener("click", () => {
  setMode(mode === "register" ? "signIn" : "register");
});

resendButton?.addEventListener("click", async () => {
  const emailInput = document.getElementById("email");
  const email = emailInput?.value.trim();
  if (!email) {
    setMessage("Please enter your email address to resend verification.", true);
    return;
  }

  submitButton.disabled = true;
  try {
    const supabase = typeof getSupabaseClient === "function" ? getSupabaseClient() : null;
    if (!supabase) throw new Error("Supabase is not configured.");

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email
    });
    if (error) {
      setMessage(error.message, true);
    } else {
      setMessage("Verification email resent. Please check your inbox and spam folder.");
    }
  } catch (err) {
    setMessage(err instanceof Error ? err.message : "Unable to request verification.", true);
  } finally {
    submitButton.disabled = false;
  }
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  submitButton.disabled = true;
  setMessage("");

  const fullName = document.getElementById("fullName")?.value.trim() || "";
  const email = document.getElementById("email")?.value.trim() || "";
  const phone = document.getElementById("phone")?.value.trim() || "";
  const password = document.getElementById("password")?.value || "";

  try {
    const supabase = typeof getSupabaseClient === "function" ? getSupabaseClient() : null;
    if (!supabase) throw new Error("Supabase is not initialized. Please verify your connection.");

    if (mode === "register") {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName,
            phone: phone
          }
        }
      });

      if (error) {
        setMessage(error.message, true);
        return;
      }

      if (data.session && data.user) {
        showSignedIn(data.user);
        setMessage("Account created and signed in successfully!");
        return;
      }

      // If email confirmation is enabled on Supabase project:
      document.getElementById("password").value = "";
      setMode("signIn");
      if (resendButton) resendButton.hidden = false;
      setMessage("Account created! Check your email to verify your address, then sign in.");
      return;
    }

    // Sign in mode
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        if (resendButton) resendButton.hidden = false;
      }
      setMessage(error.message, true);
      return;
    }

    if (!data?.user) {
      setMessage("Unable to sign in. Please verify your credentials.", true);
      return;
    }

    showSignedIn(data.user);
    const pwd = document.getElementById("password");
    if (pwd) pwd.value = "";
    if (resendButton) resendButton.hidden = true;
    setMessage("You are signed in.");
  } catch (error) {
    setMessage(error instanceof Error ? error.message : "The account service is unavailable.", true);
  } finally {
    submitButton.disabled = false;
  }
});

signOutButton?.addEventListener("click", async () => {
  try {
    const supabase = typeof getSupabaseClient === "function" ? getSupabaseClient() : null;
    if (supabase) {
      await supabase.auth.signOut();
    }
  } catch (err) {
    console.error("Sign out error:", err);
  } finally {
    sessionStorage.removeItem(PROFILE_KEY);
    signedInPanel.hidden = true;
    formPanel.hidden = false;
    bookingsList.replaceChildren();
    if (bookingsMessage) bookingsMessage.textContent = "";
    setMode("signIn");
    setMessage("You have been signed out.");
  }
});

async function restoreSession() {
  const supabase = typeof getSupabaseClient === "function" ? getSupabaseClient() : null;
  if (!supabase) return;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      showSignedIn(session.user);
    }
  } catch (err) {
    console.warn("Unable to restore session:", err);
  }
}

// Initial session check
void restoreSession();
