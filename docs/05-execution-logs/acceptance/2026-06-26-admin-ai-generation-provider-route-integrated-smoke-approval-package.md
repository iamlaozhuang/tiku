# Admin AI Generation Provider Route Integrated Smoke Approval Package

Task ID: `admin-ai-generation-provider-route-integrated-smoke-approval-package-2026-06-26`

## Decision

Decision: `CONDITIONAL_APPROVAL_BOUNDARY_PREPARED`.

The package does not execute real Provider calls and does not by itself approve credential reads in this task. It defines the boundary for a future execution path.

Current direct real Provider route smoke status: `not_ready_for_direct_execution`.

Reason: content and organization admin routes are now wired to the admin runtime bridge, but the route integration still exposes only provider-disabled diagnostics. A real Provider smoke through the admin route requires one narrow source task first: add a disabled-by-default provider-enabled admin route runtime bridge runner/control path with fake-provider TDD and no formal question/paper writes.

## Required Preceding Source Task

Recommended task ID:

`admin-ai-generation-provider-enabled-route-runtime-bridge-fake-provider-tdd-2026-06-26`

Minimum allowed outcome for that task:

- Add a provider-enabled route runtime bridge control/runner path for admin routes.
- Default behavior remains provider-disabled.
- Fake-provider tests prove content/org question/paper route workflows can traverse the route-integrated provider runner without reading credentials.
- Result persistence remains redacted generated result storage only.
- Formal `question` and `paper` writes remain blocked.
- No real Provider call, credential read, staging/prod, payment, external-service, deployment, or release readiness.

## Future Real Provider Smoke Boundary

After the preceding fake-provider source task passes and the owner separately opens an execution task that consumes this package, the future real Provider route-integrated smoke may run under these limits:

- Environment: local only.
- Routes/workflows:
  - content admin AI question generation.
  - content admin AI paper generation.
  - organization advanced admin AI question generation.
  - organization advanced admin AI paper generation.
- Maximum real Provider calls: 4 total, one per workflow.
- Retries: no automatic retry loop; each workflow gets at most one real call. A failed workflow records failure and stops.
- Persistence: use route-level fake/in-memory repositories unless a separate local DB smoke approval explicitly allows live DB. Do not run migrations.
- Formal content: do not write formal `question` or `paper` records.
- Provider/model selection: use the existing shared route-integrated Provider metadata/configuration conventions already present in the repository; do not introduce a new SDK/package/provider selection mechanism in the execution task.
- Credential source: read only the locally approved private credential source named by the execution task; do not write the credential to evidence, logs, fixtures, source, env files, or docs.
- Cost boundary: record token/cost summary only; no unbounded retries and no broad cost calibration beyond the four-call smoke.

## Evidence Redaction Rules

Allowed evidence fields:

- provider/model identifier.
- route/workflow.
- call count.
- status.
- latency/duration summary.
- token/cost summary.
- error category.
- local contract summary hit/miss.
- persistence mode, such as fake repository or separately approved local DB.
- redaction status.

Forbidden evidence fields:

- raw prompt.
- raw output.
- raw Provider request or response payload.
- API key.
- token.
- cookie.
- Authorization header.
- raw env values.
- raw generated content beyond redacted summaries.

## Failure Branches

- Missing credential: stop with `credential_missing`, do not retry, recommend credential setup or provider-disabled product closure.
- Provider call failed: stop with provider error category, do not retry outside the four-call cap, recommend focused provider diagnostic.
- Cost/token exceeds boundary: stop with `cost_boundary_exceeded`, recommend cost calibration package refresh.
- Route/product flow failed while Provider succeeded: stop with route/product diagnostic, do not broaden into DB/schema/formal content writes.
- Fake-provider source task not completed: do not execute real Provider route smoke; complete the fake-provider route runtime bridge TDD task first.

## Explicitly Excluded Gates

- Provider/Cost gate: not passed by this package; future execution still required.
- Staging/prod: excluded.
- Payment: excluded.
- External service beyond the explicitly approved Provider call in a future task: excluded.
- Deployment/release readiness: excluded.
- Formal question/paper adoption: excluded.
- Live DB/migration execution: excluded unless separately approved.
