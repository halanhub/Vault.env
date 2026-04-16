import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, deleteObject } from "firebase/storage";
import { auth, db, storage } from "./firebase";
import { encrypt, decrypt, encryptFile, type EncryptedPayload } from "./crypto";
import {
  getBillingStatus,
  mustSubscribeForAnotherProject,
  SUBSCRIPTION_REQUIRED_ERROR,
} from "./billing";

export interface Project {
  id: string;
  name: string;
  icon: string;
  imageUrl?: string;   // custom uploaded logo
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Secret {
  id: string;
  projectId: string;
  userId: string;
  key: string;
  encryptedValue: EncryptedPayload;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface VaultFile {
  id: string;
  projectId: string;
  userId: string;
  name: string;
  size: number;
  type: string;
  storagePath: string;
  iv: string;
  salt: string;
  createdAt: Timestamp;
}

export interface Note {
  id: string;
  projectId: string;
  userId: string;
  encryptedContent: EncryptedPayload;
  updatedAt: Timestamp;
}

// --- Projects ---

export async function getProjects(userId: string): Promise<Project[]> {
  // Single-field query  -  no composite index required.
  // Sort by updatedAt client-side to avoid Firestore index creation.
  const q = query(
    collection(db, "projects"),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Project));
  return docs.sort((a, b) => {
    const aTime = a.updatedAt?.toMillis?.() ?? 0;
    const bTime = b.updatedAt?.toMillis?.() ?? 0;
    return bTime - aTime;
  });
}

export async function createProject(
  userId: string,
  name: string,
  icon: string,
  imageUrl?: string
): Promise<string> {
  const [existing, billing] = await Promise.all([
    getProjects(userId),
    getBillingStatus(userId),
  ]);
  if (mustSubscribeForAnotherProject(existing.length, billing)) {
    throw new Error(SUBSCRIPTION_REQUIRED_ERROR);
  }

  const docRef = await addDoc(collection(db, "projects"), {
    name,
    icon,
    ...(imageUrl ? { imageUrl } : {}),
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Uploads a project logo. Uses `auth.currentUser.uid` for the path so Storage rules
 * (`request.auth.uid == userId`) always match a fresh session  -  avoids storage/unauthorized
 * when the Zustand `userId` was stale or out of sync.
 */
export async function uploadProjectImage(
  _userId: string,
  file: File
): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to upload an image.");
  }
  await user.getIdToken(true);

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `projectImages/${user.uid}/${Date.now()}.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const { getDownloadURL } = await import("firebase/storage");
  return getDownloadURL(storageRef);
}

export async function updateProject(
  projectId: string,
  data: Partial<Pick<Project, "name" | "icon" | "imageUrl">>
): Promise<void> {
  await updateDoc(doc(db, "projects", projectId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProject(projectId: string): Promise<void> {
  await deleteDoc(doc(db, "projects", projectId));
}

// --- Secrets ---

export async function getSecrets(
  projectId: string,
  userId: string,
  masterPassword: string
): Promise<Array<{ id: string; key: string; value: string }>> {
  const q = query(
    collection(db, "secrets"),
    where("projectId", "==", projectId),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  const results = await Promise.all(
    snapshot.docs.map(async (d) => {
      const data = d.data() as Omit<Secret, "id">;
      const value = await decrypt(data.encryptedValue, masterPassword);
      return { id: d.id, key: data.key, value, createdAt: data.createdAt };
    })
  );
  return results
    .sort((a, b) => (a.createdAt?.toMillis?.() ?? 0) - (b.createdAt?.toMillis?.() ?? 0))
    .map(({ id, key, value }) => ({ id, key, value }));
}

export async function addSecret(
  projectId: string,
  userId: string,
  key: string,
  value: string,
  masterPassword: string
): Promise<string> {
  const encryptedValue = await encrypt(value, masterPassword);
  const docRef = await addDoc(collection(db, "secrets"), {
    projectId,
    userId,
    key,
    encryptedValue,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "projects", projectId), {
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateSecret(
  secretId: string,
  projectId: string,
  key: string,
  value: string,
  masterPassword: string
): Promise<void> {
  const encryptedValue = await encrypt(value, masterPassword);
  await updateDoc(doc(db, "secrets", secretId), {
    key,
    encryptedValue,
    updatedAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "projects", projectId), {
    updatedAt: serverTimestamp(),
  });
}

export async function deleteSecret(secretId: string): Promise<void> {
  await deleteDoc(doc(db, "secrets", secretId));
}

export async function bulkImportSecrets(
  projectId: string,
  userId: string,
  raw: string,
  masterPassword: string
): Promise<number> {
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));

  let count = 0;
  for (const line of lines) {
    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) continue;
    const key = line.substring(0, eqIndex).trim();
    const value = line.substring(eqIndex + 1).trim().replace(/^["']|["']$/g, "");
    if (key) {
      await addSecret(projectId, userId, key, value, masterPassword);
      count++;
    }
  }
  return count;
}

// --- Files ---

export async function getFiles(projectId: string, userId: string): Promise<VaultFile[]> {
  const q = query(
    collection(db, "files"),
    where("projectId", "==", projectId),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() } as VaultFile))
    .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
}

export async function uploadFile(
  projectId: string,
  userId: string,
  file: File,
  masterPassword: string
): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to upload files.");
  }
  await user.getIdToken(true);
  const uid = user.uid;
  if (uid !== userId) {
    console.warn("[uploadFile] Store userId does not match auth uid; using auth uid for Storage path.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const { encrypted, iv, salt } = await encryptFile(arrayBuffer, masterPassword);

  const storagePath = `vaults/${uid}/${projectId}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, encrypted);

  const docRef = await addDoc(collection(db, "files"), {
    projectId,
    userId: uid,
    name: file.name,
    size: file.size,
    type: file.type,
    storagePath,
    iv,
    salt,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "projects", projectId), {
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function deleteFile(fileId: string, storagePath: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to delete files.");
  }
  await user.getIdToken(true);
  await deleteObject(ref(storage, storagePath));
  await deleteDoc(doc(db, "files", fileId));
}

// --- Notes ---

export async function getNote(
  projectId: string,
  userId: string,
  masterPassword: string
): Promise<{ id: string; content: string } | null> {
  const q = query(
    collection(db, "notes"),
    where("projectId", "==", projectId),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  const data = d.data() as Omit<Note, "id">;
  const content = await decrypt(data.encryptedContent, masterPassword);
  return { id: d.id, content };
}

export async function saveNote(
  projectId: string,
  userId: string,
  content: string,
  masterPassword: string,
  existingNoteId?: string
): Promise<string> {
  const encryptedContent = await encrypt(content, masterPassword);

  if (existingNoteId) {
    await updateDoc(doc(db, "notes", existingNoteId), {
      encryptedContent,
      updatedAt: serverTimestamp(),
    });
    return existingNoteId;
  }

  const docRef = await addDoc(collection(db, "notes"), {
    projectId,
    userId,
    encryptedContent,
    updatedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "projects", projectId), {
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

// --- Verification ---

export async function getVerificationPayload(
  userId: string
): Promise<EncryptedPayload | null> {
  const docSnap = await getDoc(doc(db, "vaultKeys", userId));
  if (!docSnap.exists()) return null;
  return docSnap.data().verification as EncryptedPayload;
}

export async function setVerificationPayload(
  userId: string,
  payload: EncryptedPayload
): Promise<void> {
  await setDoc(doc(db, "vaultKeys", userId), { verification: payload });
}
