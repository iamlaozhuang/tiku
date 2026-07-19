# F-0143 employee personal AI context audit

## Review scope

This audit covers the design transition and the complete F-0143 product diff. Git closeout remains a later state transition and is not pre-claimed.

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

## Closeout state

- Written-spec approval: complete.
- Implementation task reviews: complete.
- Whole-branch adversarial review: complete.
- Fresh product validation: complete.
- Governance gates and Git closeout: pending.

## Product Round 1

Decision: APPROVE_PENDING_INDEPENDENT_REVIEW

- Raw ownership and effective generation remain separate first-principles policies. History proves actor-to-authorization ownership only; generation additionally proves current effective advanced edition, exact scope, capability, and the existing production-enablement exception.
- Generation overwrites every client owner/source/organization/quota fact and fails closed when raw/effective dependencies or exact authorization are missing.
- Request/result list, count, and detail retain actor plus resolved owner and exact selected authorization constraints; result detail no longer searches a broad page in memory.
- UI selection owns every read surface, clears old context data before reload, and prevents old context/detail promises from repopulating the new view.
- Employee-personal learning-session behavior remains available without importing F-0142 lifecycle decisions.
- Scope review found only the 22 allowlisted product/plan files and zero blocked changes.

## Product Round 2 initial findings

Decision: CHANGES_REQUESTED

- Critical: authorization scope parsing accepted numeric `level` only, while the canonical validator accepted numeric strings. A numeric string could become a null authorization scope, bypass exact scope matching, reach persistence/Provider, and omit selected authorization from the idempotency hash.
- Important: request/result pagination shared one sequence. Interleaved single-side pagination could stale-return the other handler and leave its loading state permanently unresolved.
- Minor: the canonical detail repository port accepted an exact/owner-only union, so `authorizationPublicId` was not mandatory at the type boundary.
- No other functional, security, allowlist, blocked-surface, redaction, or F-0142 scope finding was identified.

## Review fix disposition

Decision: ALL_FINDINGS_CLOSED

- Critical closed: an explicit absent/invalid/valid scope reader now mirrors canonical `level` normalization (`1..5`, number or numeric string). Local-browser generation rejects absent/invalid scope before persistence/Provider. Adversarial tests prove zero writes/calls and distinct idempotency hashes for two same-owner personal authorizations.
- Important closed: request/result histories use independent sequences. Context/task/combined loads invalidate both; a single pagination action invalidates only its own side. Three delayed-Promise tests cover both pagination orders and pending initial result load.
- Minor closed: selected-context result detail uses a dedicated exact-authorization repository port; learning-session keeps its explicit owner-only lookup with unchanged source behavior.
- Main-thread focused verification passed `57/57`, `25/25`, and `43/43` for the three fixes.

## Product Round 2 final rereview

Decision: READY_FOR_GOVERNANCE_CLOSEOUT

- Independent rereview result: `Critical 0 / Important 0 / Minor 0`; no new or omitted finding.
- Product/implementation-plan diff: 19 tracked modifications plus 3 approved untracked files, all in the F-0143 allowlist. With evidence/audit alignment, the current worktree has 24 allowlisted files total; blocked-file matches remain zero.
- Final focused suite: `9/9` files, `226/226` tests.
- Final full unit: `421/421` files, `2773/2773` tests after an unrelated full-load UI timing failure passed both exact-case and complete-file isolation without task-external changes.
- Lint, typecheck, format, diff check, and the root-installed-dependency directed production build passed; build generated `96/96` static pages.
- Database, schema, migration, dependency, external Provider, browser/runtime, P2, PR, force push, and deployment boundaries remain unchanged and unexercised.
- No unresolved product/review blocker remains. This decision authorizes only the already approved governance-gate and Git closeout sequence; any guard failure remains a hard block.

## Final Disposition

Result: pass

The complete product diff passed two-round adversarial review and fresh static validation. Product commit and later Git/state transitions remain governed separately and are not pre-claimed by this review disposition.

## Post-merge closeout review

Decision: BLOCKED_GOVERNANCE_CONTRACT_MISMATCH

- Product implementation, validation, two reviews, product/ready commits, ff-only merge, normal push, and product worktree/branch cleanup are complete.
- The existing Program contract closes a task only while materializing its successor. The P1 guard likewise requires one active current task while the Program is `in_progress`.
- A no-successor `closed` projection would require either falsely closing the entire P1 Program or changing/bypassing the guard. Both violate the approved boundary and the deferred checkpoint instruction.
- No state/queue edit, next-task materialization, guard change, or next product RED was performed. The only valid disposition is to keep F-0143 `ready_for_closeout` and request revised direction or the complete v2.1 charter before any mechanism change.
