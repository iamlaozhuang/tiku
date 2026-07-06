# 2026-07-05 Personal AI Generation `generationParameters` Null Contract Audit

## Review Summary

- Root cause: three older expectations treated missing `generationParameters` as an omitted field, while the current shared personal AI generation request contract and ADR-002 require optional fields to be present with `null`.
- Fix: updated the focused validator, service, and flow service expectations to include `generationParameters: null`.
- No runtime/source behavior changed.

## Risk Review

- API contract is now stricter and more consistent with ADR-002.
- Shared AI generation service/validator paths remain reused; no role-specific fork was introduced.
- Redaction checks in the existing tests still verify omitted private fixture values are not serialized.
- Full unit is still not globally green; remaining failures are separately scoped and should be repaired before any closed-loop completion claim.

## Taste Checklist

- API JSON fields remain camelCase and optional field presence follows the standard null contract.
- DB naming and schema were not touched.
- No custom abbreviation or duplicated role-specific AI generation path was added.
- No hardcoded UI color/token change was made.
- No formal content write boundary was changed.
- No sensitive provider payload, credential, DB row, raw question, material, or paper content was recorded.
