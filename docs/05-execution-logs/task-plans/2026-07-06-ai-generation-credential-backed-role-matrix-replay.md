# 2026-07-06 AI Generation Credential-Backed Role Matrix Replay Plan

## Metadata

- Task id: `ai-generation-credential-backed-role-matrix-replay-2026-07-06`
- Branch: `codex/ai-generation-credential-backed-role-matrix-replay-2026-07-06`
- Parent goal: `ai-generation-recontract-local-repair-goal-2026-07-06`
- Scope: credential-backed localhost browser role matrix replay for current AI出题 / AI组卷 recontract state.

## SSOT Read List

- `AGENTS.md`
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
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/05-execution-logs/evidence/2026-07-06-ai-generation-role-matrix-local-acceptance-recheck.md`
- `docs/05-execution-logs/audits-reviews/2026-07-06-ai-generation-role-matrix-local-acceptance-recheck.md`

## Requirement Mapping Result

This task targets the remaining browser gap from package 6:

- `personal_standard_student`, `org_standard_employee`, and `org_standard_admin` must not reach usable advanced AI generation surfaces.
- `personal_advanced_student` and `org_advanced_employee` must reach learner `AI训练` with AI出题 and AI组卷 entries.
- `org_advanced_admin` must reach organization AI出题 and AI组卷 admin surfaces.
- `content_admin` must reach content AI出题 and AI组卷 admin surfaces.
- The replay must not submit Provider-enabled generation, must not create screenshots/traces, and must not record credentials or DOM/body text.

## Execution Strategy

1. Reuse the currently running `http://127.0.0.1:3000` localhost service.
2. Load the local private role fixture in memory only.
3. Log in each selected role through local session runtime; store only aggregate role login status.
4. Navigate role-specific AI routes and check visible product-state markers without outputting page text.
5. Record only role label, route label, pass/partial/fail category, and sanitized reason code.
6. Stop immediately if a current source defect appears; do not repair inside this replay branch.

## Boundary

- No source or test file changes.
- No dependency, package, lockfile, schema, migration, seed, env/secret, staging/prod, deploy, Provider-enabled, or Cost Calibration work.
- No screenshot, trace, raw DOM, page body dump, credential, session, cookie, token, header, env value, DB URL, raw DB row, internal id, PII, Provider payload, raw prompt, raw AI output, full question, full paper, material, resource, chunk, employee raw answer, or plaintext `redeem_code` in evidence.
- Local login/session activity is allowed only for localhost role replay and evidence remains aggregate.

## Validation Commands

- `node <inline redacted credential-backed role matrix replay>`
- `git diff --check`
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-06-ai-generation-credential-backed-role-matrix-replay.md docs/05-execution-logs/evidence/2026-07-06-ai-generation-credential-backed-role-matrix-replay.md docs/05-execution-logs/audits-reviews/2026-07-06-ai-generation-credential-backed-role-matrix-replay.md`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-credential-backed-role-matrix-replay-2026-07-06`

## Risk Controls

- This replay checks entry/denial and visible surface state only. It does not submit AI generation requests.
- Provider-disabled remains covered by source/unit evidence unless this task observes the browser disabled state without submission.
- Provider-enabled small samples remain blocked without separate bounded approval.
- If the private fixture or localhost service is unavailable, record a blocked result instead of bypassing with invented credentials.
