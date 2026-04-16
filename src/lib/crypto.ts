/** Shared with CLI  -  implementation lives in `@vaultenv/crypto`. */
export {
  encrypt,
  decrypt,
  encryptFile,
  decryptFile,
  verifyMasterPassword,
  createVerificationPayload,
  type EncryptedPayload,
} from "@vaultenv/crypto";
