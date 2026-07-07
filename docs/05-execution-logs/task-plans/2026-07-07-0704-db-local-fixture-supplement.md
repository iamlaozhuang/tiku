# 2026-07-07 0704 DB Local Fixture Supplement Plan

## Task

- Task id: `0704-db-local-fixture-supplement-2026-07-07`
- Branch: `codex/0704-db-local-manual-role-acceptance-prep-2026-07-07`
- Approval: current user approved local 0704 non-destructive account/fixture supplement for `personal_standard_student` and `org_advanced_employee`, then local commit, merge, push, and cleanup.
- Goal: close direct manual-login material gaps for the two blocked role labels while preserving edition and authorization boundaries.

## Required Sources Read

- `AGENTS.md`
- Current project state and task queue recovery entries.
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`, especially ADR-007.
- `docs/05-execution-logs/evidence/2026-07-07-0704-db-local-manual-role-acceptance-prep.md`
- `docs/05-execution-logs/audits-reviews/2026-07-07-0704-db-local-manual-role-acceptance-prep.md`
- Latest explicit 20260704 localhost browser replay evidence.
- Latest personal standard fixture acceptance evidence.
- Latest 0704 org enterprise fixture materialization replay evidence.
- Runtime auth/session, user, employee, personal_auth, org_auth schema and repository code.
- Private 20260704 fixture structure in memory only.

## Execution Boundary

- Local 20260704 DB only.
- Non-destructive only: create or update missing local fixture bindings, reset login failure/disabled state as needed, preserve existing valid rows, and avoid delete/truncate/drop.
- Do not edit `.env.local`.
- Do not change source, tests, schema, migration, seed, package, lockfile, staging/prod/deploy, Provider-enabled flow, or Cost Calibration.
- Evidence and final output must omit credentials, sessions, cookies, tokens, env values, DB URLs, raw DB rows, internal ids, phone/email/password, plaintext `redeem_code`, Provider payload, raw prompt, raw AI output, full question/paper/material/resource/chunk content, screenshots, traces, raw DOM, and private fixture values.

## Steps

1. Confirm clean branch state and 0704 process-only runtime target.
2. Read private fixture values only in process memory.
3. Run read-only preflight for `personal_standard_student` and `org_advanced_employee`.
4. If missing, perform idempotent local upsert:
   - `personal_standard_student`: active personal user, student row, credential, and active standard `personal_auth`.
   - `org_advanced_employee`: active employee user, credential, employee binding, covered active advanced `org_auth` association, and quota refresh if needed.
5. Re-run `/api/v1/sessions` login preflight and authorization/route probes with redacted outputs only.
6. Write redacted evidence and adversarial audit.
7. Run validation gates, commit docs/state/evidence changes, merge to `master`, push approved target, and clean local short branch.

## Adversarial Checks

- Do not treat 0601, 0623, dev seed, or historical role-separated files as 20260704 login evidence.
- If login fails after materialization, distinguish fixture extraction, service DB binding, browser/session state, and source defect.
- If source defect is confirmed, stop fixture closeout and create a separate fix branch.
- Do not use destructive DB repair to make a pass.
