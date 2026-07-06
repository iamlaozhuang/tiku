# 2026-07-05 Organization AI Training Auth Lineage Audit

## Review Summary

- Root cause: organization AI task metadata used a synthetic `org_auth_local_contract_*` authorization id, but organization training draft creation requires a trusted persistence lineage tied to a real `org_auth.public_id`.
- Fix: session runtime now hydrates `organizationAuthorizationPublicId` from active `org_auth.public_id`; organization AI route requires that service-computed capability and persists it; frontend copy flow uses the current session capability id and shows API business error code/message when the training API rejects the copy.
- Adjacent test maintenance: admin AI task persistence repository tests were updated to the current provider-enabled local contract path and real org auth public id.
- Mechanism state: task-queue and project-state were updated so Module Run v2 pre-commit scope enforcement recognizes this task's exact file set.

## Risk Review

- Formal content boundary unchanged: AI generation still creates/reuses task/result metadata and does not publish formal question/paper/training content directly.
- Authorization boundary tightened: organization AI generation now fails closed if the service-computed capability lacks real `organizationAuthorizationPublicId`.
- Frontend fallback remains non-sensitive: local validation failures say the session lacks a verifiable enterprise authorization; API failures include only standard response `code` and `message`.
- No new dependency, migration, env, credential, or DB operation introduced.
- Commit hook was not bypassed; task scope was repaired and checked with the Module Run v2 pre-commit hardening script.

## Remaining Known Failures Outside Scope

Full `npm.cmd run test:unit` still fails in seven existing non-target tests:

- `tests/unit/paper-legacy-alias-inventory.test.ts`
- `tests/unit/phase-21-admin-permission-boundary-review.test.ts`
- `tests/unit/phase-22-content-admin-cookie-session-repair.test.ts`
- `tests/unit/phase-8-admin-org-auth-redeem-ui.test.ts`
- `src/server/validators/personal-ai-generation-request.test.ts`
- `src/server/services/personal-ai-generation-request-service.test.ts`
- `src/server/services/personal-ai-generation-request-flow-service.test.ts`

The task-specific suites and adjacent admin AI persistence suite passed after the fix.

## Taste Checklist

- API JSON fields remain camelCase.
- DB naming remains snake_case and only existing `org_auth.public_id` is selected.
- No self-invented business abbreviation was added.
- No hardcoded UI color/token regression introduced.
- No formal content write path was bypassed.
- No sensitive raw provider payload, credential, or DB row was logged.
