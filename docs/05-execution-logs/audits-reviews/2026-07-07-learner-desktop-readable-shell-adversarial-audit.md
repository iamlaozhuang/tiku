# 2026-07-07 学员端桌面可读壳层 Adversarial Audit

Task id: `learner-desktop-readable-shell-2026-07-07`

## Scope

Adversarial review for branch 2 learner/employee shell, navigation, title, context, empty state, error state, and disabled state changes.

## Requirement Mapping Result

| Risk                                            | Review result                                                                                         |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Desktop change breaks mobile-first shell        | pass - bottom tab layout remains mobile-first while header/nav receive bounded desktop width.         |
| Emoji/decorative nav remains                    | pass - tab labels use lucide line icons with `aria-hidden` icons and text labels.                     |
| UI grants advanced routes to standard users     | pass - home advanced entries remain gated by existing capability checks.                              |
| Advanced entries disappear                      | pass - targeted tests keep AI/organization training entries visible for advanced capable contexts.    |
| Missing organization context uses login wording | pass - branch 2 did not alter organization-training guard semantics; existing coverage remains green. |
| Evidence leaks private values or full content   | pass - evidence records safe counts and file labels only.                                             |
| Forbidden files changed                         | pass - diff is scoped to allowed docs, student layout/home code, and targeted tests.                  |

## Adversarial Review Notes

- Authorization, role, edition, organization-context, and route guard semantics were not rewritten.
- The home context band consumes existing DTO fields and renders descriptive labels only; it does not render raw authorization or owner identifiers.
- Standard learners/employees continue to lack advanced entries when capabilities are absent, while advanced capable contexts retain AI/organization training entries.
- Empty/loading/error/no-authorization/no-paper and organization-training unavailable state coverage remained green in targeted tests.
- No Provider, DB, env, dependency, package/lockfile, schema/migration/seed, fixture, screenshot, raw DOM, staging/prod/deploy, release readiness, production usability, or Cost Calibration action was performed.

## Non-Claims

- No Provider execution.
- No DB read/write/mutation.
- No account, fixture, env, dependency, package/lockfile, schema/migration/seed, screenshot, raw DOM, e2e, staging/prod/deploy, release readiness, production usability, final Pass, or Cost Calibration claim.
