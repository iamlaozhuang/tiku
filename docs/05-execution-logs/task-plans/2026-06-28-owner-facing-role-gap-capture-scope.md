# Owner-Facing Role Gap Capture Scope Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans only if a later approved task turns this
> documentation scope into source implementation. This plan is a docs-only requirement alignment and verification-scope
> capture.

**Goal:** Record the owner-confirmed role-by-role experience validation scope so later local walkthroughs and repairs do
not repeat the completed six-role route smoke and do not omit confirmed organization training, AI generation, employee
edition, authorization, Prompt, import, or Chinese UI checks.

**Architecture:** This task writes a requirement traceability document plus redacted evidence and audit notes. It does
not change product source, tests, schema, queue state, runtime data, or environment configuration.

**Tech Stack:** Markdown documentation in the existing Tiku docs tree; validation by scoped Prettier, `git diff --check`,
and project-status diagnostics.

---

## Task Metadata

- Task id: `owner-facing-role-gap-capture-scope-2026-06-28`
- Branch: `codex/owner-role-gap-scope-docs-20260628`
- Task kind: `docs_requirement_alignment`
- Approval boundary: current user instructed to continue after all six role groups were discussed and to document the
  role checklists with a fresh logic review.
- Queue handling: initially planned as traceability/evidence only. During closeout, the pre-commit hook correctly blocked
  the commit because `project-state.yaml` still pointed at the previous task. This task is therefore materialized as a
  closed docs-only task in `project-state.yaml` and `task-queue.yaml` so scope gates use the correct allowed files while
  preserving the cleaned active queue and the remaining staging blocker.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/modules/07-retention-log-governance.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/2026-06-27-standard-advanced-backend-ux-design-first-contract.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/03-standards/glossary.yaml`

## Requirement Decision Map

- Role-separated acceptance roles remain split by edition where the product requires it:
  `personal_standard_student`, `personal_advanced_student`, `org_standard_employee`, `org_advanced_employee`,
  `org_standard_admin`, `org_advanced_admin`, `content_admin`, and `ops_admin`.
- The completed six-role local browser acceptance is historical route evidence only. It must not be repeated as the next
  validation target.
- Standard organization employees do not receive `企业训练` or learner `AI训练`.
- Advanced organization employees receive discoverable `企业训练` and learner `AI训练`, including `AI出题` and `AI组卷`.
- Advanced organization admins receive organization training, organization analytics, organization `AI出题`, and
  organization `AI组卷`; standard organization admins do not.
- Content admins receive content `AI出题` and content `AI组卷` draft/review entries, not direct formal writes.
- Operations admins govern `user`, `organization`, `employee`, `redeem_code`, `authorization`, `personal_auth`,
  `org_auth`, resources, `knowledge_base`, `audit_log`, and `ai_call_log`, but not content authoring.
- Enterprise authorization must support multi-`profession`, multi-`level`, and multi-`subject` scope through reviewed
  atomic authorization scope semantics.
- `prompt_template` viewing/editing is accepted only as a high-privilege `super_admin` or explicit
  `prompt_template:read/write` capability, not as ordinary `ops_admin` editing.
- All future page walkthroughs must inspect Chinese UI wording and interaction quality, not only route reachability.

## Requirement Mapping

| Area                   | Mapping                                                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Learner base flows     | `03-student-experience.md` defines practice, `mock_exam`, `exam_report`, and `mistake_book`.                                                                             |
| Learner AI             | Advanced `03-personal-ai-generation.md` and AI scope clarification define `AI训练`, `AI出题`, and `AI组卷`.                                                              |
| Organization training  | Advanced `04-organization-training.md` defines standard denial and advanced admin/employee training.                                                                     |
| Organization analytics | Advanced `05-organization-analytics.md` defines summary analytics and raw-answer privacy boundaries.                                                                     |
| Organization AI        | Advanced `08-organization-ai-generation.md` defines organization-owned AI question and AI `paper` generation.                                                            |
| Ops authorization      | `01-user-auth.md`, `06-admin-ops.md`, advanced ops requirements, ADR-007, and org-auth traceability define edition, upgrade, employee import, and atomic scope behavior. |
| Content backend        | `02-question-paper.md` and `06-admin-ops.md` define formal content; AI scope clarification defines AI draft/review isolation.                                            |
| Prompt governance      | `04-ai-scoring.md`, `06-admin-ops.md`, and glossary define `model_provider`, `model_config`, and `prompt_template` boundaries.                                           |

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-28-local-role-browser-acceptance-hardening.md`
- `docs/05-execution-logs/evidence/2026-06-28-local-full-loop-post-provider-rollup-evidence.md`
- `docs/05-execution-logs/evidence/2026-06-28-local-blocked-gate-supersession-triage.md`

