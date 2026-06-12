# Health Audit Local Baseline Task Plan

## Task

- Task id: `health-audit-local-baseline`
- Branch: `codex/health-audit-local-baseline`
- Task kind: `read_only/docs_only audit`
- Date: 2026-06-12
- Source: user-approved health-check batch plan

## Documents Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Scope

Allowed files:

- `docs/05-execution-logs/task-plans/2026-06-12-health-audit-local-baseline.md`
- `docs/05-execution-logs/evidence/2026-06-12-health-audit-local-baseline.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-health-audit-local-baseline.md`

Blocked files and work:

- No `src/**`, `tests/**`, `e2e/**`, `package.json`, lockfile, `src/db/schema/**`, `drizzle/**`, `.env*`, provider, deploy, payment, external-service, schema, migration, or dependency changes.
- No default full e2e, headed e2e, e2e UI, provider call, env/secret read, staging/prod/cloud action, destructive database operation, or Cost Calibration Gate execution.
- No product code repair in this batch. Follow-up items are recorded as independent candidate tasks only.

## Audit Approach

Use read-only searches and controlled local validation to classify implementation health. Findings must be evidence-backed and prioritized as `P0`, `P1`, `P2`, or `Info`.

Required audit dimensions:

- ADR, standards, and dependency reality alignment.
- API envelope, path, `publicId`, and JSON contract signals.
- `route handlers / server actions -> service -> repository -> model` layering drift.
- Frontend client/server boundary and `@/server/*` import risk.
- Test gate freshness and Playwright stale server risk.
- Encoding, TODO, `any`, `@ts-ignore`, `dangerouslySetInnerHTML`, hardcoded token, and design-token risk signals.
- Local artifact ignore rules, worktree, and Git state health.

## Validation Commands

Required:

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`

Docs formatting:

- `node .\node_modules\prettier\bin\prettier.cjs --write --ignore-unknown docs\05-execution-logs\task-plans\2026-06-12-health-audit-local-baseline.md docs\05-execution-logs\evidence\2026-06-12-health-audit-local-baseline.md docs\05-execution-logs\audits-reviews\2026-06-12-health-audit-local-baseline.md`
- `node .\node_modules\prettier\bin\prettier.cjs --check --ignore-unknown docs\05-execution-logs\task-plans\2026-06-12-health-audit-local-baseline.md docs\05-execution-logs\evidence\2026-06-12-health-audit-local-baseline.md docs\05-execution-logs\audits-reviews\2026-06-12-health-audit-local-baseline.md`

Optional diagnostic:

- `npm.cmd run build`

## Evidence Requirements

Evidence must record:

- Git branch and clean/dirty state.
- Static audit command summaries.
- Validation command status.
- Health findings with file evidence, priority, risk, and follow-up.
- Highest local validation level reached.
- Blocked environment or high-risk work.
- Residual gaps.

Evidence must not record `.env.local` contents, database URLs, secrets, tokens, Authorization headers, provider payloads, raw prompts, raw answers, raw generated AI content, cleartext `redeem_code`, raw DB rows, full paper content, or e2e traces/screenshots.

## Stop Conditions

Stop before continuing if:

- A required validation command fails due a likely product-code regression and cannot be classified as pre-existing or environment/tooling.
- Any useful next step requires product code edits, dependency changes, schema/migration, env/secret, provider, deploy, payment, external-service, full e2e, or Cost Calibration Gate work.
- Git state becomes ambiguous or changed files leave the allowed docs-only set.
