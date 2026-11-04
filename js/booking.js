const BOOKING_TIME_ZONE = "Africa/Johannesburg";
const PAST_DATE_MESSAGE =
  "Past dates cannot be booked. Please select today or a future date.";
const ACTIVITY_CUTOFF_MESSAGE =
  "This activity must be booked at least 24 hours in advance. Please choose a later date or time.";
const CHECKOUT_DATE_MESSAGE = "Check-out must be at least one day after check-in.";

const activities = [
  { id: "kayaking", name: "Kayaking", price: 450 },
  { id: "ziplining", name: "Ziplining", price: 550 },
  { id: "climbing", name: "Rock Climbing", price: 600 },
  { id: "team", name: "Team Challenges", price: 400 },
  { id: "hiking", name: "Coastal Hiking & Fynbos Trail", price: 350 },
  { id: "snorkeling", name: "Marine Snorkel Safari", price: 500 },
  { id: "sup", name: "Stand-Up Paddleboarding (SUP)", price: 380 },
  { id: "fatbike", name: "Fat Bike Dune Trail", price: 460 },
  { id: "caving", name: "Caving & Grotto Exploration", price: 520 }
];

const accommodations = [
  { id: "cabins", name: "Coastal Eco-Cabins", price: 1250, unit: "per cabin / night" },
  { id: "glamping", name: "Canopy Glamping Tents", price: 850, unit: "per tent / night" },
  { id: "lodge", name: "Cliffside Mountain Lodge", price: 2400, unit: "entire lodge / night" },
  { id: "camp", name: "Seaside Camp & Backpackers", price: 350, unit: "per person / night" }
];

const pickerList = document.getElementById("pickerList");
const accommodationPickerList = document.getElementById("accommodationPickerList");
const form = document.getElementById("bookingForm");
const message = document.getElementById("bookingMessage");
const submitButton = document.getElementById("submitBooking");
const activityDateInput = document.getElementById("activityDate");
const activityTimeInput = document.getElementById("activityTime");
const checkInDateInput = document.getElementById("checkInDate");
const checkOutDateInput = document.getElementById("checkOutDate");

async function prefillCustomerInfo() {
  try {
    const savedProfile = JSON.parse(
      sessionStorage.getItem("adventure-escape-client-profile") || "null"
    );
    if (savedProfile) {
      if (savedProfile.fullName && document.getElementById("fullName")) {
        document.getElementById("fullName").value = savedProfile.fullName;
      }
      if (savedProfile.email && document.getElementById("email")) {
        document.getElementById("email").value = savedProfile.email;
      }
      if (savedProfile.phone && document.getElementById("phone")) {
        document.getElementById("phone").value = savedProfile.phone;
      }
    }

    const supabase = typeof getSupabaseClient === "function" ? getSupabaseClient() : null;
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const name = session.user.user_metadata?.full_name || session.user.email.split("@")[0];
        const phone = session.user.user_metadata?.phone || "";
        const email = session.user.email;
        if (!document.getElementById("fullName").value && name) {
          document.getElementById("fullName").value = name;
        }
        if (!document.getElementById("email").value && email) {
          document.getElementById("email").value = email;
        }
        if (!document.getElementById("phone").value && phone) {
          document.getElementById("phone").value = phone;
        }
      }
    }
  } catch (err) {
    console.warn("Could not prefill customer details:", err);
  }
}
void prefillCustomerInfo();

const activityQuantities = Object.fromEntries(activities.map(({ id }) => [id, 0]));
const accommodationQuantities = Object.fromEntries(accommodations.map(({ id }) => [id, 0]));

function formatMoney(amount) {
  return `R${amount.toLocaleString("en-ZA")}`;
}

