# Task Plan: mechanism legacy status evidence diagnostics

## Task

- Task id: `mechanism-legacy-status-evidence-diagnostics`
- Task kind: `mechanism_maintenance`
- Execution profile: `docs_state_lite`
- Evidence mode: redacted local evidence only
- Branch: `codex/mechanism-legacy-status-evidence-diagnostics`

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`

## Scope

Refine the next-action diagnostics for old queue hygiene findings so historical cleanup advisories remain visible but do not look like current actionable blockers. The task covers legacy terminal status, missing historical evidence paths, and known blocked validation status diagnostics.

Allowed files are limited to the next-action script, its smoke test, project-state/task-queue records, and task plan/evidence/audit records.

## TDD Plan

1. Update `Get-TikuNextAction.Smoke.ps1` to expect explicit historical-hygiene diagnostic naming for legacy terminal status, missing historical evidence, and known blocked validation status.
2. Run the smoke and confirm RED failure because current output still uses the older `statusFindings` / `evidenceFindings` labels.
3. Update `Get-TikuNextAction.ps1` output labels and supported status handling with minimal logic changes.
4. Re-run smoke for GREEN.
5. Run local next-action diagnostic, formatting, lint, typecheck, diff check, and pre-commit hardening.

## Risk Controls

- Do not fabricate missing historical evidence.
- Do not read or modify `.env*`.
- Do not touch product code, schema, Drizzle, migrations, package files, lockfiles, dependencies, providers, cloud/deploy/payment/external services, PR, force-push, or Cost Calibration Gate.
- Evidence must stay redacted and must not include secrets, provider/model payloads, row/private data, publicId inventories, raw prompts, or raw answers.
