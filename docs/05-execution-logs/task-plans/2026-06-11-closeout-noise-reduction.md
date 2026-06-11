# Closeout Noise Reduction Plan

## Task

`closeout-noise-reduction`

## Read Before Edit

- `AGENTS.md` instructions supplied in conversation
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`

## Objective

Make closeout default to one task implementation commit plus final handoff/pre-push readiness, instead of creating a post-merge evidence-only commit unless durable evidence or SHA state must be written.

## Implementation Plan

1. Add explicit closeout noise policy output to pre-push readiness and approved closeout scripts.
2. Add smoke assertions so the default policy cannot silently regress to mandatory post-merge evidence-only commits.
3. Update operating manual, automation-loop SOP, automated-advancement governance, and schema wording.
4. Keep the policy additive: it changes closeout guidance and readiness output, not git behavior or push approval.
5. Validate with pre-push readiness smoke, approved closeout smoke, project status, runner plan-only, formatting, lint, and typecheck.

## Required Durable Evidence Cases

- Validation output or closeout facts were not recorded before merge.
- Queue/project-state SHA or handoff pointer must be corrected on disk for recovery.
- A failed merge/push/cleanup needs durable recovery facts.
- Task approval explicitly requires persistent post-merge evidence.
- A gate script requires a file-based evidence/audit artifact for the next step.

## Default Non-Writing Cases

- Merge/push/cleanup succeeded and pre-push readiness already recorded enough proof.
- Final handoff can state implementation commit, closeout commit when applicable, pushed branch, and cleanup result.
- `project-state.yaml` recorded SHAs are accepted ancestors of current Git reality.

## Risk Controls

- Do not change local automation registration or activate automation.
- Do not weaken pre-push readiness, module closeout readiness, or protected-branch gates.
- Do not touch product code, dependencies, lockfiles, schema, migrations, env/secret, provider, deployment, external service, or Cost Calibration Gate.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2ApprovedCloseout.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.ps1 -PlanOnly -MaxSteps 1 -AllowProtectedBranch`
- `git diff --check`
- Prettier check for touched files
- `npm run lint`
- `npm run typecheck`
