# 2026-07-04 Full-chain Scenario 2 Admin-flow Cookie Session Auth Repair Plan

## Task

- Task id: `full-chain-scenario-2-admin-flow-cookie-session-auth-repair-2026-07-04`
- Branch: `codex/full-chain-scenario-2-admin-flow-cookie-session-auth-repair-2026-07-04`
- Kind: `minimal_source_test_repair`
- Approval boundary: `current_user_approved_full_chain_centralized_local_continuity_authorization_2026_07_04`

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-centralized-approval-and-continuity-addendum.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-2-content-baseline-rerun-after-knowledge-baseline-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-2-content-baseline-rerun-after-knowledge-baseline-provisioning.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-06-21-paper-question-count-and-type-policy.md`
- `src/server/auth/session-cookie.ts`
- `src/features/admin/content-admin-runtime.tsx`
- `src/server/services/admin-flow-runtime.ts`
- `src/server/services/paper-composition-lifecycle-runtime.ts`
- `src/server/repositories/admin-flow-runtime-repository.ts`
- `src/server/contracts/admin-content-knowledge-ops-contract.ts`
- `src/server/contracts/api-response.ts`
- `src/server/contracts/auth-contract.ts`
- `src/server/services/session-service.ts`
- `src/server/auth/session-route.test.ts`
- `C:/Users/jzzhu/.codex/plugins/cache/openai-curated-remote/superpowers/5.1.4/skills/systematic-debugging/SKILL.md`

## Root Cause

Scenario 2 showed that the `content_admin` paper collection route returns `401001` when the browser session is
cookie-backed and no explicit client bearer header is present. The failing route uses `admin-flow-runtime`, whose
authorization helper returns `null` before calling the shared request authorization resolver when the authorization
header is absent. The shared resolver already supports cookie-backed sessions and is used by the session and paper
lifecycle runtimes.

This is an implementation inconsistency, not an expected product boundary. No role permission should be weakened:
requests without any valid session material must still return the existing admin-session-required response.

## Implementation Plan

1. Add focused regression coverage in `src/server/services/admin-flow-runtime.test.ts`:
   - cookie-backed admin session request can resolve a content-admin actor and read the paper collection.
   - request without session material remains denied with `401001`.
2. Run the focused test before source repair to prove the first case fails.
3. Change only `src/server/services/admin-flow-runtime.ts` so the admin-flow helper delegates to the shared
   `getRequestAuthorization(request)` behavior.
4. Re-run focused test, typecheck, formatting check, diff check, and Module Run v2 hardening.
5. Write redacted evidence and adversarial audit review, then close out by commit, fast-forward merge to `master`, push
   `origin/master`, and delete the short branch.

## Boundaries

- No browser/e2e runtime in this repair task.
- No DB connection, DB write, schema change, migration, or seed.
- No Provider, Prompt, raw AI I/O, staging/prod, deployment, Cost Calibration, dependency or lockfile change.
- No account login, private fixture read, credential/session/token/cookie/localStorage/Authorization value evidence.
- No release readiness, final Pass, or production usability claim.

## Evidence Requirements

Evidence may include only task id, branch, file paths, role labels, route labels, command names, pass/fail/block status,
and redacted expected/observed summaries. It must not include credentials, private account values, phone, email,
connection strings, tokens, sessions, cookies, localStorage, Authorization headers, raw DB rows, internal ids,
screenshots, raw DOM, traces, Provider payloads, raw Prompt, raw AI I/O, full content, employee answers, or plaintext
card values.

## Validation Commands

- `npm.cmd exec -- vitest run src/server/services/admin-flow-runtime.test.ts`
- `npm.cmd run typecheck`
- `npm.cmd exec -- prettier --check --ignore-unknown src/server/services/admin-flow-runtime.ts src/server/services/admin-flow-runtime.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-04-full-chain-scenario-2-admin-flow-cookie-session-auth-repair.md docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-2-admin-flow-cookie-session-auth-repair.md docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-2-admin-flow-cookie-session-auth-repair.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-2-admin-flow-cookie-session-auth-repair-2026-07-04`

## Stop Rules

Stop and split another repair/provisioning task if the failure is not limited to admin-flow request authorization
normalization, if the focused tests require broader runtime changes, if validation finds unrelated regressions, if any
evidence redaction risk appears, or if source repair would weaken authorization boundaries.
