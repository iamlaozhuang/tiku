# AP-01 Qwen User-Visible Result One-Request Materialization Execution

## Task

- Task id: `ap-01-qwen-user-visible-result-one-request-materialization-execution`
- Branch: `codex/ap-01-qwen-user-visible-result-one-request-materialization-execution`
- Date: 2026-06-19
- Scope: execute exactly one real route-integrated Qwen request and send only the redacted result summary through the already validated materialization path.

## Read Baseline

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-route-integrated-provider-one-request-execution.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-route-integrated-user-visible-result-materialization-implementation.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-user-visible-result-one-request-materialization-approval.md`

## Approval Boundary

- Provider: `openai_compatible`
- Provider name: `alibaba-qwen`
- Model: `qwen3.7-max`
- Base URL: `https://dashscope.aliyuncs.com/compatible-mode/v1`
- Env key alias: `ALIBABA_API_KEY`
- Max requests: `1`
- Max retries: `0`
- Max output tokens: `8`
- Timeout: `30000` ms
- Max spend ceiling: `0.10` USD
- Streaming: blocked
- Cost Calibration Gate: blocked

## Execution Plan

1. Create the execution task queue entry and current task state before running the provider call.
2. Run a redacted inline local runner through the existing route-integrated provider execution path.
3. Stop after exactly one request regardless of provider pass/fail.
4. If the provider request passes, send only sanitized metadata into the existing validated result materialization service with in-memory persistence.
5. Record only sanitized status, counts, aggregate usage, materialization pass/fail, and blocked gates in evidence.
6. Run formatting, lint, typecheck, diff check, and Module Run v2 hardening/readiness gates.
7. Create one local commit; do not merge, push, deploy, or create a PR.

## Materialization Boundary

- Allowed materialized result fields:
  - `contentPreviewMasked`
  - `contentDigest`
  - `contentVisibility=redacted_snapshot`
  - `redactionStatus=redacted`
  - `evidenceStatus`
  - `citationCount`
- Raw prompt, raw response, raw model output, provider payload, raw provider error text, key, token, Authorization header, database URL, `.env*` contents, raw DB rows, screenshots, traces, and HTML reports must not enter evidence or persistence.
- Existing path only: no source, test, schema, migration, dependency, script, e2e, or provider configuration changes.

## Stop Conditions

- Missing `ALIBABA_API_KEY`.
- Provider error or timeout after the single request.
- Redaction violation before materialization.
- Existing route/materialization path cannot materialize the redacted result without source changes.
- Persistence failure.
- Token or cost ceiling exceeded.
- Any need for schema, migration, dependency, provider configuration, `.env*`, staging/prod/deploy, or external-service change.

## Validation Plan

- `node_modules\.bin\tsx.cmd --tsconfig tsconfig.json - <redacted route-integrated one-request materialization runner via stdin>`
- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-qwen-user-visible-result-one-request-materialization-execution`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen-user-visible-result-one-request-materialization-execution`
