# 2026-07-03 UI/UX Contract Packages Detailed Audit Plan

## Task

Perform a detailed adversarial audit of the six completed UI/UX contract packages, correct any documentation omission or
conflict found, then close out with validation, commit, fast-forward merge, push, and short-branch cleanup.

Task id: `ui-ux-contract-packages-detailed-audit-2026-07-03`

Branch: `codex/uiux-contracts-detailed-audit-2026-07-03`

## Read Baseline

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-redeem-code-edition-and-plaintext-ops-decision.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- Six completed UI/UX contract files and their evidence/audit files.
- Current source files referenced by each contract's source-alignment section.

## Scope

Allowed writes:

- `docs/01-requirements/traceability/2026-07-02-ops-authorization-ui-ux-contract.md`
- `docs/01-requirements/traceability/2026-07-02-organization-training-ui-ux-contract.md`
- `docs/01-requirements/traceability/2026-07-02-organization-analytics-ui-ux-contract.md`
- `docs/01-requirements/traceability/2026-07-02-organization-ai-post-actions-ui-ux-contract.md`
- `docs/01-requirements/traceability/2026-07-02-admin-model-prompt-log-governance-ui-ux-contract.md`
- `docs/01-requirements/traceability/2026-07-02-content-resource-management-ui-ux-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- this plan
- `docs/05-execution-logs/evidence/2026-07-03-ui-ux-contract-packages-detailed-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-07-03-ui-ux-contract-packages-detailed-audit.md`

Blocked:

- Product source or test edits.
- Database schema, migration, seed, direct database action, dependency or lockfile change.
- Browser/runtime acceptance, Provider/model call, env/secret access, deployment, PR, force-push, Cost Calibration,
  release readiness, final Pass, and production-usability claims.

## Audit Method

1. Verify state/queue closeout chain for the six packages and the post-closeout evidence normalization.
2. Build a per-package decision-anchor matrix from the current-thread ledger and decision package.
3. Check each contract for required decisions, role boundaries, source gap registers, non-claims, and redaction limits.
4. Re-read source snippets that the contracts cite for current implementation posture.
5. Patch only confirmed documentation omissions or contradictions.
6. Record two self-review passes after patching and run local documentation gates.

## Package Checklist

- Package 1: operations authorization, `org_auth`, `redeem_code`, employees, organization tree, and pagination.
- Package 2: organization training source, four-step wizard, lifecycle, employee answer/result, and AI handoff.
- Package 3: organization analytics, weak points, formal-learning separation, privacy, and quota-summary exclusion.
- Package 4: organization AI generated-output review and copy-to-training-draft handoff.
- Package 5: model config, connection test, Prompt registry, AI call logs, audit logs, and redaction.
- Package 6: content resource management, content workspace ownership, legacy operations entry cleanup, and
  non-technical lifecycle UX.

## Validation

- `npm.cmd run format:check`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ui-ux-contract-packages-detailed-audit-2026-07-03`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ui-ux-contract-packages-detailed-audit-2026-07-03`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ui-ux-contract-packages-detailed-audit-2026-07-03 -SkipRemoteAheadCheck`

## Risk Controls

- Treat source inspection as read-only evidence; do not convert gaps into implementation work.
- Do not reopen already-decided product scope unless a direct conflict is found.
- Do not record credentials, tokens, sessions, cookies, Authorization headers, env values, DB rows, plaintext card
  values, provider payloads, raw prompts, raw AI IO, raw employee answers, or full content.
- Do not declare release readiness, final Pass, or production usability.
