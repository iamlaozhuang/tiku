# Discovered Issue Closure Governance Seed Plan

**Date:** 2026-06-21
**Task id:** `discovered-issue-closure-governance-seed`
**Branch:** `codex/discovered-issue-closure-seed`
**Scope:** docs/state governance seed only.

## Read-Only Recovery Completed

- `git status --short --branch`: clean `master...origin/master`.
- Current `master` and `origin/master`: `04f82c7e`, including `fix(mistake-book): honor cookie-backed student session`.
- Read `AGENTS.md`, `docs/03-standards/code-taste-ten-commandments.md`, `docs/03-standards/glossary.yaml`.
- Read ADRs `adr-001` through `adr-007`.
- Read `docs/04-agent-system/state/project-state.yaml` and `docs/04-agent-system/state/task-queue.yaml`.
- Read the static audit at `docs/05-execution-logs/audits-reviews/2026-06-21-requirement-fulfillment-and-role-experience-review.md`.
- Read the role matrix at `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.
- Read `package.json` for ADR-006 dependency fact checking only.

## Goal

Create a minimal governance seed that registers the discovered-issue closure batch and the first legal serial task scopes. No product source, test source, package file, schema, migration, provider, env, dev server, browser, e2e, deploy, PR, force-push, or database work is allowed in this seed.

## Batch Inventory Rules

Every item is classified with one or more of:

- `local_implementation`
- `docs_decision`
- `approval_blocked`
- `security_review_required`
- `runtime_verification_later`

Closure target for every item is one of:

- fixed by local implementation;
- converted into an explicit product or architecture decision package;
- blocked by a hard gate with the next approval step recorded.

## Implementation Steps

1. Create this task plan before state edits.
2. Update `docs/04-agent-system/state/task-queue.yaml` with:
   - one governance seed task;
   - the serial child task list derived from all three user-mandated sources;
   - explicit allowed and blocked file boundaries for each child task.
3. Update `docs/04-agent-system/state/project-state.yaml` with the batch registry and source coverage summary.
4. Create evidence and audit-review files for the seed.
5. Validate docs/state changes with:
   - `git diff --check`;
   - Prettier check for touched docs/state files;
   - Module Run v2 pre-commit hardening for `discovered-issue-closure-governance-seed`;
   - Module Run v2 pre-push readiness for `discovered-issue-closure-governance-seed`.
6. Commit, fast-forward merge to `master`, push `origin/master`, and delete the merged short branch under the current user approval boundary.

## Risk Boundaries

- The existing mistake_book cookie-backed session fix is already on `origin/master`; this seed must not re-implement it.
- `package.json` and lockfiles are read-only; ADR-006 work may only update docs and evidence unless a later dependency approval exists.
- `org_auth` schema/runtime changes are blocked until product scope, security boundary, and implementation split are completed.
- Content AI 出题/AI 组卷 work is decision-only; no Provider call, prompt payload, or formal adoption implementation is allowed.
- Runtime/browser/e2e proof is recorded as `runtime_verification_later` because the current approval explicitly blocks dev server, browser, and Playwright/e2e runtime.
