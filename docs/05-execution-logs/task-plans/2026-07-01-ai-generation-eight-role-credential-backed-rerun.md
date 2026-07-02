# AI Generation Eight Role Credential Backed Rerun Task Plan

## Task

- Task id: `ai-generation-eight-role-credential-backed-rerun-2026-07-01`
- Branch: `codex/ai-generation-eight-role-credential-backed-rerun`
- Scope: rerun exact eight-role localhost owner preview AI 出题 / AI组卷 matrix after UI wording and resource grounding repairs.
- Non-goals: no source/test change, no dependency/package/lockfile change, no schema/migration/seed change, no `.env*` read/write, no database mutation, no e2e automation, no staging/prod/cloud/deploy, no Cost Calibration, no release readiness or final Pass claim.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`

## Matrix

- Roles: `personal_standard_student`, `personal_advanced_student`, `org_standard_employee`, `org_advanced_employee`, `org_standard_admin`, `org_advanced_admin`, `content_admin`, `ops_admin`.
- Workflows: `ai_question_generation`, `ai_paper_generation`.
- Required cross-role checks:
  - resource pack / RAG grounding is required, or generation is blocked when evidence is insufficient;
  - ordinary user/operator UI must not show internal governance, redaction, local contract, local preview, or owner-preview wording;
  - if generated output is visible, it must remain within tobacco marketing, monopoly, or logistics scope at summary level only.

## Execution Plan

1. Restart or confirm local dev server for `http://localhost:3000`.
2. Use the in-app browser only against localhost.
3. For each role, log in locally using credentials only for browser input; do not record, echo, or store any secret or account identifier.
4. Visit the available AI 出题 / AI组卷 surfaces for that role.
5. Record only role label, route/workflow label, pass/fail/blocked/not_applicable status, safe counts, duration bucket, and sanitized observation summary.
6. Do not capture screenshots, raw DOM, HTML dumps, traces, Provider payloads, prompts, raw AI output, full generated question/paper/material/resource/chunk content, cookies, tokens, session, localStorage, Authorization headers, `.env*`, DB rows, internal numeric ids, PII, or complete account identifiers.

## Validation Commands

```powershell
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-01-ai-generation-eight-role-credential-backed-rerun.md docs/05-execution-logs/evidence/2026-07-01-ai-generation-eight-role-credential-backed-rerun.md docs/05-execution-logs/audits-reviews/2026-07-01-ai-generation-eight-role-credential-backed-rerun.md
npm.cmd run typecheck
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-eight-role-credential-backed-rerun-2026-07-01
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-eight-role-credential-backed-rerun-2026-07-01 -SkipRemoteAheadCheck
```

## Evidence Boundary

Evidence records only command names, pass/fail summaries, safe role labels, route/workflow labels, status counts, and duration buckets. It must not include credentials, cookies, tokens, sessions, localStorage values, Authorization headers, `.env*`, database URLs, raw DB rows, internal numeric ids, PII, Provider payloads, prompts, raw AI input/output, complete generated content, screenshots, traces, raw DOM, HTML dumps, or full question/paper/material/resource/chunk content.
