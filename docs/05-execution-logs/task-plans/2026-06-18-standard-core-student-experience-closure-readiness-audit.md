# standard-core-student-experience-closure-readiness-audit Plan

## Task

- Task id: `standard-core-student-experience-closure-readiness-audit`
- Branch: `codex/mechanism-throughput-readiness-tuning`
- Started at: `2026-06-18T11:13:00-07:00`
- Goal: audit whether the five standard core student use cases can move from `local_experience_ready` to
  `experience_closed` based on the fresh passing local full-flow evidence.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`

## Inputs

- Fresh local full-flow evidence:
  `docs/05-execution-logs/evidence/2026-06-18-standard-core-student-local-full-flow-content-admin-heading-contract-repair.md`
- Coverage matrix rows:
  - `UC-STD-ACCOUNT-SESSION`
  - `UC-STD-PERSONAL-AUTH-REDEEM`
  - `UC-STD-PRACTICE`
  - `UC-STD-MOCK-EXAM`
  - `UC-STD-REPORT-MISTAKE-BOOK`

## Audit Plan

1. Confirm the fresh repair evidence has passing focused unit, e2e list, targeted local e2e, lint, typecheck, and Module
   Run v2 gates.
2. Confirm the coverage matrix rows are the five standard student core rows and no release/staging/provider claim is
   implied.
3. If evidence is sufficient, mark the five rows `experience_closed` for local experience only.
4. Record evidence and audit review, then run docs/state gates for this audit task.

## Validation Plan

- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/05-execution-logs/task-plans/2026-06-18-standard-core-student-experience-closure-readiness-audit.md docs/05-execution-logs/evidence/2026-06-18-standard-core-student-experience-closure-readiness-audit.md docs/05-execution-logs/audits-reviews/2026-06-18-standard-core-student-experience-closure-readiness-audit.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId standard-core-student-experience-closure-readiness-audit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId standard-core-student-experience-closure-readiness-audit`

## Blocked Work

- No source edits, `.env*`, package/lockfile/dependency, schema/drizzle/migration, provider/model, staging/prod/cloud/
  deploy/payment/external-service, destructive DB, e2e spec edits, PR, force-push, merge, push, branch cleanup, or Cost
  Calibration Gate.
