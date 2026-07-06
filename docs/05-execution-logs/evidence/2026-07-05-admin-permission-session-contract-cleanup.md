# 2026-07-05 Admin Permission Session Contract Cleanup Evidence

## Scope

- Close the current full-unit red subset where two admin permission/session tests still asserted old contracts.
- Keep runtime permission and session behavior unchanged.

## Commands

| Command                                                                                                                                                 | Result                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm.cmd run test:unit -- tests/unit/phase-21-admin-permission-boundary-review.test.ts tests/unit/phase-22-content-admin-cookie-session-repair.test.ts` | Failed before repair: 2 files, 2 failing assertions.                                                                                                                                      |
| `npm.cmd run test:unit -- tests/unit/phase-21-admin-permission-boundary-review.test.ts tests/unit/phase-22-content-admin-cookie-session-repair.test.ts` | Passed after repair: 2 files, 12 tests.                                                                                                                                                   |
| `npm.cmd run typecheck`                                                                                                                                 | Passed.                                                                                                                                                                                   |
| `npm.cmd run lint`                                                                                                                                      | Passed.                                                                                                                                                                                   |
| `npm.cmd run format:check`                                                                                                                              | Passed.                                                                                                                                                                                   |
| `git diff --check`                                                                                                                                      | Passed.                                                                                                                                                                                   |
| `npm.cmd run test:unit`                                                                                                                                 | Failed with 2 remaining failures outside this task scope: paper legacy alias inventory and phase-8 org auth UI empty-state expectation. The admin permission/session failures are closed. |

## Adversarial Checks

- Confirmed password reset service and contract now return an explicit one-time distribution window for allowed operators.
- Confirmed `getRequestAuthorization()` accepts raw `tiku_session` cookies and converts them to the same Bearer authorization used by cookie-backed marker requests.
- Confirmed the raw cookie-only admin-flow user read remains fail-closed for `content_admin`: authentication succeeds, user-management permission denies, repository `listUsers` is not called.
- No source behavior, Provider execution, DB action, env/credential access, dependency change, schema/migration/seed change, browser runtime, or dev server work was performed.

## Remaining Known Failures

- `tests/unit/paper-legacy-alias-inventory.test.ts`
- `tests/unit/phase-8-admin-org-auth-redeem-ui.test.ts`
