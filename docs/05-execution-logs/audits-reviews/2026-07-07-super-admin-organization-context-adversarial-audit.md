# 2026-07-07 Super Admin Organization Context Adversarial Audit

Task id: `super-admin-organization-context-2026-07-07`

Branch: `codex/super-admin-organization-context-2026-07-07`

Audit status: pass.

## Scope Audited

This audit reviews the Branch 7 UI/source change that context-gates `super_admin` organization workspace switching when
no selected organization context exists.

## Requirement Mapping Result

| Requirement / Risk                                    | Audit result                                                                                                                       |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| No implicit organization proxy authority              | Pass. The change does not alter route guard or service authorization. It removes the ordinary switch link when context is missing. |
| No login-like wording for valid admin session         | Pass. Direct organization routes still show `需要选择组织上下文`; the switcher also uses missing-context wording.                  |
| `super_admin` operations/content authority preserved  | Pass. Operations and content switch entries remain available for `super_admin`.                                                    |
| Organization admin standard/advanced boundaries       | Pass. Existing guard tests still pass; standard organization admin advanced routes remain unavailable.                             |
| `effectiveEdition` and `org_auth` semantics unchanged | Pass. No service, contract, DB, schema, migration, fixture, or auth calculation file was changed.                                  |
| Empty/error/disabled state explicitness               | Pass. The switcher exposes a disabled group with a visible reason and an operations return path.                                   |
| Evidence redaction                                    | Pass. Evidence records file labels, command status, and counts only.                                                               |

## Adversarial Checks

- Tried to treat `super_admin` as an ordinary organization admin through the switcher: blocked by missing-context UI.
- Tried to reinterpret the UI as an authorization grant: no authorization code changed; guard remains service-owned.
- Checked direct route behavior: existing test still blocks `/organization/portal` page body without context.
- Checked standard organization direct advanced routes: existing test still renders standard-unavailable state before page content.
- Checked unrelated workspace boundaries through focused guard tests: operations/content/organization boundaries still pass.
- Checked sensitive-output risk: no raw account, DB, Provider, prompt, AI output, full content, plaintext card value, screenshot, or DOM evidence is present.

## Residual Risk

- This branch does not implement an actual organization selector for `super_admin`; it only prevents misleading ordinary entry and points to operations organization handling.
- Browser runtime, screenshot comparison, and live session switching were not executed in this branch because the branch scope and queue forbid browser/screenshot/raw-DOM evidence.

## Conclusion

The change closes Branch 7's P1 source issue without expanding role, edition, authorization, Provider, DB, or organization
context semantics. Branch 8 should only recheck cross-role consistency and wording drift.

Cost Calibration Gate remains blocked.
