# Organization Training Employee Visible Scope Post-Repair Browser Rerun Plan

Task id: `organization-training-employee-visible-scope-post-repair-browser-rerun-2026-06-25`

Branch: `codex/org-training-visible-scope-rerun-20260625`

## Goal

Run a focused, credentialed, redacted local real-browser rerun for the two organization employee rows after
`organization-training-advanced-employee-empty-state-source-diagnosis-repair-2026-06-25`.

No Standard/Advanced MVP final Pass will be claimed.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-25-organization-training-advanced-employee-empty-state-source-diagnosis-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-25-organization-training-advanced-employee-empty-state-source-diagnosis-repair.md`
- `docs/05-execution-logs/evidence/2026-06-25-organization-training-employee-effective-context-post-repair-browser-rerun.md`
- `docs/05-execution-logs/audits-reviews/2026-06-25-organization-training-employee-effective-context-post-repair-browser-rerun.md`

## Requirement Mapping Result

- `org_standard_employee` must not enter organization-training answer workflow by direct `/organization-training`.
- `org_advanced_employee` should reach assigned organization-training answer workflow when valid advanced `org_auth`
  context and visible publication scope exist.
- Full 8-row browser rerun remains blocked unless both focused rows satisfy the decision rule below.

## Scope

Allowed actions:

- Use the local in-app browser against `http://127.0.0.1:3000`.
- Read or enter only the owner-approved local private credentials for `org_standard_employee` and
  `org_advanced_employee`.
- Record only redacted role labels, route paths, high-level UI markers, and pass/fail/blocker conclusions.
- Update only task plan, evidence, audit review, project state, and task queue files.
- Commit, fast-forward merge to `master`, push `origin/master`, and delete the merged short branch after validation.

Blocked actions:

- Source, test, schema, seed, migration, package, lockfile, script, or environment file edits.
- DB reads/writes, Provider/model calls, Cost Calibration, staging/prod, payment, external services, PRs, or force push.
- Screenshots, traces, raw HTML/page dumps, cookies, storage, tokens, Authorization headers, credential values, DB rows,
  raw prompts, raw generated content, raw answer content, or raw credential file content in evidence.

## Browser Matrix

| Row                     | Home expectation           | Direct route expectation                                                         |
| ----------------------- | -------------------------- | -------------------------------------------------------------------------------- |
| `org_standard_employee` | No `AI训练`; no `企业训练` | `/organization-training` unavailable, denied, or empty with no answer workflow   |
| `org_advanced_employee` | `AI训练` and `企业训练`    | `/organization-training` shows assigned training and permits answer workflow use |

## Decision Rule

- If both focused rows satisfy the matrix, create the next short-branch task for full 8-row real-browser rerun.
- If `org_standard_employee` can enter organization-training answer workflow, close as blocked evidence and choose the
  next smallest organization-training guard repair.
- If `org_advanced_employee` still cannot reach an assigned answer workflow, close as blocked evidence. Do not run full
  8-row rerun yet. If the next repair needs DB/seed/schema/migration/account mutation, stop for separate approval.

## Validation Plan

- Browser runtime rerun: two organization employee rows, local real browser, redacted evidence.
- `npx.cmd prettier --write --ignore-unknown` for the five allowed docs/state files.
- `npx.cmd prettier --check --ignore-unknown` for the five allowed docs/state files.
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-employee-visible-scope-post-repair-browser-rerun-2026-06-25`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-training-employee-visible-scope-post-repair-browser-rerun-2026-06-25 -SkipRemoteAheadCheck`
