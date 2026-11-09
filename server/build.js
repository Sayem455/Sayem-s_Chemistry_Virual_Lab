import { copyFile, mkdir, rm } from "node:fs/promises";

// Publish only browser entry points. Study files are bundled with the authorized API.
const publicFiles = [
  "index.html", "admin.html", "portal.html", "experiments.html", "lab.html",
  "style.css", "portal.css", "lab.css", "script.js", "home.js", "admin.js", "portal.js",
  "experiments.js", "lab.js", "activities.js", "content.js", "qualitative-slides.js",
  "shared.js", "firebase-config.js", "sayems-chemistry-logo.png", "teacher-sayem.jpg",
];
await rm("dist", { recursive: true, force: true });
await mkdir("dist");
await Promise.all(publicFiles.map(file => copyFile(file, "dist/" + file)));
