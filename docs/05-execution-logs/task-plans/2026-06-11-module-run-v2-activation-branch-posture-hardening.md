# Module Run v2 activation and branch posture hardening

## Scope

- Implement the user-approved mechanism hardening plan for Module Run v2.
- Keep the work limited to automation mechanism scripts, smoke tests, durable schema/state, task plan, evidence, and audit review.
- Do not touch product source code, package or lock files, env/secret files, provider configuration, schema/migration files, e2e artifacts, deployment, PRs, force push, or Cost Calibration Gate.

## Read Before Edit

- AGENTS.md
- docs/03-standards/code-taste-ten-commandments.md
- docs/02-architecture/adr/adr-001-tech-stack-selection.md
- docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md
- docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md
- docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md
- docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md
- docs/04-agent-system/state/project-state.yaml
- docs/04-agent-system/state/task-queue.yaml
- docs/04-agent-system/state/autodrive-control-schema.yaml
- docs/04-agent-system/state/mechanism-source-of-truth-index.yaml

## Implementation Plan

1. Add failing smoke coverage first:
   - detached HEAD with a pending task and approved commit/merge/push closeoutPolicy must not claim.
   - codex/\* short branch with the same task metadata must remain claimable.
   - project-state/TOML ACTIVE/PAUSED mismatch must emit a concrete reconcile action.
   - run registry finalizer must classify branch posture stops as auto-recoverable with a prepare_short_branch command.
2. Implement the minimum mechanism changes:
   - add serial executor branch posture gate before claim writes queue or project-state.
   - add registration reconcile output for status mismatch.
   - add finalizer defaults for branch posture blockers.
   - document branch posture action/taxonomy in the durable autodrive control schema.
   - reconcile project-state automation status with the active primary TOML through this explicit mechanism task.
3. Run targeted smoke tests and then broader gates.
4. Write evidence and audit review before closeout.

## Risk Controls

- Branch posture gate applies only to tasks whose structured closeoutPolicy approves local commit, fast-forward merge to master, push origin/master, and cleanup.
- Existing proposal-only, docs-only, and non-push tasks are not made stricter unless they opt into approved push closeout.
- Registration mismatch remains a hard block; the improvement is actionable output, not silent auto-repair.
- Activation reconcile updates durable state only for the already active primary automation TOML and does not activate historical or on-demand mechanic identities.
