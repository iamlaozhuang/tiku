# Task Plan: Advanced Personal AI Generation Result Redacted Detail Read-Model Service

## Task

- Task id: `advanced-personal-ai-generation-result-redacted-detail-read-model-service`
- Branch: `codex/advanced-personal-ai-generation-result-redacted-detail-read-model-service`
- Date: 2026-06-15
- Baseline: `228e0f94d4fd8ccac0a44b6f68b4415cb5836f8f`
- Task kind: local service implementation

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- relevant advanced task queue entries in `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/01-requirements/traceability/capability-catalog.md` advanced personal AI and blocked gate rows

## Approval Boundary

User approved executing `advanced-personal-ai-generation-result-redacted-detail-read-model-service` and closing it out
with local commit, fast-forward merge to `master`, push to `origin/master`, and short-branch cleanup.

Allowed:

- local redacted detail read-model contract/model/validator/service work;
- focused unit coverage using TDD;
- task plan, evidence, audit review, state, and queue metadata.

Blocked:

- route, UI, repository, mapper, schema, migration, drizzle, script, package, or lockfile changes;
- `.env.local`, `.env.*`, secret, provider configuration, database URL, token, cookie, Authorization header, raw prompt,
  raw answer, provider payload, row data, or private data access or output;
- DB access, dev server, Browser, Playwright, provider/model calls, quota/cost measurement, Cost Calibration Gate,
  staging/prod/cloud/deploy, payment, external-service, PR, or force-push;
- formal adoption write or authorization-model changes.

## Implementation Plan

1. Add RED unit tests for a result detail read-model method that:
   - returns one matching result by session-owned `ownerPublicId` and `resultPublicId`;
   - returns `404` when the result is not in the owner-scoped draft result set;
   - rejects invalid input before repository access;
   - returns a standard unavailable envelope without leaking thrown errors.
2. Implement minimal model, contract, validator, and service changes.
3. Keep the service response explicitly marked `runtimeStatus: "local_contract_only"`,
   `redactionStatus: "redacted"`, `contentVisibility: "redacted_snapshot"`, and
   `formalAdoptionWriteStatus: "blocked_without_follow_up_task"`.
4. Verify with focused unit test, lint, typecheck, whitespace diff check, and Module Run v2 gates.

## Risk Defense

- No route is added, so no new external URL surface is introduced.
- No repository method is added; the service depends only on the existing `listDraftResults` boundary.
- No raw generated content, provider payload, raw prompt, raw answer, internal numeric id, row/private data, or formal
  adoption write status is exposed.
- Any future route or UI detail integration must be a separate task with its own approval.
