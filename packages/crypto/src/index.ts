const PBKDF2_ITERATIONS = 600_000;
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;

function requireSubtle(): SubtleCrypto {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error(
      "Web Crypto API unavailable. Use Node.js 18+ or a secure browser context."
    );
  }
  return subtle;
}

function getRandomBytes(length: number): Uint8Array<ArrayBuffer> {
  return globalThis.crypto.getRandomValues(new Uint8Array(length));
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer as ArrayBuffer;
}

async function deriveKeyFromPassword(
  password: string,
  salt: ArrayBuffer
): Promise<CryptoKey> {
  const subtle = requireSubtle();
  const encoder = new TextEncoder();
  const keyMaterial = await subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  salt: string;
}

export async function encrypt(
  plaintext: string,
  password: string
): Promise<EncryptedPayload> {
  const salt = getRandomBytes(SALT_LENGTH);
  const iv = getRandomBytes(IV_LENGTH);
  const key = await deriveKeyFromPassword(password, salt.buffer as ArrayBuffer);

  const encoder = new TextEncoder();
  const encrypted = await requireSubtle().encrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    key,
    encoder.encode(plaintext)
  );

  return {
    ciphertext: bufferToBase64(encrypted),
    iv: bufferToBase64(iv.buffer as ArrayBuffer),
    salt: bufferToBase64(salt.buffer as ArrayBuffer),
  };
}

export async function decrypt(
  payload: EncryptedPayload,
  password: string
): Promise<string> {
  const salt = base64ToBuffer(payload.salt);
  const iv = base64ToBuffer(payload.iv);
  const ciphertext = base64ToBuffer(payload.ciphertext);

  const key = await deriveKeyFromPassword(password, salt);

  const decrypted = await requireSubtle().decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

export async function encryptFile(
  file: ArrayBuffer,
  password: string
): Promise<{ encrypted: ArrayBuffer; iv: string; salt: string }> {
  const salt = getRandomBytes(SALT_LENGTH);
  const iv = getRandomBytes(IV_LENGTH);
  const key = await deriveKeyFromPassword(password, salt.buffer as ArrayBuffer);

  const encrypted = await requireSubtle().encrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    key,
    file
  );

  return {
    encrypted,
    iv: bufferToBase64(iv.buffer as ArrayBuffer),
    salt: bufferToBase64(salt.buffer as ArrayBuffer),
  };
}

export async function decryptFile(
  encrypted: ArrayBuffer,
  iv: string,
  salt: string,
  password: string
): Promise<ArrayBuffer> {
  const saltBuf = base64ToBuffer(salt);
  const ivBuf = base64ToBuffer(iv);
  const key = await deriveKeyFromPassword(password, saltBuf);

  return requireSubtle().decrypt(
    { name: "AES-GCM", iv: ivBuf },
    key,
    encrypted
  );
}

export async function verifyMasterPassword(
  password: string,
  verificationPayload: EncryptedPayload
): Promise<boolean> {
  try {
    const decrypted = await decrypt(verificationPayload, password);
    return decrypted === "vault.env.verification";
  } catch {
    return false;
  }
}

export async function createVerificationPayload(
  password: string
): Promise<EncryptedPayload> {
  return encrypt("vault.env.verification", password);
}
