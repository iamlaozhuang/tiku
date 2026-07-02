# AI Generation Bounded Provider Rerun After Question Structure Repair Plan

## Task Boundary

- Task id: `ai-generation-bounded-provider-rerun-after-question-structure-repair-2026-07-02`
- Branch: `codex/ai-generation-bounded-provider-rerun-after-question-structure-repair`
- Scope: bounded local content-admin Provider rerun for previously failed AI出题 samples only.
- Included samples: `monopoly` / `skill` / AI出题 and `logistics` / `theory` / AI出题.
- Blocked: source/test code edits, AI组卷 repair, browser UI changes, direct DB query or mutation by agent, dependency/package/lockfile changes, schema/migration/seed, staging/prod/cloud/deploy, PR, force push, release readiness, final Pass, and Cost Calibration.
- Provider limit: at most 2 Provider submit attempts, 0 retries.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-bounded-provider-rerun-after-structured-contract.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-ai-question-provider-structured-output-robustness.md`
- `docs/05-execution-logs/audits-reviews/2026-07-02-ai-generation-ai-question-provider-structured-output-robustness.md`

## Requirement Mapping

- `UC-ADV-CONTENT-ADMIN-AI-GENERATION`: content admins must receive reviewable structured AI出题 drafts when grounding is sufficient.
- Admin ops AI draft/review boundary remains unchanged: generated drafts are review artifacts and are not directly adopted into formal `question` content.
- Personal/employee/org AI出题 flows share the same structured parser, but this task only validates the content-admin local Provider slice that previously failed.
- Boundary: no AI组卷 repair or full release readiness claim is included in this task.

## Execution Steps

1. Confirm localhost availability and create a local `content_admin` acceptance session without recording credential or cookie values.
2. POST two bounded content AI出题 requests through `/api/v1/content-ai-generation-requests`.
3. Record only role label, route/function, profession, subject, attempt count, retry count, outcome category, duration bucket, structured preview count, and failure category.
4. If either sample fails, stop and record the safe failure category; do not retry or expand scope.
5. Run focused deterministic tests, lint, typecheck, scoped Prettier, diff check, and Module Run v2 gates.

## Acceptance Standards

- Provider submit attempts are `2` or fewer and Provider retries are `0`.
- `monopoly` / `skill` / AI出题 returns a visible, acceptable structured preview with question_set `10/10`.
- `logistics` / `theory` / AI出题 returns a visible, acceptable structured preview with question_set `10/10`.
- No raw Provider payload, prompt, AI output, generated question, generated paper, material, resource, chunk, credential, cookie, token, session, Authorization header, localStorage, `.env*` value, raw DB row, internal id, or PII is recorded.
- No source/test code, dependency, schema, migration, seed, staging/prod/cloud/deploy, AI组卷 repair, release readiness, final Pass, or Cost Calibration action is executed.
