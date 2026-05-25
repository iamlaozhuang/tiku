# Task Plan: Phase 11 Local Runtime Capability Queue Seeding

## Task

Register the next five local-first Phase 11 tasks so local upload, parsing, mock RAG, real-provider smoke, and cloud adapter readiness can be executed as separate reviewable units.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/05-execution-logs/evidence/2026-05-25-phase-11-paper-asset-local-boundary-closeout.md`

## Scope

Allowed changes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- this task plan and evidence

Forbidden changes:

- No runtime code.
- No dependency, package, lockfile, schema, migration, script, or environment file changes.
- No `.env.local` read or output.
- No staging/prod connection, deployment, cloud resource change, public object storage URL, real provider call, or destructive data operation.

## Queue Plan

1. `phase-11-local-file-upload-storage-adapter`
2. `phase-11-local-text-document-parser-boundary`
3. `phase-11-local-rag-mock-embedding-pipeline`
4. `phase-11-local-real-provider-smoke-boundary`
5. `phase-11-cloud-adapter-readiness-contract`

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-local-runtime-capability-queue-seeding`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Risk Defense

- Keep each implementation task independently reviewable.
- Block dependency, schema, migration, script, cloud, secret/env, staging/prod, and provider-cost work unless each future task explicitly records approval.
