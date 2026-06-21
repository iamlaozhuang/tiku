# Edition-aware authorization local e2e acceptance packet

## Scope

- Task id: `edition-aware-authorization-local-e2e-acceptance-packet`
- Branch: `codex/edition-auth-local-e2e-acceptance-packet`
- Fresh approval: current user prompt on 2026-06-21 approves returning to the local e2e acceptance packet after the dedicated spec authoring packet.
- This packet validates the existing allowlisted local Playwright spec and records redacted evidence/audit/state only unless a validation failure requires an authorized minimal spec fix.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/05-execution-logs/task-plans/2026-06-21-edition-aware-authorization-e2e-spec-authoring-packet.md`
- `e2e/edition-aware-authorization-local-flow.spec.ts`

## Allowed Files

- `e2e/edition-aware-authorization-local-flow.spec.ts`
- `tests/unit/playwright-config-baseline.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

## Blocked Files And Gates

- No `.env*`, package or lockfile changes.
- No schema/migration, source implementation, scripts, dependency, provider/model call, payment, deploy, PR, force-push, destructive DB, DB migration apply, headed/debug browser, additional e2e spec, or Cost Calibration Gate.
- Evidence must record only commands, results, role/use-case summaries, and redacted metadata.
- Do not record raw employee answer text, full paper content, raw prompt, raw generated AI content, provider payload, internal DB row, plaintext `redeem_code`, database URL, secret, session credential, or Authorization header value.

## Validation Plan

1. Confirm localhost-only localFullFlowGate and record the WorkReadiness script result.
2. Run `npm.cmd run test:e2e -- --list` to verify the allowlisted spec is discoverable.
3. Run `npm.cmd run test:e2e -- e2e/edition-aware-authorization-local-flow.spec.ts`.
4. Run `npm.cmd run lint`, `npm.cmd run typecheck`, and `git diff --check`.
5. Run pre-commit hardening, module closeout readiness, and pre-push readiness.
6. Commit, FF merge to `master`, push `origin/master`, delete the merged short branch, and run the stage-end status commands.

## Acceptance Boundary

- Personal standard, personal advanced, and personal standard-to-advanced upgrade are validated through the local browser flow using route-fulfilled standard envelopes.
- Organization standard, organization advanced, and organization standard-to-advanced upgrade are validated through the local browser flow using route-fulfilled standard envelopes.
- Expired, revoked, duplicate upgrade, scope mismatch, and quota insufficiency boundaries are validated as visible UI rows or safe standard error envelopes.
- This remains local contract/browser acceptance; DB-backed persistence acceptance stays blocked because this packet does not apply migrations or write local DB data.
