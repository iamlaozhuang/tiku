# Acceptance L5 Fixture-Only Role Coverage Run Plan

taskId: acceptance-l5-fixture-only-role-coverage-run-2026-06-23
status: in_progress
createdAt: "2026-06-23T00:03:20-07:00"
branch: codex/runtime-blocker-evidence-batch-20260623
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only

## Human Approval Boundary

Laozhuang approved continuing with the fixture-only / seeded local account evidence discussion. Codex applies this run
only to the lower-risk fixture-only subset:

- allowed: run existing local Playwright specs that fulfill API calls with synthetic fixture payloads;
- allowed: reuse the existing local `127.0.0.1:3000` browser target if it is already available;
- allowed: record role and edition coverage as pass, partial, missing, or blocked;
- blocked: seeded local account creation, login with real credentials, database connection, database seed, schema or
  migration work, `.env*` access, Provider/model calls, dependency changes, staging/prod/cloud, payment, external
  services, Cost Calibration, and final acceptance Pass claims.

## Standards Read

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `playwright.config.ts`
- `package.json`
- `e2e/edition-aware-authorization-local-flow.spec.ts`
- `e2e/admin-role-denial-browser.spec.ts`
- prior Standard L5 blocked evidence and audit review

## Execution Plan

1. Confirm the local target is still limited to `http://127.0.0.1:3000`.
2. Run Playwright discovery only with `npm.cmd run test:e2e -- --list`.
3. Run the existing fixture-only authorization edition spec:
   `TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER=1; npm.cmd run test:e2e -- e2e/edition-aware-authorization-local-flow.spec.ts`.
4. Run the existing fixture-only admin role denial spec:
   `TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER=1; npm.cmd run test:e2e -- e2e/admin-role-denial-browser.spec.ts`.
5. Record a plain-language coverage matrix for:
   - personal standard edition;
   - personal advanced edition;
   - personal standard upgraded to advanced;
   - enterprise employee standard and advanced;
   - enterprise standard administrator;
   - enterprise advanced administrator;
   - content operations;
   - system operations;
   - auditor/evidence review role.
6. Mark each row as covered, partially covered, missing fixture, or still requiring seeded local account evidence.
7. Preserve all blocked gates and run docs validation before local commit.

## Expected Evidence Limits

Evidence may record only command names, pass/fail status, test counts, local target summary, role labels, and coverage
classification. Evidence must not include screenshots, traces, HTML report contents, browser storage dumps, cookies,
credentials, tokens, Authorization headers, database URLs, `.env*` contents, Provider payloads, prompts, raw AI output,
raw answers, full `paper` or `material` content, plaintext `redeem_code`, or internal database rows.

## Risk Controls

- Existing fixture specs are read-only and must not be modified in this task.
- A fixture-only pass does not become formal L5 acceptance Pass.
- Missing positive flows for enterprise employees, content operations, system operations, and auditor runtime must be
  recorded honestly instead of inferred from denial or authorization fixtures.
- Seeded local account evidence remains a separate approval and execution task.
