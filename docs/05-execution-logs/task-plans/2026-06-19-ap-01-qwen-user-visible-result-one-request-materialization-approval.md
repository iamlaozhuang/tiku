# AP-01 Qwen User-Visible Result One-Request Materialization Approval

## Task

- Task id: `ap-01-qwen-user-visible-result-one-request-materialization-approval`
- Branch: `codex/ap-01-qwen-user-visible-result-one-request-materialization-approval`
- Date: 2026-06-19
- Scope: docs-only approval for one real route-integrated Qwen request whose redacted result may enter the validated materialization path.

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
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-route-integrated-user-visible-result-materialization-implementation.md`

## Approval Boundary

- This task is docs/state approval only.
- This task does not read `.env.local`.
- This task does not execute provider/model calls.
- This task does not modify source, tests, scripts, e2e specs, schema, migrations, package files, lockfiles, provider configuration, staging/prod/cloud/deploy resources, or `.env*`.

## Approved Next Execution

- Next task: `ap-01-qwen-user-visible-result-one-request-materialization-execution`
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

## Materialization Boundary

- The one response may be transformed only transiently in memory into:
  - `contentDigest`
  - `contentPreviewMasked`
  - `contentVisibility=redacted_snapshot`
  - `redactionStatus=redacted`
  - `evidenceStatus`
  - `citationCount`
- The write may use only the existing validated materialization path and existing `personal_ai_generation_result` contract.
- Raw prompt, raw response, raw model output, provider payload, provider error text, key, token, Authorization header, database URL, `.env*` contents, and raw DB rows must not enter evidence, route responses, or persistence.
- Formal adoption remains blocked.

## Stop Conditions

- Missing `ALIBABA_API_KEY`.
- Provider error or timeout after the single request.
- Redaction violation before materialization.
- Existing route/materialization path cannot materialize the redacted result without source changes.
- Persistence failure.
- Token or cost ceiling exceeded.
- Any need for schema, migration, dependency, provider configuration, `.env*`, staging/prod/deploy, or external-service change.

## Validation Plan

- Format and check changed docs/state files.
- Run `git diff --check`.
- Run `npm.cmd run lint`.
- Run `npm.cmd run typecheck`.
- Run Module Run v2 pre-commit hardening and module closeout readiness for this task.

## Evidence Rules

- Evidence may record command names, pass/fail, request count, provider/model/base URL host, aggregate usage counts, redaction pass/fail, materialization status, and blocked gates.
- Evidence must not record raw prompt, raw response, raw model output, provider payload, raw provider error text, key, token, Authorization header, database URL, `.env*` contents, raw DB rows, screenshots, traces, or HTML reports.
