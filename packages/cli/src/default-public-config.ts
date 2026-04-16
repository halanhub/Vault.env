/**
 * Default Firebase **web client** config for the hosted Vault.env service (vault-env.com).
 * These are public keys (same as bundled in the web app). Self-hosters override via
 * vault-env.cli.env or env vars.
 */
export const DEFAULT_PUBLIC_FIREBASE = {
  NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyBxveZIiZMVGPqcpE1jyG_x2rrSHeH0P5w",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "vaultenv-f0028.firebaseapp.com",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "vaultenv-f0028",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "vaultenv-f0028.firebasestorage.app",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "885731382708",
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:885731382708:web:d346495457752c28c0cee1",
} as const;

export function applyDefaultPublicFirebaseEnv(): void {
  for (const [k, v] of Object.entries(DEFAULT_PUBLIC_FIREBASE)) {
    if (!process.env[k]) process.env[k] = v;
  }
}
