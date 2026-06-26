# Provider Cost real Provider paper composition smoke execution task plan

Task id: `provider-cost-real-provider-paper-composition-smoke-execution-2026-06-26`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`

## Approval Source

- Fresh user approval in the current Codex thread at `2026-06-26T12:49:54-07:00`.
- Approved provider/model: `alibaba-qwen` / `qwen3.7-max` through `openai_compatible`.
- Approved credential alias: `ALIBABA_API_KEY`.
- Approved Provider call cap: 1.
- Approved retry cap: 0.
- Approved token cap: 2000 total.
- Approved budget cap: USD 1.00.
- Approved route/workflow: content admin `content_ai_paper_generation` followed by formal draft composition adoption.
- Approved draft-only composition cap: 1 companion `question` draft, 1 `paper_section`, and 1 `paper_question`.
- Explicitly not approved: publish, student-visible content, staging/prod, payment, external service, deployment/release
  readiness, Cost Calibration Gate, or final Pass.

## Requirement Decision Map

- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md` allows content admin
  generated `paper` output to become a formal `paper` only through governed review and adoption.
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md` requires generated content to
  stay separate from formal content unless an approved adoption path is used.
- `docs/01-requirements/modules/02-question-paper.md` defines formal `paper` draft composition through
  `paper_section` and `paper_question`, while publish remains a separate validation boundary.
- ADR-002 requires route/service/repository layering; this smoke uses existing route/service contracts and does not
  change source.
- ADR-004 and ADR-005 keep this local-only; staging/prod and release readiness remain blocked.
- ADR-006 records installed AI SDK packages as dependency availability only; the Provider call is allowed here only by
  the fresh user approval above.

## Requirement Mapping

This task proves the Provider/Cost boundary after the existing local composition route smoke:

1. Execute exactly one real Provider call for the content admin `content_ai_paper_generation` route-integrated runner.
2. Use the same redacted content admin generated result reference from that local route response as the source for a
   governed formal adoption request.
3. Create only an editable formal draft `paper`, with one companion draft `question`, one `paper_section`, and one
   `paper_question`.
4. Record only redacted status/count/token/latency/public-id-presence evidence.

This task does not prove publish, student visibility, staging/prod readiness, release readiness, or Cost Calibration.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-26-provider-cost-boundary-or-real-provider-paper-composition-smoke-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-provider-cost-boundary-or-real-provider-paper-composition-smoke-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-formal-paper-draft-composition-route-integration-local-smoke.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-formal-paper-draft-composition-route-integration-local-smoke.md`
- `docs/05-execution-logs/evidence/2026-06-26-ai-generation-provider-route-integrated-smoke-execution.md`

## Conflict Check

No requirement conflict was found. Existing implementation still prevents unapproved Provider execution by default. This
task consumes a fresh approval for one controlled Provider smoke and keeps formal publish/student visibility blocked.

The current DB task persistence adapter enforces a historical provider-disabled boundary for persisted admin AI task
metadata. The smoke therefore records the real Provider route runner evidence through a controlled local route harness
and uses a governed formal adoption repository boundary for draft-only composition without broadening source code or
schema.

## Execution Plan

1. Run the focused unit tests for admin AI generation runtime bridge and formal draft adapter/runtime.
2. Create a transient repository-root `tsx` smoke harness and remove it after execution.
3. The harness will:
   - load only the approved local credential alias without printing or persisting the value;
   - execute one content admin `content_ai_paper_generation` POST through `createAdminAiGenerationLocalContractRouteHandlers`;
   - use the existing controlled Provider runner with `maxRequests: 1`, `maxRetries: 0`, `timeoutMs: 30000`, and
     `maxOutputTokens` within the approved token cap;
   - execute one formal adoption POST through `createAdminAiGenerationFormalAdoptionRuntimeRouteHandlers`;
   - write only draft `question`, `paper`, `paper_section`, and `paper_question` rows through existing draft services;
   - verify composition counts through the route/adapter result and public-id presence states only.
4. Update evidence and audit review with redacted results.
5. Run scoped Prettier write/check, `git diff --check`, Module Run v2 precommit hardening, and prepush readiness.
6. Commit, fast-forward merge to `master`, push `origin/master`, and delete the short branch if validation passes.

## Call Caps

- Provider calls: max 1.
- Provider retries: 0.
- Token cap: 2000 total.
- Budget cap: USD 1.00.
- Content paper setup POST: max 1.
- Formal adoption POST: max 1.
- Companion question draft creation: max 1.
- `paper_section` rows: max 1.
- `paper_question` rows: max 1.
- Formal publish/student-visible content: 0.
- Staging/prod/payment/external service/deploy/release readiness/final Pass: 0.

## Scope

Allowed:

- Docs/state/evidence/audit updates for this task.
- One controlled real Provider call through existing local route-integrated Provider runner.
- Read approved credential alias `ALIBABA_API_KEY`; never print, persist, commit, or summarize the value.
- Existing local runtime DB configuration read through existing runtime code; no DB URL in evidence.
- Draft-only formal `question` and `paper` composition through existing route/service/adapter path.

Blocked:

- Source/test/package/lockfile/env/schema/migration changes.
- Provider configuration changes, fallback changes, Cost Calibration Gate execution, or pricing-table calibration.
- Raw prompt, raw output, raw Provider payload, raw generated result body, raw reviewed draft, full formal content, raw
  DB rows, DB URL, secret, token, cookie, Authorization header, or credential material in evidence.
- Cleanup delete, seed, data repair, destructive DB operation, or migration.
- Formal publish, student-visible content, staging/prod, deployment, payment, external service, release readiness, PR,
  force push, or final Pass.

## Validation Commands

- `npm.cmd run test:unit -- src/server/services/admin-ai-generation-runtime-bridge-service.test.ts src/server/services/admin-ai-generation-formal-draft-adapter.test.ts src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts`
- `node_modules\.bin\tsx.cmd <transient-repo-root-provider-paper-composition-smoke-harness>`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-provider-cost-real-provider-paper-composition-smoke-execution.md docs/05-execution-logs/evidence/2026-06-26-provider-cost-real-provider-paper-composition-smoke-execution.md docs/05-execution-logs/audits-reviews/2026-06-26-provider-cost-real-provider-paper-composition-smoke-execution.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-provider-cost-real-provider-paper-composition-smoke-execution.md docs/05-execution-logs/evidence/2026-06-26-provider-cost-real-provider-paper-composition-smoke-execution.md docs/05-execution-logs/audits-reviews/2026-06-26-provider-cost-real-provider-paper-composition-smoke-execution.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId provider-cost-real-provider-paper-composition-smoke-execution-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId provider-cost-real-provider-paper-composition-smoke-execution-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

- The approved credential alias is missing.
- The Provider call fails or would require a retry.
- Token/cost bounds cannot be respected.
- More than one Provider call, content setup POST, formal adoption POST, companion question draft, `paper_section`, or
  `paper_question` would be required.
- Source/test/schema/migration/package/env changes become necessary.
- Evidence would need to expose any forbidden raw or secret data.
- Publish, student-visible content, staging/prod, payment, external service, deployment/release readiness, or final Pass
  becomes necessary.
