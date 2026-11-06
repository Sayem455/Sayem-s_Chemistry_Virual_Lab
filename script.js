const translations = {
  bn: { lang: "EN" },
  en: { lang: "বাংলা" }
};
let currentLang = "bn";
const langToggle = document.getElementById("languageToggle");

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("sc-language", lang);
  window.dispatchEvent(new Event("sc-language"));
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-bn][data-en]").forEach((el) => {
    el.innerHTML = el.dataset[lang];
  });
  langToggle.textContent = translations[lang].lang;
}
langToggle.addEventListener("click", () => setLanguage(currentLang === "bn" ? "en" : "bn"));

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
menuToggle.addEventListener("click", () => mainNav.classList.toggle("open"));
mainNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => mainNav.classList.remove("open")));
document.getElementById("year").textContent = new Date().getFullYear();

setLanguage(localStorage.getItem("sc-language") === "en" ? "en" : "bn");
