# Acceptance L6 Owner Preview Readiness Plan

taskId: acceptance-l6-owner-preview-readiness-2026-06-23
status: closed
createdAt: "2026-06-23T00:36:31-07:00"
branch: codex/runtime-blocker-evidence-batch-20260623
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only

## Task Boundary

This task prepares L6 owner preview readiness only. It does not execute actual owner preview walkthrough, staging,
Provider/model calls, Cost Calibration, payment, external-service, schema migration, dependency change, push, PR, force
push, or final acceptance Pass.

Laozhuang remains the only accountable owner. Codex prepares route lists, decision criteria, evidence structure, and
redaction guidance only.

## Standards Read

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-06-23-runtime-blocker-evidence-batch-plan.md`
- `docs/05-execution-logs/evidence/2026-06-22-acceptance-final-decision-review.md`
- `docs/05-execution-logs/evidence/2026-06-23-acceptance-l5-seeded-local-account-run.md`
- `docs/05-execution-logs/audits-reviews/2026-06-23-acceptance-l5-seeded-local-account-run.md`

## Documentation Plan

1. Create an L6 owner preview readiness package with plain-language route groups, expected checks, pass/block rules, and
   evidence redaction requirements.
2. Carry forward the L5 seeded local evidence as prerequisite evidence, without inflating it into staging or final
   acceptance.
3. Define which parts laozhuang can personally judge in a local owner preview and which parts must remain blocked
   behind dedicated-role-account, Provider, Cost Calibration, staging, payment, or release gates.
4. Update `project-state.yaml` and `task-queue.yaml` to close the readiness task and preserve blocked gates.
5. Write evidence and audit review showing that this task produced a readiness package only.

## Expected Output

- `docs/05-execution-logs/acceptance/2026-06-23-l6-owner-preview-readiness-package.md`
- `docs/05-execution-logs/evidence/2026-06-23-acceptance-l6-owner-preview-readiness.md`
- `docs/05-execution-logs/audits-reviews/2026-06-23-acceptance-l6-owner-preview-readiness.md`
- updated `docs/04-agent-system/state/project-state.yaml`
- updated `docs/04-agent-system/state/task-queue.yaml`

## Stop Conditions

Stop if the work requires:

- executing actual owner walkthrough without explicit approval;
- opening or recording `.env*`, secrets, tokens, cookies, database URLs, credentials, raw prompts, raw answers, raw AI
  output, Provider payloads, plaintext `redeem_code`, full `paper`, or full `material`;
- changing source, tests, scripts, schema, migrations, package, lockfile, dependency, or environment files;
- touching staging, prod, cloud, deploy, payment, external services, Provider, Cost Calibration, push, PR, or force push;
- claiming Standard MVP Pass, Advanced MVP Pass, staging ready, release ready, production ready, or final acceptance Pass.

## Validation Commands

- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId acceptance-l6-owner-preview-readiness-2026-06-23`
