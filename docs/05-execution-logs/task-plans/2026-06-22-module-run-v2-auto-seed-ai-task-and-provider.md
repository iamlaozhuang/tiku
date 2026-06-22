# Task Plan: Module Run v2 Auto Seed Ai Task And Provider

## Task

- taskId: `module-run-v2-auto-seed-ai-task-and-provider`
- branch: `codex/ai-task-provider-guarded-seed-20260622`
- executionProfile: `docs_state_seed_transaction`
- scope: guarded seed transaction for `request_auto_seed_approval:ai-task-and-provider`.

## Context Read

- `AGENTS.md`
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
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `scripts/agent-system/Get-TikuNextAction.ps1`
- `scripts/agent-system/Get-ModuleRunV2ImplementationSeedProposal.ps1`
- `scripts/agent-system/New-ModuleRunV2ImplementationSeed.ps1`

## Approval

The current user explicitly approved `request_auto_seed_approval:ai-task-and-provider`.

This is treated as task-scoped approval for the guarded seed transaction only. The generated implementation tasks may
use the standing low-risk local closeout policy already required by Module Run v2, but high-risk capability gates remain
blocked.

## Seed Candidates

- `batch-284-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract`
- `batch-285-ai-task-and-provider-local-task-request-policy-and-result-referen`
- `batch-286-ai-task-and-provider-redacted-audit-log-and-ai-call-log-evidence`
- `batch-287-ai-task-and-provider-local-provider-sandbox-proposal-and-evidence`

## Implementation Plan

1. Run the read-only seed proposal and verify the module, source planning task, and candidate ids.
2. Run `New-ModuleRunV2ImplementationSeed.ps1 -Apply` with the current approval statement.
3. Verify the generated docs/state changes and seed evidence/audit templates.
4. Run scoped Prettier, lint, typecheck, `git diff --check`, queue diagnostics, and Module Run v2 hardening/pre-push gates.
5. Commit the seed transaction, fast-forward merge to `master`, push `origin/master`, and delete the merged short branch if gates pass.

## Risk Boundary

Blocked for this seed transaction:

- product source or test implementation
- Provider/model calls or provider configuration
- prompt/provider payload/raw generated content exposure
- env/secret reads or writes
- schema/migration/seed/database connection or data mutation
- dependency/package/lockfile changes
- dev server, Browser, Playwright, or e2e runtime
- deploy, PR, force push
- payment/external service
- org_auth runtime behavior changes
- raw employee answer, full paper content, plaintext redeem_code, token, DB URL, raw audit row, or raw ai_call_log evidence
- Cost Calibration Gate
