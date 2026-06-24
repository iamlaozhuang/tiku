# Content Admin AI Generation Scope Decision

**Date:** 2026-06-21
**Decision status:** decision package recorded; implementation blocked pending fresh product and Provider approvals.
**Related use case:** `UC-FUTURE-STANDARD-AI-GENERATION-NON-GOAL`

## Decision

For the current standard MVP and this discovered-issue closure batch, `content_admin` AI 出题 and AI 组卷 remain out of implementation scope unless a later task receives explicit implementation approval. Follow-up product approval on 2026-06-21 selected option A as the future direction: AI may only create reviewable drafts or suggestions, and humans must confirm before any formal `question`, `paper`, publish, or `mock_exam` use.

The product decision package is:

1. Standard content operations continue to use manual `question`, `material`, and `paper` authoring as the system of record.
2. Existing student personal AI generation is not a content_admin feature and must not be reused as a formal content entry path.
3. If content_admin AI 出题 or AI 组卷 is approved later, generated output must first land in an isolated AI generation result or draft review surface, not directly in formal `question` or `paper` records.
4. Formal adoption into `question` or `paper` requires a separate review action, audit trail, author attribution, validation, and security review.
5. Real Provider calls, prompt/provider payloads, model output persistence, quota/cost policy, `.env` work, and production/staging execution remain blocked without fresh approval.
6. AI 组卷 output may propose paper structure, candidate questions, or selection rationale only. It must not create a publishable `paper`, attach full paper content to evidence, or make the paper available to students until a `content_admin` reviewer explicitly accepts and validates it.
7. AI 出题 output may propose question drafts only. It must not create formal `question`, `question_option`, `standard_answer`, `analysis`, `scoring_point`, `material`, or `question_group` records until a reviewer accepts the draft through a separately approved adoption workflow.

## 2026-06-23 Requirement Clarification

The 2026-06-23 product clarification supersedes the earlier "future direction only" stance for the requirement itself:
`content_admin` must have discoverable AI question generation and AI `paper` generation entries in the content backend.

The implementation gate remains unchanged:

1. This clarification does not approve source, route, UI, schema, Provider, prompt, env/secret, database, browser/e2e, deploy, PR, payment, or Cost Calibration work.
2. Content admin AI output must first land in an isolated reviewable draft or suggestion surface.
3. Formal adoption into platform `question` or `paper` must follow governed review, validation, source attribution, reviewer attribution, and `audit_log`.
4. Direct write into formal `question`, `paper`, publish, `mock_exam`, or student-visible content remains forbidden.
5. Requiring content operators to type an unpublished URL fails the entry requirement; future acceptance must prove discoverable navigation.

## Product Boundary

| capability                            | current status | future entry condition                                                                                          |
| ------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------- |
| content_admin AI 出题 button or route | blocked        | Product owner approves exact UI/API/source files for draft/suggestion-only generation with manual adoption.     |
| content_admin AI 组卷 button or route | blocked        | Product owner approves exact UI/API/source files for draft/suggestion-only paper planning with manual adoption. |
| generated result storage              | blocked        | Requires data model or existing isolated result contract decision, redaction policy, and retention policy.      |
| formal `question` adoption            | blocked        | Requires manual review gate, audit_log entry, validation, duplicate detection, and source attribution.          |
| formal `paper` adoption               | blocked        | Requires manual review gate, paper draft lifecycle rules, snapshot semantics, and publish validation.           |
| real Provider execution               | blocked        | Requires Provider/env/cost approvals and redacted evidence rules.                                               |

Note: the two button or route rows above are superseded by the 2026-06-23 clarification at the requirement level. The
required entries are confirmed, while implementation remains blocked until a scoped implementation task approves exact
UI/API/source files and evidence gates.

## Generated Result Storage Model

Follow-up approval on 2026-06-21 selected option A for generated-result storage: use an isolated AI generation result or
draft review surface.

Policy:

