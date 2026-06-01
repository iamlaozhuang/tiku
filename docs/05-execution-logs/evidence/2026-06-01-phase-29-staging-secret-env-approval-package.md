# Phase 29 Staging Secret Env Approval Package Evidence

## Summary

- Result: pass.
- Scope: docs_only secret/env approval package.
- Changed surfaces: evidence only.
- Gates: variable classes, owner, storage location, rotation, rollback, and redaction rules documented; `.env*` files were not read or modified.
- Forbidden scope (`forbiddenScope`): no `.env.local` read/change, no `.env.example` change, no secret creation/rotation, no staging/prod config, no provider key handling, no deployment.
- Residual gaps (`residualGaps`): actual values and secret storage require explicit human approval before Phase 30.

## Secret Env Approval Matrix

| Variable or class                                                     | Purpose                                                            | Future owner                  | Future storage location class                                     | Rotation trigger                                    | Rollback plan                                                              | Evidence redaction                                                            |
| --------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------- | ----------------------------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `APP_ENV`                                                             | Runtime environment discriminator; staging value must be `staging` | Deployment owner              | Staging runtime env manager                                       | Environment recreation or release boundary change   | Revert runtime env to last approved staging value                          | Record value class only; `staging` is safe                                    |
| `APP_BASE_URL`                                                        | Staging web base URL and auth redirect base                        | Domain/deployment owner       | Staging runtime env manager                                       | Domain/TLS/callback change                          | Revert to previous approved staging URL                                    | Record hostname class only unless URL is public and approved                  |
| `DATABASE_URL`                                                        | Staging database connection for app and migrations                 | DB owner                      | Secret manager or runtime secret store                            | Credential rotation, suspected leak, DB replacement | Restore previous credential only through secret manager; never paste value | Never record full value, user, password, host, or query string                |
| `BETTER_AUTH_SECRET`                                                  | Staging-only auth/session signing secret                           | Security owner                | Secret manager or runtime secret store                            | Scheduled rotation or suspected leak                | Force session invalidation if rotated; document owner decision             | Never record value, hash, token, or derived material                          |
| `OBJECT_STORAGE_BUCKET`                                               | Object storage bucket name or approved bucket alias                | Storage owner                 | Runtime env manager if non-secret; secret store if access-coupled | Bucket change                                       | Revert to previous staging bucket/prefix                                   | Record bucket class or redacted name only until approved                      |
| `OBJECT_STORAGE_PREFIX`                                               | Staging path prefix                                                | Storage owner                 | Runtime env manager                                               | Prefix policy change                                | Revert to previous `staging/` prefix                                       | `staging/` prefix is safe; no object keys with private content                |
| Object storage access key class                                       | App write/read access to staging object storage                    | Security/storage owner        | Secret manager or runtime secret store                            | Key rotation, owner change, suspected leak          | Disable new key and restore previous approved key if safe                  | Never record key id, key secret, token, signed URL, or headers                |
| `AI_PROVIDER_ENABLED`                                                 | Feature flag for real provider use                                 | Product/AI owner              | Runtime env manager                                               | Provider decision change                            | Set to disabled/default false                                              | Record boolean decision only                                                  |
| AI provider key classes such as `ALIBABA_API_KEY` or `OPENAI_API_KEY` | Real provider access if later approved                             | AI/security owner             | Secret manager only                                               | Scheduled rotation, quota incident, suspected leak  | Disable provider flag and rotate key; keep mock fallback                   | Never record key, provider payload, prompt, answer, model response, or header |
| `WECHAT_MINI_PROGRAM_APP_ID`                                          | Future mini program staging integration                            | Mini program owner            | Runtime env manager if non-secret                                 | App registration change                             | Revert to previous approved app id                                         | Record only after mini program staging task approves it                       |
| `WECHAT_MINI_PROGRAM_API_BASE_URL`                                    | Future mini program staging API target                             | Mini program/deployment owner | Runtime env manager                                               | API target change                                   | Revert to previous approved staging API base URL                           | Record hostname class only until approved                                     |

## Approval Inputs Required Before Secret Handling

- Target environment must be `staging`; `prod` remains separate.
- Named owner for each variable class.
- Storage decision: runtime env manager versus secret manager.
- Rotation trigger and rollback owner.
- Kill-switch owner for AI provider enablement.
- Evidence redaction approver.
- Confirmation that `.env.local` and `.env.example` handling is explicitly approved if those files ever become in-scope.

## Blocked Actions

- Do not read `.env.local`.
- Do not modify `.env.local` or `.env.example`.
- Do not create, rotate, paste, print, commit, or record any secret.
- Do not configure staging/prod runtime variables.
- Do not enable AI provider quota or call a real provider.

## Phase 30 Entry Condition

`phase-30-staging-dry-run-after-approval` can touch staging secret/env only after explicit human approval records the variable classes, owners, storage locations, rotation/rollback plan, and redaction rules above. Without that approval, Phase 30 must remain docs-only or stop at a blocked gate.
