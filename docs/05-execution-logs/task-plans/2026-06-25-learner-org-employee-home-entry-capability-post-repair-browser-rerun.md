# Learner/Org Employee Home Entry Capability Post-Repair Browser Rerun

Task id: `learner-org-employee-home-entry-capability-post-repair-browser-rerun-2026-06-25`

Branch: `codex/home-entry-browser-rerun-20260625`

## Goal

Run a redacted local real-browser rerun for the four learner/organization employee rows after the effective authorization
capability-discovery source repair. The rerun decides whether the next step is the full eight-row browser rerun or the
minimal `organization_training_employee_entry_guard` source repair.

No Standard/Advanced MVP final Pass will be claimed.

## SSOT Read List

- `AGENTS.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-25-learner-org-employee-ai-runtime-cookie-session-post-repair-browser-rerun.md`
- `docs/05-execution-logs/audits-reviews/2026-06-25-learner-org-employee-ai-runtime-cookie-session-post-repair-browser-rerun.md`
- `docs/05-execution-logs/evidence/2026-06-25-learner-org-employee-home-entry-capability-discovery-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-25-learner-org-employee-home-entry-capability-discovery-repair.md`
- `docs/05-execution-logs/evidence/2026-06-25-organization-admin-private-account-post-repair-browser-rerun.md`

## Requirement Mapping Result

- R5 / personal AI generation: `personal_advanced_student` must see a discoverable `AI训练` entry after login, while
  `personal_standard_student` must not receive advanced AI generation capability.
- R6 / organization employee navigation: `org_advanced_employee` must see `AI训练` and `企业训练`; `org_standard_employee`
  must see neither and direct advanced or enterprise-training route access must be denied or unavailable.
- Organization training module: standard organization employees cannot access training through menu visibility or manual
  URL entry; advanced organization employees must have discoverable training entry.

## Scope

Allowed actions:

- Reuse the local dev browser against `http://127.0.0.1:3000`.
- Read or enter only the owner-approved local role account credentials needed for these four rows.
- Record row-level outcomes with all sensitive fields redacted.
- Update only task plan, evidence, audit review, project state, and task queue files.
- Commit, fast-forward merge to `master`, push `origin/master`, and delete the merged short branch after validation.

Blocked actions:

- Source, test, schema, seed, migration, package, lockfile, script, or environment file edits.
- DB reads or writes, Provider/model calls, Cost Calibration, staging/prod, payment, external services, PRs, or force push.
- Screenshots, traces, raw HTML/page dumps, cookies, storage, tokens, Authorization headers, credential values, DB rows, or
  raw answer content in evidence.

## Browser Matrix

| Row                         | Home entry expectation          | Direct route expectation                                      |
| --------------------------- | ------------------------------- | ------------------------------------------------------------- |
| `personal_standard_student` | No `AI训练`; no `企业训练`      | `/ai-generation` denied, unavailable, or no advanced workflow |
| `personal_advanced_student` | `AI训练` visible; no `企业训练` | `/ai-generation` reachable without login prompt               |
| `org_standard_employee`     | No `AI训练`; no `企业训练`      | `/organization-training` denied or unavailable                |
| `org_advanced_employee`     | `AI训练` and `企业训练` visible | `/ai-generation` and `/organization-training` reachable       |

## Decision Rule

- If all four rows satisfy their home-entry and direct-route expectations, open the full eight-row browser rerun as a
  separate short-branch task.
- If `org_standard_employee` can still enter the `/organization-training` workflow by direct URL, do not run the full
  eight-row rerun in this task chain. Close this rerun as blocked evidence and make
  `organization_training_employee_entry_guard` the next minimal source repair.

## Validation Plan

- Browser runtime rerun: four rows, local real browser, redacted evidence.
- `npx.cmd prettier --write --ignore-unknown` for the five allowed docs/state files.
- `npx.cmd prettier --check --ignore-unknown` for the five allowed docs/state files.
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-org-employee-home-entry-capability-post-repair-browser-rerun-2026-06-25`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId learner-org-employee-home-entry-capability-post-repair-browser-rerun-2026-06-25 -SkipRemoteAheadCheck`
