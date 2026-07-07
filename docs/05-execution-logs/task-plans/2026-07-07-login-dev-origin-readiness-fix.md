# 2026-07-07 Login Dev Origin Readiness Fix Task Plan

## Task

- Task id: `login-dev-origin-readiness-fix-2026-07-07`
- Branch: `codex/login-dev-origin-readiness-fix-2026-07-07`
- Goal: repair the localhost development-origin boundary so the login form becomes interactive when opened at `127.0.0.1:3000`, and record why the initial shared `Input` hypothesis was disproved.

## Read Gate

Read before implementation:

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- current `src/components/ui/input.tsx`
- current `next.config.ts`
- current `src/app/(auth)/login/page.tsx`
- current `tests/unit/ui-input-contract.test.ts`
- current `tests/unit/student-login-ui.test.ts`

## Scope

In scope:

- Source fix for the local Next.js dev-origin configuration.
- Focused regression coverage proving `127.0.0.1` is an allowed dev origin.
- Focused login UI regression coverage remains in place to prove submit-button enablement once client state is active.
- Git history audit for why the earlier input-focused guard did not catch the browser symptom.
- Redacted task plan, evidence, and audit review updates.
- Local verification gates: focused unit tests, lint, typecheck, `git diff --check`, scoped Prettier, Module Run v2 hardening/readiness where applicable.

Out of scope:

- DB reads/writes, schema, migration, seed, or fixture materialization.
- Provider calls, Provider config, raw prompt, raw AI output, or Cost Calibration.
- `.env*`, credentials, sessions, cookies, tokens, DB URLs, raw DB rows, private fixture values.
- `package.json`, lockfile, dependency installation, staging, production, deployment, PR, force push, or release readiness claims.

## Root-Cause Finding

The login page uses a controlled React state gate:

- valid phone value
- password length at least 8
- not submitting

The initial shared `Input` hypothesis was tested and disproved:

- focused shared input and login UI unit tests pass under React/jsdom controlled events;
- real browser input at `127.0.0.1:3000/login` leaves the submit button disabled;
- the same real browser input at `localhost:3000/login` enables the submit button;
- Next.js dev log reports blocked cross-origin access to dev resources from `127.0.0.1`.

Therefore the current actionable root cause is the local dev-origin mismatch, not the shared input component.

## Execution Plan

1. Reproduce and isolate the browser symptom using placeholder values only; do not submit the form.
2. Add a failing configuration regression test requiring `127.0.0.1` in `allowedDevOrigins`.
3. Implement the smallest `next.config.ts` repair for the local loopback dev origin.
4. Re-run focused config, shared input, and login UI tests.
5. Run full local source gates required for a low-risk frontend source repair.
6. Record redacted evidence and adversarial audit review, including the regression-introduction commit and non-claims.
7. Commit, merge to `master`, push to `origin/master`, and delete the short branch under this user-approved closeout request.

## Risk Controls

- Do not change dependencies or lockfiles.
- Do not change login API, auth session, DB target, account documents, credential handling, or shared `Input` without fresh evidence.
- Do not print or persist credentials.
- Treat existing tests that pass under synthetic events as insufficient for dev-origin browser readiness.
