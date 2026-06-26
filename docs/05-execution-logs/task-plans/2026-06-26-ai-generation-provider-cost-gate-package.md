# AI Generation Provider And Cost Gate Package Plan

Task id: `ai-generation-provider-cost-gate-package-2026-06-26`

Branch: `codex/ai-provider-cost-gate-package-20260626`

Task kind: `docs_only_provider_cost_gate_package`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
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
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`

## Requirement Decision Map

- ADR-006 records installed AI SDK packages as dependency availability only. Real Provider calls, Provider
  configuration, env/secret reads, raw payload evidence, and Cost Calibration remain task-scoped gates.
- Advanced AI generation requirements require trackable tasks and redacted `ai_call_log` evidence without exposing
  prompt, Provider payload, secrets, tokens, or raw AI output.
- The previous AI scope inventory concluded that Provider bridge code exists but is not executed by the normal public
  product route.
- The owner has now approved preparing a concrete Provider/Cost and real model call gate package.

## Requirement Mapping

This task maps Provider/Cost execution into a future gate. It does not execute the gate.

The package must decide:

- exact model/provider and endpoint family;
- credential read method for a future execution task;
- maximum call count, retries, timeout, and output budget;
- allowed and blocked evidence fields;
- whether the next Provider task also executes Cost Calibration;
- next task ordering: Provider smoke first or content/organization AI product loop implementation first.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-26-ai-generation-scope-inventory-and-mvp-decision-package.md`
- `src/server/services/personal-ai-generation-route-integrated-provider-execution-service.ts`
- `src/server/services/personal-ai-generation-runtime-bridge-service.ts`
- `src/server/services/ai-generation-task-provider-adapter-service.ts`
- `package.json`

Source files are read only to align gate boundaries with already existing code. They are not edited.

## Conflict Check

No conflict is expected. The gate package must preserve the distinction between:

- an approved future Provider smoke;
- a full Cost Calibration Gate;
- content/organization AI generation product implementation;
- MVP final Pass.

## Allowed Scope

- Create docs-only Provider/Cost gate package, evidence, and audit review.
- Update task queue and project state for recovery and closeout.
- Read current source/provider boundary files only.

## Blocked Scope

- No Provider/model call.
- No `.env*`, credential file, token, or secret read/write.
- No Cost Calibration execution.
- No source, test, e2e, script, schema, migration, package, lockfile, or env edits.
- No browser, Playwright, dev server, DB, seed, account, staging/prod, payment, external-service, PR, force-push, or final
  MVP Pass claim.

## Documentation Approach

1. Create the gate package with an exact future smoke profile.
2. Define evidence redaction and blocked evidence fields.
3. Decide that the first successor execution is a single-call Provider smoke, not full Cost Calibration.
4. Define pass/fail/blocked handling and next task selection.

## Risk Defenses

- Keep the next smoke to one request, zero retries, eight output tokens, and a 30-second timeout.
- Prefer ephemeral owner-supplied `ALIBABA_API_KEY` process environment for future execution; allow `.env.local` read only
  if the future execution task explicitly permits it.
- Record only usage counters, duration, redacted status, and sanitized error code/status.
- Never record raw prompt, raw output, request payload, response body, API key, Authorization header, or stack trace.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-ai-generation-provider-cost-gate-package.md docs/05-execution-logs/acceptance/2026-06-26-ai-generation-provider-cost-gate-package.md docs/05-execution-logs/evidence/2026-06-26-ai-generation-provider-cost-gate-package.md docs/05-execution-logs/audits-reviews/2026-06-26-ai-generation-provider-cost-gate-package.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-ai-generation-provider-cost-gate-package.md docs/05-execution-logs/acceptance/2026-06-26-ai-generation-provider-cost-gate-package.md docs/05-execution-logs/evidence/2026-06-26-ai-generation-provider-cost-gate-package.md docs/05-execution-logs/audits-reviews/2026-06-26-ai-generation-provider-cost-gate-package.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-provider-cost-gate-package-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-provider-cost-gate-package-2026-06-26 -SkipRemoteAheadCheck`

## Evidence And Audit Requirements

- Evidence must include the gate decision and validation results.
- Audit review must approve redaction, scope, and next-task ordering.
- No runtime Provider readiness, Cost Calibration readiness, content/organization AI completion, or MVP final Pass may be
  claimed from this docs-only package.
