# 2026-07-04 Stage C-1 Secret Availability Decision Audit

## Scope

Adversarial review of the secret availability decision package. This checks whether the proposed path avoids secret
leakage, avoids hidden `.env*` reads, avoids persistent local state without approval, and avoids expanding into Provider,
staging, DB, or Cost Calibration execution.

## Findings

No blocking finding in the prepared decision package.

## Boundary Checks

| Check                                                                                                       | Result |
| ----------------------------------------------------------------------------------------------------------- | ------ |
| Decision package does not read or record `ALIBABA_API_KEY` value                                            | pass   |
| `.env*` files remain rejected as a source for this path                                                     | pass   |
| Secret-in-chat and secret-in-docs paths are rejected                                                        | pass   |
| Parent-process/session injection is selected over repository files or DB/config writes                      | pass   |
| Persistent User/Machine env writes are deferred pending separate approval and cleanup plan                  | pass   |
| Provider smoke rerun remains blocked until fresh approval after owner-side injection                        | pass   |
| DB, browser/e2e/dev server, staging/prod/cloud/deploy, and Cost Calibration remain out of scope             | pass   |
| Product source, tests, package files, lockfiles, schema, migrations, scripts, and dependencies stay blocked | pass   |
| Release readiness, final Pass, Provider readiness, model quality, and production usability are not claimed  | pass   |

## Adversarial Notes

- A child PowerShell process can set `$env:ALIBABA_API_KEY` only for itself and its children. It cannot reliably update an
  already-running parent Codex process for future tool calls.
- A persistent User/Machine environment variable would avoid `.env*` but creates durable local state; that needs separate
  approval and cleanup/rotation evidence.
- Asking the user to paste the secret into chat would satisfy process availability poorly and create a durable secret
  record. It remains rejected.
- Using DB/admin config or staging to provide the secret would mix Stage C gates and should stay separate.

## Recommendation

Use owner-side parent-process/session injection, then rerun the same one-call Stage C-1 Provider smoke under fresh
approval. If the current Codex process cannot inherit the variable, restart Codex from the prepared local environment
instead of adding repository files or persistent local secrets.
