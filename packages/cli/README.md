# vault-env CLI

Sync encrypted secrets between [Vault.env](https://github.com) (Firebase) and local `.env` files.

## Setup

1. From the repo root, install and build:

   ```bash
   npm install
   npm run build -w @vaultenv/cli
   ```

2. In your project directory, ensure `.env.local` contains the same `NEXT_PUBLIC_FIREBASE_*` variables as the web app (or pass `--env-file`).

## Commands

| Command | Description |
|---------|-------------|
| `vault-env login` | Save Firebase email/password under `~/.vault-env/credentials.json` (plain text; restrict permissions). |
| `vault-env logout` | Remove saved credentials. |
| `vault-env whoami` | Print Firebase uid and email. |
| `vault-env projects` | List project ids and names. |
| `vault-env pull --project <id>` | Decrypt secrets and write `.env` (use `-o file`). |
| `vault-env push --project <id>` | Encrypt and upload keys from `.env` (use `-f file`). |

**Master password** (vault encryption, not Firebase): set `VAULT_MASTER_PASSWORD`, or `--master-password`, or enter when prompted.

## Examples

```bash
npx vault-env login --env-file .env.local
npx vault-env projects
npx vault-env pull --project abc123 -o .env.local
npx vault-env push --project abc123 -f .env.local
```

From repo root after `npm run build -w @vaultenv/cli`:

```bash
npm run vault-env -- login
npm run vault-env -- pull --project YOUR_PROJECT_ID -o .env
```

## Security

- `~/.vault-env/credentials.json` stores your **Firebase** password in plain text. Use a dedicated Firebase user or restrict file permissions (`chmod 600` on Unix).
- The **master password** is never written to disk by the CLI unless you export `VAULT_MASTER_PASSWORD` yourself.
