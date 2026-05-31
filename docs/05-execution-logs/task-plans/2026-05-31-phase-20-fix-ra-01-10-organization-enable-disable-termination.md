# Phase 20 Fix RA-01-10 Organization Enable Disable Termination

## Task

- Task id: `phase-20-fix-ra-01-10-organization-enable-disable-termination`.
- Finding: `F-RA-01-10-001`.
- Branch: `codex/phase-20-fix-ra-01-10-organization-enable-disable-termination`.
- Goal: close organization enable evidence and ensure organization disable terminates affected active `practice` and `mock_exam` flows.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`

## Current Findings

- `POST /api/v1/organizations/{publicId}/enable` exists in the current runtime.
- `disableOrganization` updates organization status and returns affected public ids.
- `disableOrganization` does not currently demonstrate active `practice` / `mock_exam` termination for affected organization employees.

## Implementation Plan

1. Add RED unit coverage for organization disable active-flow termination evidence.
2. Extend `DisableOrganizationResultDto` with `activeFlowTermination`.
3. Update admin organization disable runtime audit metadata to include redacted termination counts.
4. Update repository disable flow to terminate affected employee active `practice` and `mock_exam` rows without schema or drizzle changes.
5. Add source-level repository regression coverage for termination query boundaries.
6. Run task validation commands, write evidence, and perform security review.

## Risk Defense

- No package or lockfile changes.
- No `.env*` reads or writes.
- No `src/db/schema/**` or `drizzle/**` changes.
- No external provider, cloud, deploy, or real service changes.
- No destructive data outside the intended local runtime status transition for active flows caused by organization disable.
- Route must still require `super_admin` or `ops_admin`; `content_admin` remains denied before mutation.
- Evidence must not include session tokens or internal numeric ids.
