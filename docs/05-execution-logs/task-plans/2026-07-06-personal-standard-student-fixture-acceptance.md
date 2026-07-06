# 2026-07-06 Personal Standard Student Fixture Acceptance Plan

## Task

- Task id: `personal-standard-student-fixture-acceptance-2026-07-06`
- Branch: `codex/personal-standard-student-fixture-acceptance-2026-07-06`
- Goal: close the remaining `personal_standard_student` role-matrix fixture gap from the 0704 local AI generation runtime acceptance.

## Read Gate

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- Latest 2026-07-06 AI generation, learner, organization, and content-admin evidence.

## Scope

- Verify only `personal_standard_student` on current `master` plus local 0704 database.
- Use test-owned private fixture input only in process memory if needed.
- Verify learner UI advanced `AI训练` is unavailable, hidden, denied, or upgrade-guided for standard personal authorization.
- Verify direct personal AI generation POST is rejected before Provider execution.
- Record only role label, route labels, aggregate status, API code, and pass/fail summary.

## Boundaries

- No source/test/schema/migration/seed/package/lockfile change unless a current code defect is reproduced and a separate fix branch is created.
- No Provider call, Provider config read/write, prompt payload, raw AI output, Cost Calibration, staging/prod, deploy, PR, force push, or dependency change.
- No destructive DB operation.
- No evidence of credentials, sessions, cookies, tokens, env values, connection strings, raw DB rows, internal ids, PII, plaintext `redeem_code`, screenshots, traces, raw DOM, Provider payloads, raw prompts, raw AI I/O, full question, paper, material, or chunk content.

## Implementation Strategy

1. Confirm branch and worktree are clean.
2. Start or reuse local localhost service against the 0704 local DB without printing secrets.
3. Locate a current `personal_standard_student` fixture from the approved private acceptance input, using only in-memory values.
4. Browser-walk the learner surface and record whether advanced AI is unavailable/hidden/denied/upgrade-guided.
5. Perform one direct backend denial probe for personal AI generation with the standard personal authorization context; record API code only.
6. If denial fails, stop and create a separate `fix/` branch before any source repair.
7. Write redacted evidence and audit, then run local gates.

## Validation Commands

- `git status --short --branch`
- localhost browser role check for `personal_standard_student`
- redacted direct backend denial probe for `personal_standard_student`
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-06-personal-standard-student-fixture-acceptance.md docs/05-execution-logs/evidence/2026-07-06-personal-standard-student-fixture-acceptance.md docs/05-execution-logs/audits-reviews/2026-07-06-personal-standard-student-fixture-acceptance.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId personal-standard-student-fixture-acceptance-2026-07-06`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId personal-standard-student-fixture-acceptance-2026-07-06 -SkipRemoteAheadCheck`

## Risk Defense

- Treat UI hidden state as insufficient by itself; direct backend denial is mandatory.
- Prefer existing service/route behavior and do not add duplicate authorization logic unless a fresh failure proves it is required.
- Keep any private fixture material out of committed files and shell output.
- If the approved fixture is absent or cannot authenticate against 0704, record a blocked fixture-input result rather than inventing or seeding data.
