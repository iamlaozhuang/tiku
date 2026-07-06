# 2026-07-06 Personal AI Generation Authorization Gate Fix Evidence

## Scope

- Branch: `fix/personal-ai-generation-authorization-gate-2026-07-06`
- Base: current `master` at runtime-acceptance start
- Fix target: `POST /api/v1/personal-ai-generation-requests` local browser experience authorization gate
- Data source: local 0704 DB only
- Redaction: no credentials, cookies, session tokens, DB raw rows, internal ids, Provider payloads, raw prompts, raw AI output, or full question/paper/material content recorded

## Root Cause

- The student UI filtered advanced AI entry points through `/api/v1/authorizations`.
- The backend local browser experience branch trusted route-local server-owned metadata but did not re-check the service-computed effective authorization context before persistence or Provider bridge execution.
- A standard employee session could direct POST a standard org authorization public id and receive an accepted local AI generation response.

## Code Change Summary

- Added server-side effective authorization lookup to the personal AI generation request route.
- The local browser experience branch now requires:
  - matching requested authorization public id,
  - `effectiveEdition = advanced`,
  - AI generation capability for the requested task type,
  - owner/quota/organization boundary matching the current user context.
- Standard or mismatched contexts return code `403057`.
- Production-enable blocked advanced contexts remain eligible for local acceptance; Provider execution remains controlled by the runtime bridge.
- App route now injects the existing effective authorization service from the student authorization runtime repository.

## TDD Evidence

1. Baseline before test change:
   - Command: `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts`
   - Result: 28 tests passed.
2. RED 1:
   - Added standard employee direct POST test.
   - Result before fix: expected `403057`, received accepted response; Provider bridge was reachable.
3. GREEN 1:
   - Command: `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts`
   - Result: 29 tests passed.
4. RED 2:
   - Added advanced employee local browser POST test with `production_enablement_blocked`.
   - Result before adjustment: expected accepted response, received `403057`.
5. GREEN 2:
   - Command: `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts`
   - Result: 30 tests passed.

## Verification Commands

- `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts`
  - Result: 1 file / 30 tests passed.
- `npm.cmd run typecheck`
  - Result: passed.
- `npm.cmd run lint -- src/server/services/personal-ai-generation-request-route.ts src/server/services/personal-ai-generation-request-route.test.ts src/app/api/v1/personal-ai-generation-requests/route.ts`
  - Result: passed.

## Runtime Evidence

- Service: localhost `127.0.0.1:3107`
- Server branch: `fix/personal-ai-generation-authorization-gate-2026-07-06`
- DB: local 0704 DB selected from local env, value not recorded
- Provider mode: disabled by empty local Provider credential in process env, value not recorded
- Dev server mode: webpack, because Turbopack root inference failed inside linked worktree
- Worktree-only `node_modules` junction: ignored by Git, points to existing workspace dependency directory; no package or lockfile changes

### Standard Employee Direct POST

- Candidate employee count: 26
- Checked candidate count: 1
- Selected role class: standard employee
- Authorization context count: 1
- Advanced AI context count: 0
- POST status: 200
- API code: `403057`
- API message: `Personal AI generation is not available for this authorization.`
- Response data present: false
- Provider bridge fields: absent because request was rejected before bridge execution

### Advanced Employee Direct POST

- Candidate employee count: 26
- Checked candidate count: 9
- Selected role class: advanced employee
- Authorization context count: 8
- Advanced AI context count: 3
- POST status: 200
- API code: `0`
- Flow status: `accepted`
- Bridge status: `controlled_runner_ready`
- Provider call executed: false
- Provider configuration read: false
- Runtime result status: `blocked`
- Failure category: `insufficient_grounding_evidence`
- Visible generated content present: false

## DB Mutation Note

- Runtime validation inserted short-lived temporary `auth_session` rows to exercise localhost session-backed APIs because current private employee CSV credentials did not authenticate against the local 0704 DB.
- No user, organization, authorization, generation result, prompt, Provider, or training data was modified by the standard rejection path.
- The advanced acceptance path may create normal local AI generation request metadata through the API route; evidence records only aggregate status.

## Non-Claims

- This evidence does not claim full release readiness.
- This evidence does not claim production usability.
- This evidence does not claim Cost Calibration.
- This evidence does not replace broader Provider-enabled small-sample or three-loop runtime acceptance evidence.