1. AI generated question and paper-planning output must land in an isolated review surface before any formal content
   adoption.
2. Isolated results are not formal `question`, `material`, `paper`, `paper_section`, `question_group`,
   `question_option`, `standard_answer`, `analysis`, or `scoring_point` records.
3. Isolated results are not student-visible, cannot be published, cannot be selected by `mock_exam`, and cannot be used
   as formal `paper` content.
4. Formal adoption is a separate human action that validates, edits when needed, attributes the reviewer, writes
   `audit_log`, and creates or updates formal records only after the reviewer accepts the result.
5. Paper-planning output may propose structure, candidate question references, and selection rationale, but must not
   create a publishable `paper` without the formal adoption workflow.
6. Question-generation output may propose draft fields, options, standard answer, analysis, scoring points, materials,
   or groups, but must not write them into formal records without the formal adoption workflow.
7. Evidence must remain redacted and must not include raw prompts, Provider payloads, raw generated content, private
   answer text, full paper content, API keys, tokens, database URLs, internal numeric ids, or plaintext `redeem_code`
   values.

This decision does not approve schema, migration, source implementation, model output persistence, real Provider calls,
prompt/provider payload exposure, formal content writes, database work, or runtime verification.

## Review And Adoption Boundary

Follow-up approval on 2026-06-21 selected option A for review/adoption: two-step adoption.

Policy:

1. Isolated AI results can only be adopted into editable formal drafts, not directly into published content.
2. After adoption, `question` drafts, `material` drafts, and `paper` drafts must use the existing formal validation and
   publish workflow.
3. A reviewer may edit, split, reject, or adopt an isolated result. Rejection and adoption both require audit attribution
   to the reviewer.
4. AI question-generation results may create formal draft content only after reviewer adoption; they cannot create
   published `question` records.
5. AI paper-planning results may create or update formal draft `paper` content only after reviewer adoption; they cannot
   publish a `paper` or make it available to `mock_exam` in the same action.
6. The adoption action must not bypass duplicate detection, canonical `question_type` normalization, `paper` count
   limits, material binding rules, or publish validation.
7. Evidence for future adoption work must be redacted and must not include raw prompts, Provider payloads, raw generated
   content, private answer text, full paper content, API keys, tokens, database URLs, internal numeric ids, or plaintext
   `redeem_code` values.

This decision does not approve implementation, formal content writes, schema, migration, Provider calls, prompt/provider
payload exposure, database work, browser/e2e runtime, or publish-flow changes.

## Logging And Evidence Redaction

Follow-up approval on 2026-06-21 selected option A for logging and evidence: redacted references only.

Policy:

1. `audit_log`, `ai_call_log`, and execution evidence may store or display public request/result references, status,
   model_provider or model_config references, token and cost summaries, latency, error code/category, reviewer public
   reference, and redacted adoption action metadata.
2. They must not store raw prompt text, Provider payloads, raw generated content, full private paper content, private
   answer text, API keys, tokens, database URLs, internal numeric ids, or plaintext `redeem_code` values.
3. `audit_log` should prove who requested, reviewed, rejected, or adopted an AI result, using public references and
   redacted metadata only.
4. `ai_call_log` should prove operational status and cost/capacity behavior without storing replayable prompt/provider
   material or full model output.
5. Evidence for future tasks should cite redacted public references and aggregate summaries only. It must not include
   content that would allow reconstructing the prompt, Provider request/response, private answer text, or unpublished
   paper content.
6. Any exception for reversible debugging capture requires a separate product/security approval and a retention,
   access-control, redaction, and deletion plan before implementation.

This decision does not approve implementation, Provider calls, prompt/provider payload exposure, model output
persistence, formal content writes, schema, migration, database work, browser/e2e runtime, or a debugging-capture
exception.

## Provider Approval Package Preparation

Follow-up approval on 2026-06-21 selected option B for the Provider/env/cost gate: prepare a Provider approval package
only.

Policy:

