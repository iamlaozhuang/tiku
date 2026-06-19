# AP-01 Qwen Console Permission Remediation Handoff Task Plan

## Task

- Task id: `ap-01-qwen-console-permission-remediation-handoff`
- Branch: `codex/ap-01-qwen-console-permission-remediation-handoff`
- Task kind: `docs_state_handoff`
- Date: `2026-06-19`
- User request: create a docs-only handoff after the redacted Qwen one-request diagnostic returned sanitized HTTP `403`,
  using the user-provided Bailian/DashScope console screenshot to separate confirmed console facts from the remaining
  user-side permission checks before any future retry.

## Scope

Allowed files:

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-01-qwen-console-permission-remediation-handoff.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-console-permission-remediation-handoff.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-01-qwen-console-permission-remediation-handoff.md`

Blocked files and actions:

- Reading, writing, copying, staging, committing, or outputting `.env*` or `ALIBABA_API_KEY`.
- Provider/model calls, Qwen retry, additional provider execution, provider configuration changes, and Cost Calibration
  Gate.
- Product source, tests, e2e, schema, migration, dependency, package, lockfile, or script changes.
- Staging/prod/cloud/deploy, payment, external-service, PR, push, force-push, destructive DB.
- Raw screenshots, raw console secrets, raw prompts, raw provider payloads, raw responses, raw errors, key, token,
  Authorization header, env value, database URL, or secret evidence.

## Screenshot-Derived Boundary

Confirmed from the user-provided console screenshot:

- Bailian/DashScope console page is under business space management.
- Region selector shows `华北2（北京）`.
- Workspace/business space path shows `TIKUProject`.
- Visible model list rows include authorized model invocation for `Qwen3.7-Plus`, `Qwen3.7-Max`, and `Qwen3.6-Plus`.

Not confirmed by the screenshot:

- The local `.env.local` `ALIBABA_API_KEY` belongs to the same Beijing `TIKUProject` workspace/sub-workspace.
- The exact retry API model id is `qwen-plus`; the screenshot shows console labels, not necessarily the API model id
  accepted by the OpenAI-compatible endpoint.
- The key is permitted to call `https://dashscope.aliyuncs.com/compatible-mode/v1`.
- Any raw key value or raw console secret.

## Documents Read

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
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-one-request-redacted-error-code-diagnostic-run.md`

## Handoff Checklist For User

Before any future Qwen retry, confirm in Bailian/DashScope:

1. Region remains `华北2（北京）`.
2. Current business space remains `TIKUProject`.
3. The API key used as local `ALIBABA_API_KEY` was created for this same workspace/sub-workspace or otherwise has
   permission for it.
4. The exact API model id intended for retry is enabled in this workspace. If the console/API reference shows a model id
   different from `qwen-plus`, the future retry approval must explicitly approve that model id change.
5. The API key has permission to call the OpenAI-compatible endpoint at
   `https://dashscope.aliyuncs.com/compatible-mode/v1`.
6. Do not paste or upload the key value, raw Authorization header, raw provider error, or raw console secret into chat or
   evidence.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-qwen-console-permission-remediation-handoff`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen-console-permission-remediation-handoff`

## Stop Conditions

- Any need to inspect or output `ALIBABA_API_KEY`.
- Any need to read `.env.local`.
- Any request to run a provider call or retry Qwen in this task.
- Any need to change model/base URL/provider configuration before fresh approval.
- Any need to store screenshots, raw provider details, source code changes, tests/e2e, schema/migration, dependency, or
  cloud/deploy configuration.
