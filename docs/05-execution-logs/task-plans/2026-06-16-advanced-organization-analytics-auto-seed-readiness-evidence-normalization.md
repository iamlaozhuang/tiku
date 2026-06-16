# Task Plan: Advanced Organization Analytics Auto-Seed Readiness Evidence Normalization

## Scope

- Task id: `advanced-organization-analytics-auto-seed-readiness-evidence-normalization`
- Branch: `codex/organization-analytics-auto-seed-readiness-normalization`
- Goal: normalize the organization-analytics auto-seed evidence and queued validation commands so `batch-185` through `batch-188` can pass `Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1` before implementation starts.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/05-execution-logs/evidence/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`

## Execution Plan

1. Reproduce the current auto-seed readiness hard block for `batch-185` without an explicit normalized evidence path.
2. Add a docs-only queue task for this normalization.
3. Add the required auto-seed readiness anchors to the organization-analytics seed evidence.
4. Update `batch-185` through `batch-188` pre-edit readiness commands to pass the normalized seed evidence path explicitly.
5. Record normalization evidence and audit review.
6. Run readiness for all four seeded implementation tasks, then diff check, lint, typecheck, GitCompletion, PreCommit, ModuleCloseout, and PrePush.

## Blocked Gates

- No product source, test source, script, schema, drizzle, package, or lockfile changes.
- No `.env*` read, output, summary, or edit.
- No DB access and no row/private data.
- No provider/model call, provider configuration, quota/cost measurement, or Cost Calibration Gate.
- No dev server, Browser, Playwright, e2e, staging/prod/cloud/deploy/payment/external-service.
- No PR and no force push.
