# Learner Org Employee AI Runtime Cookie Session Post Repair Browser Rerun Plan

Task id: learner-org-employee-ai-runtime-cookie-session-post-repair-browser-rerun-2026-06-25

Branch: codex/ai-cookie-rerun-20260625

Status: completed

## SSOT Read List

- AGENTS.md
- docs/04-agent-system/operating-manual.md
- docs/04-agent-system/sop/requirement-ssot-reading-governance.md
- docs/04-agent-system/sop/task-lifecycle-governance.md
- docs/04-agent-system/state/project-state.yaml
- docs/04-agent-system/state/task-queue.yaml
- docs/03-standards/code-taste-ten-commandments.md
- docs/02-architecture/adr/
- docs/01-requirements/00-index.md
- docs/01-requirements/advanced-edition/00-index.md
- docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md
- docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md
- docs/01-requirements/traceability/role-experience-fulfillment-matrix.md
- docs/05-execution-logs/evidence/2026-06-25-role-separated-full-8-row-post-ai-entry-repair-browser-rerun.md
- docs/05-execution-logs/audits-reviews/2026-06-25-role-separated-full-8-row-post-ai-entry-repair-browser-rerun.md
- docs/05-execution-logs/evidence/2026-06-25-learner-org-employee-ai-runtime-login-prompt-residual-repair.md
- Browser skill documentation for in-app Browser runtime control

## Requirement Mapping Result

Requirement SSOT starts from `docs/01-requirements/00-index.md`. Advanced edition and role-separated acceptance scope is mapped through:

- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`

This task maps only to the runtime evidence side of R5/R6 learner and organization employee AI entry/session acceptance. The source repair already completed in `learner-org-employee-ai-runtime-login-prompt-residual-repair-2026-06-25`; this task verifies the affected browser rows after that repair. It does not create new requirements, alter authorization policy, run the full eight-row gate, or claim final MVP Pass.

## Approval Boundary

- Browser execution approval: current user approved execution of the recommended next step on 2026-06-25.
- Credential handling approval: prior current-user message on 2026-06-25 allowed credential input or credential reads. Credentials may be used only for the four in-scope local role rows and must not be recorded.

## Scope

Run a local real-browser post-repair rerun for four affected rows only:

- `personal_standard_student`
- `personal_advanced_student`
- `org_standard_employee`
- `org_advanced_employee`

Primary check:

- Direct personal AI generation route no longer shows the login prompt for authenticated cookie-backed sessions.

Secondary observations:

- Home AI/training entry visibility and organization training reachability are recorded as residual notes only.

## Blocked Scope

- Full eight-row rerun
- Source/test/package/lockfile changes
- DB, seed, schema, migration, account mutation
- `.env*`
- Browser storage inspection, token/cookie capture, password manager
- Provider, Cost Calibration, staging/prod, payment, external service
- PR, force push, deployment
- Standard/Advanced MVP final Pass claim

## Evidence Policy

Allowed evidence fields:

- Role row label
- Redacted login landing path
- Route reachability status
- Whether direct personal AI route shows login prompt
- Denial/redirect/no-access status for out-of-role routes
- Logout status
- Console error/warn count
- Row result and redacted notes

Disallowed evidence fields:

- Account identifiers, passwords, credential values
- Tokens, cookies, local/session storage, Authorization headers
- Raw HTML, screenshots, traces, database rows
- Provider payloads, prompts, generated content

## Validation Commands

- npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-25-learner-org-employee-ai-runtime-cookie-session-post-repair-browser-rerun.md docs/05-execution-logs/evidence/2026-06-25-learner-org-employee-ai-runtime-cookie-session-post-repair-browser-rerun.md docs/05-execution-logs/audits-reviews/2026-06-25-learner-org-employee-ai-runtime-cookie-session-post-repair-browser-rerun.md
- npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-25-learner-org-employee-ai-runtime-cookie-session-post-repair-browser-rerun.md docs/05-execution-logs/evidence/2026-06-25-learner-org-employee-ai-runtime-cookie-session-post-repair-browser-rerun.md docs/05-execution-logs/audits-reviews/2026-06-25-learner-org-employee-ai-runtime-cookie-session-post-repair-browser-rerun.md
- git diff --check
- powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-org-employee-ai-runtime-cookie-session-post-repair-browser-rerun-2026-06-25
- powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId learner-org-employee-ai-runtime-cookie-session-post-repair-browser-rerun-2026-06-25 -SkipRemoteAheadCheck

## Non-Goal

This task can confirm the four-row browser residual status after the source repair. It cannot close the full role-separated gate or declare a Standard/Advanced MVP final Pass.
