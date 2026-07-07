# 2026-07-06 AI training quantity validation and degradation alignment audit

## Audit Position

This is a local adversarial implementation review for the quantity and degradation-message packet only. It checks whether
the new recontract quantity boundary is harder to bypass and whether paper-source degradation wording remains safe for
users. It is not a release audit.

## Requirement Checks

| Requirement                                                                 | Evidence                                                                                     | Result |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------ |
| AI出题 default is `3` and max is `10`                                       | Shared task spec assertions and admin UI default assertions                                  | Pass   |
| AI组卷 default is `30` and max is `80`                                      | Shared task spec assertions and admin UI default assertions                                  | Pass   |
| Shared structured preview cannot amplify requested count beyond max         | RED-to-GREEN structured preview tests                                                        | Pass   |
| Provider instruction count uses the same bounded contract                   | Focused package unit test includes instruction service after source change                   | Pass   |
| Admin route rejects out-of-range count before persistence                   | Route test asserts `400013` and zero task-persistence calls                                  | Pass   |
| Personal/employee local route rejects out-of-range count before persistence | Route test asserts `400015` and zero request-persistence calls                               | Pass   |
| Admin UI cannot preserve or submit stale oversized count                    | Component helper test covers persisted `99` normalization to `10` or `80`                    | Pass   |
| Paper-source degradation/insufficiency wording is user-facing Chinese       | Admin surface test covers nearby supplement, same-scope supplement, and insufficiency states | Pass   |
| Technical enum/fallback wording is hidden from UI for these states          | Admin surface test asserts enum/fallback terms are absent                                    | Pass   |

## Adversarial Findings

- Old evidence that Provider could produce generated paper drafts does not prove this packet; this packet only proves
  quantity boundaries and safe degradation wording in local source/unit scope.
- The route-level maximum checks reduce bypass risk from crafted request bodies, but they do not replace future browser
  role-matrix validation.
- The personal route preserves existing error-code separation: local browser flow invalid input returns `400015`; ordinary
  personal request invalid input remains `400011`.
- Admin AI组卷 insufficiency still depends on the upstream plan-and-select resolver for accurate source counts. This
  packet verifies display mapping and out-of-range count rejection, not DB-backed source inventory quality.

## Boundary Review

- No dependency/package/lockfile change.
- No schema, migration, seed, or destructive DB operation.
- No DB runtime, Provider call, browser runtime, dev server, staging, production, deploy, or Cost Calibration execution.
- No sensitive evidence was recorded.

## Remaining Work

- Role matrix and local acceptance recheck remain required before claiming browser or DB-backed runtime status.
- Provider-enabled small sample remains not executed and still requires separate bounded approval if requested.
- Release readiness, production usability, staging, production, deploy, and Cost Calibration remain not claimed.
