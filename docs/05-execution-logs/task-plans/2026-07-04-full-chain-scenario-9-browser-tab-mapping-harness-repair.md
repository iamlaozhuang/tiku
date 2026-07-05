# 2026-07-04 Full-Chain Scenario 9 Browser Tab Mapping Harness Repair Plan

## Task

- Task id: `full-chain-scenario-9-browser-tab-mapping-harness-repair-2026-07-04`
- Branch: `codex/full-chain-scenario-9-browser-tab-mapping-harness-repair-2026-07-04`
- Source blocked task:
  `full-chain-scenario-9-advanced-personal-rerun-after-redeem-repair-2026-07-04`
- Goal: repair or provision the local browser acceptance harness control path after stale in-app browser tab handle
  mapping blocked Scenario 9 before private input fill and before product DB writes.

## Read Gate

Read before repair execution:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/05-execution-logs/task-plans/2026-07-04-full-chain-scenario-9-advanced-personal-rerun-after-redeem-repair.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-9-advanced-personal-rerun-after-redeem-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-9-advanced-personal-rerun-after-redeem-repair.md`
- `package.json`
- `C:/Users/jzzhu/.codex/skills/playwright/SKILL.md`

## Scope

- Repair scope is browser acceptance harness only.
- Use existing local `@playwright/test` availability as a redacted programmatic harness probe; do not add dependencies or
  write Playwright trace, screenshot, report, or raw DOM artifacts.
- Do not use the in-app browser tab handle as the proof path for this repair because the source blocker is stale
  in-app browser tab mapping.
- Do not change product source, authentication, authorization, redeem runtime, schema, seed, fixture, dependency,
  Provider, staging/prod, Cost, deployment, or release-readiness behavior.

## Validation Plan

1. Verify branch, state/queue entry, `npx`, and local `@playwright/test` availability.
2. Launch a minimal headless browser probe from the installed Playwright test package without screenshots, traces,
   snapshots, raw DOM output, or private values.
3. If browser launch works, classify the harness repair as local acceptance can use the programmatic redacted Playwright
   control path when in-app browser tab mapping is stale.
4. Run scoped Prettier check, `git diff --check`, blocked path diff review, Module Run v2 pre-commit hardening, and
   Module Run v2 pre-push readiness.
5. Close the repair, merge to `master`, push `origin/master`, delete the short branch, then rerun Scenario 9 from the
   browser login node without repeating Scenario 8 standard redemption or learning data creation.

## Stop Rules

Stop and split a new task if the repair needs product source, auth, authorization, redeem runtime, DB schema, seed,
dependency or lockfile changes, Provider, staging/prod, Cost Calibration, destructive DB operations, private fixture
expansion, raw DOM/screenshot/trace evidence, or any release readiness/final Pass/production usability claim.
