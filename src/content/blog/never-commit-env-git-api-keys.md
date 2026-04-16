# Never commit your `.env`: git, leaks, and API key rotation

**Last updated: April 2026**

A **`.env` file** is convenient: one place for **environment variables**, **API keys**, and connection strings. The moment that **env file** lands in git history, you no longer have a private copy - you have a timestamped leak that forks and backups can spread.

This article is about **env protection** at the source control layer: **gitignore**, scanning, and what to do when **API keys** escape.

---

## Why committing `.env` is different from “private repo”

Even private repositories:

- Change hands when teammates leave or companies acquire projects  
- Get copied to laptops, CI caches, and backups  
- Can become public by accident (new default branch settings, fork, or “make repo public”)  

**Environment variables** in a committed **env file** are written in plaintext. Attackers run automated scans for cloud provider keys, Stripe tokens, and generic `API_KEY=` patterns. Assume any committed secret is eventually found.

---

## The role of dotenv in local development

**Dotenv** loads your local **`.env` file** into `process.env` so your app runs without exporting variables by hand. That workflow is fine - **dotenv** is not the problem. The failure mode is versioning the file:

- Add **`.env`** to **`.gitignore`**  
- Commit **`.env.example`** with the same keys but fake values (documenting shape without secrets)  

Teach new contributors: copy example → real **env file**, never paste **API keys** into Slack.

---

## When API keys already leaked through git

If a **`.env`** or key was pushed:

1. **Rotate the key at the provider**  -  treat it as burned; revoking beats “we deleted the commit.”  
2. **Purge from history**  -  tools like `git filter-repo` or provider-specific scrubbers; this is painful, which is why prevention matters.  
3. **Audit forks and clones**  -  anyone who pulled while the secret existed may still have it.  

**API key rotation** is the only guarantee the old string stops working.

---

## Habits that improve env protection

- Pre-commit hooks that block files named `.env` or match secret patterns  
- Secret scanning on push (GitHub Advanced Security, GitGuardian, etc.)  
- Separate **API keys** per environment (dev/staging/prod) so a dev leak does not compromise production  
- Never share **environment variables** in screenshots - IDE tabs love to show **env file** contents  

---

## How Vault.env fits

**Vault.env** is built for developers who want encrypted projects and a vault that does not require trusting the server with plaintext **API keys**. You still keep a local **`.env`** for **dotenv** when you work; the vault is the durable, encrypted store - not a replacement for git hygiene, but a complement when “spreadsheet of keys” stops scaling.

---

## Quick FAQ

### Is `.env` in `.gitignore` enough?

It is the baseline. Pair it with **API key** rotation after any incident and scanning for accidental commits.

### What about encrypted git?

Encrypting the repo does not remove the need to rotate keys if someone with access could have copied them.

### Next steps

Read more on [securing .env files and API keys](/blog/secure-env-files-api-keys) or [open the app](/) to try Vault.env.
