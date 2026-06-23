# Acceptance L5 Browser Runtime Scope Approval Plan

## Task

- taskId: `acceptance-l5-browser-runtime-scope-approval-2026-06-23`
- branch: `codex/runtime-blocker-evidence-batch-20260623`
- taskKind: `acceptance_runtime_approval_package`
- phase: `standard-advanced-mvp-runtime-blocker-evidence-batch-2026-06-23`
- source batch: `standard-advanced-mvp-runtime-blocker-evidence-batch-2026-06-23`

## References Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`
- `docs/05-execution-logs/acceptance/2026-06-23-runtime-blocker-evidence-batch-plan.md`
- `docs/05-execution-logs/evidence/2026-06-23-acceptance-runtime-blocker-evidence-batch-seed.md`

## Goal

Prepare the exact approval package for local L5 role-flow and browser runtime evidence. This task must not start a dev
server, run browser/e2e, perform L5 walkthrough, execute L6 owner preview, or touch Provider, env, database, dependency,
staging, payment, external-service, or Cost Calibration gates.

## Planned Files

- Create:
  - `docs/05-execution-logs/task-plans/2026-06-23-acceptance-l5-browser-runtime-scope-approval.md`
  - `docs/05-execution-logs/acceptance/2026-06-23-l5-browser-runtime-scope-approval-package.md`
  - `docs/05-execution-logs/evidence/2026-06-23-acceptance-l5-browser-runtime-scope-approval.md`
  - `docs/05-execution-logs/audits-reviews/2026-06-23-acceptance-l5-browser-runtime-scope-approval.md`
- Modify:
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`

## Approval Package Shape

The approval package must define:

- exact local target URL policy;
- whether Codex may start the local dev server in a later task;
- whether Codex may use the in-app browser or Playwright in a later task;
- whether safe existing Playwright smoke specs may run;
- role labels and account labels;
- route or surface matrix;
- evidence and redaction rules;
- defect severity and stop conditions;
- explicit blocked gates that remain outside the approval.

## Validation Commands

```powershell
npx.cmd prettier --write --ignore-unknown docs/05-execution-logs/task-plans/2026-06-23-acceptance-l5-browser-runtime-scope-approval.md docs/05-execution-logs/acceptance/2026-06-23-l5-browser-runtime-scope-approval-package.md docs/05-execution-logs/evidence/2026-06-23-acceptance-l5-browser-runtime-scope-approval.md docs/05-execution-logs/audits-reviews/2026-06-23-acceptance-l5-browser-runtime-scope-approval.md docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml
npx.cmd prettier --check --ignore-unknown docs/05-execution-logs/task-plans/2026-06-23-acceptance-l5-browser-runtime-scope-approval.md docs/05-execution-logs/acceptance/2026-06-23-l5-browser-runtime-scope-approval-package.md docs/05-execution-logs/evidence/2026-06-23-acceptance-l5-browser-runtime-scope-approval.md docs/05-execution-logs/audits-reviews/2026-06-23-acceptance-l5-browser-runtime-scope-approval.md docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml
git diff --check
powershell -ExecutionPolicy Bypass -File scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1 -TaskId acceptance-l5-browser-runtime-scope-approval-2026-06-23
```

## Stop Conditions

- The package would require reading `.env*`, credentials, secrets, token values, or database URLs.
- The package would authorize Provider, Cost Calibration, staging, payment, external-service, dependency, schema,
  migration, seed, database, deploy, PR, or force-push execution.
- The package would allow evidence to record raw prompts, raw AI output, Provider payloads, full paper/material content,
  raw employee answers, plaintext `redeem_code`, private data, screenshots with sensitive values, traces, or HTML
  reports.
- The task tries to run browser, dev server, e2e, or L5 role flow instead of preparing the approval package.
