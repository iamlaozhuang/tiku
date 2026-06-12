# Task Plan: batch-114-personal-learning-ai-local-e2e-smoke-planning

## Scope

Plan the local E2E smoke boundary for `personal-learning-ai-experience` without running Playwright, editing e2e specs,
or changing product code.

This task is docs-only. It may update durable state, task plan, evidence, and audit review files only.

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/batch-110-personal-learning-ai-local-transport-contract.md`
- `docs/05-execution-logs/evidence/batch-111-personal-learning-ai-request-context-local-contract.md`
- `docs/05-execution-logs/evidence/batch-112-personal-learning-ai-redacted-result-reference-local-contract.md`
- `docs/05-execution-logs/evidence/batch-113-personal-learning-ai-local-ui-browser-planning.md`
- `src/app/api/v1/personal-ai-generation-requests/route.ts` read-only
- `src/server/services/personal-ai-generation-request-route.ts` read-only
- `src/server/services/personal-ai-generation-request-context-service.ts` read-only
- `src/server/services/personal-ai-generation-result-reference-service.ts` read-only
- `playwright.config.ts` read-only
- Existing `e2e/**` specs read-only for candidate assessment.

## Planning Criteria

The future local E2E smoke task can consume `approved_local_only_existing_specs` only when all of these are true:

- the future queued task declares `capabilities.localE2EValidation: approved_local_only_existing_specs`;
- the future queued task names the exact whitelisted command, such as
  `npm.cmd run test:e2e -- e2e/<existing-spec>.spec.ts`;
- the target spec already exists under `e2e/**` at execution time;
- execution stays on localhost or `127.0.0.1` through the checked Playwright config;
- evidence records only command, result, spec name, and test count;
- full e2e suite, headed/debug mode, non-existing specs, provider calls, env/secret, dependency, schema/migration,
  deploy, payment, external service, destructive DB work, and Cost Calibration Gate remain blocked.

## Implementation Plan

1. Inventory existing local Playwright specs and classify whether any can already satisfy the
   `personal-learning-ai-experience` L5 smoke target.
2. Connect the assessment to the completed local contracts: local transport, redacted `paper` and `mock_exam` request
   context, redacted result reference, summary-only `ai_call_log`, and `authorization` boundary.
3. Record the future execution boundary for `localE2EValidation` without running Playwright.
4. Write redacted evidence and audit review.
5. Update durable state and task queue for batch-114 closeout.
6. Run the scoped validation commands and record their results before commit.

## Expected Planning Outcome

The expected conservative outcome is that existing specs provide useful adjacent coverage but no current spec fully
proves `personal-learning-ai-experience`. A future validation task should not run Playwright until a separate queued task
has either wired the student-facing UI/runtime path into an existing local spec or created a dedicated spec that already
exists before the validation task consumes `approved_local_only_existing_specs`.

## Risk Controls

- Do not edit `src/**`, `tests/**`, `e2e/**`, `scripts/**`, package/lockfile, schema, migration, env, or secret files.
- Do not run Playwright, browser UI automation, provider calls, dependency installation, schema/migration commands, or
  Cost Calibration Gate.
- Do not record raw prompts, raw generated AI content, provider payloads, secrets, tokens, database URLs, Authorization
  headers, raw DB rows, plaintext `redeem_code`, full `paper`, or full `material` content.
- Do not claim full L5 runtime closure; claim only local E2E smoke planning readiness.

## Validation Plan

- `node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-11-batch-114-personal-learning-ai-local-e2e-smoke-planning.md docs\05-execution-logs\evidence\batch-114-personal-learning-ai-local-e2e-smoke-planning.md docs\05-execution-logs\audits-reviews\batch-114-personal-learning-ai-local-e2e-smoke-planning.md`
- `Select-String -Path docs\05-execution-logs\task-plans\2026-06-11-batch-114-personal-learning-ai-local-e2e-smoke-planning.md,docs\05-execution-logs\evidence\batch-114-personal-learning-ai-local-e2e-smoke-planning.md,docs\05-execution-logs\audits-reviews\batch-114-personal-learning-ai-local-e2e-smoke-planning.md -Pattern 'personal-learning-ai-experience','approved_local_only_existing_specs','localE2EValidation','authorization','paper','mock_exam','ai_call_log','Cost Calibration Gate remains blocked'`
- `git diff --check`
