# Task Plan: Module Run v2 Auto-Seed Organization Analytics

## Scope

- Task id: `module-run-v2-auto-seed-organization-analytics`
- Branch: `codex/organization-analytics-guarded-seed`
- Goal: seed the next guarded organization-analytics implementation batch after organization-training batch 252-255 closeout.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `scripts/agent-system/Get-TikuNextAction.ps1`
- `scripts/agent-system/Get-ModuleRunV2ImplementationSeedProposal.ps1`
- `scripts/agent-system/New-ModuleRunV2ImplementationSeed.ps1`

## Execution Plan

1. Confirm repository readiness and current organization-analytics seed proposal.
2. Use `New-ModuleRunV2ImplementationSeed.ps1 -Apply` to append guarded pending implementation tasks.
3. Register a docs/state queue-seeding task, evidence, audit review, and project-state batch checkpoint.
4. Add task-plan paths for seeded implementation tasks so each task can be claimed independently.
5. Run seed self-review, auto-seed readiness checks, diff check, lint, typecheck, GitCompletion, PreCommit, ModuleCloseout, and PrePush.

## Blocked Gates

- No product source or test source implementation in this seed task.
- No `.env*` read, output, summary, or edit.
- No database access, row/private data, schema, migration, drizzle, seed, dependency, package, or lockfile changes.
- No provider/model call, provider configuration, raw prompt, raw employee answer, full paper content, or provider payload exposure.
- No dev server, Browser, Playwright, e2e runtime, staging/prod/cloud/deploy/payment/external-service, PR, force push, export object storage or external delivery, org_auth runtime behavior change, or Cost Calibration Gate execution.
