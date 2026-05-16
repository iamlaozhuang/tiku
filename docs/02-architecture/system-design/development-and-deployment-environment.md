# Development and Deployment Environment

## Status

Current context.

## Purpose

Record the known local development and production deployment context for Tiku so future agent sessions do not infer the environment incorrectly.

## Local Development

- Primary development machine: Windows 11.
- Primary agent environment: Codex desktop.
- Local container runtime: Docker is available.
- Shell reality: PowerShell is the default shell in this workspace. PowerShell script execution may require `powershell.exe -NoProfile -ExecutionPolicy Bypass -File <script>`.
- Git Bash is available at `C:\Program Files\Git\bin\sh.exe` and is used by the current Husky hook path when needed.

## AI Providers

- The project will use domestic model providers, including DeepSeek and Qwen.
- Provider integration must stay behind project-owned AI service adapters.
- Model provider names, model config, AI call log, and AI call status must follow the project glossary terms:
  - `model_provider`
  - `model_config`
  - `ai_call_log`
  - `ai_call_status`
- Provider credentials must be environment variables and must not be committed.

## Production Deployment Target

- Production deployment target: Tencent Cloud.
- Deployment topology, network boundary, secret management, object storage, database service, and monitoring details are not finalized yet.
- Future Tencent Cloud deployment design must get its own plan or ADR before production work starts.

## Implications For Automation

- Local automation scripts should remain Windows-compatible and prefer PowerShell for repository-owned scripts.
- Docker may be used for local service dependencies such as PostgreSQL when Phase 1 selects the development database workflow.
- Any dependency, external service, secret, environment variable, deployment, or Tencent Cloud configuration change is high risk and requires explicit human approval under `docs/04-agent-system/sop/dependency-introduction-gate.md` and `docs/04-agent-system/state/project-state.yaml`.
- Do not claim production readiness until Tencent Cloud deployment design, environment variables, database migration flow, and rollback strategy are documented and verified.
