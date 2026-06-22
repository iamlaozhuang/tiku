# MVP Acceptance Execution Plan Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Strengthen the Standard and Advanced MVP acceptance execution plan so it can be executed without missing required use cases, release gates, owner gates, L2 validation, or AI lifecycle details.

**Architecture:** This is a docs-only hardening task. It updates the existing acceptance plan and adds fresh evidence/audit records for this hardening pass. It does not change product source, tests, dependencies, schemas, migrations, environment files, runtime data, Provider configuration, staging resources, or remote Git state.

**Tech Stack:** Markdown documentation, repository governance state, local Git branch `codex/acceptance-execution-plan-doc-20260622`.

---

## Task Classification

- Task id: `mvp-acceptance-execution-plan-hardening-2026-06-22`
- Task kind: `docs_only_planning_hardening`
- Branch: `codex/acceptance-execution-plan-doc-20260622`
- Scope: Strengthen the existing Standard and Advanced MVP acceptance execution plan based on the follow-up review findings.

## Inputs Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/preview-owner-acceptance-checklist.yaml`
- `docs/05-execution-logs/acceptance/2026-06-22-standard-advanced-mvp-acceptance-execution-plan.md`

## Files

- Modify: `docs/05-execution-logs/acceptance/2026-06-22-standard-advanced-mvp-acceptance-execution-plan.md`
- Create: `docs/05-execution-logs/task-plans/2026-06-22-mvp-acceptance-execution-plan-hardening.md`
- Create: `docs/05-execution-logs/evidence/2026-06-22-mvp-acceptance-execution-plan-hardening.md`
- Create: `docs/05-execution-logs/audits-reviews/2026-06-22-mvp-acceptance-execution-plan-hardening.md`

## Guardrails

- Do not modify product source, tests, schema, migrations, scripts, package files, lockfiles, `.env*`, runtime artifacts, or generated reports.
- Do not run dev server, browser/e2e, Provider, payment, database, staging, deploy, push, or PR actions.
- Keep all evidence redacted and summary-only.
- Keep local MVP acceptance distinct from release, preview, staging, and production readiness.

## Steps

- [x] **Step 1: Re-read required governance and architecture sources**

  Required sources listed above have been read before modifying the acceptance plan.

- [x] **Step 2: Add complete use case acceptance matrix seed**

  Add rows for all Standard MVP, Advanced edition, and required unified governance use cases, including `UC-ADV-FORMAL-CONTENT-SEPARATION` and `UC-AUDIT-SOURCE-GOVERNANCE` as an audit-only row.

- [x] **Step 3: Add AP gate table**

  Add AP-01 through AP-11 with gate name, affected scope, blocked reason, required approval, acceptance impact, and evidence expectation.

- [x] **Step 4: Add L6 owner gate**

  Add the full owner gate from `preview-owner-acceptance-checklist.yaml`: account, sample data, redaction, monitoring, incident, rollback, stop, and evidence redaction owners.

- [x] **Step 5: Fix L2 command consistency**

  Make L2 require `npm.cmd run build`; leave docs-only commands separate.

- [x] **Step 6: Add AI lifecycle checklist**

  Add Standard and Advanced AI lifecycle checks for `ai_hint`, `prompt_template`, `model_config`, `model_provider`, `ai_call_status`, retry, timeout, idempotency, quota precheck, redaction, and Provider-disabled boundaries.

- [x] **Step 7: Add fresh hardening evidence and audit review**

  Create evidence and audit review files recording this hardening pass, validation commands, and remaining non-executed actions.

- [x] **Step 8: Validate and re-review**

  Run:

  ```powershell
  npx.cmd prettier --write --ignore-unknown docs/05-execution-logs/acceptance/2026-06-22-standard-advanced-mvp-acceptance-execution-plan.md docs/05-execution-logs/task-plans/2026-06-22-mvp-acceptance-execution-plan-hardening.md docs/05-execution-logs/evidence/2026-06-22-mvp-acceptance-execution-plan-hardening.md docs/05-execution-logs/audits-reviews/2026-06-22-mvp-acceptance-execution-plan-hardening.md
  npx.cmd prettier --check --ignore-unknown docs/05-execution-logs/acceptance/2026-06-22-standard-advanced-mvp-acceptance-execution-plan.md docs/05-execution-logs/task-plans/2026-06-22-mvp-acceptance-execution-plan-hardening.md docs/05-execution-logs/evidence/2026-06-22-mvp-acceptance-execution-plan-hardening.md docs/05-execution-logs/audits-reviews/2026-06-22-mvp-acceptance-execution-plan-hardening.md
  git diff --check
  ```

  Then run anchor checks for all required `UC-*`, AP gates, L6 owners, L2 build, and AI lifecycle terms.
