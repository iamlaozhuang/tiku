# Edition-aware authorization e2e spec authoring packet

## Scope

- Task id: `edition-aware-authorization-e2e-spec-authoring-packet`
- Branch: `codex/edition-auth-e2e-spec-authoring-packet`
- Fresh approval: current user prompt on 2026-06-21 approves adding `e2e/edition-aware-authorization-local-flow.spec.ts`, then returning to `edition-aware-authorization-local-e2e-acceptance-packet`.
- This packet is limited to one local Playwright spec plus docs/state/evidence/audit updates.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- Existing local Playwright specs under `e2e/`
- Edition-aware authorization source, contract, service, UI tests, and acceptance task metadata

## Allowed Files

- `e2e/edition-aware-authorization-local-flow.spec.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

## Blocked Files And Gates

- No `.env*`, package or lockfile changes.
- No `src/**`, `drizzle/**`, schema/migration, scripts, dependency, provider/model call, payment, deploy, PR, force-push, destructive DB, DB migration apply, headed/debug browser, or Cost Calibration Gate.
- Evidence must not contain raw employee answer text, full paper content, raw prompt, raw generated AI content, provider payload, internal DB row, plaintext `redeem_code`, secret, token, database URL, or Authorization header.

## Implementation Plan

1. Materialize the authoring task and plan before writing the e2e spec.
2. Run pre-edit work readiness for the planned spec and docs/state files.
3. Add a local Playwright contract spec that uses `localhost` app pages and route-fulfilled standard API envelopes to cover personal and organization standard/advanced/upgrade/boundary display without DB writes.
4. Keep the spec redaction-safe: assert sensitive markers are absent and attach only redacted metadata summaries.
5. Run `npm.cmd run test:e2e -- --list`, targeted spec, lint, typecheck, `git diff --check`, hardening, closeout readiness, and pre-push readiness.
6. Commit, FF merge to `master`, push `origin/master`, delete merged short branch, run stage-end status commands, then start the acceptance packet from latest `master`.

## Risk Controls

- Route fulfillment in this packet proves browser/UI contract handling, not DB-backed persistence or staging/prod readiness.
- The later local e2e acceptance packet must explicitly record any residual persistence/runtime gaps.
- Cost Calibration Gate remains blocked.
