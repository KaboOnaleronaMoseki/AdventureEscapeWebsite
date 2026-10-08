// main.js - Simple JavaScript for the website
// This file handles:
// 1. Mobile menu toggle
// 2. Auto-updating the footer year

// Get the menu button and menu
const navToggle = document.getElementById("navToggle");
const primaryNav = document.getElementById("primaryNav");

// Keep the responsive menu state and its accessibility attributes in sync.
if (navToggle && primaryNav) {
  navToggle.addEventListener("click", function() {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    primaryNav.classList.toggle("open", !isOpen);
  });

  const links = primaryNav.querySelectorAll("a");
  links.forEach(function(link) {
    link.addEventListener("click", function() {
      primaryNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("keydown", function(event) {
    if (event.key === "Escape" && primaryNav.classList.contains("open")) {
      primaryNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.focus();
    }
  });
}

// Update the year in the footer automatically
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}
