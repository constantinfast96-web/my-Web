/*
  scripts.js – Interaktive Funktionen für NextGen Digital Solutions

  Dieses Skript implementiert folgende Funktionen:
  - Mobile Navigation: Ein/ausklappen des Menüs über das Hamburger‑Icon.
  - Menühighlighting: Hervorheben des Navigationslinks des gerade sichtbaren Abschnitts.
  - Fade‑In‑Animation: Abschnitte mit der Klasse "hidden" werden beim Scrollen sichtbar,
    indem ein IntersectionObserver die Klasse "show" hinzufügt.
  - Dynamisches Jahresdatum: Der aktuelle Wert im Footer wird automatisch gesetzt.
*/

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const navList = document.querySelector("nav ul");

  // Menü ein-/ausklappen auf mobilen Geräten
  menuToggle.addEventListener("click", () => {
    navList.classList.toggle("open");
    menuToggle.classList.toggle("open");
  });

  // Navigation schließen, wenn ein Link geklickt wird (nur mobil relevant)
  const navLinks = document.querySelectorAll("nav a");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navList.classList.remove("open");
      menuToggle.classList.remove("open");
    });
  });

  // Hervorheben des aktuellen Abschnitts im Menü beim Scrollen
  const sections = document.querySelectorAll("section");
  window.addEventListener("scroll", () => {
    let currentSection = "";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 100; // Versatz, damit das Highlight etwas früher wechselt
      if (window.pageYOffset >= sectionTop) {
        currentSection = section.getAttribute("id");
      }
    });
    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href").includes(currentSection)) {
        link.classList.add("active");
      }
    });
  });

  // IntersectionObserver für Fade‑In‑Effekte
  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll(".hidden").forEach((el) => observer.observe(el));

  // Aktuelles Jahr im Footer setzen
  const yearSpan = document.getElementById("current-year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Hero‑Video: Es sind keine speziellen Steuerungen mehr erforderlich.
  // Das Hintergrundvideo wird direkt über das `loop`‑Attribut im HTML gesteuert.
});

// Zweiter DOMContentLoaded‑Handler: Steuerung für Sprach‑Dropdown und Übersetzungen
document.addEventListener("DOMContentLoaded", () => {
  const dd = document.querySelector(".nav-dropdown");
  if (!dd) return;
  const btn = dd.querySelector(".nav-dropbtn");
  const menu = dd.querySelector(".nav-dropdown-menu");
  const currentLabel = dd.querySelector(".current-lang-label");
  const SUPPORTED = ["de", "en", "es", "it"];
  const LABELS = { de: "Deutsch", en: "English", es: "Español", it: "Italiano" };

  // JSON‑Datei laden
  async function loadLocale(lang) {
    const res = await fetch(`./locales/${lang}.json`, { cache: "no-store" });
    if (!res.ok) throw new Error("Locale not found");
    return res.json();
  }

  // Übersetzungen anwenden
  function applyTranslations(dict) {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const parts = key.split(".");
      let val = dict;
      parts.forEach((k) => {
        if (val) val = val[k];
      });
      if (typeof val === "string") {
        if (el.hasAttribute("data-i18n-attr")) {
          const attr = el.getAttribute("data-i18n-attr");
          el.setAttribute(attr, val);
        } else {
          el.textContent = val;
        }
      }
    });
  }

  // Sprache setzen: Wörterbuch laden, anwenden und speichern
  async function setLanguage(lang) {
    const dict = await loadLocale(lang);
    applyTranslations(dict);
    document.documentElement.setAttribute("lang", lang);
    localStorage.setItem("site-lang", lang);
    currentLabel.textContent = LABELS[lang] || lang.toUpperCase();
    // Aktuelle Sprache im Menü markieren
    menu.querySelectorAll("[role='menuitem']").forEach((b) => {
      b.removeAttribute("aria-current");
      if (b.getAttribute("data-lang") === lang) {
        b.setAttribute("aria-current", "true");
      }
    });
  }

  // Initialsprache bestimmen (URL > LocalStorage > Standard)
  (async () => {
    const params = new URLSearchParams(location.search);
    const urlLang = params.get("lang");
    const saved = localStorage.getItem("site-lang");
    let initial = "de";
    if (urlLang && SUPPORTED.includes(urlLang)) {
      initial = urlLang;
    } else if (saved && SUPPORTED.includes(saved)) {
      initial = saved;
    }
    await setLanguage(initial);
  })();

  // Dropdown öffnen/schließen
  btn.addEventListener("click", () => {
    const open = dd.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // Sprache auswählen
  menu.addEventListener("click", async (e) => {
    const item = e.target.closest("[data-lang]");
    if (!item) return;
    const lang = item.getAttribute("data-lang");
    await setLanguage(lang);
    dd.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
    // URL-Parameter optional aktualisieren
    // location.search = `?lang=${lang}`;
  });

  // Schließen beim Klick außerhalb
  document.addEventListener("click", (e) => {
    if (!dd.contains(e.target)) {
      dd.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }
  });
});
document.addEventListener("DOMContentLoaded", () => {
  limitTestimonials();
  initStarRatings();
});

function initStarRatings() {
  const createStarSVG = () => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    // sauberer Stern
    path.setAttribute("d",
      "M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.59L12 17.9l-5.9 3.09 1.13-6.59-4.78-4.66 6.6-.96L12 2.5z"
    );
    svg.appendChild(path);
    return svg;
  };

  document.querySelectorAll(".stars[data-rating]").forEach(container => {
    const rating = Math.max(0, Math.min(5, parseFloat(container.dataset.rating || "0")));
    // Basis- und Vordergrundreihe anlegen
    const bg = document.createElement("div");
    bg.className = "stars-row stars-bg";
    const fg = document.createElement("div");
    fg.className = "stars-row stars-fg";

    for (let i = 0; i < 5; i++) {
      bg.appendChild(createStarSVG());
      fg.appendChild(createStarSVG());
    }

    container.innerHTML = "";
    container.appendChild(bg);
    container.appendChild(fg);

    // Breite der Vordergrundreihe (für Halb-/Teilsterne)
    const pct = (rating / 5) * 100;
    fg.style.width = pct + "%";
  });
}

function limitTestimonials(max = 6) {
  const grid = document.querySelector(".testimonials-grid");
  if (!grid) return;
  while (grid.children.length > max) {
    grid.removeChild(grid.lastElementChild);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const reviewForm = document.getElementById("reviewForm");
  if (reviewForm) {
    reviewForm.addEventListener("submit", e => {
      e.preventDefault();

      const name = document.getElementById("reviewName").value.trim();
      const rating = parseFloat(document.getElementById("reviewRating").value);
      const comment = document.getElementById("reviewText").value.trim();

      if (!name || !comment) return;

      // Neue Karte erstellen
      const article = document.createElement("article");
      article.className = "testimonial";
      article.innerHTML = `
        <p class="quote">“${comment}”</p>
        <div class="stars" data-rating="${rating}" aria-label="${rating} von 5 Sternen"></div>
        <p class="author">– ${name}</p>
      `;

      // In Grid einfügen (neuestes zuerst)
      const grid = document.querySelector(".testimonials-grid");
      grid.prepend(article);

      // Nur die 6 neuesten Bewertungen behalten
      limitTestimonials();

      // Sterne initialisieren
      initStarRatings();

      // Formular leeren
      reviewForm.reset();
    });
  }
});
