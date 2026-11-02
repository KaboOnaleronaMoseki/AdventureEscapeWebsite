




const navToggle = document.getElementById("navToggle");
const primaryNav = document.getElementById("primaryNav");

function closeMegaMenus() {
  document.querySelectorAll(".mega-menu-item").forEach(function(item) {
    item.classList.remove("open");
    const trigger = item.querySelector(".nav-trigger");
    if (trigger) {
      trigger.setAttribute("aria-expanded", "false");
    }
  });
}

if (navToggle && primaryNav) {
  navToggle.addEventListener("click", function() {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    primaryNav.classList.toggle("open", !isOpen);
    if (!isOpen) {
      closeMegaMenus();
    }
  });

  const links = primaryNav.querySelectorAll("a");
  links.forEach(function(link) {
    link.addEventListener("click", function() {
      primaryNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      closeMegaMenus();
    });
  });

  const megaButtons = primaryNav.querySelectorAll(".nav-trigger");
  megaButtons.forEach(function(button) {
    button.addEventListener("click", function(event) {
      event.stopPropagation();
      const item = button.closest(".mega-menu-item");
      if (!item) {
        return;
      }

      const isOpen = item.classList.contains("open");
      closeMegaMenus();

      if (!isOpen) {
        item.classList.add("open");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });

  document.addEventListener("click", function(event) {
    if (!event.target.closest(".mega-menu-item") && !event.target.closest(".nav-toggle")) {
      closeMegaMenus();
    }
  });

  document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
      if (primaryNav.classList.contains("open")) {
        primaryNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.focus();
      }
      closeMegaMenus();
    }
  });
}

const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}
