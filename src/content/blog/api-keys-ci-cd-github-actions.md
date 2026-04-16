# API keys in CI/CD: GitHub Actions, secrets, and env files

**Last updated: April 2026**

Continuous integration runs your tests and builds on someone else’s computers. That means **API keys** and **environment variables** need a pipeline-specific story: not checked into YAML, not echoed in logs, and not the same **`.env` file** you use on your laptop without thinking.

---

## Why CI is a high-risk place for API keys

Build logs are searchable. A mistaken `echo $API_KEY` or printing `process.env` in a failing test can exfiltrate **environment variables** into artifacts everyone on the team can read. **Env protection** in CI means:

- **Secrets** stored in the platform’s secret store (e.g. GitHub **Secrets** and **Environments**)  
- Scoped access per branch or environment  
- Minimal permissions on cloud **API keys** (narrow IAM, scoped tokens)  

---

## GitHub Actions: repository secrets vs environments

**Repository secrets** are available to workflows you allow; **environment** secrets add protection rules (required reviewers, branch filters). Use environments for production deploy steps so production **API keys** are harder to trigger accidentally.

Inject secrets into the job as **environment variables** - never hard-code them in workflow files. Reference names only: `${{ secrets.MY_TOKEN }}`.

---

## `.env` files in CI: usually avoid

Many teams generate a temporary **env file** during the job from secrets. That can work if:

- The file is created in a workspace that is not cached or uploaded as an artifact  
- No step prints the file or runs `cat .env` for debugging  

Prefer passing **environment variables** directly to the process when possible so there is no file on disk to leak.

---

## OIDC and short-lived credentials

For AWS and similar clouds, **OIDC federation** from GitHub Actions can replace long-lived **API keys** in CI entirely. Fewer static secrets means fewer rotation fires - worth the setup time for teams shipping often.

---

## Checklist: API keys in pipelines

1. No plaintext keys in repo or workflow YAML.  
2. Separate secrets for preview vs production.  
3. Log redaction enabled where your CI provider supports it.  
4. Rotate any key that ever appeared in a log or public build.  

---

## Vault.env and automation

Some teams keep human-facing **API keys** in an encrypted vault and sync only what CI needs through approved paths. **Vault.env** focuses on developer machines and encrypted projects; pair it with your platform’s native **secrets** story for CI so nothing sensitive lives only in chat.

---

## Related reading

- [Never commit your `.env`](/blog/never-commit-env-git-api-keys)  
- [Zero-knowledge secrets explained](/blog/zero-knowledge-secrets-explained)  
- [Try Vault.env](/)
