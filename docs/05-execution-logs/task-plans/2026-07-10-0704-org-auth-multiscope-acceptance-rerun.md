# 2026-07-10 0704 Org Auth Multiscope Acceptance Rerun Plan

## Task

- taskId: `0704-org-auth-multiscope-acceptance-rerun-2026-07-10`
- branch: `codex/0704-org-auth-multiscope-acceptance-rerun`
- mode: validation-only rerun after priority repair

## Required Reading

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- prior org_auth multiscope acceptance evidence/audit
- org_auth multiscope UI fix evidence/audit
- private 0704 credential index metadata only

## Scope

- Verify the repaired enterprise authorization UI/API contract now satisfies the prior blocked acceptance standard.
- No product source changes unless a new real defect is found.
- No package/lockfile, schema, migration, seed, provider, browser screenshot, raw DOM, direct DB, staging, prod, deploy, env, secret, or Cost Calibration action.
- Evidence must stay redacted.

## Validation

- Targeted tests for org_auth validator/service/route/runtime/UI contract.
- Static source inspection of the repaired UI submit payload, validator expansion, per-atom overlap checks, and response contract.
- `lint`, `typecheck`, `git diff --check`, and Module Run v2 gates.

## Stop Conditions

- Stop and open a new repair task if multi-profession or multi-level package submission fails.
- Stop if sensitive values would be required for evidence.
- Stop if product runtime would require credential/session output.
