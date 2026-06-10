# Batch 104 Authorization And Access Redeem Code Audit Log And Ai Call Log Redact Plan

**Task id:** `batch-104-authorization-and-access-redeem-code-audit-log-and-ai-call-log-redact`

**Task kind:** `implementation`

**Branch:** `(detached HEAD)`

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- Relevant Module Run v2 SOPs under `docs/04-agent-system/sop/`
- Latest Batch 103 task plan, evidence, and audit review

## Scope

Implement or verify a low-risk local redacted reference surface for `redeem_code`, `audit_log`, and `ai_call_log` references inside the authorization-and-access Module Run.

Allowed surfaces:

- `src/server/models/**`
- `src/server/contracts/**`
- `src/server/validators/**`
- `src/server/services/**`
- task plan, evidence, audit, and automation state files

Blocked surfaces remain env/secret files, package/lockfiles, database schema, migrations, provider calls, deploy, PR, force push, destructive DB work, dependency changes, and Cost Calibration Gate.

## Implementation Approach

1. Inspect existing `redeem_code`, `audit_log`, and `ai_call_log` local reference helpers and tests.
2. Preserve the pure local boundary: no repository calls, DB reads, provider calls, or real authorization permission changes.
3. Ensure outward-facing contracts use camelCase and expose only public ids, nullable safe metadata, and explicit redaction status.
4. Add or update focused unit coverage only under allowed server surfaces.
5. Use `D:\tiku\node_modules\.bin` for validation if this automation worktree lacks local `node_modules`; do not install dependencies.
6. Write redacted evidence and audit review before any completion claim.

## Risk Defenses

- Do not expose plaintext `redeem_code`, code hashes, raw `paper` content, raw answer text, provider payloads, Authorization headers, database URLs, DB rows, secrets, tokens, or auto-increment ids.
- Use glossary terms exactly: `authorization`, `redeem_code`, `audit_log`, `ai_call_log`, `personal_auth`, and `org_auth`.
- Treat this task as local reference and redaction behavior only, not a real permission model or authorization policy change.
- Keep high-risk capability gates blocked.

## Validation Plan

- `Test-ModuleRunV2ImplementationAutoSeedReadiness` for the batch candidate.
- Focused unit tests for changed local service/validator/model files.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `git diff --check`.
- `Test-ModuleRunV2ModuleCloseoutReadiness` only after evidence/audit and focused validation are present.

## Stop Conditions

Stop if the task requires schema/migration changes, dependency/package/lockfile edits, env/secret access, real provider calls, real DB mutation, e2e, deploy, payment, PR, force push, closeout commit, or Cost Calibration Gate execution.
