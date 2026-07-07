# 2026-07-07 全角色 UIUX 源码整改总控矩阵 Adversarial Audit

Task id: `full-role-uiux-source-remediation-control-matrix-2026-07-07`

## Scope

Adversarial review of the 7-branch source remediation control matrix before branch 2 begins.

## Requirement Mapping Result

| Risk                                                      | Review result                                                                                                                                                                                                               |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Matrix accidentally becomes a deferral plan               | Pass: branch 8 is an in-round closeout branch and every branch has evidence/audit paths.                                                                                                                                    |
| Branch scope too broad                                    | Pass: branches list allowed file families and explicit forbidden ranges; each branch must narrow to exact files in its own task plan before editing.                                                                        |
| UI changes weaken authorization                           | Pass: matrix requires service-owned authorization and `effectiveEdition` boundaries.                                                                                                                                        |
| AI pages accidentally claim new AI组卷 backend completion | Pass: matrix preserves 2026-07-06 plan-and-select wording and blocks Provider/backend claims unless separately scoped.                                                                                                      |
| Operations plaintext card behavior is incorrectly removed | Pass: matrix preserves eligible operations UI exception while keeping evidence/log redaction.                                                                                                                               |
| Sensitive evidence leakage                                | Pass: evidence mode and branch flow prohibit credentials, sessions, cookies, env values, DB raw rows, internal ids, Provider payloads, raw AI I/O, plaintext `redeem_code`, full content, screenshots, raw DOM, and traces. |
| State/queue drift                                         | Pass with enforced flow: after this matrix task closes, each branch must update queue/state status before commit and before entering the next branch.                                                                       |
| Tests after implementation only                           | Watch item: source branches must add or adjust targeted tests before implementation when behavior/state changes.                                                                                                            |

## Fixed Follow-Up Guard

Before branch 2 starts:

1. Merge and push this matrix task to `origin/master`.
2. Confirm `master` equals `origin/master` and worktree clean.
3. Create branch 2 from latest `origin/master`.
4. Read branch 2 baselines and source again.
5. Write branch 2 task plan with exact files and tests.

## Forced Self-Review Result

- Pass: branch count is exactly 7 for branches 2-8.
- Pass: every matrix row records role, pages, source, allowed range, forbidden range, risk points, validation, evidence/audit path, and status.
- Pass: every branch now has explicit permission, standard/advanced, and empty/error/disabled state test obligations.
- Pass: queue registration is serial through explicit `dependsOn`.
- Pass: new branch registrations use explicit `blockedFiles` lists.
- Pass: Module Run v2 prepush readiness passed on `master` after fast-forward merge.
- Pass: this matrix task changes docs/state/evidence/audit only, with no product source, test, dependency, env, DB, Provider, schema/migration/seed, screenshot, trace, raw DOM, staging/prod/deploy, release, production, or Cost Calibration work.

## Non-Claims

- No product source implementation reviewed.
- No runtime/browser acceptance reviewed.
- No DB, Provider, env, dependency, schema/migration/seed, staging/prod/deploy, release readiness, production usability, final Pass, or Cost Calibration claim.

Cost Calibration Gate remains blocked.
