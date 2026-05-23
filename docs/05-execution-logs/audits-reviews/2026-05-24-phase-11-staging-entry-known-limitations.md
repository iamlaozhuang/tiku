# Audit Review: phase-11-staging-entry-known-limitations

## Boundary

This review closes the remaining Phase 11 staging-entry P2 role-play findings as explicit known limitations after the required P0/P1 staging-entry fixes were completed.

No application source, dependency, database schema, migration, script, `.env`, staging/prod endpoint, deployment target, cloud resource, provider configuration, secret, or runtime integration is changed in this task.

## Precondition

The following blockers were fixed and pushed before this review:

- `LPR-RP-001` protected pages render without a local session: fixed by `phase-11-staging-entry-auth-route-guards`.
- `LPR-RP-002` admin shell audit navigation points to `/ops/audit-logs` 404: fixed by `phase-11-staging-entry-admin-audit-navigation`.
- `LPR-RP-003` student `practice` and `mock_exam` direct entry does not start an actionable flow: fixed by `phase-11-staging-entry-student-practice-mock-entry`.
- `LPR-RP-004` content management primary actions are enabled but not browser-complete: fixed/scoped by `phase-11-staging-entry-content-action-closures`.

## Known Limitation Register

| Finding                                                                 | Severity | Decision                                                                                                                                                                                                                           | stagingDecision                      | Acceptance boundary                                                                                                                                                                                                           | Future trigger                                                                                                                        |
| ----------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `LPR-RP-005` missing-object student error states are not explicit       | `P2`     | Accept as named limitation for first staging entry because student happy paths now have route guards and actionable `practice`/`mock_exam` entry.                                                                                  | `known_limitation_for_staging_entry` | First staging acceptance may verify valid student home, practice, mock exam, report, mistake-book, profile, and authorization flows. It must not treat arbitrary missing `publicId` deep-link error copy as release-blocking. | Create `phase-11-staging-entry-student-error-states` before broad external UAT, public deep-link sharing, or support-team acceptance. |
| `LPR-RP-006` resource operations disabled without acceptance guidance   | `P2`     | Accept as named limitation because first staging acceptance does not include full RAG resource upload/download/disable/Markdown editing. Existing resource vector rebuild remains the only write-like resource operation in scope. | `known_limitation_for_staging_entry` | Staging acceptance may verify resource listing and vector rebuild boundaries only. Upload, download, Markdown proofreading, and resource disable are out of first staging scope.                                              | Add a resource-management implementation task before accepting RAG admin write workflows.                                             |
| `LPR-RP-007` organization and `redeem_code` operations mostly read-only | `P2`     | Accept as named limitation because first staging acceptance is read-heavy for organization, enterprise authorization, and redeem code operations.                                                                                  | `known_limitation_for_staging_entry` | Staging acceptance may verify listing, filtering, detail visibility, and already implemented explicit actions only. Full organization/redeem-code lifecycle operations are out of first staging scope.                        | Add an admin ops write-closure task before accepting full ops lifecycle workflows.                                                    |

## Staging Entry Decision

`stagingEntryDecision`: `proceed_with_named_p2_limitations`

The remaining P2 findings are not hidden defects. They are named limitations with explicit acceptance boundaries. Any staging checklist, release note, or UAT handoff must carry this register until follow-up implementation tasks close them.

## Evidence Hygiene

This document records only finding identifiers, severity, staging decisions, and bounded acceptance guidance. It does not include secrets, tokens, Authorization headers, raw provider payloads, raw prompt, raw answer, raw model response, full paper/material/OCR text, or customer/private data.
