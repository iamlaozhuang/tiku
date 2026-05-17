# Task Plan: Mechanism Git Health Hardening

## Context

The Phase 2 auth schema PR cleanup exposed mechanism gaps:

- The code-level `.gitattributes` LF policy was added to `master`, but the policy was not yet documented in the automation mechanism.
- `local-ci.md` still described the pre-test-tooling state and did not list `test:unit` or `format:check` as current gates.
- The workflow docs did not explicitly cover stacked PR retargeting, fresh checkout verification, or safe `--force-with-lease` use.

## Read Sources

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/03-standards/git-workflow.md`
- `docs/03-standards/local-ci.md`
- `docs/04-agent-system/sop/automation-loop.md`

## Scope

Allowed changes for this mechanism-only task:

- `AGENTS.md`
- `docs/03-standards/git-workflow.md`
- `docs/03-standards/local-ci.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `scripts/agent-system/Invoke-QualityGate.ps1`
- `scripts/agent-system/Test-AgentSystemReadiness.ps1`
- `docs/05-execution-logs/task-plans/2026-05-17-mechanism-git-health-hardening.md`
- `docs/05-execution-logs/evidence/2026-05-17-mechanism-git-health-hardening.md`

Blocked changes:

- Business code
- Database schema
- `package.json`
- lockfiles
- generated migrations

## Implementation Plan

1. Document fresh worktree verification and LF line-ending policy.
2. Update local CI documentation to reflect current gates: `lint`, `typecheck`, `test:unit`, and `format:check`.
3. Add stacked PR retargeting and safe `--force-with-lease` rules.
4. Update the automation quality gate script to run the current baseline gates.
5. Update readiness checks so missing baseline quality scripts fail visibly.
6. Run validation and record evidence.

## Risk Controls

- Use a dedicated worktree and branch from `origin/master`.
- Keep the patch docs/mechanism-only.
- Do not touch dependency manifests or generated migrations.
- Verify the final diff before commit.
