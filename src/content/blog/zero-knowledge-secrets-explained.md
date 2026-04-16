# Zero-knowledge secrets storage: what developers should know

**Last updated: April 2026**

“**Zero-knowledge**” gets thrown around in marketing. For **API keys** and **environment variables**, the practical question is simple: **who can read your secrets in plaintext, and when?**

---

## What “zero-knowledge” usually means for apps

In a typical zero-knowledge or **client-side encryption** design:

- You enter a password or key material **only on your device**.  
- Secrets are encrypted **before** they leave the browser or CLI.  
- The service stores ciphertext and metadata - not your master password, and not an easy path to decrypt without your key.  

That is different from “we encrypt at rest on our servers,” where the provider still *could* decrypt if their application layer has access.

---

## Why it matters for `.env` and API keys

A plain **env file** on disk is only as safe as your disk and git habits. A hosted “secrets” product that stores **API keys** in plaintext behind a login is convenient for the provider’s support team - and a larger blast radius if their database is compromised.

**Zero-knowledge**-style designs try to ensure that a database leak alone is not enough to read your **environment variables** or project secrets.

---

## Questions to ask any secrets tool

1. **Is encryption performed on the client before upload?**  
2. **Does the server ever see my master password or raw decryption key?**  
3. **What happens if I lose the only device with my key?** (True zero-knowledge often means **no** universal recovery of your data - by design.)  
4. **How do CLI and web stay in sync** without exposing secrets to logs?  

Honest answers matter more than buzzwords.

---

## How this relates to dotenv and local workflows

**Dotenv** loads a **`.env` file** locally. A vault can hold the encrypted source of truth; your workflow **exports** or **pulls** into a local file when you need to run the app. The **env file** is then just another local artifact - still subject to the same “don’t commit” rules as always.

---

## Vault.env’s model (short)

Vault.env uses **client-side AES-256-GCM** for vault data, a **master password** that does not leave your browser, and projects meant to align with how developers think about **API keys** and per-project configuration. Read the [main security guide](/blog/secure-env-files-api-keys) for the full picture, and the [privacy policy](/privacy) for data handling.

---

## Takeaway

**Zero-knowledge** is not magic - it is a specific threat model: assume servers and operators are not trusted with plaintext **API keys**. If that matches how you think about **env protection**, choose tools that make the cryptography and recovery story explicit - not vague “bank-grade” language.
