# 2026-07-03 Source Landing 8 Role Credential-Backed Local Acceptance Rerun Plan

## Task

- Task ID: `source-landing-8-role-credential-backed-local-acceptance-rerun-2026-07-03`
- Branch: `codex/source-landing-8-role-credential-backed-local-acceptance-rerun-2026-07-03`
- Status: blocked; repair task split

## Read Baseline

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- 2026-07-02 UI/UX, role/auth/training/ops, current-thread, redeem-code, and AI generation traceability baselines
- 2026-07-03 16-package acceptance matrix/materials/approval pack
- 2026-07-03 credential-backed fixture target matrix and local account readiness
- 2026-07-03 credential-backed rerun preflight and repaired harness evidence

## Execution Boundary

Allowed:

- Run local Playwright acceptance commands with `--trace=off`.
- Use the approved private account fixture only as runtime login input for the repaired credential-backed harness.
- Record redacted role, route, assertion, command, pass/fail/block, and coverage-mode summaries.
- Update this task's plan, report, evidence, audit, `project-state.yaml`, and `task-queue.yaml`.

Blocked:

- Product source, schema, migration, seed, dependency, package, lockfile, env, Provider, staging/prod, deploy, PR, force
  push, Cost Calibration, release readiness, final Pass, or production usability work.
- Direct DB connection or raw DB row evidence.
- Credentials, passwords, sessions, cookies, headers, localStorage, env values, connection strings, internal ids, PII,
  plaintext `redeem_code`, Provider payloads, Prompt text, AI I/O, full content, screenshots, traces, raw DOM, or exports
  in evidence.

## Command Sequence

Stop on the first fail or block and split a repair task.

1. `npm.cmd exec -- playwright test e2e/credential-backed-8-role-local-acceptance.spec.ts --project=chromium --reporter=line --trace=off`
2. `npm.cmd exec -- playwright test e2e/student-practice-mock-entry.spec.ts --project=chromium --reporter=line --trace=off`
3. `npm.cmd exec -- playwright test e2e/personal-ai-generation-local-request.spec.ts --project=chromium --reporter=line --trace=off`
4. `npm.cmd exec -- playwright test e2e/edition-aware-authorization-local-flow.spec.ts --project=chromium --reporter=line --trace=off`
5. `npm.cmd exec -- playwright test e2e/local-full-loop-organization-training-analytics-ai-generation-role-flow.spec.ts --project=chromium --reporter=line --trace=off`
6. `npm.cmd exec -- playwright test e2e/admin-role-denial-browser.spec.ts --project=chromium --reporter=line --trace=off`
7. `npm.cmd exec -- playwright test e2e/role-separated-account-fixture-supplement.spec.ts --project=chromium --reporter=line --trace=off`

Adversarial coverage probe added before closeout:

8. `npm.cmd exec -- playwright test e2e/local-full-loop-knowledge-rag-maintenance-smoke.spec.ts --project=chromium --reporter=line --trace=off`

The probe is required because the first seven commands give `content_admin` credential-backed login/session and denial
boundary coverage, but do not give credential-backed positive content resource/RAG workflow proof.

## Stop Result

- Commands 1-7 completed before the adversarial probe.
- Command 8 failed before content resource mutation because the existing content positive workflow harness still expects
  a client-visible session token after login.
- Current secure session contract uses an HttpOnly `tiku_session` cookie and rejects client-visible session token
  evidence. The failed expectation is a stale acceptance harness contract, not an accepted 8-role pass.
- Split repair task:
  `repair-content-admin-cookie-backed-acceptance-harness-2026-07-03`.

## Acceptance Reporting Rule

- Primary ledger order remains:
  `personal_standard_student`, `personal_advanced_student`, `org_standard_employee`, `org_advanced_employee`,
  `org_standard_admin`, `org_advanced_admin`, `content_admin`, `ops_admin`.
- The repaired harness supplies all-role credential-backed login/session proof.
- Older route-fulfilled and fixture-first specs may supplement edge cases only; report them as supplement coverage, not
  as credential-backed workflow proof.
- `super_admin` is not a ninth primary role axis.
