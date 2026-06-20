# Task Plan: local-full-flow-human-acceptance-packet

## Task

- Task id: `local-full-flow-human-acceptance-packet`
- Branch: `codex/local-full-flow-human-acceptance`
- Goal: run a local full-flow human acceptance packet using only existing localhost Playwright specs and redacted
  evidence for standard plus advanced key paths.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- all ADRs under `docs/02-architecture/adr/`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- repair packet evidence from 2026-06-20 for personal AI and organization-training blockers

## Existing Specs

- Standard key path: `e2e/local-business-flow.spec.ts`
- Advanced personal AI key path: `e2e/personal-ai-generation-local-request.spec.ts`
- Advanced organization training key path: `e2e/organization-training-local-full-flow.spec.ts`
- Advanced organization portal key path: `e2e/organization-portal-local-flow.spec.ts`
- Advanced organization analytics key path: `e2e/organization-analytics-local-flow.spec.ts`

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-20-local-full-flow-human-acceptance-packet.md`
- `docs/05-execution-logs/evidence/2026-06-20-local-full-flow-human-acceptance-packet.md`
- `docs/05-execution-logs/audits-reviews/2026-06-20-local-full-flow-human-acceptance-packet.md`

## Blocked Files And Gates

- Blocked files: `.env*`, package and lockfiles, `src/**`, `e2e/**`, `src/db/schema/**`, `drizzle/**`, `scripts/**`,
  `playwright-report/**`, and `test-results/**`.
- Blocked gates: new e2e specs, headed/debug browser, destructive local DB writes, schema/drizzle/migration,
  dependency changes, provider/model calls, env/secret reads or writes, deploy/staging/prod/cloud, payment/export/OCR/
  external-service, PR, force-push, and Cost Calibration Gate.

## Plan

1. Run project status, next action, seed proposal, and localhost-only localFullFlow capability gate.
2. Run selected existing Playwright specs with `--list` first to confirm scope.
3. Run the selected existing specs as the local full-flow acceptance execution.
4. Record only command results, covered roles/use cases, and redacted metadata. Do not record raw user answers, full
   content, prompts, generated AI content, provider payloads, internal DB rows, secrets, tokens, database URLs,
   Authorization headers, or plaintext `redeem_code`.
5. Run prettier, lint, typecheck, diff check, pre-commit hardening, closeout readiness, and pre-push readiness.

## Stop Conditions

- Stop if acceptance requires a new e2e spec, headed/debug browser, local DB destructive write, schema/migration,
  dependency/provider/env/deploy/payment/export/OCR/Cost Calibration Gate, or raw sensitive evidence.
- Stop if existing specs cannot cover both standard and advanced key paths.