These files prove prior route and local-loop history. They are not used as standalone requirement sources.

## Conflict Check

- No conflict found on standard organization employee training: multiple requirement sources state no `企业训练`.
- The base MVP originally excluded AI 出题 and intelligent group paper generation, but the later standard/advanced MVP
  addendum and advanced edition traceability explicitly add advanced and content draft/review AI flows. The later
  traceability controls this scope.
- Existing Prompt requirements say first release uses configuration files and does not let super admins edit Prompt in
  the backend. The owner accepted a supplemental requirement to track safe `prompt_template` viewing/editing as
  high-privilege or permissioned future scope. This task documents that as future gated validation scope and does not
  claim it is already implemented.
- Current `org_auth` runtime has historical single-scope limitations, while product decisions require future atomic
  multi-scope behavior. This task records the target validation scope without approving schema or migration work.

## Files

- Create:
  `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- Create:
  `docs/05-execution-logs/task-plans/2026-06-28-owner-facing-role-gap-capture-scope.md`
- Create:
  `docs/05-execution-logs/evidence/2026-06-28-owner-facing-role-gap-capture-scope.md`
- Create:
  `docs/05-execution-logs/audits-reviews/2026-06-28-owner-facing-role-gap-capture-scope.md`
- Modify:
  `docs/04-agent-system/state/project-state.yaml`
- Modify:
  `docs/04-agent-system/state/task-queue.yaml`

## Documentation Steps

- [x] **Step 1: Reconfirm repository and queue status**

  Run:

  ```powershell
  git status --short --branch
  git rev-parse HEAD
  git rev-parse origin/master
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1
  ```

  Expected: clean branch before editing, `HEAD` aligned to `origin/master`, no executable pending task, Cost Calibration
  Gate blocked.

- [x] **Step 2: Read requirement and governance SSOT**

  Read the files listed in `## SSOT Read List`.

- [x] **Step 3: Create short docs branch**

  Run:

  ```powershell
  git checkout -b codex/owner-role-gap-scope-docs-20260628
  ```

- [ ] **Step 4: Write requirement traceability scope**

  Create the traceability document with role taxonomy, role checklists, global Chinese UI checks, blocked gates, and
  gap-capture rules.

- [ ] **Step 5: Write evidence and audit review**

  Record changed files, source mapping, validation results, redaction boundary, and residual blocked gates.

- [ ] **Step 6: Format and validate changed docs**

  Run:

  ```powershell
  npx.cmd prettier --write --ignore-unknown docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md docs/05-execution-logs/task-plans/2026-06-28-owner-facing-role-gap-capture-scope.md docs/05-execution-logs/evidence/2026-06-28-owner-facing-role-gap-capture-scope.md docs/05-execution-logs/audits-reviews/2026-06-28-owner-facing-role-gap-capture-scope.md
  npx.cmd prettier --check --ignore-unknown docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md docs/05-execution-logs/task-plans/2026-06-28-owner-facing-role-gap-capture-scope.md docs/05-execution-logs/evidence/2026-06-28-owner-facing-role-gap-capture-scope.md docs/05-execution-logs/audits-reviews/2026-06-28-owner-facing-role-gap-capture-scope.md
  git diff --check
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1
  ```

## Risk Defenses

- Do not run browser, Playwright, dev server, database, Provider, or staging/prod validation.
- Do not inspect or record credentials, tokens, cookies, localStorage, raw DOM, screenshots, traces, DB rows, Provider
  payloads, prompt text, raw AI output, employee subjective answers, or full `question`/`paper`/`resource`/`chunk`
  content.
- Do not edit `package.json`, lockfiles, `.env*`, source, tests, schema, migrations, scripts, or queue state.
- Do not claim runtime behavior changed, release readiness, Cost Calibration readiness, staging readiness, production
  readiness, or final Pass.

## Stop Conditions

- Stop before implementation if any role checklist item requires source, schema, migration, database, Provider, runtime,
  payment, OCR/export, staging/prod/deploy, dependency, or external-service work.
- Stop before commit, merge, push, PR, force push, or branch cleanup unless the user gives fresh explicit approval.
