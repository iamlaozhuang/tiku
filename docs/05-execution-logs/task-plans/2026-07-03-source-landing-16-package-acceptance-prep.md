# 2026-07-03 Source Landing 16 Package Acceptance Prep Plan

## Task

Task id: `source-landing-16-package-acceptance-prep-2026-07-03`

Branch: `codex/source-landing-16-package-acceptance-prep-2026-07-03`

Goal: materialize acceptance execution preparation packages for the closed 16 source landing packages without running
acceptance, starting a dev server, running browser validation, changing product source, or claiming release readiness,
final Pass, production usability, Provider readiness, Cost Calibration, staging/prod readiness, or broad runtime
acceptance.

## Required Sources Read

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
- Sixteen package task plans, evidence, and audits under `docs/05-execution-logs/*/2026-07-03-*-source-landing.md`.

## Allowed Writes

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-03-source-landing-16-package-acceptance-prep.md`
- `docs/05-execution-logs/acceptance/2026-07-03-source-landing-16-package-role-acceptance-matrix.md`
- `docs/05-execution-logs/acceptance/2026-07-03-source-landing-16-package-acceptance-materials-pack.md`
- `docs/05-execution-logs/acceptance/2026-07-03-source-landing-16-package-acceptance-approval-pack.md`
- `docs/05-execution-logs/evidence/2026-07-03-source-landing-16-package-acceptance-prep.md`
- `docs/05-execution-logs/audits-reviews/2026-07-03-source-landing-16-package-acceptance-prep.md`

## Blocked Scope

- Product source, tests, package manifests, lockfiles, schema, migrations, seeds, scripts, environment files, local private
  data, DB connections, DB mutation, Provider/model calls, Prompt edits, browser/dev-server/e2e/runtime acceptance,
  staging/prod/cloud/deploy, PR, force push, release readiness, final Pass, production usability, and Cost Calibration.
- Plaintext `redeem_code`, credentials, tokens, sessions, cookies, Authorization headers, env values, raw DB rows, internal
  numeric ids, PII, raw Prompt/full Prompt text, Provider payloads, raw AI IO, raw employee answers, full
  question/paper/material/resource/chunk content, screenshots, traces, raw DOM, or exported raw reports in evidence.

## Preparation Outputs

1. Role acceptance matrix with 8 primary roles:
   `personal_standard_student`, `personal_advanced_student`, `org_standard_employee`, `org_advanced_employee`,
   `org_standard_admin`, `org_advanced_admin`, `content_admin`, and `ops_admin`.
2. Acceptance materials pack that lists safe fixtures, source/evidence anchors, data prerequisites, execution sequence,
   and redaction requirements.
3. Approval pack that separates acceptance execution approval from release readiness and records `super_admin` as a
   privileged coverage item, not a primary role axis.
4. Evidence and audit files with two adversarial self-reviews:
   - package-order pass across all 16 source landing packages;
   - role/process-order pass across the 8 role and flow axes.

## Implementation Approach

- Use first-principles acceptance design: a role can do only what runtime authorization, edition, organization context,
  quota ownership, and source package evidence support; UI visibility is never treated as the authorization boundary.
- For every role, document allowed and denied flows, visible and non-visible entries, UI/UX expectations, data
  prerequisites, success and blocking paths, audit/log requirements, requirement IDs, evidence anchors, acceptance status,
  and follow-up-task status.
- For every requirement conclusion, cite at least one requirement/traceability source plus at least one source-landing
  evidence or test/source anchor where implementation is claimed.
- Mark each requirement point as `landed`, `partial`, `follow_up_task`, `conflict_pending`, or `not_needed`.
- Keep all language at acceptance-preparation level; do not state that acceptance has passed or that the system is
  release-ready.

## Validation Commands

- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-03-source-landing-16-package-acceptance-prep.md docs/05-execution-logs/acceptance/2026-07-03-source-landing-16-package-role-acceptance-matrix.md docs/05-execution-logs/acceptance/2026-07-03-source-landing-16-package-acceptance-materials-pack.md docs/05-execution-logs/acceptance/2026-07-03-source-landing-16-package-acceptance-approval-pack.md docs/05-execution-logs/evidence/2026-07-03-source-landing-16-package-acceptance-prep.md docs/05-execution-logs/audits-reviews/2026-07-03-source-landing-16-package-acceptance-prep.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId source-landing-16-package-acceptance-prep-2026-07-03`

No lint, typecheck, unit, browser, dev server, DB, Provider, staging/prod, or acceptance execution is planned because
this task is docs/state acceptance-preparation only.

## Review Checklist

- 16-package pass follows the exact requested package order.
- 8-role/process pass follows the requested role order and includes positive and negative acceptance design.
- `super_admin` appears only as a privileged coverage item in ops/content/system-admin rows and the approval pack.
- Every role row has source/evidence anchors and a clear status.
- Evidence explicitly records non-execution of acceptance/runtime/browser/dev-server/DB/Provider.
