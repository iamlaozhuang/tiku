# Content Admin AI Generation Scope Decision

**Date:** 2026-06-21
**Decision status:** decision package recorded; implementation blocked pending fresh product and Provider approvals.
**Related use case:** `UC-FUTURE-STANDARD-AI-GENERATION-NON-GOAL`

## Decision

For the current standard MVP and this discovered-issue closure batch, `content_admin` AI 出题 and AI 组卷 remain out of implementation scope.

The product decision package is:

1. Standard content operations continue to use manual `question`, `material`, and `paper` authoring as the system of record.
2. Existing student personal AI generation is not a content_admin feature and must not be reused as a formal content entry path.
3. If content_admin AI 出题 or AI 组卷 is approved later, generated output must first land in an isolated AI generation result or draft review surface, not directly in formal `question` or `paper` records.
4. Formal adoption into `question` or `paper` requires a separate review action, audit trail, author attribution, validation, and security review.
5. Real Provider calls, prompt/provider payloads, model output persistence, quota/cost policy, `.env` work, and production/staging execution remain blocked without fresh approval.

## Product Boundary

| capability                            | current status | future entry condition                                                                                     |
| ------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------- |
| content_admin AI 出题 button or route | blocked        | Product owner chooses a scope-change option and approves exact UI/API/source files.                        |
| content_admin AI 组卷 button or route | blocked        | Product owner chooses a scope-change option and approves paper draft semantics.                            |
| generated result storage              | blocked        | Requires data model or existing isolated result contract decision, redaction policy, and retention policy. |
| formal `question` adoption            | blocked        | Requires manual review gate, audit_log entry, validation, duplicate detection, and source attribution.     |
| formal `paper` adoption               | blocked        | Requires manual review gate, paper draft lifecycle rules, snapshot semantics, and publish validation.      |
| real Provider execution               | blocked        | Requires Provider/env/cost approvals and redacted evidence rules.                                          |

## Recommended Future Architecture

Future implementation should be split into these reviewable tasks:

1. Product UX/API contract package for `content_admin` AI generation request and review surfaces.
2. Provider/env/cost approval package with redaction rules and stop conditions.
3. Isolated generation result model or contract package, with no formal `question`/`paper` writes.
4. Manual review and formal adoption package for `question` drafts.
5. Manual review and formal adoption package for `paper` drafts.
6. Audit/logging package covering `audit_log`, `ai_call_log`, reviewer identity, and public identifiers only.
7. Runtime verification package after Provider and browser/e2e gates are separately approved.

## Non-Goals

- No current source, test, route, UI, schema, migration, package, lockfile, Provider, prompt, `.env`, database, browser/e2e, deploy, PR, force-push, payment, external-service, or Cost Calibration Gate work.
- No direct AI-generated write into formal `question` or `paper`.
- No evidence containing raw prompt, raw generated content, provider payload, private answer text, full paper content, API key, token, database URL, or plaintext `redeem_code`.
