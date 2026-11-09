import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join } from "node:path";
import { pipeline } from "node:stream/promises";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { firebaseConfig } from "../firebase-config.js";
import { overdueFees } from "../server/fees.js";

const fileTypes = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".mp4": "video/mp4",
};
const bundledAsset = /^(?:qualitative-slides\/)?[\w-]+\.(?:png|pdf|pptx|mp4)$/i;
const resourceId = /^[\w-]{1,150}$/;
const documents = snapshot => snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

function firebaseApp() {
  const existing = getApps()[0];
  if (existing) return existing;
  const credential = JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT || "{}");
  if (credential.project_id !== firebaseConfig.projectId) throw new Error("Firebase project mismatch");
  return initializeApp({
    credential: cert(credential),
    storageBucket: firebaseConfig.storageBucket,
  });
}

async function sendFile(res, filename, stream) {
  res.setHeader("Content-Type", fileTypes[extname(filename).toLowerCase()]);
  res.setHeader("Content-Disposition", 'attachment; filename="' + filename + '"');
  await pipeline(stream, res);
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method" });
  }
  const token = /^Bearer (\S+)$/.exec(req.headers.authorization || "")?.[1];
  if (!token) return res.status(401).json({ error: "sign-in" });

  const { asset, resource } = req.query;
  if ((asset !== undefined && (typeof asset !== "string" || !bundledAsset.test(asset))) ||
      (resource !== undefined && (typeof resource !== "string" || !resourceId.test(resource))) ||
      (asset && resource)) return res.status(400).json({ error: "file" });

  try {
    const app = firebaseApp();
    const identity = await getAuth(app).verifyIdToken(token, true).catch(error => {
      if (["auth/argument-error", "auth/invalid-id-token", "auth/id-token-expired",
        "auth/id-token-revoked", "auth/user-disabled", "auth/user-not-found"].includes(error.code)) return null;
      throw error;
    });
    if (!identity) return res.status(401).json({ error: "sign-in" });

    const db = getFirestore(app);
    const student = db.collection("students").doc(identity.uid);
    const profile = (await student.get()).data();
    if (!profile) return res.status(403).json({ error: "student" });
    const forStudent = data => data && data.public !== true && (!data.batch || data.batch === profile.batch);

    const feeRecords = documents(await student.collection("records").where("kind", "==", "fees").get());
    const overdue = overdueFees(feeRecords);
    if (overdue.length) return res.status(403).json({ error: "overdue", overdue });

    if (asset) {
      const path = join(process.cwd(), "materials", asset);
      const found = await stat(path).catch(error => {
        if (error.code === "ENOENT") return null;
        throw error;
      });
      if (!found?.isFile()) return res.status(404).json({ error: "file" });
      await sendFile(res, asset.split("/").at(-1), createReadStream(path));
      return;
    }

    if (resource) {
      const data = (await db.collection("resources").doc(resource).get()).data();
      const prefix = "gs://" + firebaseConfig.storageBucket + "/private-materials/";
      if (!forStudent(data) || typeof data.url !== "string" || !data.url.startsWith(prefix))
        return res.status(404).json({ error: "file" });
      const name = data.url.slice(prefix.length);
      const filename = name.split("/").at(-1);
      if (!/^[\w./-]+$/.test(name) || name.split("/").some(part => !part || part === ".." || part === ".") ||
          !fileTypes[extname(filename).toLowerCase()]) return res.status(404).json({ error: "file" });
      const file = getStorage(app).bucket().file("private-materials/" + name);
      await file.getMetadata();
      await sendFile(res, filename, file.createReadStream());
      return;
    }

    const [resources, quizzes] = await Promise.all([
      db.collection("resources").get(),
      db.collection("quizzes").get(),
    ]);
    return res.json({
      resources: documents(resources).filter(forStudent).map(doc =>
        typeof doc.url === "string" && doc.url.startsWith("gs://")
          ? { ...doc, url: "", privateFile: true }
          : doc
      ),
      quizzes: documents(quizzes).filter(forStudent),
    });
  } catch (error) {
    if (res.headersSent || res.destroyed) {
      res.destroy();
      return;
    }
    if (error.code === 404) return res.status(404).json({ error: "file" });
    console.error("Study materials request failed", error.code || error.name);
    return res.status(503).json({ error: "unavailable" });
  }
}
