# Phase 24 Fresh DB Repeatability Verification Task Plan

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/sop/fresh-local-dev-db-validation-playbook.md`
- `docs/05-execution-logs/audits-reviews/2026-06-01-phase-24-fresh-validation-orchestration-design.md`
- `docs/05-execution-logs/evidence/2026-06-01-phase-24-safe-local-dev-bootstrap-runner.md`

## Scope

- Task id: `phase-24-fresh-db-repeatability-verification`
- Branch: `codex/phase-24-fresh-validation-operationalization`
- Fresh local/dev target: `databaseName=tiku_fresh_phase24_20260601_001`
- Allowed:
  - update `.env.local` databaseName only through the approved runner;
  - create a fresh local/dev database target non-destructively;
  - run reviewed Drizzle migrate, dev seed, validation data prep, full e2e, and build through the runner;
  - write evidence without secrets.
- Blocked:
  - `.env.example`
  - package/lockfile/dependency changes
  - schema/migration edits
  - raw SQL, `drizzle-kit push`, migration table repair
  - destructive data operations
  - staging/prod/cloud/deploy/real provider/external service

## Verification Steps

1. Run the approved runner:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\local\Invoke-FreshValidationRun.ps1 -DatabaseName tiku_fresh_phase24_20260601_001
```

2. If the runner fails because a blocked operation is required, stop and record a blocked gate.
3. Run `git diff --check`.
4. Record only redacted command outcomes: `hostClass`, `databaseName`, pass/fail, and failure summaries.

## Evidence

- Evidence path: `docs/05-execution-logs/evidence/2026-06-01-phase-24-fresh-db-repeatability-verification.md`
