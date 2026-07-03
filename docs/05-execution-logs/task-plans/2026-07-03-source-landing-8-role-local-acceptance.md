# 2026-07-03 Source Landing 8 Role Local Acceptance Task Plan

## Task

- Task ID: `source-landing-8-role-local-acceptance-2026-07-03`
- Branch: `codex/source-landing-8-role-local-acceptance-2026-07-03`
- Request: execute the approved local 8-role acceptance sequence, produce redacted evidence, and record `pass` / `fail` / `block` honestly.
- Stop rule: stop on the first product defect or blocking fixture/data gap and split repair work before further acceptance execution.

## Readiness Sources

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-07-03-source-landing-16-package-execution-map.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-redeem-code-edition-and-plaintext-ops-decision.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`
- `docs/05-execution-logs/acceptance/2026-07-03-source-landing-16-package-role-acceptance-matrix.md`
- `docs/05-execution-logs/acceptance/2026-07-03-source-landing-16-package-acceptance-materials-pack.md`
- `docs/05-execution-logs/acceptance/2026-07-03-source-landing-16-package-acceptance-approval-pack.md`

## Scope

- In scope: local dev server started by Playwright webServer when needed, localhost browser execution, existing e2e specs only, redacted execution report, evidence, audit, state and queue updates.
- In scope test-owned runtime actions: local app API/UI mutations performed by existing specs for their own acceptance artifacts.
- Out of scope: product source edits, test source edits, dependency changes, schema or migration changes, direct DB connection, env secret access, Provider calls, staging/prod/deploy, Cost Calibration, release readiness, final Pass, production usability claims.

## Role Order

1. `personal_standard_student`
2. `personal_advanced_student`
3. `org_standard_employee`
4. `org_advanced_employee`
5. `org_standard_admin`
6. `org_advanced_admin`
7. `content_admin`
8. `ops_admin`

`super_admin` is not a primary role. It may appear only as a privilege-overlay requirement in system-admin/content/ops conclusions, not as a replacement for any of the 8 roles.

## Execution Sequence

1. Preflight: confirm branch, scope, local Playwright availability, and whether port `3000` is already occupied.
2. Baseline credential-backed account/session smoke: run the existing local full-loop baseline account spec with line reporter and trace disabled.
3. Role-by-role execution in the required order using existing specs only; record positive and negative checks where a spec covers them.
4. On first `fail` or `block`, stop execution, write redacted evidence, and split the repair task.
5. If no failure/block appears, complete all 8 role rows and record residual gaps without claiming release readiness.
6. Run scoped formatting/governance gates and make a local evidence commit. Fast-forward merge, push, and branch cleanup require fresh closeout approval after the result is known.

## Redaction Rules

Evidence may include role names, route categories, assertion categories, command names, exit status, elapsed result, and concise failure/block summaries. Evidence must not include credentials, session values, cookies, auth headers, env values, DB rows, internal numeric ids, PII, plaintext `redeem_code`, Provider payloads, Prompt text, AI input/output, full generated content, raw question/paper/material/resource/chunk content, screenshots, traces, or DOM dumps.

## Planned Commands

```powershell
npm.cmd exec -- playwright test e2e/local-full-loop-baseline-accounts-auth-db.spec.ts --project=chromium --reporter=line --trace=off
npm.cmd exec -- playwright test e2e/student-practice-mock-entry.spec.ts --project=chromium --reporter=line --trace=off
npm.cmd exec -- playwright test e2e/personal-ai-generation-local-request.spec.ts --project=chromium --reporter=line --trace=off
npm.cmd exec -- playwright test e2e/edition-aware-authorization-local-flow.spec.ts --project=chromium --reporter=line --trace=off
npm.cmd exec -- playwright test e2e/local-full-loop-organization-training-analytics-ai-generation-role-flow.spec.ts --project=chromium --reporter=line --trace=off
npm.cmd exec -- playwright test e2e/admin-role-denial-browser.spec.ts --project=chromium --reporter=line --trace=off
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-03-source-landing-8-role-local-acceptance.md docs/05-execution-logs/acceptance/2026-07-03-source-landing-8-role-local-acceptance-report.md docs/05-execution-logs/evidence/2026-07-03-source-landing-8-role-local-acceptance.md docs/05-execution-logs/audits-reviews/2026-07-03-source-landing-8-role-local-acceptance.md docs/01-requirements/traceability/2026-07-03-source-landing-8-role-local-acceptance-gap-split.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId source-landing-8-role-local-acceptance-2026-07-03
```

## Adversarial Checks

- A role cannot be marked `pass` unless at least one source-backed assertion covers the role actor and one assertion covers a negative or denial boundary.
- A route-fulfilled or synthetic context can support a narrow UI assertion, but it cannot silently substitute for a missing credential-backed local role when the matrix requires real local role acceptance.
- A green command cannot override forbidden evidence or missing fixture provenance.
- Existing specs that require Provider, direct DB, env secrets, stale token contracts, staging, or screenshots/traces are excluded from this run.
