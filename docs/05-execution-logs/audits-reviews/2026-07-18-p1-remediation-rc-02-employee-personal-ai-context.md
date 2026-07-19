# F-0143 employee personal AI context audit

## Review scope

This audit currently covers only the design transition from closed F-0117 to in-progress F-0143. Product implementation, implementation-plan compliance, and final closeout require later review entries.

## Transition Disposition

Decision: APPROVE_SCOPE

Approve only the exact F-0117-to-F-0143 state transition, option A written design, and its plan/evidence/audit/approval records. Product source and tests must remain unchanged until written-spec approval.

## Round 1

Result: pass

The security boundary is the selected authorization, not the employee label. Authentication establishes the actor; a server-revalidated authorization establishes the permitted source, owner, organization, capability, scope, and quota owner. Deriving ownership from `userType` before validating the selected authorization breaks that separation and conflicts with coexistence requirements.

Option A restores the invariant without trusting the client: the client supplies only an authorization identifier and request intent; the server resolves the identifier against authorizations available to the current actor and derives every ownership field itself. Personal and organization histories must use the same resolved context as creation so that visibility and quota attribution cannot diverge.

Disposition for design transition: approve, subject to guards and written-spec approval before implementation.

## Round 2

Result: pass

- Employee with organization standard plus personal advanced selects personal: must succeed as personal without organization quota use.
- Employee with both organization advanced and personal advanced: each selection must preserve distinct owner and quota attribution.
- Tampered client owner, organization, source, or quota metadata: must be ignored and replaced by server-derived facts.
- Authorization owned by another user or organization: must fail closed before persistence or Provider execution.
- Standard edition, missing AI capability, or mismatched profession/level: must fail closed.
- Multiple personal authorizations: request/result list, count, and detail must remain separated by the exact authorization public id.
- Context switch in the UI: stale request/result/detail state must clear before the selected context reloads.
- Deep-link result detail: selected authorization context must be present and revalidated; actor plus broad owner matching is insufficient.
- Learning session from an employee's personal result: must remain available with personal owner semantics.
- Expired, cancelled, downgraded, or continued generation: remains F-0142 and must not be implemented here.

Design-transition disposition: approve only the exact task materialization and written design. Any product or test diff before written-spec approval is a hard stop.

## Boundary review

- P1/P0/Module guards: unchanged.
- Ordinary in-progress SHA drift: not authorized.
- Product source/tests during transition: zero diff required.
- Schema/migration/dependency/database/Provider/runtime/P2/PR/force-push/deploy: blocked.
- WIP: exactly one active P1 task.
- Sensitive information: none recorded.

## Independent Transition Review

Result: pass

- Initial checkpoint finding: accepted after verifying `HEAD`, `master`, and `origin/master`; all recovery SHA fields now use `4f63c3c17731cbc686bb234b89a64c31f36ab03b`.
- Initial F-0142 scope finding: accepted after tracing `effective-authorization-service`, which filters lifecycle state. The spec now separates raw actor-to-authorization ownership validation for history from effective edition/capability/scope validation for generation.
- Initial allowlist finding: accepted after tracing the result route through the history model, validator, service, and repository. The exact missing chain and request API composition root are now listed, with the focused service test included.
- Independent re-review decision: `APPROVE`; no remaining Critical, Important, or Minor finding for the transition.
- Main-thread review decision: pass; the corrections preserve option A, avoid F-0142 behavior, and do not authorize any new high-risk capability.

## Pending final reviews

- Written-spec approval
- Implementation task reviews
- Whole-branch adversarial review
- Fresh closeout verification
