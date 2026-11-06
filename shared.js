import {firebaseConfig} from "./firebase-config.js";

export const $ = (id) => document.getElementById(id);
export const lang = () => localStorage.getItem("sc-language") === "en" ? "en" : "bn";
export const tr = (bn, en) => lang() === "en" ? en : bn;
export const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
}[char]));
export function safeURL(value) {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const url = new URL(value, location.href);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch { return ""; }
}
export const rows = (snapshot) => snapshot.docs.map(doc => ({...doc.data(), id:doc.id}));
export const setupMessage = () => tr("অনলাইন অ্যাকাউন্ট ও ফরম চালু করতে Firebase সেটআপ প্রয়োজন।","Firebase setup is required to enable online accounts and forms.");

export async function connect() {
  if (!firebaseConfig) return null;
  const base = "https://www.gstatic.com/firebasejs/10.14.1";
  for (const component of ["app", "auth", "firestore"]) {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = base + "/firebase-" + component + "-compat.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    });
  }
  firebase.initializeApp(firebaseConfig);
  return {auth:firebase.auth(), db:firebase.firestore()};
}

export function languageButton(render) {
  function update() {
    document.documentElement.lang = lang();
    $("language").textContent = tr("EN", "বাংলা");
    document.querySelectorAll("[data-bn][data-en]").forEach(el => el.textContent = el.dataset[lang()]);
    render();
  }
  $("language").onclick = () => {
    localStorage.setItem("sc-language", tr("en", "bn"));
    update();
  };
  update();
}

export function bindAuth(auth, callback) {
  $("login").onsubmit = async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector("button");
    button.disabled = true;
    $("auth-status").textContent = "";
    try {
      await auth.signInWithEmailAndPassword(form.email.value.trim(), form.password.value);
      form.reset();
    } catch {
      $("auth-status").textContent = tr("লগইন হয়নি। ইমেইল ও পাসওয়ার্ড যাচাই করো।","Sign-in failed. Check your email and password.");
    } finally { button.disabled = false; }
  };
  $("logout").onclick = () => auth.signOut();
  auth.onAuthStateChanged(user => {
    $("login").hidden = !!user;
    $("logout").hidden = !user;
    callback(user);
  });
}
