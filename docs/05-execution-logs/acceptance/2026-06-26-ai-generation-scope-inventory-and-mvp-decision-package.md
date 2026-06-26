# AI Generation Scope Inventory And MVP Decision Package

Package id: `AI_GENERATION_SCOPE_INVENTORY_AND_MVP_DECISION_PACKAGE_2026_06_26`

Prepared as a docs-only decision package. This package does not claim Standard/Advanced MVP final Pass and does not
execute Provider, Cost, browser, database, credential, staging, production, payment, or external-service work.

## Purpose

Clarify whether the AI出题 and AI组卷 surfaces that appear across learner, content, and organization roles are implemented
features, Provider-only scaffolding, or undeveloped product loops, then define how that affects the next MVP decision.

## Owner Authorization Recorded

The owner added fresh authorization in chat on 2026-06-26 for Provider/Cost and real model call work.

This package records that authorization as a successor-gate input only. The authorization is not consumed by this
docs-only inventory task because this task intentionally does not:

- read `.env*` or credentials;
- configure Provider or fallback chains;
- call a real model;
- measure quota, pricing, usage, or Cost Calibration;
- record raw prompts, provider payloads, or raw generated AI output.

Including Provider/Cost in a final Pass decision still requires a separate task-scoped gate package with redacted
execution evidence.

## Inventory Summary

| Surface                                      | Current implementation state       | What exists                                                                                                                                                                                    | What is still missing for product completion                                                                                                                                  | MVP decision effect                                                                                                             |
| -------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Personal advanced learner `AI训练`           | `local_contract_scaffold`          | Student UI has `AI出题` and `AI组卷` actions, request route, result history/detail routes, request/result repositories, local read models, and redacted evidence boundaries.                   | Normal public route does not execute Provider by default; generated content quality, real model output, quota/cost, and complete adoption remain gated.                       | Entry and local-contract behavior may support local role acceptance, but not real AI generation completion.                     |
| Organization advanced employee `AI训练`      | `partial_local_contract_scaffold`  | Same learner UI can resolve employee organization context and construct local browser experience.                                                                                              | Request persistence path currently accepts personal-auth persistence only; org employee generated result lifecycle, Provider execution, and quota evidence remain incomplete. | Do not treat employee AI generation product loop as complete.                                                                   |
| Content admin `AI出题` / `AI组卷`            | `entry_only`                       | Content routes render an admin entry page with role check, draft/review boundary copy, loading/error/denied states, and no direct formal write claim.                                          | No content AI generation submit API, no form workflow, no task execution, no draft review queue implementation, no Provider execution, no formal adoption workflow evidence.  | Browser role pass can prove discoverable entry and guard only. It cannot prove content AI generation completion.                |
| Organization admin `AI出题` / `AI组卷`       | `entry_only`                       | Organization routes and portal links render an admin entry page with advanced/standard role gate and organization draft boundary copy.                                                         | No organization AI generation submit API, no organization-owned result lifecycle, no draft/confirmation workflow, no Provider execution, no quota/cost evidence.              | Browser role pass can prove discoverable entry and standard denial only. It cannot prove organization AI generation completion. |
| Provider adapter and route-integrated bridge | `provider_bridge_gated`            | AI SDK packages are installed; adapter can create server-side model handles without executing calls; route-integrated Qwen/OpenAI-compatible execution service exists behind explicit control. | Public personal route does not pass `runtimeBridgeControl`; no default env/secret access; no normal UI path calls Provider; no Cost Calibration evidence.                     | Provider readiness is not proven by installed packages or bridge code.                                                          |
| Formal adoption                              | `blocked_review_or_follow_up_only` | Personal AI result formal-adoption review route/service can approve or reject manual adoption review and records redacted audit metadata.                                                      | Formal target write status remains `blocked_without_follow_up_task`; content/org formal draft adoption is not a completed product loop.                                       | Formal `question`/`paper` adoption must stay out of final Pass unless separately implemented and evidenced.                     |
| Ops model config / audit logs                | `governance_surface`               | Model provider/config/prompt and redacted `ai_call_log`/`audit_log` surfaces exist as governance or operational views.                                                                         | Governance views do not by themselves execute generation, validate output quality, or calibrate cost.                                                                         | Useful supporting infrastructure, not feature completion proof.                                                                 |

## Source Findings

### Learner Personal AI

- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx` exposes `AI出题` and `AI组卷` actions and states
  that the current page shows local contract summaries and redacted status.
- `src/app/api/v1/personal-ai-generation-requests/route.ts` wires the public route to
  `createPersonalAiGenerationRequestRouteHandlers` with a Postgres request repository only. It does not provide
  `runtimeBridgeControl`.
- `src/server/services/personal-ai-generation-request-route.ts` can return `local_browser_experience`; that path builds
  a server-owned local request input and passes the optional `runtimeBridgeControl` through only if dependencies provide
  it.
- `src/server/services/personal-ai-generation-local-browser-experience-service.ts` sets `runtimeStatus:
local_contract_only`.
- `src/server/services/personal-ai-generation-result-route.ts` lists and reads draft result summaries/details from the
  result repository; it does not execute a model call.

### Content And Organization Admin AI

- `src/app/(admin)/content/ai-question-generation/page.tsx` and
  `src/app/(admin)/content/ai-paper-generation/page.tsx` render `AdminAiGenerationEntryPage` only.
- `src/app/(admin)/organization/ai-question-generation/page.tsx` and
  `src/app/(admin)/organization/ai-paper-generation/page.tsx` render `AdminAiGenerationEntryPage` only.
- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx` fetches `/api/v1/sessions`, checks role state, and
  displays boundary cards. It states the local entry is ready and model service execution still depends on later task
  approval.
- Static route scan found personal AI generation APIs only. It did not find content or organization AI generation request
  APIs under `src/app/api/v1`.

### Provider And Cost Boundary

- `package.json` includes `ai`, `@ai-sdk/alibaba`, and `@ai-sdk/openai-compatible`.
- ADR-006 records those packages as dependency availability only, not Provider approval or readiness.
- `src/server/services/ai-generation-task-provider-adapter-service.ts` can create server-side provider model handles, but
  returns `providerCallExecuted: false` and blocks requested Provider/env/config access.
- `src/server/services/personal-ai-generation-runtime-bridge-service.ts` defaults to `provider_call_blocked` and
  `real_provider_execution_requires_fresh_approval` when no controlled runner is supplied.
- `src/server/services/personal-ai-generation-route-integrated-provider-execution-service.ts` contains the only observed
  route-integrated real Provider call path and calls `generateText` only when supplied a control that can read a
  credential. The public route does not supply that control.

## MVP Decision Implications

| Candidate decision path                                                  | Is it currently honest?                         | Required wording or next task                                                                                                                                       |
| ------------------------------------------------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Continue local-product final Pass review excluding AI product completion | Yes, if owner explicitly accepts the exclusion. | State that local role-separated browser evidence proves current entries/guards only, not full content/org AI generation, real Provider behavior, cost, or adoption. |
| Include real Provider/Cost in final Pass                                 | Not yet.                                        | Create and execute a separate Provider/Cost gate package using the owner's new authorization, redacted evidence, and no raw prompt/payload/output disclosure.       |
| Include content/admin AI generation product completion                   | Not yet.                                        | Implement scoped content AI generation and organization AI generation product loops, including request APIs, task lifecycle, draft/review queues, and tests.        |
| Declare Advanced MVP AI generation complete now                          | No.                                             | Blocked by missing content/org product loops, real Provider evidence, Cost evidence, and formal adoption boundaries.                                                |

## Recommended Next Work

Recommended immediate next task:

`ai-generation-provider-cost-gate-package-2026-06-26`

Purpose:

- Materialize the owner's Provider/Cost and real model call authorization into a task-scoped gate package.
- Define exact allowed credential source, secret redaction, model/provider, prompt redaction, max call count, timeout,
  usage/cost evidence fields, failure handling, and whether the run is a smoke or Cost Calibration Gate.
- Decide whether to run one real local Provider smoke before or after content/org AI generation implementation.

Recommended implementation epic after gate decision:

`content-organization-ai-generation-product-loop-implementation-plan-2026-06-26`

Minimum scope should be split into smaller tasks:

1. Content AI generation request API and draft/review read model.
2. Organization AI generation request API and organization-owned draft lifecycle.
3. Shared AI task execution runner with redacted `ai_call_log` and Provider/Cost controls.
4. Formal adoption path from reviewed AI output into editable formal `question`/`paper` drafts, still blocking direct
   publish.

## Final Decision Boundary

This package supports decision-making only. It does not change runtime behavior, does not execute Provider/Cost, does not
develop content or organization AI generation, does not approve staging/prod/payment/external service work, and does not
claim MVP final Pass.
