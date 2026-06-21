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

## Product Boundary

| capability                            | current status | future entry condition                                                                                          |
| ------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------- |
| content_admin AI 出题 button or route | blocked        | Product owner approves exact UI/API/source files for draft/suggestion-only generation with manual adoption.     |
| content_admin AI 组卷 button or route | blocked        | Product owner approves exact UI/API/source files for draft/suggestion-only paper planning with manual adoption. |
| generated result storage              | blocked        | Requires data model or existing isolated result contract decision, redaction policy, and retention policy.      |
| formal `question` adoption            | blocked        | Requires manual review gate, audit_log entry, validation, duplicate detection, and source attribution.          |
| formal `paper` adoption               | blocked        | Requires manual review gate, paper draft lifecycle rules, snapshot semantics, and publish validation.           |
| real Provider execution               | blocked        | Requires Provider/env/cost approvals and redacted evidence rules.                                               |

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

## Recommended Future Architecture

Future implementation should be split into these reviewable tasks. Every implementation task must preserve the option A boundary: generation produces reviewable drafts or suggestions only; formal adoption remains a separate human action.

1. Product UX/API contract package for `content_admin` AI generation request and review surfaces, including draft status and reviewer action semantics.
2. Provider/env/cost approval package with redaction rules and stop conditions.
3. Isolated generation result model or contract package, with no formal `question`/`paper` writes, following the option A
   isolated review-surface decision above.
4. Manual review and formal adoption package for `question` drafts, following the option A two-step adoption boundary.
5. Manual review and formal adoption package for `paper` drafts, following the option A two-step adoption boundary.
6. Audit/logging package covering `audit_log`, `ai_call_log`, reviewer identity, and public identifiers only.
7. Runtime verification package after Provider and browser/e2e gates are separately approved.

## Non-Goals

- No current source, test, route, UI, schema, migration, package, lockfile, Provider, prompt, `.env`, database, browser/e2e, deploy, PR, force-push, payment, external-service, or Cost Calibration Gate work.
- No direct AI-generated write into formal `question` or `paper`.
- No evidence containing raw prompt, raw generated content, provider payload, private answer text, full paper content, API key, token, database URL, or plaintext `redeem_code`.
