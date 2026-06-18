# Module Run v2 local experience governance hardening

- Task ID: `module-run-v2-local-experience-governance-hardening`
- Branch: `codex/local-experience-governance-hardening`
- Created: `2026-06-17T17:24:01-07:00`
- Execution profile: `docs_state_lite`
- Evidence mode: `full`
- Validation policy: `docs_state`

## Required Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/git-workflow.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `superpowers:executing-plans`
- `superpowers:using-git-worktrees`

## Scope

Implement the local experience closure governance plan by adding a durable SOP, initializing the coverage state matrix,
adding a `local_experience_audit` execution profile, and materializing the next docs-only governance task state.

Allowed write scope:

- `docs/04-agent-system/sop/local-experience-closure-governance.md`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- this task plan, evidence, and audit files

## Non-Goals

- No product source, route, UI, test, e2e, script, schema, drizzle, migration, package, lockfile, or dependency changes.
- No `.env*` read, output, or edit.
- No Browser, Playwright runtime execution, dev server, full e2e, provider/model call, staging/prod/cloud/deploy/payment,
  external-service, PR, force-push, raw row/private data exposure, public identifier inventories, or Cost Calibration Gate
  work.

## Implementation Plan

1. Add `local-experience-closure-governance.md` as a long-lived SOP under `docs/04-agent-system/sop/`.
2. Add `local-experience-coverage-matrix.yaml` under `docs/04-agent-system/state/` with initial standard and advanced
   use case rows classified from current local facts and existing evidence.
3. Extend `execution-profiles.yaml` with `local_experience_audit`, keeping it read-only and separate from
   `local_full_flow`.
4. Update `project-state.yaml` handoff to recommend `unified-standard-advanced-current-coverage-refresh` as the next
   matrix-driven task.
5. Add a pending queue entry for `unified-standard-advanced-current-coverage-refresh` so the mechanism has a concrete
   next docs-only audit task.
6. Record redacted evidence and audit after validation.

## Risk Controls

- Status terms are governance state only; they do not rewrite requirements or product semantics.
- `experience_closed` requires fresh evidence anchors; initial matrix rows should not overclaim closure.
- `release_blocked` must name blocked gates instead of treating provider/staging/prod gaps as local implementation gaps.
- Evidence records command outcomes and policy summaries only.
