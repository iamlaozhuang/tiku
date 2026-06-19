# AP-01 Qwen3.7-Max one-request smoke approval plan

## Task

- Task id: `ap-01-qwen3-7-max-one-request-smoke-approval`
- Branch: `codex/ap-01-qwen3-7-max-one-request-smoke-approval`
- Date: 2026-06-19
- Task kind: provider smoke execution
- User approval: fresh approval to run exactly one local Qwen3.7-Max provider smoke request.

## Scope

Allowed:

- Read only `ALIBABA_API_KEY` from local-only `.env.local`.
- Inject the key only into the child process environment for the smoke runner.
- Execute exactly one provider request:
  - provider: `openai_compatible`
  - provider name: `alibaba-qwen`
  - model: `qwen3.7-max`
  - base URL: `https://dashscope.aliyuncs.com/compatible-mode/v1`
  - max requests: `1`
  - max output tokens: `8`
  - timeout: `30000` ms
  - max retries: `0`
- Record redacted evidence only.
- Update docs/state/evidence/audit files and create a local commit.

Blocked:

- No `.env.local` write, copy, echo, stage, or commit.
- No API key value, token, Authorization header, raw prompt, raw response, raw error, provider payload, raw model output,
  raw provider body, screenshot, trace, or HTML report in evidence.
- No second Qwen request or retry.
- No other provider/model call.
- No model id other than `qwen3.7-max`.
- No provider configuration source changes.
- No business code, tests, e2e, schema, migration, dependency, package, lockfile, script, staging/prod/cloud/deploy,
  payment, external-service, PR, push, force-push, or destructive DB work.
- Cost Calibration Gate remains blocked.

## Required Reading

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
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-exact-model-id-and-key-permission-handoff.md`
- `scripts/ai/run-personal-ai-provider-smoke.mjs`

## Execution Plan

1. Create this task plan, queue entry, evidence draft, and audit draft.
2. Confirm `.env.local` is ignored by Git.
3. Run smoke runner dry-run with the approved Qwen3.7-Max arguments.
4. Run local capability gates for `providerKey` and `providerCall`.
5. Run a scoped PowerShell preflight that reads only whether `ALIBABA_API_KEY` exists in `.env.local`; do not output its
   value.
6. Run exactly one child-process smoke execution with `TIKU_PROVIDER_SMOKE_APPROVED=1`.
7. Record only redacted result fields:
   - request count
   - provider call executed flag
   - result status
   - failure category if any
   - sanitized HTTP status/provider error code if any
   - duration
   - redacted usage summary if available
   - redaction status
8. Update state/evidence/audit, run validation gates, and commit locally.

## Closeout Criteria

- Evidence proves exactly one provider request was attempted.
- Evidence contains no key, raw prompt, raw response, raw error, provider payload, or raw model output.
- Module Run v2 pre-commit hardening and closeout readiness pass.
- No push or PR is created.
