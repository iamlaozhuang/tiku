# Preview Release Scope Decision Package

## Task

- Task id: `preview-release-scope-decision-package`
- Scope: docs/state-only release scope decision.
- User approval: user explicitly requested executing this docs/state-only task to fix the first preview release include/exclude scope.
- Branch: `codex/preview-release-scope-decision-package`

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`

## Current Facts

- `master` and `origin/master` are both `3883d8dbcd05da4ffba26267b0b4d3a873b8e166`.
- Queue slimming is clean with 51 active tasks, 43 non-terminal tasks, 8 terminal recovery-window tasks, and 0 archive candidates.
- Local experience matrix has 32 use cases: 21 `experience_closed`, 11 `release_blocked`.
- Mechanism next action is guarded seed proposal for `ai-task-and-provider`, not preview deployment.

## Decision Goal

Define the first preview release scope as a governance checkpoint:

- Include only already local-closed, low-risk Web flows that do not require provider/env/schema/deploy/payment/external-service execution in this task.
- Exclude or defer AP-01 through AP-11 high-risk gates unless a later task receives fresh approval and scoped implementation evidence.
- Keep preview release readiness as `false` until release-scope implementation, staging design, deployment, and acceptance gates are separately approved.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- `docs/05-execution-logs/task-plans/2026-06-22-preview-release-scope-decision-package.md`
- `docs/05-execution-logs/evidence/2026-06-22-preview-release-scope-decision-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-22-preview-release-scope-decision-package.md`

## Blocked Files And Actions

- No source code, tests, schemas, migrations, dependency manifests, lockfiles, `.env*`, provider calls, browser/e2e, deployment, PR, force-push, or database changes.
- No staging/prod resource creation, cloud configuration, secret/env access, provider execution, payment/OCR/export execution, or Cost Calibration Gate execution.
- No claim that the preview environment is ready to deploy.

## Plan

1. Add a closed docs/state task packet for this scope decision with strict allowed files and blocked capabilities.
2. Record a project-state `previewReleaseScopeDecisionPackage20260622` checkpoint with first-preview include/exclude/defer lists.
3. Preserve the terminal recovery window by archiving the displaced terminal task.
4. Write evidence and audit review.
5. Run queue diagnostics, project status, next action, Prettier, lint, typecheck, `git diff --check`, and Module Run v2 pre-commit hardening.
6. Commit, fast-forward merge to `master`, and clean the short branch locally.

## Risk Controls

- Scope decision is documentation/governance only.
- All release gates remain blocked unless explicitly approved in a future task.
- Evidence uses task IDs and sanitized category names only; no secrets, provider payloads, raw answers, or full paper content.
