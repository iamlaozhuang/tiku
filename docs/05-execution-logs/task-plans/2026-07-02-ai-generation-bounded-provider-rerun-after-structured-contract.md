# AI Generation Bounded Provider Rerun After Structured Contract Plan

## Task Boundary

- Task id: `ai-generation-bounded-provider-rerun-after-structured-contract-2026-07-02`
- Branch: `codex/ai-generation-bounded-provider-rerun-after-structured-contract`
- Parent goal: AI出题 / AI组卷 shared structured contract acceptance goal.
- Scope: bounded local owner-preview Qwen Provider rerun after deterministic gates.
- Allowed files:
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
  - `docs/05-execution-logs/task-plans/2026-07-02-ai-generation-bounded-provider-rerun-after-structured-contract.md`
  - `docs/05-execution-logs/evidence/2026-07-02-ai-generation-bounded-provider-rerun-after-structured-contract.md`
  - `docs/05-execution-logs/audits-reviews/2026-07-02-ai-generation-bounded-provider-rerun-after-structured-contract.md`
- Blocked: source/test edits, dependency/package/lockfile changes, schema/migration/seed, direct DB mutation, `.env*` read or write by the agent, staging/prod/cloud/deploy, PR, force push, release readiness, final Pass, and Cost Calibration.

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
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-deterministic-acceptance-matrix-rollup.md`
- `docs/05-execution-logs/audits-reviews/2026-07-02-ai-generation-deterministic-acceptance-matrix-rollup.md`
- `docs/05-execution-logs/evidence/2026-07-02-marketing-monopoly-logistics-provider-rerun.md`
- `docs/05-execution-logs/evidence/2026-07-02-monopoly-scanned-pdf-ocr-runtime-rag-coverage.md`
- Local route and runtime control files were read only to identify the existing execution path and built-in Provider limits.

## First-Principles Diagnosis

The deterministic fixes prove that shared task specs, instruction wording, parser count extraction, route contracts, and UI surfaces agree on a single structured contract. They do not prove that a live Provider follows it. This task is therefore a runtime acceptance task, not another repair task: submit one bounded content-admin sample for each profession and each function, with zero retries, and accept only structured summaries that satisfy the same count contract.

## Execution Steps

1. Confirm the deterministic rollup task is closed and passing before any Provider attempt.
2. Use the existing local acceptance session and `/api/v1/content-ai-generation-requests` route.
3. Submit six content-admin samples: three professions times AI出题 and AI组卷.
4. Stop after the first attempt for each profession/function; do not retry failed or timed-out samples.
5. Record only role label, route/function, profession, subject, status category, duration bucket, structured preview count, and failure category.
6. Run existing focused tests, lint, typecheck, scoped Prettier, `git diff --check`, and Module Run v2 pre-commit/pre-push gates.

## Acceptance Standards

- Task 6 deterministic rollup is closed with passing evidence before Provider execution.
- Provider submit attempts are bounded to six total, one content-admin sample per profession/function.
- Provider retries are zero.
- Successful AI出题 samples expose parsed `question_set` count matching the requested count.
- Successful AI组卷 samples expose parsed `paper_draft` question count matching the requested count.
- Evidence contains no credentials, cookies, tokens, sessions, localStorage, Authorization headers, `.env*` values, DB raw rows, internal ids, PII, Provider payloads, prompts, raw AI input/output, or full generated/resource/question/paper/material/chunk content.
- No release readiness, final Pass, production usability, staging/prod, deploy, or Cost Calibration claim is made.

## Risk Controls

- The runtime Provider control already limits Qwen execution to `maxRequests=1`, `maxRetries=0`, `maxOutputTokens=1800`, and `timeoutMs=60000`.
- The local HTTP runner must print only sanitized aggregate summaries.
- If a sample fails, record the safe failure category and stop; do not patch source in this task.
