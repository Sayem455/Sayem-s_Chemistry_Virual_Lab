const translations = {
  bn: { lang: "EN" },
  en: { lang: "বাং" }
};
let currentLang = "bn";
const langToggle = document.getElementById("languageToggle");

function setLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-bn][data-en]").forEach((el) => {
    el.innerHTML = el.dataset[lang];
  });
  langToggle.textContent = translations[lang].lang;
}
langToggle.addEventListener("click", () => setLanguage(currentLang === "bn" ? "en" : "bn"));

const modal = document.getElementById("loginModal");
function openModal() {
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeModal() {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
document.querySelectorAll(".login-open").forEach((button) => button.addEventListener("click", openModal));
document.getElementById("modalClose").addEventListener("click", closeModal);
modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeModal(); });

document.getElementById("demoLogin").addEventListener("submit", (event) => {
  event.preventDefault();
  const message = document.getElementById("formMessage");
  message.textContent = currentLang === "bn"
    ? "এটি ডেমো ফর্ম। প্রকৃত লগইন চালু করতে নিরাপদ Backend যুক্ত করতে হবে।"
    : "This is a demo form. A secure backend is needed to enable real login.";
});

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
menuToggle.addEventListener("click", () => mainNav.classList.toggle("open"));
mainNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => mainNav.classList.remove("open")));
document.getElementById("year").textContent = new Date().getFullYear();
