# Task Plan: Advanced Personal AI Generation Result Redacted Detail Readonly Route

## Task

- Task id: `advanced-personal-ai-generation-result-redacted-detail-readonly-route`
- Branch: `codex/advanced-personal-ai-generation-result-redacted-detail-readonly-route`
- Date: 2026-06-15
- Baseline: `334b8835a2ca1dcf457ba0fe3fed915476108eb4`
- Task kind: local route implementation

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- relevant advanced task queue entries in `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/01-requirements/traceability/capability-catalog.md` advanced personal AI and blocked gate rows

## Approval Boundary

User approved executing `advanced-personal-ai-generation-result-redacted-detail-readonly-route` and closing it out with
local commit, fast-forward merge to `master`, push to `origin/master`, and short-branch cleanup.

Allowed:

- thin readonly detail REST route over the approved redacted detail read-model service;
- focused unit coverage using TDD with injected repository and user resolver;
- task plan, evidence, audit review, state, and queue metadata.

Blocked:

- UI, repository, mapper, schema, migration, drizzle, script, package, or lockfile changes;
- `.env.local`, `.env.*`, secret, provider configuration, database URL, token, cookie, Authorization header, raw prompt,
  raw answer, provider payload, row data, or private data access or output;
- DB access, dev server, Browser, Playwright, provider/model calls, quota/cost measurement, Cost Calibration Gate,
  staging/prod/cloud/deploy, payment, external-service, PR, or force-push;
- formal adoption write or authorization-model changes.

## Implementation Plan

1. Add RED unit tests for a result detail route handler that:
   - resolves owner identity from session-owned user context;
   - passes route `publicId` as `resultPublicId` and ignores client-supplied owner/query identifiers;
   - returns the service redacted detail envelope;
   - returns the standard unauthorized envelope for missing/non-personal sessions;
   - returns a standard error envelope without leaking repository errors.
2. Implement minimal route service changes and a dynamic API route export.
3. Keep route logic thin: transport input and session owner resolution only; business rules remain in the existing
   redacted detail read-model service.
4. Verify with focused unit test, lint, typecheck, whitespace diff check, and Module Run v2 gates.

## Risk Defense

- No repository method is added and no mapper is changed.
- Unit tests use injected dependencies and never access the real database.
- The API route exports GET only for `/api/v1/personal-ai-generation-results/{publicId}`.
- The response remains redacted and local-contract-only; formal adoption write remains blocked.
- Any UI detail page or direct detail repository lookup must be a separate approved task.
