#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync, chmodSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { Command } from "commander";
import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore";
import { encrypt, decrypt, type EncryptedPayload } from "@vaultenv/crypto";

const CREDENTIALS_DIR = path.join(os.homedir(), ".vault-env");
const CREDENTIALS_FILE = path.join(CREDENTIALS_DIR, "credentials.json");

interface Credentials {
  firebaseEmail: string;
  firebasePassword: string;
}

interface FirebaseEnv {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

function loadEnvFile(filePath: string): void {
  if (!existsSync(filePath)) return;
  const raw = readFileSync(filePath, "utf8");
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

function getFirebaseEnv(): FirebaseEnv {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId) {
    throw new Error(
      "Missing Firebase env vars. Set NEXT_PUBLIC_FIREBASE_* or use --env-file pointing to .env.local"
    );
  }
  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

function getApp(cfg: FirebaseEnv): FirebaseApp {
  if (!app) {
    app = initializeApp({
      apiKey: cfg.apiKey,
      authDomain: cfg.authDomain,
      projectId: cfg.projectId,
      storageBucket: cfg.storageBucket,
      messagingSenderId: cfg.messagingSenderId,
      appId: cfg.appId,
    });
  }
  return app;
}

function getAuthDb(cfg: FirebaseEnv) {
  const a = getApp(cfg);
  if (!auth) auth = getAuth(a);
  if (!db) db = getFirestore(a);
  return { auth: auth!, db: db! };
}

function saveCredentials(c: Credentials): void {
  mkdirSync(CREDENTIALS_DIR, { recursive: true });
  writeFileSync(CREDENTIALS_FILE, JSON.stringify(c, null, 2), { mode: 0o600 });
  try {
    chmodSync(CREDENTIALS_FILE, 0o600);
  } catch {
    /* windows */
  }
}

function loadCredentials(): Credentials | null {
  if (!existsSync(CREDENTIALS_FILE)) return null;
  try {
    const j = JSON.parse(readFileSync(CREDENTIALS_FILE, "utf8")) as Credentials;
    if (j.firebaseEmail && j.firebasePassword) return j;
    return null;
  } catch {
    return null;
  }
}

function clearCredentials(): void {
  if (existsSync(CREDENTIALS_FILE)) unlinkSync(CREDENTIALS_FILE);
}

async function getMasterPassword(
  flag?: string
): Promise<string> {
  if (flag) return flag;
  const env = process.env.VAULT_MASTER_PASSWORD;
  if (env) return env;
  const rl = createInterface({ input, output });
  const pw = await rl.question("Master password: ");
  await rl.close();
  return pw.trim();
}

export function parseDotenv(content: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    if (!k) continue;
    let v = t.slice(eq + 1);
    if (v.startsWith(" ") && !v.startsWith('"')) v = v.trimStart();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

function escapeEnvValue(v: string): string {
  if (/[\r\n#"']/.test(v) || /^\s/.test(v) || /\s$/.test(v)) {
    return `"${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return v;
}

function serializeDotenv(entries: { key: string; value: string }[]): string {
  return entries.map((e) => `${e.key}=${escapeEnvValue(e.value)}`).join("\n") + "\n";
}

async function cmdLogin(
  cfg: FirebaseEnv,
  email: string | undefined,
  password: string | undefined
) {
  const { auth: a } = getAuthDb(cfg);
  const rl = createInterface({ input, output });
  const em = email ?? (await rl.question("Firebase email: "));
  const pw = password ?? (await rl.question("Firebase password: "));
  await rl.close();
  await signInWithEmailAndPassword(a, em.trim(), pw);
  saveCredentials({ firebaseEmail: em.trim(), firebasePassword: pw });
  await signOut(a);
  console.log("Saved credentials to", CREDENTIALS_FILE);
  console.warn(
    "Warning: your Firebase password is stored in plain text. Restrict file permissions or use a dedicated account."
  );
}

async function ensureSignedIn(cfg: FirebaseEnv): Promise<{ uid: string; email: string }> {
  const cred = loadCredentials();
  if (!cred) {
    throw new Error(
      "Not logged in. Run: vault-env login --env-file .env.local"
    );
  }
  const { auth: a } = getAuthDb(cfg);
  const credResult = await signInWithEmailAndPassword(
    a,
    cred.firebaseEmail,
    cred.firebasePassword
  );
  const u = credResult.user;
  return { uid: u.uid, email: u.email ?? cred.firebaseEmail };
}

async function cmdWhoami(cfg: FirebaseEnv) {
  const { uid, email } = await ensureSignedIn(cfg);
  console.log("uid:", uid);
  console.log("email:", email);
  const { auth: a } = getAuthDb(cfg);
  await signOut(a);
}

async function cmdProjects(cfg: FirebaseEnv) {
  const { uid } = await ensureSignedIn(cfg);
  const { db: d } = getAuthDb(cfg);
  const q = query(collection(d, "projects"), where("userId", "==", uid));
  const snap = await getDocs(q);
  const rows = snap.docs
    .map((docSnap) => {
      const data = docSnap.data() as { name?: string; updatedAt?: { toMillis?: () => number } };
      return {
        id: docSnap.id,
        name: data.name ?? "(no name)",
        updated: data.updatedAt?.toMillis?.() ?? 0,
      };
    })
    .sort((a, b) => b.updated - a.updated);
  if (rows.length === 0) {
    console.log("No projects.");
  } else {
    for (const r of rows) {
      console.log(`${r.id}\t${r.name}`);
    }
  }
  const { auth: a } = getAuthDb(cfg);
  await signOut(a);
}

async function cmdPull(
  cfg: FirebaseEnv,
  projectId: string,
  outFile: string,
  masterPassword: string | undefined
) {
  const { uid } = await ensureSignedIn(cfg);
  const { db: d } = getAuthDb(cfg);
  const mp = await getMasterPassword(masterPassword);
  const q = query(
    collection(d, "secrets"),
    where("projectId", "==", projectId),
    where("userId", "==", uid)
  );
  const snap = await getDocs(q);
  const rows: { key: string; value: string }[] = [];
  for (const docSnap of snap.docs) {
    const data = docSnap.data() as {
      key: string;
      encryptedValue: EncryptedPayload;
      createdAt?: { toMillis?: () => number };
    };
    const value = await decrypt(data.encryptedValue, mp);
    rows.push({
      key: data.key,
      value,
    });
  }
  rows.sort((a, b) => a.key.localeCompare(b.key));
  const body = serializeDotenv(rows);
  writeFileSync(outFile, body, "utf8");
  console.log(`Wrote ${rows.length} secrets to ${outFile}`);
  const { auth: a } = getAuthDb(cfg);
  await signOut(a);
}

async function cmdPush(
  cfg: FirebaseEnv,
  projectId: string,
  inFile: string,
  masterPassword: string | undefined
) {
  const { uid } = await ensureSignedIn(cfg);
  const { db: d } = getAuthDb(cfg);
  const mp = await getMasterPassword(masterPassword);
  const raw = readFileSync(inFile, "utf8");
  const parsed = parseDotenv(raw);

  const q = query(
    collection(d, "secrets"),
    where("projectId", "==", projectId),
    where("userId", "==", uid)
  );
  const snap = await getDocs(q);
  const byKey = new Map<string, { id: string; key: string }>();
  for (const docSnap of snap.docs) {
    const data = docSnap.data() as { key: string };
    byKey.set(data.key, { id: docSnap.id, key: data.key });
  }

  let added = 0;
  let updated = 0;
  for (const [key, value] of Object.entries(parsed)) {
    const existing = byKey.get(key);
    const encryptedValue = await encrypt(value, mp);
    if (existing) {
      await updateDoc(doc(d, "secrets", existing.id), {
        key,
        encryptedValue,
        updatedAt: serverTimestamp(),
      });
      updated++;
    } else {
      await addDoc(collection(d, "secrets"), {
        projectId,
        userId: uid,
        key,
        encryptedValue,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      added++;
    }
  }
  await updateDoc(doc(d, "projects", projectId), {
    updatedAt: serverTimestamp(),
  });
  console.log(`Push complete: ${added} added, ${updated} updated.`);
  const { auth: a } = getAuthDb(cfg);
  await signOut(a);
}

async function main() {
  const program = new Command();
  program.name("vault-env").description("Vault.env  -  pull/push secrets from the terminal");

  program
    .option(
      "--env-file <path>",
      "Path to .env with NEXT_PUBLIC_FIREBASE_* (default: .env.local in cwd)"
    )
    .hook("preAction", (thisCommand) => {
      const opts = thisCommand.opts() as { envFile?: string };
      const p = opts.envFile ?? path.join(process.cwd(), ".env.local");
      loadEnvFile(p);
    });

  program
    .command("login")
    .description("Save Firebase email/password for CLI (stored under ~/.vault-env/)")
    .option("-e, --email <email>")
    .option("-p, --password <password>")
    .action(async (opts: { email?: string; password?: string }) => {
      const cfg = getFirebaseEnv();
      await cmdLogin(cfg, opts.email, opts.password);
    });

  program
    .command("logout")
    .description("Remove saved credentials")
    .action(() => {
      clearCredentials();
      console.log("Logged out (credentials removed).");
    });

  program
    .command("whoami")
    .description("Show signed-in user uid and email")
    .action(async () => {
      const cfg = getFirebaseEnv();
      await cmdWhoami(cfg);
    });

  program
    .command("projects")
    .description("List project ids and names")
    .action(async () => {
      const cfg = getFirebaseEnv();
      await cmdProjects(cfg);
    });

  program
    .command("pull")
    .description("Decrypt secrets and write a .env file")
    .requiredOption("--project <id>", "Firestore project document id")
    .option("-o, --out <file>", "Output file", ".env")
    .option("--master-password <pw>", "Master password (else VAULT_MASTER_PASSWORD or prompt)")
    .action(
      async (opts: { project: string; out?: string; masterPassword?: string }) => {
        const cfg = getFirebaseEnv();
        await cmdPull(cfg, opts.project, opts.out ?? ".env", opts.masterPassword);
      }
    );

  program
    .command("push")
    .description("Encrypt and upload secrets from a .env file")
    .requiredOption("--project <id>", "Firestore project document id")
    .option("-f, --file <file>", "Input file", ".env")
    .option("--master-password <pw>", "Master password (else VAULT_MASTER_PASSWORD or prompt)")
    .action(
      async (opts: { project: string; file?: string; masterPassword?: string }) => {
        const cfg = getFirebaseEnv();
        await cmdPush(cfg, opts.project, opts.file ?? ".env", opts.masterPassword);
      }
    );

  await program.parseAsync(process.argv);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
