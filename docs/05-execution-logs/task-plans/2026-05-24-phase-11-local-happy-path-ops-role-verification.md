# Task Plan: phase-11-local-happy-path-ops-role-verification

## Task Claim

- Task id: `phase-11-local-happy-path-ops-role-verification`
- Branch: `codex/phase-11-local-happy-path-ops-role-verification`
- Phase: `phase-11-staging-release-planning`
- Human approval: user explicitly requested continuing local role-experience verification for system ops, content ops, and the relationship to the student happy path. No Tencent Cloud, deployment, staging/prod connection, secret/env, dependency, schema, migration, script, package, or lockfile work is approved.

## Boundary

This task is planning and verification first. It records local role experience paths, runs local-only validation, classifies findings, and decides whether any follow-up task is needed.

This task must not:

- change application runtime code unless a later explicit local UI/runtime fix task is created and approved;
- change dependencies, `package.json`, or lockfiles;
- read or output `.env.local`;
- change secrets or env files;
- change schema, migration, or scripts;
- create cloud resources;
- deploy;
- connect to `staging` or `prod`;
- call external providers;
- record secrets, tokens, Authorization headers, raw provider payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR text, plaintext `redeem_code`, or customer/private data.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/interfaces/phase-11-staging-release-planning-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-05-24-phase-11-local-happy-path-experience-plan.md`
- `docs/05-execution-logs/evidence/2026-05-24-phase-11-local-happy-path-student-answer-flow.md`
- `docs/05-execution-logs/evidence/2026-05-24-phase-11-local-happy-path-student-session-controls.md`
- `docs/05-execution-logs/evidence/2026-05-24-phase-11-local-happy-path-redeem-code-loop.md`
- `docs/05-execution-logs/audits-reviews/2026-05-24-phase-11-staging-required-role-flow-closures.md`
- `docs/05-execution-logs/evidence/2026-05-24-phase-11-staging-required-role-flow-closures.md`

## Local Role Experience Path Plan

### System Ops

1. Log in through the local dev UI using existing documented local seed/fixture behavior only.
2. Verify `/ops/users`:
   - user list renders;
   - filter/search affordance is visible or explicitly unavailable;
   - detail/status/reset-password affordances do not expose secrets or internal auto-increment ids;
   - write actions are clearly guarded or explicitly unavailable.
3. Verify `/ops/organizations`:
   - organization list renders;
   - hierarchy/status/org_auth relationship is visible;
   - detail/filter affordance is visible or explicitly unavailable;
   - org_auth creation entry is discoverable and scoped.
4. Verify `/ops/redeem-codes`:
   - redeem_code list renders;
   - detail/status fields are understandable without plaintext card leakage;
   - generation entry is discoverable;
   - plaintext-unavailable state remains clear.
5. Verify `/ops/ai-audit-logs` and `/ops/audit-logs`:
   - AI call log/audit log entry is reachable;
   - filters are visible or explicitly unavailable;
   - no raw provider payload, raw prompt, raw answer, raw model response, token, or Authorization header is rendered.
6. Record which actions are local writable closures and which are read-only/entry validation.

### Content Ops

1. Verify `/content/questions`:
   - question list renders;
   - filter/search affordance is visible or explicitly unavailable;
   - question detail/action states are clear;
   - unavailable create/edit/copy/disable actions are not enabled dead ends.
2. Verify `/content/materials`:
   - material list renders;
   - filter/detail states are clear;
   - unsupported write actions are explicit.
3. Verify `/content/papers`:
   - paper list renders;
   - filter/detail states are clear;
   - assemble/publish/archive/copy entry states are explicit;
   - paper-to-student `practice` and `mock_exam` relationship is clear enough for local acceptance.
4. Verify `/content/knowledge-nodes`:
   - knowledge_node list renders;
   - detail/filter states are clear;
   - create/edit/disable path remains the currently accepted content ops write-capable path if available.
5. Verify RAG/resource entry surfaces through `/ops/resources` and content knowledge surfaces:
   - list/filter state is clear;
   - resource/knowledge_base/chunk/citation/evidence_status copy does not leak raw content;
   - unsupported write actions are explicitly scoped out.
6. Record which content ops data affects student `practice` and `mock_exam`.

### Student Association Recheck

1. Verify `/home` still links to actionable `practice` and `mock_exam` flows.
2. Verify `/practice?paperPublicId=paper-dev-theory` displays answer options, can save/submit an answer, and supports restart.
3. Verify `/mock-exam?paperPublicId=paper-dev-theory` displays answer options, can save an answer, and can submit.
4. Verify `/profile` exposes logout.
5. Verify the redeem_code status copy remains clear and does not imply a false local plaintext card source.
6. If system ops cannot locally generate a usable plaintext card under approved boundaries, record it as a follow-up task rather than faking a redemption closure.

### Error States

Check and classify:

- empty or no-data states;
- loading failure states;
- unauthenticated/no-permission states;
- operation conflict states;
- unconfigured states;
- entry exists but capability not ready states.

## Issue Record Format

Every finding must include:

- id;
- severity: `P0`, `P1`, `P2`, or `P3`;
- affected role;
- reproduction path;
- actual result;
- expected result;
- whether it blocks local happy path;
- whether it blocks staging entry;
- recommended follow-up task split.

## Allowed Files

- `docs/05-execution-logs/task-plans/2026-05-24-phase-11-local-happy-path-ops-role-verification.md`
- `docs/05-execution-logs/audits-reviews/2026-05-24-phase-11-local-happy-path-ops-role-verification.md`
- `docs/05-execution-logs/evidence/2026-05-24-phase-11-local-happy-path-ops-role-verification.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Blocked Files

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `.env.local`
- `src/**`
- `drizzle/**`
- `scripts/**`

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-local-happy-path-ops-role-verification`
- `Select-String -Path 'docs\05-execution-logs\audits-reviews\2026-05-24-phase-11-local-happy-path-ops-role-verification.md' -Pattern 'system ops|content ops|student|P0|P1|P2|P3|stagingDecision'`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Risk Controls

- Keep all evidence route-level and state-level.
- Use only existing local dev seed/fixture behavior.
- Do not record credentials, tokens, plaintext `redeem_code`, private content, raw AI payloads, or full paper/material text.
- Treat missing local generation/security capability as a follow-up finding, not as a reason to bypass permissions or invent production-like behavior.
- Keep Tencent Cloud, preview, staging, prod, deployment, cloud resources, dependencies, env, schema, migration, and scripts paused.
