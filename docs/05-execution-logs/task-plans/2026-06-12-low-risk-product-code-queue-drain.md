# Low Risk Product Code Queue Drain Implementation Plan

## Task

Implement mechanism tuning so one `tiku-module-run-v2-autopilot` wake can advance multiple low-risk product-code Module Run v2 batches.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`

## Implementation Scope

- Update bounded queue drain policy so `low_risk_local_code` can be eligible by default when all low-risk gates pass.
- Keep one batch per branch, commit, closeout, push, cleanup, and worktree parking cycle.
- Do not alter product behavior, dependencies, package/lockfiles, schema/migrations, env/secrets, providers, deploy, payment, PR, force-push, e2e, or Cost Calibration Gate.

## Planned Files

- `scripts/agent-system/Test-ModuleRunV2QueueDrainEligibility.ps1`
- `scripts/agent-system/Test-ModuleRunV2QueueDrainEligibility.Smoke.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2QueueDrainSupervisor.Smoke.ps1`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/05-execution-logs/evidence/2026-06-12-low-risk-product-code-queue-drain.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-low-risk-product-code-queue-drain.md`
- local automation prompt for `tiku-module-run-v2-autopilot`

## TDD Plan

1. RED: update eligibility smoke so `low_risk_local_code` with low-risk metadata must return `eligible`, and missing explicit `drainPolicy` for safe implementation tasks must synthesize default eligibility.
2. GREEN: update eligibility script to synthesize default product-code drain policy and retain hard blocks for high-risk metadata.
3. Add supervisor smoke coverage for product-code eligible task routing and budget stops.
4. Update durable policy docs and automation prompt.
5. Validate with focused smokes, registration readiness, control-loop acceptance, lint, typecheck, and diff checks.

## Risk Controls

- Product-code drain remains bounded by `maxTasksPerWake`, `maxWallClockMinutes`, changed-file and changed-line budgets.
- Every batch still requires clean closeout before next claim.
- High-risk surfaces remain blocked.
- Evidence must record command outcomes and avoid secrets, raw provider payloads, raw prompts, raw generated AI content, raw DB rows, plaintext `redeem_code`, or full paper/material content.
