# Task Plan: batch-126-personal-learning-ai-local-browser-flow-e2e-validation

## Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-12-batch-121-personal-learning-ai-local-ui-browser-experience-for-request-and.md`
- `docs/05-execution-logs/evidence/2026-06-12-batch-124-personal-learning-ai-student-local-request-entry-ui.md`
- `docs/05-execution-logs/evidence/2026-06-12-batch-125-personal-learning-ai-redacted-reference-display-integration.md`

## Goal

Run the approved local-only validation suite for the personal-learning-ai local browser flow after the route bridge,
student request entry UI, and redacted result/reference display tasks have closed. This is validation-only and must not
modify product code, tests, e2e specs, dependencies, schema, environment, provider configuration, deploy settings, or
formal generated-content paths.

## Scope

Allowed:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- this task plan, evidence, and audit review

Blocked:

- `src/**`, `tests/**`, `e2e/**`, `package.json`, lockfiles, schema, migrations, env/secret, provider calls, formal
  generated-content write paths, Playwright generated artifacts, deploy, payment, external-service, PR, force-push,
  headed/debug/browser UI mode, and Cost Calibration Gate.

## Validation Plan

1. Record pre-edit readiness on a clean short branch from `master`.
2. Run lint, typecheck, full unit, build, diff, e2e list, and full e2e.
3. Record only pass/fail, counts, command names, and redacted summaries.
4. Run Module Run v2 pre-commit hardening, closeout readiness, and pre-push readiness.
5. Submit a docs/state/evidence-only commit, fast-forward to `master`, push `origin/master`, and delete the short branch.

## Risk Controls

- No product source or e2e spec edits.
- No provider execution or generated content storage.
- No environment, dependency, schema/migration, deploy, payment, or external-service changes.
- Cost Calibration Gate remains blocked.