1. The next Provider-related step for `content_admin` AI is a docs-only approval package, not live execution.
2. The package must cover candidate `model_provider` and `model_config` baseline, draft-only use cases, env/secret
   ownership, quota and cost caps, stop conditions, redaction rules, retention, access control, fallback behavior,
   rollback or kill-switch rules, and validation evidence requirements.
3. The package may cite ADR-006's installed AI SDK baseline as dependency availability only. It must not treat installed
   packages as Provider/runtime approval.
4. The package must preserve the earlier boundaries: generated output remains isolated and reviewable; formal
   `question` or `paper` writes require separate human adoption; logs and evidence use redacted references only.
5. Any future live Provider smoke, cost calibration, Provider configuration, `.env` work, prompt/payload handling,
   model-output persistence, or runtime verification requires a separate task with fresh approval and explicit allowed
   files.

This decision does not approve real Provider calls, prompt/provider payload exposure, raw generated AI content evidence,
model output persistence, `.env` reads or writes, secret creation, Provider configuration changes, source
implementation, schema, migration, seed, database connection, package or lockfile change, browser/e2e/dev-server
runtime, deploy, PR, force-push, payment, external service, or Cost Calibration Gate work.

## Provider Candidate Baseline

Follow-up approval on 2026-06-21 selected option A for the Provider candidate baseline: use ADR-006's installed AI SDK
baseline for the approval package.

Policy:

1. The future Provider approval package should treat `@ai-sdk/alibaba`/Qwen as the preferred candidate for
   `content_admin` AI draft generation and paper-planning review flows.
2. The package may list `@ai-sdk/openai-compatible` as a fallback candidate for compatible Provider evaluation.
3. The installed AI SDK packages remain dependency availability only. They do not approve live Provider execution,
   Provider configuration, fallback-chain changes, `.env` work, secret creation, prompt/payload handling, or runtime
   verification.
4. The approval package must still define exact `model_provider`, `model_config`, quota and cost caps, stop conditions,
   redaction, retention, access control, fallback behavior, rollback or kill-switch rules, and validation evidence
   before any live Provider task is considered.
5. Any future Provider smoke or cost calibration must be a separate task with fresh approval and redacted evidence.

This decision does not approve real Provider calls, prompt/provider payload exposure, raw generated AI content evidence,
model output persistence, `.env` reads or writes, secret creation, Provider configuration changes, source
implementation, schema, migration, seed, database connection, package or lockfile change, browser/e2e/dev-server
runtime, deploy, PR, force-push, payment, external service, or Cost Calibration Gate work.

## Recommended Future Architecture

Future implementation should be split into these reviewable tasks. Every implementation task must preserve the option A boundary: generation produces reviewable drafts or suggestions only; formal adoption remains a separate human action.

1. Product UX/API contract package for `content_admin` AI generation request and review surfaces, including draft status and reviewer action semantics.
2. Provider/env/cost approval package with redaction rules and stop conditions, following the option B docs-only
   approval-package preparation decision and option A Provider candidate baseline above.
3. Isolated generation result model or contract package, with no formal `question`/`paper` writes, following the option A
   isolated review-surface decision above.
4. Manual review and formal adoption package for `question` drafts, following the option A two-step adoption boundary.
5. Manual review and formal adoption package for `paper` drafts, following the option A two-step adoption boundary.
6. Audit/logging package covering `audit_log`, `ai_call_log`, reviewer identity, public identifiers, and redacted
   references only.
7. Runtime verification package after Provider and browser/e2e gates are separately approved.

## Non-Goals

- No current source, test, route, UI, schema, migration, package, lockfile, Provider, prompt, `.env`, database, browser/e2e, deploy, PR, force-push, payment, external-service, or Cost Calibration Gate work.
- No direct AI-generated write into formal `question` or `paper`.
- No evidence containing raw prompt, raw generated content, provider payload, private answer text, full paper content, API key, token, database URL, or plaintext `redeem_code`.