function todayInSouthAfrica() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BOOKING_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const fields = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${fields.year}-${fields.month}-${fields.day}`;
}

function addDays(date, count) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + count);
  return value.toISOString().slice(0, 10);
}

function formatSouthAfricanDate(value) {
  if (!value) return "Not selected";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return "Not selected";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: BOOKING_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}

function updateDateDisplays() {
  const actDateEl = document.getElementById("formattedActivityDate");
  const inDateEl = document.getElementById("formattedCheckInDate");
  const outDateEl = document.getElementById("formattedCheckOutDate");
  if (actDateEl) actDateEl.textContent = formatSouthAfricanDate(activityDateInput.value);
  if (inDateEl) inDateEl.textContent = formatSouthAfricanDate(checkInDateInput.value);
  if (outDateEl) outDateEl.textContent = formatSouthAfricanDate(checkOutDateInput.value);
}

function setMessage(text, isError = false) {
  if (!message) return;
  message.textContent = text;
  message.classList.toggle("is-error", isError);
  message.classList.toggle("is-success", Boolean(text) && !isError);
}

function createPickerRow(item, isAccommodation) {
  const row = document.createElement("li");
  row.className = "picker-row";

  const info = document.createElement("div");
  info.className = "picker-info";
  info.innerHTML =
    `<span class="picker-name">${item.name}</span>` +
    `<span class="picker-price">${formatMoney(item.price)} (${isAccommodation ? item.unit : "per person"})</span>`;

  const controls = document.createElement("div");
  controls.className = "qty";

  const minus = document.createElement("button");
  minus.type = "button";
  minus.textContent = "−";
  minus.setAttribute("aria-label", `Remove one ${item.name}`);

  const output = document.createElement("output");
  output.textContent = "0";
  output.setAttribute("aria-label", `${item.name} quantity`);

  const plus = document.createElement("button");
  plus.type = "button";
  plus.textContent = "+";
  plus.setAttribute("aria-label", `Add one ${item.name}`);

  const quantities = isAccommodation ? accommodationQuantities : activityQuantities;
  function adjust(change) {
    quantities[item.id] = Math.max(0, quantities[item.id] + change);
    output.textContent = String(quantities[item.id]);
    setMessage("");
    updateSummary();
  }

  minus.addEventListener("click", () => adjust(-1));
  plus.addEventListener("click", () => adjust(1));
  controls.append(minus, output, plus);
  row.append(info, controls);
  return row;
}

function getPricing() {
  const selectedActivityTypes = activities.filter(
    ({ id }) => activityQuantities[id] > 0
  ).length;
  const totalActivities = activities.reduce(
    (total, { id }) => total + activityQuantities[id],
    0
  );
  const activitySubtotal = activities.reduce(
    (total, { id, price }) => total + activityQuantities[id] * price,
    0
  );
  const discountPercent =
    selectedActivityTypes >= 4 ? 15 :
      selectedActivityTypes === 3 ? 10 :
        selectedActivityTypes === 2 ? 5 : 0;
  const discountAmount = Math.round(activitySubtotal * discountPercent / 100);
  const accommodationCount = accommodations.reduce(
    (total, { id }) => total + accommodationQuantities[id],
    0
  );
  const accommodationSubtotal = accommodations.reduce(
    (total, { id, price }) => total + accommodationQuantities[id] * price,
    0
  );

  return {
    selectedActivityTypes,
    totalActivities,
    activitySubtotal,
    discountPercent,
    discountAmount,
    accommodationCount,
    accommodationSubtotal,
    total: activitySubtotal - discountAmount + accommodationSubtotal
  };
}

function selectedIds(items, quantities) {
  return items.filter(({ id }) => quantities[id] > 0).map(({ id }) => id);
}

function getDateError() {
  const today = todayInSouthAfrica();
  const chosenActivities = selectedIds(activities, activityQuantities);
  const chosenAccommodations = selectedIds(accommodations, accommodationQuantities);

  if (chosenActivities.length) {
    if (!activityDateInput.value || !activityTimeInput.value) {
      return "Select a valid activity date and time.";
    }
    if (activityDateInput.value < today) return PAST_DATE_MESSAGE;
    const activityTime = new Date(`${activityDateInput.value}T${activityTimeInput.value}:00+02:00`);
    if (Number.isNaN(activityTime.getTime())) return "Select a valid activity date and time.";
    if (activityTime.getTime() - Date.now() < 24 * 60 * 60 * 1000) {
      return ACTIVITY_CUTOFF_MESSAGE;
    }
  }

  if (chosenAccommodations.length) {
    if (!checkInDateInput.value) return "Select a valid check-in date.";
    if (checkInDateInput.value < today) return PAST_DATE_MESSAGE;
    if (!checkOutDateInput.value || checkOutDateInput.value <= checkInDateInput.value) {
      return CHECKOUT_DATE_MESSAGE;
    }
  }

  return "";
}

function updateSummary() {
  const summary = getPricing();
  const bookingsEl = document.getElementById("summaryBookings");
  const typesEl = document.getElementById("summaryActivityTypes");
  const subtotalEl = document.getElementById("summarySubtotal");
  const discountEl = document.getElementById("summaryDiscount");
  const accomNightsEl = document.getElementById("summaryAccomNights");
  const accomTotalEl = document.getElementById("summaryAccomTotal");
  const totalEl = document.getElementById("summaryTotal");

  if (bookingsEl) bookingsEl.textContent = summary.totalActivities;
  if (typesEl) typesEl.textContent = summary.selectedActivityTypes;
  if (subtotalEl) subtotalEl.textContent = formatMoney(summary.activitySubtotal);
  if (discountEl) discountEl.textContent = `${formatMoney(summary.discountAmount)} (${summary.discountPercent}%)`;
  if (accomNightsEl) accomNightsEl.textContent = summary.accommodationCount;
  if (accomTotalEl) accomTotalEl.textContent = formatMoney(summary.accommodationSubtotal);
  if (totalEl) totalEl.textContent = formatMoney(summary.total);
  updateFormState();
}

function updateFormState(showDateError = false, clearError = false) {
  if (!form || !submitButton) return;
  const today = todayInSouthAfrica();
  if (activityDateInput) activityDateInput.min = today;
  if (checkInDateInput) checkInDateInput.min = today;
  if (checkOutDateInput) {
    checkOutDateInput.min =
      checkInDateInput.value >= today
        ? addDays(checkInDateInput.value, 1)
        : today;
  }
  const hasSelection =
    Object.values(activityQuantities).some((count) => count > 0) ||
    Object.values(accommodationQuantities).some((count) => count > 0);
  const dateError = getDateError();
  const isValid =
    form.checkValidity() &&
    document.getElementById("fullName").value.trim().length > 0 &&
    hasSelection &&
    !dateError;
  submitButton.disabled = !isValid;

  if (showDateError && dateError) setMessage(dateError, true);
  else if (clearError && message?.classList.contains("is-error")) setMessage("");
}

function resetQuantities() {
  for (const quantities of [activityQuantities, accommodationQuantities]) {
    for (const id of Object.keys(quantities)) quantities[id] = 0;
  }
  document.querySelectorAll(".qty output").forEach((output) => {
    output.textContent = "0";
  });
}

if (pickerList) {
  activities.forEach((activity) => pickerList.append(createPickerRow(activity, false)));
}
if (accommodationPickerList) {
  accommodations.forEach((stay) => accommodationPickerList.append(createPickerRow(stay, true)));
}

updateFormState();

form?.addEventListener("input", () => {
  updateDateDisplays();
  updateFormState(true, true);
});
form?.addEventListener("change", () => {
  updateDateDisplays();
  updateFormState(true, true);
});
updateDateDisplays();
updateSummary();

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  updateFormState(true);
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const activityIds = selectedIds(activities, activityQuantities);
  const accommodationIds = selectedIds(accommodations, accommodationQuantities);
  const dateError = getDateError();
  if (!activityIds.length && !accommodationIds.length) {
    setMessage("Please select at least one activity or accommodation.", true);
    return;
  }
  if (dateError) {
    setMessage(dateError, true);
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Sending request…";
  setMessage("");

  const pricing = getPricing();
  const customerName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const notes = document.getElementById("notes")?.value.trim() || "";

  const activityNames = activityIds.map((id) => {
    const act = activities.find((a) => a.id === id);
    return `${act ? act.name : id} (x${activityQuantities[id]})`;
  });
  const accommodationNames = accommodationIds.map((id) => {
    const acc = accommodations.find((a) => a.id === id);
    return `${acc ? acc.name : id} (x${accommodationQuantities[id]})`;
  });

  const supabase = typeof getSupabaseClient === "function" ? getSupabaseClient() : null;
  let currentUser = null;
  if (supabase) {
    try {
      const { data } = await supabase.auth.getUser();
      currentUser = data?.user || null;
    } catch {
      // ignore
    }
  }

  function generateUUID() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  const bookingUuid = generateUUID();
  const bookingId = "AE-" + bookingUuid.substring(0, 8).toUpperCase();

  const bookingRecord = {
    id: bookingUuid,
    user_id: currentUser?.id || null,
    customer_name: customerName,
    email: email,
    phone: phone,
    notes: notes,
    date: activityDateInput?.value || checkInDateInput?.value || new Date().toISOString().split("T")[0],
    time: activityTimeInput?.value || "10:00",
    activity_ids: activityIds,
    activity_quantities: Object.fromEntries(
      activityIds.map((id) => [id, activityQuantities[id]])
    ),
    activity_date_time: activityIds.length
      ? `${activityDateInput.value}T${activityTimeInput.value}`
      : null,
    accommodation_ids: accommodationIds,
    accommodation_quantities: Object.fromEntries(
      accommodationIds.map((id) => [id, accommodationQuantities[id]])
    ),
    check_in_date: accommodationIds.length ? checkInDateInput.value : null,
    check_out_date: accommodationIds.length ? checkOutDateInput.value : null,
    total_price: pricing.total,
    pricing: pricing,
    status: "pending",
    created_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      const { error } = await supabase
        .from("bookings")
        .insert([bookingRecord]);

      if (error) {
        console.warn("Supabase booking insert notice:", error.message);
      }
    } catch (dbErr) {
      console.warn("Supabase booking insert error:", dbErr);
    }
  }

  // Email notification via EmailJS
  let emailSent = false;
  const emailjsCfg = window.ADVENTURE_CONFIG?.emailjs;
  const recipient = emailjsCfg?.recipientEmail || "Kaboonalerona7@gmail.com";

  const emailParams = {
    to_email: recipient,
    email: recipient,
    recipient: recipient,
    to_name: "Admin",
    customer_name: customerName,
    customer_email: email,
    customer_phone: phone || "Not provided",
    activities: activityNames.join(", ") || "None",
    activity_date: activityIds.length
      ? `${activityDateInput.value} at ${activityTimeInput.value}`
      : "N/A",
    accommodation: accommodationNames.join(", ") || "None",
    accommodation_dates: accommodationIds.length
      ? `${checkInDateInput.value} to ${checkOutDateInput.value}`
      : "N/A",
    notes: notes || "None",
    total_price: formatMoney(pricing.total),
    booking_id: bookingId
  };

  if (
    window.emailjs &&
    emailjsCfg &&
    emailjsCfg.serviceId &&
    emailjsCfg.templateId &&
    emailjsCfg.publicKey &&
    emailjsCfg.serviceId !== "YOUR_SERVICE_ID"
  ) {
    try {
      await window.emailjs.send(
        emailjsCfg.serviceId,
        emailjsCfg.templateId,
        emailParams,
        emailjsCfg.publicKey
      );
      emailSent = true;
    } catch (e) {
      console.error("EmailJS sending error:", e);
    }
  }

  const successMessage = emailSent
    ? `Your reservation request has been submitted! Reference: ${bookingId}. Estimated total: ${formatMoney(pricing.total)}. A confirmation email has been dispatched to ${recipient}.`
    : `Your reservation request has been submitted! Reference: ${bookingId}. Estimated total: ${formatMoney(pricing.total)}. Our adventure team will review your booking shortly.`;

  setMessage(successMessage);
  form.reset();
  resetQuantities();
  updateDateDisplays();
  updateSummary();

  submitButton.textContent = "Confirm & Reserve";
  updateFormState();
});
