import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/** Strip `gs://` if pasted from console; Firebase expects `project-id.appspot.com`. */
function normalizeStorageBucket(raw: string | undefined): string | undefined {
  if (!raw?.trim()) return undefined;
  return raw.trim().replace(/^gs:\/\//i, "");
}

const storageBucket = normalizeStorageBucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);

/** Enable Google Sign-In in Firebase Console → Authentication → Sign-in method → Google. */
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({ prompt: "select_account" });

export const db = getFirestore(app);

/** Pin default bucket so uploads match Storage rules in `storage.rules`. */
export const storage = storageBucket
  ? getStorage(app, `gs://${storageBucket}`)
  : getStorage(app);

export default app;
