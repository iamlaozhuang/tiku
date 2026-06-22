# Module Run v2 auto-seed ai-task-and-provider task plan

## Task

- Task id: `module-run-v2-auto-seed-ai-task-and-provider-2026-06-22`
- Branch: `codex/auto-seed-ai-task-provider-20260622`
- Requested action: apply the approved guarded seed proposal for `ai-task-and-provider`, then assess the remaining work
  before local closeout validation.

## Read context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/code-stage-task-seeding-governance.md`
- `scripts/agent-system/Get-ModuleRunV2ImplementationSeedProposal.ps1`
- `scripts/agent-system/New-ModuleRunV2ImplementationSeed.ps1`
- `scripts/agent-system/Test-ModuleRunV2ImplementationSeedSelfReview.ps1`

## Baseline

- `master` and `origin/master` are aligned at `0a3d4d84a1a831ade2b53de19cd7a04d96319982`.
- `Get-TikuProjectStatus.ps1` reports `seed_proposal_available`.
- The read-only seed proposal selects `ai-task-and-provider` and four candidate tasks, `batch-244` through `batch-247`.
- Default local date-based seed evidence would collide with an earlier `2026-06-21` evidence file for the same module, so
  this task uses explicit `2026-06-22` evidence and audit paths.

## Implementation plan

1. Apply the seed transaction with the user's explicit `autoDriveLocalImplementationApproval` and existing standing
   closeout approval statement boundaries.
2. Write seed evidence and audit review to explicit `2026-06-22` paths.
3. Run seed self-review for the four newly seeded task ids.
4. Run project status and queue diagnostics to count remaining work toward local closeout validation.
5. Run formatting, lint, typecheck, `git diff --check`, Module Run v2 closeout, and pre-push readiness.
6. Commit, fast-forward merge to `master`, push `origin/master`, and clean the short branch if all gates pass.

## Risk controls

- No product source implementation happens in this seed task.
- No Provider/model call, env/secret access, schema/migration, database connection, dependency, dev-server/browser/e2e,
  deploy, PR, force-push, payment, external service, org_auth runtime change, employee transfer runtime change, or Cost
  Calibration Gate work.
- Evidence records command/result summaries and task ids only.
- Existing `2026-06-21` ai-task-and-provider seed evidence is not overwritten.

## Validation plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2ImplementationSeedProposal.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\New-ModuleRunV2ImplementationSeed.ps1 -Apply ...`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationSeedSelfReview.ps1 -ExpectedModule ai-task-and-provider -SeedTaskIds ...`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`
- `npx.cmd prettier --check --ignore-unknown ...`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-244-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-244-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-244-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract -SkipRemoteAheadCheck`
