# AP-01 Qwen exact model id and key permission handoff plan

## Task

- Task id: `ap-01-qwen-exact-model-id-and-key-permission-handoff`
- Branch: `codex/ap-01-qwen-exact-model-id-and-key-permission-handoff`
- Date: 2026-06-19
- Task kind: docs/state handoff and approval package preparation
- User request: research official Alibaba Bailian/DashScope guidance for a Beijing `TikuProject` business space using `qwen3.7-max`, then materialize a docs-only handoff before any new Qwen retry.

## Scope

Allowed:

- Record official Alibaba Bailian/DashScope documentation findings for:
  - Beijing OpenAI-compatible base URL.
  - exact `qwen3.7-max` model id.
  - API Key business-space permission boundary.
  - current project `.env.local` key name expectations.
- Record user-visible console facts from the provided redacted screenshot without copying any key fragment.
- Update governance state, coverage matrix, evidence, and audit review.
- Run docs/state validation gates.
- Create a local commit.

Blocked:

- No `.env.local` read, write, copy, echo, stage, or commit.
- No provider/model call.
- No Qwen retry.
- No API key validation request.
- No provider configuration source change.
- No business code, tests, e2e, schema, migration, dependency, package, lockfile, script, staging/prod/cloud/deploy, payment, external-service, PR, push, or force-push work.
- No raw prompt, raw response, raw provider payload, raw error, Authorization header, token, secret, or key material in evidence.

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
- `scripts/ai/run-personal-ai-provider-smoke.mjs` read-only behavior review
- Prior AP-01 Qwen evidence and audit files as referenced by the queue.

## Official Documentation Sources

- Alibaba Bailian OpenAI Chat compatibility:
  - `https://help.aliyun.com/zh/model-studio/compatibility-of-openai-with-dashscope`
- Alibaba Bailian API Key acquisition and business-space permission:
  - `https://help.aliyun.com/zh/model-studio/get-api-key`
- Alibaba Bailian permission management:
  - `https://help.aliyun.com/zh/model-studio/permission-management-overview`
- Alibaba Bailian text generation model list:
  - `https://help.aliyun.com/zh/model-studio/text-generation-model/`
- Alibaba Bailian environment variable recommendation:
  - `https://help.aliyun.com/zh/model-studio/configure-api-key-through-environment-variables`

## Implementation Plan

1. Confirm repository starts clean and create a short-lived `codex/` branch.
2. Record official configuration decision:
   - Beijing OpenAI-compatible base URL: `https://dashscope.aliyuncs.com/compatible-mode/v1`.
   - Chat completions endpoint implied by OpenAI-compatible mode: `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`.
   - Model id for the intended next retry: `qwen3.7-max`.
   - Dated snapshots are separate ids and require explicit approval if used.
3. Record project-specific `.env.local` guidance:
   - Current smoke runner reads the CLI-specified env key; for this project use `ALIBABA_API_KEY`.
   - Official docs commonly use `DASHSCOPE_API_KEY`, but the current project runner and `.env.example` use `ALIBABA_API_KEY`.
   - `ALIBABA_BASE_URL` and `ALIBABA_MODEL` can be documented for human clarity, but the current runner does not automatically read them.
4. Materialize the docs-only approval handoff:
   - task plan, evidence, audit review.
   - `task-queue.yaml`, `project-state.yaml`, and `local-experience-coverage-matrix.yaml`.
5. Validate with formatting, lint/typecheck, diff check, and Module Run v2 scripts.
6. Commit locally only.

## Risk Controls

- Evidence must not include the visible masked API key fragment from the screenshot.
- The next Qwen execution must remain blocked because it changes the model from prior `qwen-plus` retries to `qwen3.7-max`.
- Cost Calibration Gate, staging/prod/cloud/deploy, additional provider calls, and provider configuration changes remain blocked.

## Expected Closeout

- Docs/state package records exact configuration and permission boundary.
- User receives concrete `.env.local` guidance and the next fresh approval boundary.
- No provider call is made in this task.
