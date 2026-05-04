# vault-env CLI

Sync encrypted secrets between [Vault.env](https://github.com) (Firebase) and local `.env` files.

## From the website (easiest)

On a project’s **Secrets** tab, open **Use these secrets on your computer**. You can:

1. **Download** `vault-env.cli.env` - a small connection file for the CLI (no manual setup).
2. **Copy** ready-made commands for login, pull, and push - **this project** is already filled in.

Put the downloaded file in your app folder, install the CLI from npm (see below), then paste the commands into your terminal.

## Install (users - no repo clone)

You need [Node.js](https://nodejs.org/) 18+.

```bash
npm install -g @vaultenv/cli
```

Then the `vault-env` command is on your `PATH`. Alternatively run commands with `npx @vaultenv/cli` without a global install.

## Local development (maintainers)

From the monorepo root:

```bash
npm install
npm run build -w @vaultenv/crypto
npm run build -w @vaultenv/cli
npm run vault-env -- login --env-file .env.local
```

Publish both packages to npm (crypto first; `workspace:*` is rewritten on publish):

```bash
npm run publish:packages
```

Requires an npm account with access to the `@vaultenv` scope.

## Zero setup (vault-env.com)

For the hosted **vault-env.com** service, **no connection file is required**. Install **`@vaultenv/cli@0.1.2`** or newer and run `vault-env login` - the public Firebase client config is built in.

If you sign in to the website with Google, add a CLI password from **Profile** first. The CLI
currently uses Firebase email/password auth, not Google browser sign-in.

## Connection file (self-hosted)

If you run your own Vault.env deployment, put **`vault-env.cli.env`** in your project folder, or use `--env-file`. The CLI loads `vault-env.cli.env`, `vault-env.firebase.env`, or `.env.local` when present (optional overrides before applying defaults).

## Commands

| Command | Description |
|---------|-------------|
| `vault-env login` | Save Vault.env account email/password, or the CLI password you added for a Google account, under `~/.vault-env/credentials.json` (plain text; restrict permissions). |
| `vault-env logout` | Remove saved credentials. |
| `vault-env whoami` | Print Firebase uid and email. |
| `vault-env projects` | List project ids and names. |
| `vault-env pull --project <id>` | Decrypt secrets and write `.env` (use `-o file`). |
| `vault-env push --project <id>` | Encrypt and upload keys from `.env` (use `-f file`). |

**Master password** (vault encryption, not Firebase): set `VAULT_MASTER_PASSWORD`, or `--master-password`, or enter when prompted.

## Examples

With `vault-env.cli.env` in the current directory:

```bash
npx @vaultenv/cli login
npx @vaultenv/cli projects
npx @vaultenv/cli pull --project YOUR_PROJECT_ID -o .env
npx @vaultenv/cli push --project YOUR_PROJECT_ID -f .env
```

After `npm install -g @vaultenv/cli`, use `vault-env` instead of `npx @vaultenv/cli`.

## Security

- `~/.vault-env/credentials.json` stores your **Firebase** password in plain text. Use a dedicated Firebase user or restrict file permissions (`chmod 600` on Unix).
- The **master password** is never written to disk by the CLI unless you export `VAULT_MASTER_PASSWORD` yourself.
