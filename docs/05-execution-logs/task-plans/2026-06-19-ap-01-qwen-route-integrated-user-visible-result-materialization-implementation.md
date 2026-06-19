# AP-01 Qwen Route-Integrated User-Visible Result Materialization Implementation

## Task

- Task id: `ap-01-qwen-route-integrated-user-visible-result-materialization-implementation`
- Branch: `codex/ap-01-qwen-route-integrated-user-visible-result-materialization-implementation`
- Date: 2026-06-19
- Scope: implement a local controlled redacted result materialization path for the personal AI route-integrated runtime bridge.

## Read Baseline

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-record-architecture-decisions.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-local-first-testing-and-tooling.md`
- `docs/02-architecture/adr/adr-005-agent-system-dispatch-and-lifecycle.md`
- `docs/02-architecture/adr/adr-006-staging-production-and-openapi-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-route-integrated-user-visible-result-materialization-approval.md`

## Approved Boundary

- Allowed: scoped server service/contract/unit-test changes for redacted result materialization with fake or sanitized in-memory output.
- Allowed user-visible result fields: `contentPreviewMasked`, `contentDigest`, `contentVisibility`, `redactionStatus`, `evidenceStatus`, `citationCount`.
- Allowed persistent input fields: redacted snapshot, digest, masked preview, redacted citation snapshot, evidence status, citation count, AI call log public id, formal adoption blocked flag.
- Blocked: `.env.local` read, provider/model call, raw prompt, raw response, raw provider error, raw model output, provider payload, key/token/authorization header/database URL, schema/migration, dependency, app route, e2e runtime, staging/prod/deploy, Cost Calibration Gate, formal adoption, PR, push, force-push.

## Implementation Plan

1. Add a focused failing unit test for route-integrated redacted result materialization through the runtime bridge.
2. Add a small materialization service that builds a `PersonalAiGenerationResultPersistenceInput` from the request flow and a sanitized in-memory output fixture.
3. Extend the runtime bridge DTO with a redacted materialization summary and wire it only behind a server-side `runtimeBridgeControl.resultMaterialization` switch.
4. Verify that default runtime behavior stays blocked and that provider execution/env secret access remain false for the materialization path.
5. Add a route-level unit assertion proving client request bodies cannot enable materialization and server-side dependency injection can return only redacted result fields.
6. Run focused unit tests, lint, typecheck, Prettier, `git diff --check`, and Module Run v2 hardening/readiness gates.

## Evidence Rules

- Record only command name, pass/fail, test counts where available, and sanitized materialization flags.
- Do not record raw prompt, raw response, raw model output, provider payload, provider error text, keys, tokens, authorization headers, database URL, raw DB rows, screenshots, traces, or HTML reports.

## Risk Controls

- No provider execution control is provided for this implementation validation.
- No `.env.local` read is needed or allowed.
- Persistence is verified with an in-memory fake service/repository only.
- A redaction guard must block materialization if blocked keys or values appear in the DTO/input.
