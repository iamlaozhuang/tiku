# Task Plan: Phase 11 Local System Validation

## Task Source

User request on 2026-05-25 to pause Phase 11 staging implementation planning and run one systematic local validation pass from clean `master`.

This is a local/dev validation and audit task. It does not approve staging/prod connection, deployment, cloud resource changes, dependency changes, package or lockfile changes, schema or migration changes, script changes, secret/env changes, or destructive data operations.

## Branch

- `codex/phase-11-local-system-validation`

## Required Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/interfaces/phase-11-staging-release-planning-contract.md`
- `docs/02-architecture/interfaces/phase-11-staging-resource-plan.md`
- `docs/02-architecture/interfaces/phase-11-staging-secret-and-env-plan.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-25-phase-11-pause-and-local-validation-handoff.md`

## Scope

1. Verify repository state, queue state, and external readiness consistency.
2. Run local quality gates:
   - `Test-AgentSystemReadiness.ps1`
   - `Invoke-QualityGate.ps1`
   - `Test-NamingConventions.ps1`
   - `Test-GitCompletionReadiness.ps1 -BaseBranch master`
   - `git diff --check`
3. Run local build:
   - `npm.cmd run build`
4. Run E2E:
   - `npm.cmd run test:e2e`
5. Review local product/runtime risk areas:
   - `auth/session`
   - `practice`, `mock_exam`, `exam_report`, `mistake_book`
   - `question`, `material`, `paper`
   - admin ops
   - `audit_log`
   - `ai_call_log`
   - AI/RAG mock/local boundary
6. Record controlled local content-backend experience without full textbook, full paper, OCR full text, customer-like private data, secrets, raw prompts, raw answers, raw model responses, provider payloads, or Authorization headers.
7. Attempt at most five local/dev real AI provider calls only if already configured without reading or printing `.env.local` secrets; otherwise record the reason and use mock/local AI validation.

## Explicit Blockers

- Do not read or output `.env.local`.
- Do not connect to staging or prod.
- Do not deploy.
- Do not modify cloud resources, DNS, Tencent Cloud COS, or public object storage URLs.
- Do not add, remove, or upgrade dependencies.
- Do not modify `package.json` or lockfiles.
- Do not modify schema, migration, or script files.
- Do not record secret values, tokens, Authorization headers, raw provider payloads, raw prompts, raw answers, raw model responses, full paper, full textbook, OCR full text, or customer/customer-like private content.

## Evidence Plan

Evidence will record:

- exact commands and pass/fail status;
- sanitized output summaries;
- P0/P1/P2/P3 issue list;
- AC-to-runtime matrix;
- local content-backend experience status;
- local/dev AI call count, success/failure status, fallback status, duration range, and error category only;
- repository hygiene closeout;
- `stagingDecision`;
- next recommendations.

## Risk Handling

If validation finds a potential code fix, classify it first. Pause for approval before touching dependency, schema, migration, script, secret/env, Tencent Cloud, staging/prod, deployment, major permission model, or destructive data paths.
