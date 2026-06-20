# Task Plan: module-run-v2-personal-ai-local-ui-auth-session-contract-repair

## Task

- Task id: `module-run-v2-personal-ai-local-ui-auth-session-contract-repair`
- Branch: `codex/personal-ai-local-ui-auth-session-repair`
- Source blocked task: `module-run-v2-personal-ai-local-ui-browser-flow-validation`
- Goal: repair the existing localhost-only Playwright validation contract so it authenticates through the current
  server-session-compatible local automation boundary without changing product auth/session source behavior.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/05-execution-logs/evidence/2026-06-17-module-run-v2-personal-ai-local-ui-browser-flow-validation.md`

## Allowed Files

- `e2e/personal-ai-generation-local-request.spec.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-20-module-run-v2-personal-ai-local-ui-auth-session-contract-repair.md`
- `docs/05-execution-logs/evidence/2026-06-20-module-run-v2-personal-ai-local-ui-auth-session-contract-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-20-module-run-v2-personal-ai-local-ui-auth-session-contract-repair.md`

## Blocked Files And Gates

- Blocked files: `.env*`, `package.json`, lockfiles, `src/**`, `tests/**`, unrelated `e2e/**`, `src/db/schema/**`,
  `drizzle/**`, `scripts/**`, `playwright-report/**`, and `test-results/**`.
- Blocked gates: product auth/session source behavior changes, provider/model calls, env/secret reads or writes,
  dependency changes, schema/drizzle/migration, local DB destructive writes, headed/debug browser mode,
  staging/prod/cloud/deploy/payment/external-service, PR, force-push, and Cost Calibration Gate.

## Implementation Plan

1. Run readiness commands and the local full-flow capability gate for this task.
2. Reproduce or verify the targeted personal AI Playwright spec.
3. If the spec is still coupled to raw browser bearer-token persistence, update only the existing spec to use the
   server-session-compatible local automation marker/cookie boundary. If current master no longer reproduces that older
   mismatch, keep the repair limited to the next contract mismatch exposed by the same existing spec.
4. Run focused unit tests, Playwright list, targeted Playwright spec, lint, typecheck, diff check, pre-commit hardening,
   module closeout readiness, and pre-push readiness.
5. Record redacted command outcomes only. Do not record secrets, tokens, cookies, provider payloads, raw prompts, raw
   generated AI content, raw answers, DB URLs, DB rows, or public identifier inventories.
6. Create a validation commit, then a separate closeout commit, fast-forward merge to `master`, push `origin/master`,
   and delete the merged short branch.

## Risk Controls

- Preserve the approved server-session-only product boundary; do not reintroduce browser bearer-token login persistence
  in product source.
- Keep Playwright headed/debug mode disabled.
- Treat the local full-flow as localhost-only evidence, not staging or production readiness.
- Cost Calibration Gate remains blocked.
