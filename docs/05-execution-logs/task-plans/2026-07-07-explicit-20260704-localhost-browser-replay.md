# 2026-07-07 Explicit 20260704 Localhost Browser Replay Task Plan

## Task

- Task id: `explicit-20260704-localhost-browser-replay-2026-07-07`
- Branch: `codex/explicit-20260704-localhost-browser-replay-2026-07-07`
- Goal: run a bounded localhost browser replay against the explicit local `20260704` DB target, focusing on the remaining browser-submitted AI出题 / AI组卷 closed-loop evidence gap.

## Read Gate

Read or restored before execution:

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/05-execution-logs/evidence/2026-07-06-ai-generation-credential-backed-role-matrix-replay.md`
- `docs/05-execution-logs/evidence/2026-07-07-post-recontract-local-adversarial-acceptance-consolidation.md`
- `docs/05-execution-logs/evidence/2026-07-07-full-db-backed-local-runtime-replay.md`

## Scope

In scope:

- Start a separate local dev server on a non-3000 port with an in-process DB override to the explicit `20260704` local DB label.
- Use browser automation with role credentials read in memory only.
- Exercise bounded browser UI flows:
  - `personal_advanced_student` AI组卷 to isolated learning session, answer submit, feedback/progress visibility.
  - `org_advanced_employee` AI组卷 to isolated learning session, answer submit, feedback/progress visibility.
  - `org_advanced_admin` AI组卷 route submit and enterprise-training draft handoff indicator.
  - `content_admin` AI组卷 route submit and pending draft review indicator.
  - standard role denial/unavailable samples for personal, employee, and organization admin.
- Record only role labels, route labels, aggregate result categories, safe error categories, command names, and exit status.

Out of scope:

- Provider-enabled generation.
- Provider payload, raw prompt, raw AI output, full generated content capture.
- screenshots, traces, raw DOM dumps, credentials, session values, cookies, tokens, env values, DB URL, raw DB rows, internal ids, private fixture values, employee raw answers.
- dependency, package, lockfile, schema, migration, seed, or source changes.
- staging, prod, deploy, release readiness, production usability, or Cost Calibration.

## Execution Plan

1. Preflight: confirm branch/worktree, role fixture presence, port availability, and explicit 20260704 DB target construction without printing values.
2. Start local dev server on an isolated port with process-only DB override; do not edit `.env.local`.
3. Run browser replay with redacted aggregate output only.
4. Stop the temporary dev server and avoid retaining browser artifacts.
5. Write redacted evidence and adversarial audit review.
6. Run local gates: lint, typecheck, focused AI generation source/unit suite, `git diff --check`, scoped Prettier, Module Run v2 hardening.
7. Close out by commit, fast-forward merge to `master`, push, and delete the short branch under the current user-approved local acceptance closeout boundary.

## Risk Controls

- Fail closed if the runtime DB label is not the explicit `20260704` target.
- Fail closed if a role credential cannot be mapped in memory.
- Do not broaden the task into Provider, Cost Calibration, staging/prod, or release claims.
- If browser replay exposes a source defect, stop and report the root cause; create a separate fix branch only after confirming the defect is current code, not fixture or harness drift.

## Recovery Addendum: DB / Fixture Boundary And Dependency Restore

Added after recovery approval on 2026-07-07.

Reason:

- The explicit 20260704 browser replay initially mixed historical/default localhost role fixture assumptions with the explicit 20260704 DB target during preflight investigation.
- The short runtime workspace cleanup also damaged local dependency executable links, leaving `node_modules/.bin` unavailable for `lint` and `typecheck`.

Recovery plan:

1. Freeze acceptance execution; do not run DB, browser, Provider, staging/prod, deploy, or Cost Calibration work while mapping is being corrected.
2. Record a redacted DB-account fixture boundary inventory:
   - current `.env.local` default DB label maps to the default localhost account-document family only;
   - explicit 20260704 DB label maps only to the 2026-07-04 full-chain account plan and related full-chain acceptance employee import material;
   - historical role-separated account documents and common dev seed credentials must not be reused against the explicit 20260704 DB unless a fresh preflight proves compatibility.
3. Restore local dependency executables according to project technical decisions:
   - prefer the current `package.json` `packageManager` pnpm baseline with `--frozen-lockfile`;
   - if current pnpm fails because of historical lock/config compatibility, use the documented local-CI pnpm 10 recovery command as a compatibility fallback;
   - do not change `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, or env files.
4. Re-run local quality gates after dependency restore.
5. Update evidence and audit with root-cause findings and remaining non-claims.
