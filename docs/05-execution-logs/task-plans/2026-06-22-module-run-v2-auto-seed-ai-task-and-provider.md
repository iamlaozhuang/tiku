# Module Run v2 Auto-Seed Plan: ai-task-and-provider

## Scope

Append guarded pending implementation tasks for `ai-task-and-provider` using the repository seed transaction script.

## Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `scripts/agent-system/New-ModuleRunV2ImplementationSeed.ps1`
- `scripts/agent-system/Test-ModuleRunV2ImplementationSeedSelfReview.ps1`

## Allowed Changes

- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-22-module-run-v2-auto-seed-ai-task-and-provider.md`
- `docs/05-execution-logs/evidence/2026-06-22-module-run-v2-auto-seed-ai-task-and-provider.md`
- `docs/05-execution-logs/audits-reviews/2026-06-22-module-run-v2-auto-seed-ai-task-and-provider.md`
- seeded task evidence/audit templates under `docs/05-execution-logs/`

## Blocked Changes

- Source, tests, package files, lockfiles, schema, migration, seed data, database connection or mutation.
- `.env*`, Provider/model calls, prompt/provider payloads, raw generated content, browser/e2e/dev-server runtime.
- Deployments, PRs, force push, payment/external services, `org_auth` runtime changes, and Cost Calibration Gate execution.

## Plan

1. Confirm repository status and queue recommendation.
2. Run `New-ModuleRunV2ImplementationSeed.ps1` with the current user approval statement and `-Apply`.
3. Run seed self-review for all four seeded task ids.
4. Run formatting and local governance checks.
5. Commit the seed transaction, fast-forward merge to `master`, push `origin/master`, and delete the seed branch.

## Risk Controls

- Keep seeded tasks pending; implementation happens in separate short branches.
- Do not change high-risk gates or claim preview release readiness.
- Record only command/result summaries in evidence.
