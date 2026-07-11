# 0704 Localhost UI Polish

## Task Metadata

- taskId: `0704-localhost-ui-polish-2026-07-10`
- branch: `codex/0704-localhost-ui-polish`
- base: `origin/master@889c586667509529ef0169ba3382fd2b74d7590a`
- status: `ready_for_closeout`
- scope: use the existing 0704DB-backed localhost app to assess current UI and apply only small focused UI fixes.

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-ui-remediation-baseline.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-0-shared-foundations-baseline.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-1-public-auth-profile-baseline.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-2-admin-shell-baseline.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-3-learner-core-baseline.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-4-learner-advanced-baseline.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-5-content-ai-baseline.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-local-design-board-materialization.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-baseline-design-review.md`
- `docs/01-requirements/traceability/2026-07-02-redeem-code-edition-and-plaintext-ops-decision.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/01-requirements/standard-edition/modules/01-user-auth.md`
- `docs/01-requirements/standard-edition/modules/02-question-paper.md`
- `docs/01-requirements/standard-edition/modules/03-student-experience.md`
- `docs/01-requirements/standard-edition/modules/04-ai-scoring.md`
- `docs/01-requirements/standard-edition/modules/05-rag-knowledge.md`
- `docs/01-requirements/standard-edition/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/modules/`
- `docs/01-requirements/advanced-edition/stories/`
- `docs/05-execution-logs/evidence/2026-07-07-full-role-uiux-local-browser-acceptance.md`
- `docs/05-execution-logs/audits-reviews/2026-07-07-full-role-uiux-local-browser-acceptance-adversarial-audit.md`
- `docs/05-execution-logs/evidence/2026-07-07-shared-ui-state-context-bands-evidence.md`
- `docs/05-execution-logs/audits-reviews/2026-07-07-shared-ui-state-context-bands-adversarial-audit.md`
- `docs/05-execution-logs/evidence/2026-07-10-0704-code-readonly-preview-risk-assessment-evidence.md`
- `docs/05-execution-logs/audits-reviews/2026-07-10-0704-code-readonly-preview-risk-assessment-audit.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-code-readonly-preview-risk-assessment.md`
- `docs/05-execution-logs/evidence/2026-07-10-0704-owner-preview-provider-gate-hardening-evidence.md`
- `docs/05-execution-logs/audits-reviews/2026-07-10-0704-owner-preview-provider-gate-hardening-audit.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-localhost-acceptance-summary-archive.md`
- `docs/05-execution-logs/evidence/2026-07-10-0704-summary-archive-decision-framework-evidence.md`
- `docs/05-execution-logs/audits-reviews/2026-07-10-0704-summary-archive-decision-framework-audit.md`
- `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux/README.md`
- `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux/manifest.redacted.json`
- `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux/index.html`
- `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux/page-matrix.html`

## Execution Boundary

- Use localhost or `127.0.0.1` only, with the existing 0704DB-backed local environment.
- Do not print, copy, store, or evidence DB URLs, env values, credentials, sessions, cookies, tokens, browser storage, Provider payloads, raw prompts, raw AI output, raw DB rows, internal numeric IDs, or complete question/paper/material/resource/chunk content.
- Provider-enabled behavior is blocked. Runtime credential presence must not be used to trigger Provider execution.
- No staging, production, deploy, secret, env, Cost Calibration, schema, migration, seed, package, lockfile, or dependency change.
- No screenshots, raw DOM, traces, or videos unless the user explicitly approves in the same turn.
- If login is required, read `D:/tiku-local-private/acceptance/0704-role-credential-index.private.md` only for in-memory login input.

## UI Assessment Plan

1. Confirm git branch, clean state, and master/origin alignment.
2. Start or reuse the localhost dev server without exposing env output.
3. Perform a read-only UI pass first, recording only redacted status categories:
   - role workbench first screen after login
   - learner AI training, practice, mock exam, mistake book, report
   - organization admin employees, authorization, training, statistics
   - content admin question bank, papers, resources, AI draft/review
   - ops admin organization authorization, redeem code, account, logs
   - standard/advanced edition boundary states
   - empty, error, loading, disabled states
   - mobile learner and desktop admin layout
   - copy clarity, button affordance, table scanability
4. Prioritize issues by user impact, role boundary risk, and fix blast radius.
5. Apply minimal UI fixes that match the existing design system and current component patterns.

## Candidate Fix Surface

- Learner desktop shell readability while preserving mobile-first behavior.
- Learner AI training boundary clarity for standard versus advanced edition.
- Shared empty/error/loading/disabled wording where current pages leak unavailable or ambiguous states.
- Small table/list readability fixes in admin pages only if verified and low risk.

## Validation Plan

- Targeted failing-first tests for changed UI behavior.
- Focused Vitest for touched components/pages.
- `corepack pnpm@10.26.1 run lint`
- `corepack pnpm@10.26.1 run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId 0704-localhost-ui-polish-2026-07-10`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId 0704-localhost-ui-polish-2026-07-10 -SkipRemoteAheadCheck`
- After merge to `master`, rerun the required gates on `master` and push only if clean.

## Evidence Plan

- Evidence path: `docs/05-execution-logs/evidence/2026-07-10-0704-localhost-ui-polish-evidence.md`
- Audit path: `docs/05-execution-logs/audits-reviews/2026-07-10-0704-localhost-ui-polish-audit.md`
- Allowed evidence fields: role label, route label, status category, problem category, fix summary, command name, test count, pass/fail.
- Explicit non-claim: localhost UI optimization only. No staging readiness, production readiness, final release readiness, or Provider readiness claim.

## Adversarial Review Focus

- Permission boundary: no role can infer or access another role's workspace from UI state.
- Data boundary: no raw identifiers, private values, prompt/provider payloads, or complete content bodies in evidence.
- Edition boundary: standard unavailable states must not show advanced workflow shells as usable.
- Employee/admin isolation: employee training views and admin organization views stay separated.
- UI state completeness: empty, error, loading, disabled, and unavailable states remain explicit and actionable.
- Design compliance: token-driven styling, no hardcoded brand-breaking colors, no broad redesign, no nested decorative cards, no package or lockfile drift.
