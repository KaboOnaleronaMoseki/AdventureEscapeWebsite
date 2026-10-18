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

try {
  const savedProfile = JSON.parse(
    sessionStorage.getItem("adventure-escape-client-profile") || "null"
  );
  if (savedProfile) {
    document.getElementById("fullName").value = savedProfile.fullName || "";
    document.getElementById("email").value = savedProfile.email || "";
    document.getElementById("phone").value = savedProfile.phone || "";
  }
} catch {
  // Session storage can be unavailable in restricted browser contexts.
}

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
  document.getElementById("formattedActivityDate").textContent =
    formatSouthAfricanDate(activityDateInput.value);
  document.getElementById("formattedCheckInDate").textContent =
    formatSouthAfricanDate(checkInDateInput.value);
  document.getElementById("formattedCheckOutDate").textContent =
    formatSouthAfricanDate(checkOutDateInput.value);
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
  document.getElementById("summaryBookings").textContent = summary.totalActivities;
  document.getElementById("summaryActivityTypes").textContent = summary.selectedActivityTypes;
  document.getElementById("summarySubtotal").textContent = formatMoney(summary.activitySubtotal);
  document.getElementById("summaryDiscount").textContent =
    `${formatMoney(summary.discountAmount)} (${summary.discountPercent}%)`;
  document.getElementById("summaryAccomNights").textContent = summary.accommodationCount;
  document.getElementById("summaryAccomTotal").textContent =
    formatMoney(summary.accommodationSubtotal);
  document.getElementById("summaryTotal").textContent = formatMoney(summary.total);
  updateFormState();
}

function updateFormState(showDateError = false, clearError = false) {
  if (!form || !submitButton) return;
  const today = todayInSouthAfrica();
  activityDateInput.min = today;
  checkInDateInput.min = today;
  checkOutDateInput.min =
    checkInDateInput.value >= today
      ? addDays(checkInDateInput.value, 1)
      : today;
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

  const requestBody = {
    customerName: document.getElementById("fullName").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    notes: document.getElementById("notes").value.trim(),
    ...(activityIds.length
      ? {
          activityIds,
          activityQuantities: Object.fromEntries(
            activityIds.map((id) => [id, activityQuantities[id]])
          )
        }
      : {}),
    ...(activityIds.length
      ? { activityDateTime: `${activityDateInput.value}T${activityTimeInput.value}` }
      : {}),
    ...(accommodationIds.length
      ? {
          accommodationIds,
          accommodationQuantities: Object.fromEntries(
            accommodationIds.map((id) => [id, accommodationQuantities[id]])
          ),
          checkInDate: checkInDateInput.value,
          checkOutDate: checkOutDateInput.value
        }
      : {})
  };

  const apiUrl = document
    .querySelector('meta[name="booking-api-url"]')
    ?.content.trim();
  if (!apiUrl) {
    setMessage(
      "Online booking is not configured on this website. Please try again once the booking service is connected.",
      true
    );
    return;
  }
  try {
    const parsedApiUrl = new URL(apiUrl);
    if (parsedApiUrl.protocol !== "https:" && parsedApiUrl.hostname !== "localhost") {
      throw new Error("The booking API must use HTTPS.");
    }
  } catch {
    setMessage(
      "Online booking is not configured correctly. Please contact us for assistance.",
      true
    );
    return;
  }
  submitButton.disabled = true;
  submitButton.textContent = "Sending request…";
  setMessage("");

  try {
    const sessionToken = sessionStorage.getItem("adventure-escape-client-session");
    let response;
    try {
      response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {})
        },
        body: JSON.stringify(requestBody)
      });
    } catch {
      setMessage(
        "We could not reach the booking service. Please try again when the online booking service is available.",
        true
      );
      return;
    }

    let body;
    try {
      body = await response.json();
    } catch {
      setMessage("The booking service returned an invalid response. Please try again.", true);
      return;
    }
    if (!body || typeof body !== "object") {
      setMessage("The booking service returned an invalid response. Please try again.", true);
      return;
    }

    if (!response.ok) {
      setMessage(
        body.errors?.[0]?.message || body.error ||
          "The booking could not be accepted. Please review your dates and try again.",
        true
      );
      return;
    }
    if (response.status !== 201 || body.booking?.status !== "pending") {
      setMessage("The booking service could not confirm your reservation request. Please try again.", true);
      return;
    }

    const reference = body.booking.id ? ` Reference: ${body.booking.id}.` : "";
    const serverTotal = body.booking.pricing?.total;
    const price = typeof serverTotal === "number"
      ? ` Estimated total: ${formatMoney(serverTotal)}.`
      : "";
    const emailStatus = body.emailNotification?.status === "sent"
      ? " The team has been notified by email."
      : " Its email notification is queued for delivery.";
    setMessage(`Your reservation request is pending confirmation.${price}${emailStatus}${reference}`);
    form.reset();
    resetQuantities();
    updateDateDisplays();
    updateSummary();
  } finally {
    submitButton.textContent = "Confirm & Reserve";
    updateFormState();
  }
});
