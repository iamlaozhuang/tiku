# 2026-07-04 Full-chain Login Input State Binding Repair Plan

## Task

- Task id: `full-chain-login-input-state-binding-repair-2026-07-04`
- Branch: `codex/full-chain-login-input-state-binding-repair-2026-07-04`
- Source blocked task:
  `full-chain-scenario-5-advanced-org-package-rerun-after-employee-import-harness-repair-2026-07-04`
- Goal: repair the full-chain browser acceptance login readiness procedure so browser/e2e login fills credentials only
  after the page is hydrated and interactive, without weakening authentication, authorization, role boundaries,
  redaction, or session-cookie rules.

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-5-advanced-org-package-rerun-after-employee-import-harness-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-5-advanced-org-package-rerun-after-employee-import-harness-repair.md`
- `src/app/(auth)/login/page.tsx`
- `src/components/ui/input.tsx`
- `src/app/api/v1/sessions/route.ts`
- `src/server/auth/session-cookie.ts`
- `src/server/contracts/user-auth/session-boundary.ts`
- `tests/unit/student-login-ui.test.ts`
- local `@base-ui/react` `Input` and `FieldControl` type/runtime files under `node_modules`
- `C:/Users/jzzhu/.codex/skills/playwright/SKILL.md`

## Root Cause Hypothesis

The failing probe filled the login fields immediately after `domcontentloaded`. At that point the DOM accepted values,
but the client component was not yet hydrated and the controlled React state had not observed those input events. That
left `LoginPage`'s `canSubmit` false and the submit button disabled.

An adversarial re-check kept the shared Base UI `Input` wrapper in place and waited for the page to reach an interactive
browser state before filling. The submit button enabled. A focused unit contract test also confirmed that the shared
`Input` still propagates standard controlled `onChange` updates. Therefore this task must not replace the shared UI
primitive or weaken login logic.

## Repair Scope

- Add focused unit coverage so the shared `Input` controlled input contract is protected.
- Preserve the existing shared `Input` implementation and login form validation.
- Run a focused browser validation with redacted private values after `networkidle`/hydrated readiness to prove the login
  submit button enables after valid credential entry.
- Carry the readiness rule into the Scenario 5 affected-node rerun: wait for the login page to be interactive before
  filling private credentials; do not submit credentials unless the scenario validation step requires it and evidence
  remains redacted.
- Materialize the runbook rule that browser login credential fill must wait for hydrated/interactable readiness, and that
  API session, browser form-state, and permission/surface-boundary evidence are separate lanes.

## Forbidden Changes

- No authentication bypass, permission weakening, or UI-only authorization substitution.
- No DB schema, migration, seed, destructive DB operation, or unscoped DB mutation.
- No dependency, package, lockfile, Provider, staging/prod, Cost Calibration, release readiness, final Pass, or
  production usability claim.
- No credentials, phone numbers, email addresses, connection strings, tokens, sessions, cookies, localStorage,
  Authorization headers, raw DB rows, internal ids, screenshots, raw DOM, traces, Provider payloads, raw Prompt, raw AI
  I/O, full materials, questions, papers, employee answers, plaintext card values, or private fixture contents in
  evidence.

## Validation Plan

1. Run the current focused login UI unit test to confirm the existing test surface is green but insufficient.
2. Add the shared `Input` controlled input contract unit test.
3. Run focused unit tests for login/input behavior.
4. Run `npm.cmd run typecheck` and `npm.cmd run lint`.
5. Start the local app against the isolated target DB only for focused browser login submit-state validation.
6. Stop the task-owned local runtime.
7. Update the full-chain runbook with the hydrated/interactable login readiness gate before product DB writes.
8. Run scoped Prettier, `git diff --check`, blocked path diff review, Module Run v2 pre-commit hardening, and pre-push
   readiness.

## Stop Rules

Stop and split a follow-up repair/provisioning task if the repair requires dependency or lockfile changes, schema/migration
/seed, Provider/staging/prod/Cost, destructive DB work, private input expansion, redaction risk, auth weakening,
permission bypass, or product decisions beyond preserving the existing input contract.
