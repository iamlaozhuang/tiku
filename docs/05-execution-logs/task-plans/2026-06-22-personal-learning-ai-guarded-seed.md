# Personal Learning AI Guarded Seed Plan

## Task

- Task id: `personal-learning-ai-guarded-seed-2026-06-22`
- Date: 2026-06-22
- Branch: `codex/personal-learning-ai-seed-20260622`
- Request: apply the approved guarded seed proposal for `personal-learning-ai`, registering batch-248 through batch-251 for serial local closeout.

## Read Context

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
- `scripts/agent-system/Get-ModuleRunV2ImplementationSeedProposal.ps1`
- `scripts/agent-system/New-ModuleRunV2ImplementationSeed.ps1`
- `scripts/agent-system/Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1`

## Implementation

- Use the project seed transaction script in apply mode.
- Record the current user approval as `autoDriveLocalImplementationApproval` for `personal-learning-ai`.
- Materialize standing low-risk local implementation closeout policy into the seeded tasks only for allowed low-risk actions.
- Keep seeded task scope limited to contracts, validators, services, models, docs, state, evidence, and audit review.
- Do not repeat historical implementation when existing evidence/code already covers the closure item; later task closeout will reconcile and cite prior evidence.

## Boundary

- No Provider/model calls.
- No `.env*` read or write.
- No schema, migration, seed, database connection, or data mutation.
- No package or lockfile change.
- No dev server, browser, or e2e runtime.
- No deploy, PR, force push, payment, external service, org_auth runtime change, or Cost Calibration Gate execution.
- Evidence must stay command/result summary only and must not expose secrets, tokens, database URLs, Authorization headers, raw DB rows, plaintext `redeem_code`, prompts, provider payloads, raw generated content, private answer text, full paper content, internal numeric ids, or publicId inventories.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\New-ModuleRunV2ImplementationSeed.ps1 -Apply ...`
- `npx.cmd prettier --check --ignore-unknown ...`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 ...` for each seeded candidate.
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-248-personal-learning-ai-personal-generation-request-flow`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-248-personal-learning-ai-personal-generation-request-flow -SkipRemoteAheadCheck`
