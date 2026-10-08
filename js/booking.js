// booking.js - Interactive Fee Calculator & Booking Logic
// Calculates activity pricing, multi-activity discounts, and accommodation stays.

// 1. List of outdoor activities we offer
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

// 2. List of accommodation options
const accommodations = [
  { id: "cabins", name: "Coastal Eco-Cabins", price: 1250, unit: "per cabin / night" },
  { id: "glamping", name: "Canopy Glamping Tents", price: 850, unit: "per tent / night" },
  { id: "lodge", name: "Cliffside Mountain Lodge", price: 2400, unit: "entire lodge / night" },
  { id: "camp", name: "Seaside Camp & Backpackers", price: 350, unit: "per person / night" }
];

// HTML elements
const pickerList = document.getElementById("pickerList");
const accommodationPickerList = document.getElementById("accommodationPickerList");
const form = document.getElementById("bookingForm");
const message = document.getElementById("bookingMessage");

// Track quantities for activities and accommodations
const activityQuantities = {};
activities.forEach((act) => {
  activityQuantities[act.id] = 0;
});

const accommodationQuantities = {};
accommodations.forEach((acc) => {
  accommodationQuantities[acc.id] = 0;
});

// Format money as South African Rand (e.g., R1,250)
function formatMoney(amount) {
  return "R" + amount.toLocaleString("en-ZA");
}

// Tiered multi-activity discount
function getDiscount(totalActivities) {
  if (totalActivities >= 4) return 15; /// 4+ activities = 15% discount
  if (totalActivities === 3) return 10; // 3 activities = 10% discount
  if (totalActivities === 2) return 5;  // 2 activities = 5% discount
  return 0;                             // 0 or 1 activity = 0%
}

// Create a picker row with plus / minus counter
function createPickerRow(item, isAccommodation) {
  const row = document.createElement("li");
  row.className = "picker-row";

  // Item description
  const info = document.createElement("div");
  info.className = "picker-info";
  const unitText = isAccommodation ? item.unit : "per person";
  info.innerHTML =
    '<span class="picker-name">' + item.name + '</span>' +
    '<span class="picker-price">' + formatMoney(item.price) + ' (' + unitText + ')</span>';

  // Quantity controls (+ / -)
  const qtyDiv = document.createElement("div");
  qtyDiv.className = "qty";

  const minusBtn = document.createElement("button");
  minusBtn.type = "button";
  minusBtn.textContent = "−";

  const qtyOutput = document.createElement("output");
  qtyOutput.textContent = "0";

  const plusBtn = document.createElement("button");
  plusBtn.type = "button";
  plusBtn.textContent = "+";

  function updateQuantity(change) {
    if (isAccommodation) {
      accommodationQuantities[item.id] = Math.max(0, accommodationQuantities[item.id] + change);
      qtyOutput.textContent = accommodationQuantities[item.id];
    } else {
      activityQuantities[item.id] = Math.max(0, activityQuantities[item.id] + change);
      qtyOutput.textContent = activityQuantities[item.id];
    }
    updateSummary();
  }

  minusBtn.addEventListener("click", function () {
    updateQuantity(-1);
  });

  plusBtn.addEventListener("click", function () {
    updateQuantity(1);
  });

  qtyDiv.appendChild(minusBtn);
  qtyDiv.appendChild(qtyOutput);
  qtyDiv.appendChild(plusBtn);

  row.appendChild(info);
  row.appendChild(qtyDiv);
  return row;
}

// Update the real-time order summary calculation
function updateSummary() {
  let totalActivities = 0;
  let activitySubtotal = 0;

  activities.forEach((act) => {
    const count = activityQuantities[act.id];
    totalActivities += count;
    activitySubtotal += count * act.price;
  });

  // Calculate activity discount
  const discountPercent = getDiscount(totalActivities);
  const discountAmount = Math.round((activitySubtotal * discountPercent) / 100);
  const discountedActivityTotal = activitySubtotal - discountAmount;

  // Calculate accommodation totals
  let totalAccomStays = 0;
  let accomSubtotal = 0;

  accommodations.forEach((acc) => {
    const count = accommodationQuantities[acc.id];
    totalAccomStays += count;
    accomSubtotal += count * acc.price;
  });

  // Grand total
  const grandTotal = discountedActivityTotal + accomSubtotal;

  // Update summary UI
  const elBookings = document.getElementById("summaryBookings");
  const elSubtotal = document.getElementById("summarySubtotal");
  const elDiscount = document.getElementById("summaryDiscount");
  const elAccomNights = document.getElementById("summaryAccomNights");
  const elAccomTotal = document.getElementById("summaryAccomTotal");
  const elTotal = document.getElementById("summaryTotal");

  if (elBookings) elBookings.textContent = totalActivities;
  if (elSubtotal) elSubtotal.textContent = formatMoney(activitySubtotal);
  if (elDiscount) elDiscount.textContent = formatMoney(discountAmount) + " (" + discountPercent + "%)";
  if (elAccomNights) elAccomNights.textContent = totalAccomStays;
  if (elAccomTotal) elAccomTotal.textContent = formatMoney(accomSubtotal);
  if (elTotal) elTotal.textContent = formatMoney(grandTotal);
}

// Render activities into #pickerList
if (pickerList) {
  activities.forEach((act) => {
    pickerList.appendChild(createPickerRow(act, false));
  });
}

// Render accommodations into #accommodationPickerList
if (accommodationPickerList) {
  accommodations.forEach((acc) => {
    accommodationPickerList.appendChild(createPickerRow(acc, true));
  });
}

// Initial calculation
updateSummary();

// Handle booking reservation submission
if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const totalActivities = Object.values(activityQuantities).reduce((a, b) => a + b, 0);
    const totalAccom = Object.values(accommodationQuantities).reduce((a, b) => a + b, 0);

    const name = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const date = document.getElementById("preferredDate").value;

    if (!name || !email || !date) {
      if (message) {
        message.textContent = "Please fill in all required fields.";
        message.style.color = "var(--indian-yellow)";
      }
      return;
    }

    if (totalActivities === 0 && totalAccom === 0) {
      if (message) {
        message.textContent = "Please select at least one activity or accommodation.";
        message.style.color = "var(--indian-yellow)";
      }
      return;
    }

    if (message) {
      message.textContent = "Thank you, " + name + "! Your booking reservation request has been received.";
      message.style.color = "var(--white)";
    }

    form.reset();
    activities.forEach((act) => {
      activityQuantities[act.id] = 0;
    });
    accommodations.forEach((acc) => {
      accommodationQuantities[acc.id] = 0;
    });
    document.querySelectorAll(".qty output").forEach((output) => {
      output.textContent = "0";
    });
    updateSummary();
  });
}
