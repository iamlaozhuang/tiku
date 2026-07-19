# Employee personal AI selected authorization context design

## Goal

Allow an employee who also owns a valid personal advanced authorization to explicitly generate and browse personal AI content without being silently forced into the organization context. Preserve valid organization generation as a separate, explicit context.

## Invariants

1. The authenticated session determines the actor.
2. The exact server-revalidated `authorizationPublicId` determines authorization source, owner, and organization for every operation; generation additionally derives capability, scope, and quota owner from the current effective authorization.
3. `userType` must not replace a valid selected `personal_auth` with `org_auth`.
4. Client-supplied owner, organization, source, and quota-owner metadata is never authoritative.
5. Creation, request history, result history, and result detail use the same selected-context boundary.
6. Personal and organization records never form an implicit union.

## Server selected-context policies

Introduce a shared server service with two explicit policies so history isolation does not silently implement F-0142 authorization-termination behavior.

The ownership policy, used by request/result history and result detail, must:

- require an exact authorization public id;
- resolve raw personal and organization authorization rows belonging to the authenticated user, before effective/lifecycle filtering;
- accept `personal_auth` owned by the current user whether the user's current type is personal or employee;
- derive personal owner, no organization owner, and personal quota ownership for `personal_auth`;
- accept `org_auth` only when the authenticated employee belongs to that exact organization;
- derive organization owner and organization quota ownership for `org_auth`;
- reject an unknown or foreign authorization id;
- not evaluate active/expired/cancelled status, edition, capability, upgrade, downgrade, or continuation policy.

The generation policy must first establish ownership, then resolve the same exact id from current effective authorization contexts. It additionally requires advanced edition, the relevant AI-generation capability, requested profession/level scope, and the existing local production-enablement policy. It returns typed server-derived generation facts or one uniform fail-closed authorization result without executing an external Provider.

## Generation request

The generation POST route must resolve the selected context before persistence or Provider invocation. It must overwrite, rather than compare against or trust, any client ownership metadata. The actor remains the session user.

Expected behavior:

- employee + personal advanced selection creates a personal-owned request and consumes personal quota;
- employee + matching organization advanced selection creates an organization-owned request and consumes organization quota;
- wrong user, wrong organization, standard edition, missing capability, wrong scope, or unknown authorization id returns `403057` without persistence or Provider execution;
- existing idempotency and request validation contracts remain unchanged.

## Request and result history

History endpoints require the selected `authorizationPublicId`. They apply the ownership policy and derive the allowed owner before querying. They do not add a lifecycle/edition/capability decision; F-0142 remains unchanged.

Repository list, count, and detail queries include the exact stored authorization public id in addition to actor and derived owner constraints. This separates multiple personal authorizations as well as personal and organization contexts. A result deep link without a valid selected context must fail closed; actor plus broad owner matching is not sufficient.

The request collection plus result collection/detail API routes inject the existing raw authorization repository into the shared ownership policy. Generation continues to use the current effective-authorization service for capability and scope decisions. No schema or database execution is required because generation tasks already persist the authorization public id.

## UI behavior

- Continue to default to the effective personal context when both personal and organization contexts exist.
- Pass the selected authorization public id to generation, request history, result history, and result detail calls.
- When selection changes, clear stale request history, result history, and selected result detail before reloading the new context.
- Keep loading, empty, error, and explicit-context labels stable.
- Do not automatically switch contexts because of edition, capability, or quota outcomes.
- Treat the UI as an intent surface, never as the authorization boundary.

## Learning-session compatibility

Do not redesign the learning-session route. Add regression coverage showing that an employee can create a learning session from a personal-owned persisted result and that personal ownership remains intact. Authorization expiry, cancellation, downgrade, and continuation behavior belongs to F-0142.

## RED-to-GREEN matrix

1. Employee with organization standard and personal advanced selects personal.
2. Employee with personal advanced and organization advanced selects each context independently.
3. Client ownership metadata is tampered with but server-derived facts prevail.
4. Generation under a wrong actor, organization, scope, edition, capability, or authorization id causes zero persistence and zero Provider execution.
5. Request list/count and result list/count/detail filter by exact selected authorization public id.
6. Multiple personal authorizations do not mix records.
7. UI defaults to personal, sends the selected id to every relevant endpoint, and reloads cleanly on context switch.
8. Employee personal result remains eligible for learning-session creation.
9. History ownership resolution accepts an owned non-effective authorization context exactly as before F-0143 while still rejecting a foreign context; lifecycle blocking remains F-0142.

## Non-goals and stop conditions

- No F-0142 termination or continuation policy.
- No schema, migration, dependency, database execution, external Provider execution, browser/runtime acceptance, P2 work, PR, force push, or deployment.
- No change outside the active task allowlist.
- Stop if implementation needs a new persisted field, a widened authorization union, client-trusted ownership, weakened guard, or a second in-progress task.

## Approval gate

The user approved design option A. This written specification still requires explicit review approval before the implementation plan, RED tests, or product source changes begin.
