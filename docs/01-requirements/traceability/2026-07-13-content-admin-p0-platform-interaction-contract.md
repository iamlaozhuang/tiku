# Content Admin P0 Data Integrity And Platform Interaction Contract

Date: 2026-07-13

## Status

Accepted by the product owner on 2026-07-13 through the explicit instruction `批准三项，先启动 Batch A`.

This file is the stable requirement and traceability baseline for:

1. the content-admin `question` and `material` creation data-integrity repair;
2. the platform interaction contract used by later UI/UX implementation batches;
3. the approved implementation order: Batch A first, then separately approved platform batches.

It does not approve Provider execution, database access or mutation, schema/migration/fixture/seed changes, dependency changes, browser or screenshot work, staging/prod/deploy, PR, force push, or Cost Calibration.

## Source And Supersession Order

Read this file after:

- `docs/01-requirements/00-index.md`;
- `docs/01-requirements/modules/02-question-paper.md`;
- `docs/01-requirements/stories/epic-02-question-paper.md`;
- `docs/01-requirements/modules/06-admin-ops.md`;
- `docs/01-requirements/stories/epic-06-admin-ops.md`;
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`.

For edition, authorization, AI, organization training, phone visibility, or `redeem_code` work, the additional reading rules in `AGENTS.md` and the 2026-07-07 source implementation entry still apply.

This contract adds a current, accepted implementation baseline. It does not reopen A01-A30 or the closed/superseded AI generation issue set without fresh current-baseline failure evidence.

## Current P0 Problem Statement

At baseline `1bd47916acb5608faf5186175bfb659cd8509212`, new `question` and `material` forms use demonstration content as real form values, the client save gate focuses mainly on length, and the server validators do not enforce the complete question-type semantic matrix. Existing UI tests treat those demonstration values as valid create payloads.

The P0 root cause is not the presence of specific Chinese strings. It is the absence of a shared semantic rule that proves persisted content represents explicit author intent and a valid business structure.

## P0 Acceptance Contract

All requirements below are mandatory for Batch A.

| ID    | Requirement                                                                                                                                                                                                                                                                                                          |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0-01 | New forms must not use demonstration stem, analysis, answer, material title/body, option content, or scoring-point descriptions as submission values. Examples belong in placeholders or helper copy. Without an explicit creation context, critical classification fields must not appear as user-confirmed values. |
| P0-02 | Semantic empty content includes whitespace-only text, empty rich-text tags, `<p><br></p>`, and invisible-only content. Valid text or a valid managed media/table node with required accessible description may count as content. Literal placeholder blacklists are forbidden.                                       |
| P0-03 | Client submission must show field errors and a form summary, block the request, focus the first invalid field, and recover after correction.                                                                                                                                                                         |
| P0-04 | Server validation must reject the same semantic-empty and question-type-invalid payloads when the UI is bypassed, while preserving the standard API envelope and redacted error boundary.                                                                                                                            |
| P0-05 | `single_choice` requires at least two non-empty uniquely labelled options, exactly one correct option, and a `standard_answer` consistent with that option.                                                                                                                                                          |
| P0-06 | `multi_choice` requires at least two non-empty uniquely labelled options, at least two correct options, and a `standard_answer` consistent with the correct-option set.                                                                                                                                              |
| P0-07 | `true_false` preserves the internal correct/incorrect semantics and A/B display mapping and allows exactly one correct option.                                                                                                                                                                                       |
| P0-08 | `fill_blank` with automatic matching requires at least one valid answer. AI-scored fill blank requires valid scoring points. Switching the method preserves entered data but cannot bypass the active method's save contract.                                                                                        |
| P0-09 | Subjective question types do not submit choice options. Required scoring points have non-empty descriptions, positive scores, and 0.5-point granularity. Reference answer and `analysis` follow the stable question requirements.                                                                                    |
| P0-10 | `material` title and body are semantically non-empty and body length remains at most 30000 characters. Empty table templates, broken media references, or helper-only markup do not make an empty body valid.                                                                                                        |
| P0-11 | Submission is deduplicated while in progress. Failure preserves author input; success, failure, and conflict states remain distinguishable.                                                                                                                                                                          |
| P0-12 | Existing edit, copy, disable, lock, reference-summary, material/knowledge/tag binding, and true/false mapping behavior remains covered and unchanged unless a separate requirement says otherwise.                                                                                                                   |
| P0-13 | Required instructions, `aria-invalid`, `aria-describedby`, error text, first-error focus, keyboard submit, and visible disabled reasons are acceptance requirements.                                                                                                                                                 |
| P0-14 | TDD is mandatory. The implementation must show client/API/type-matrix RED evidence followed by focused and full unit, lint, typecheck, format, webpack build, and diff GREEN evidence.                                                                                                                               |

Batch A is incomplete if it only clears default strings, only disables the client button, or only changes server validation.

## Platform Interaction Contract

The following requirements are `MUST` for later affected backend implementation tasks:

| ID     | Requirement                                                                                                                                                                               |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PIC-01 | A page identifies workspace, role or organization context, content domain, and current task. UI visibility never replaces service authorization.                                          |
| PIC-02 | List filters, sort, page, and pageSize are stored in the URL. Filter or pageSize changes reset page to 1; refresh and return restore state.                                               |
| PIC-03 | Filter changes refresh automatically. Keyword input is debounced and stale requests are cancelled or ignored so the latest user intent wins.                                              |
| PIC-04 | Initial loading, refreshing, no data, filtered empty, error, forbidden, edition unavailable, missing context, and conflict are distinct states.                                           |
| PIC-05 | Each page region has one primary action. Secondary actions are quiet; destructive actions require destructive semantics and confirmation; disabled actions show a reason.                 |
| PIC-06 | Create and edit share the same business validation contract. Field errors are local, cross-field errors have a summary, and server errors map to recoverable UI state.                    |
| PIC-07 | In-progress submission prevents duplicates. Success uses Toast plus object-level state update; failure preserves input; conflicts never overwrite silently.                               |
| PIC-08 | Detail Drawer provides a semantic title, initial focus, focus loop, Escape close, and trigger-focus restoration.                                                                          |
| PIC-09 | Core-resource long-form create/edit uses a dedicated editor route with predictable dirty-leave, refresh, and return-to-list behavior.                                                     |
| PIC-10 | Keyboard order, visible focus, labels/instructions/errors, state announcements, and target size are verified; screenshots are not accessibility proof.                                    |
| PIC-11 | Backend remains desktop-first, but narrow viewports have no page-level horizontal overflow and wide tables scroll only inside their own container.                                        |
| PIC-12 | Terminology, states, button hierarchy, and task-container decisions remain consistent across content, operations, and organization workspaces while learner surfaces remain mobile-first. |
| PIC-13 | UI consistency must not change AI, edition, authorization, organization-training, phone-visibility, or `redeem_code` service/data/redaction boundaries.                                   |

Default `SHOULD` behavior:

- show active filter chips, result count, and one reset action;
- restore list scroll position, filter state, and focus target after detail/edit;
- group long forms by business meaning and provide a top-level error summary;
- provide a safe next step for lock, reference, edition, or organization-scope blockers;
- use a context-preserving refreshing state instead of clearing the whole page.

## Task Container Contract

| Container             | Intended use                                                                                      | Not intended for                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Detail Drawer         | Read-only details, references, audit summaries, lightweight context                               | Long forms, rich-text editing, complex validation                                 |
| Dialog                | One low-risk confirmation, a small-field action, destructive confirmation                         | Multi-step creation or saved drafts                                               |
| Task Drawer           | A bounded short task that benefits from retained list context                                     | Full `question`/`material` editing, paper assembly, four-step enterprise training |
| Dedicated editor page | Core-resource create/edit                                                                         | Read-only detail                                                                  |
| Composer/Wizard       | Paper assembly, enterprise training, authorization package, other multi-step reviewable workflows | Simple toggles                                                                    |
| Inline edit           | Reversible low-risk single-field change without cross-field dependency                            | Formal content, authorization, edition, publish, lock, or high-risk data          |

Any exception must record the route/page, affected contract ID, user benefit, risk, alternative protection, and product approval.

## Implementation Order

1. Batch A: P0 `question`/`material` data integrity.
2. Batch B: stable platform primitives and contract mapping.
3. Batch C/D: core editor workspace and list-request consistency, each independently approved.
4. Batch E: page-family rollout with an exception ledger.
5. Batch F: separately approved full-role localhost acceptance.

Batch A must remain independent from editor-route restructuring and broad platform refactoring.

## Evidence Boundary

- The six screenshot/Figma audit board is a visual evidence and communication layer, not requirement SSOT or runtime proof.
- Browser, keyboard, request-race, authorization, and data-integrity claims require their own code or approved runtime evidence.
- Historical AI paper results without complete persisted `paperAssembly` remain readable but non-resumable. This contract neither reconstructs them nor creates a valid AI paper sample.

## Non-Claims

- No source implementation is completed by this file.
- No browser, database, Provider, dependency, schema, fixture, staging/prod/deploy, release-readiness, or final-Pass claim is made.
