# Learner/Org Employee AI Direct Route Guard Post-Repair Browser Rerun

Task id: `learner-org-employee-ai-direct-route-guard-post-repair-browser-rerun-2026-06-25`

Branch: `codex/ai-direct-route-guard-browser-rerun-20260625`

## Goal

Run a redacted local real-browser rerun for the four learner and organization employee rows after
`learner-org-employee-ai-direct-route-authorization-guard-repair-2026-06-25`.

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

- `docs/05-execution-logs/evidence/2026-06-25-learner-org-employee-home-entry-capability-post-repair-browser-rerun.md`
- `docs/05-execution-logs/audits-reviews/2026-06-25-learner-org-employee-home-entry-capability-post-repair-browser-rerun.md`
- `docs/05-execution-logs/evidence/2026-06-25-learner-org-employee-ai-direct-route-authorization-guard-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-25-learner-org-employee-ai-direct-route-authorization-guard-repair.md`

## Requirement Mapping Result

- Standard personal learners and standard organization employees must not enter the advanced learner AI workflow by
  manual `/ai-generation` URL.
- Advanced personal learners and advanced organization employees must retain learner AI workflow access when their
  effective authorization allows it.
- Standard organization employees must not enter the organization training workflow by `/organization-training` direct
  URL.
- Advanced organization employees should be able to discover organization training; whether the route reaches a workflow
  or only an empty state is acceptance-relevant evidence.

## Scope

Allowed actions:

- Reuse the local real browser against `http://127.0.0.1:3000`.
- Read or enter only the owner-approved local private role credentials needed for the four rows.
- Record only redacted row labels, route paths, high-level UI markers, and pass/fail/blocker conclusions.
- Update only task plan, evidence, audit review, project state, and task queue files.
- Commit, fast-forward merge to `master`, push `origin/master`, and delete the merged short branch after validation.

Blocked actions:

- Source, test, schema, seed, migration, package, lockfile, script, or environment file edits.
- DB reads/writes, Provider/model calls, Cost Calibration, staging/prod, payment, external services, PRs, or force push.
- Screenshots, traces, raw HTML/page dumps, cookies, storage, tokens, Authorization headers, credential values, DB rows,
  raw prompts, raw generated content, or raw answer content in evidence.

## Browser Matrix

| Row                         | Home expectation                | Direct route expectation                                                                 |
| --------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------- |
| `personal_standard_student` | No `AI训练`; no `企业训练`      | `/ai-generation` unavailable or denied; no AI workflow                                   |
| `personal_advanced_student` | `AI训练` visible; no `企业训练` | `/ai-generation` reachable; AI workflow visible                                          |
| `org_standard_employee`     | No `AI训练`; no `企业训练`      | `/ai-generation` unavailable or denied; `/organization-training` not an answer workflow  |
| `org_advanced_employee`     | `AI训练` and `企业训练` visible | `/ai-generation` reachable; `/organization-training` workflow or acceptance blocker note |

## Decision Rule

- If all four rows satisfy the matrix, create the next short-branch task for the full 8-row browser rerun.
- If standard learner or standard organization employee can still enter `/ai-generation`, close as blocked evidence and
  choose the next smallest learner AI guard repair.
- If `org_standard_employee` can enter `/organization-training` workflow, close as blocked evidence and choose
  organization training employee entry/guard repair.
- If `org_advanced_employee` still cannot reach an organization training workflow, close as blocker evidence and do not
  run full 8-row rerun yet.

## Validation Plan

- Browser runtime rerun: four rows, local real browser, redacted evidence.
- `npx.cmd prettier --write --ignore-unknown` for the five allowed docs/state files.
- `npx.cmd prettier --check --ignore-unknown` for the five allowed docs/state files.
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-org-employee-ai-direct-route-guard-post-repair-browser-rerun-2026-06-25`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId learner-org-employee-ai-direct-route-guard-post-repair-browser-rerun-2026-06-25 -SkipRemoteAheadCheck`
