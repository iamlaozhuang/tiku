# Phase 12 Experience Gap Closeout Plan

**Task id:** `phase-12-experience-gap-closeout-plan`

**Branch:** `codex/phase-12-experience-gap-closeout-plan`

**Goal:** Consolidate all Phase 12 role-scenario experience gap scans, classify gaps by role/type/severity, seed follow-up queue items, and close the verification-experience task group. This task is documentation/state/queue only and does not implement business fixes.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/02-architecture/interfaces/student-experience-contract.md`
- `docs/02-architecture/interfaces/phase-11-role-based-full-flow-acceptance-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-role-scenario-script-plan.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-student-experience-gap-scan.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-admin-experience-gap-scan.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-auth-organization-boundary-gap-scan.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-ai-redaction-runtime-gap-scan.md`

## allowedFiles

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`

## blockedFiles

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `.env.example`
- `.env.local`
- `src/**`
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`

## Role And Scenario Scope

Closed Phase 12 coverage:

- student: login/session, home authorization, practice, mock_exam, exam_report, mistake_book, ai_explanation visibility.
- admin/content: question, material, paper, knowledge_node, resource/content operations.
- admin/system ops: users, organizations, employees, org_auth, redeem_code, route guard, role boundaries.
- unauthenticated and insufficient-permission users.
- AI/redaction: model_provider, model_config, prompt_template, audit_log, ai_call_log, local mock AI/RAG snapshots.

Out of scope for this closeout:

- Business/UI/test implementation.
- Dependency, schema, migration, package, lockfile, script, or environment changes.
- Real provider, staging, prod, cloud, deployment, secret/env changes, or raw content/payload retention.

## Experience Script Design

1. Aggregate all Phase 12 gap ids from student/admin/auth/AI evidence.
2. Deduplicate overlapping gaps into follow-up work packages.
3. Preserve original gap ids in each follow-up task's sourceStory or title context.
4. Mark tasks requiring only local code/test/docs as `pending`.
5. Mark real provider/staging/secret tasks as `blocked` unless explicit future approval exists.
6. Update current task state and close this Phase 12 closeout task.

## Browser Verification Plan

No new browser operations are required for this docs-only closeout. Browser results are inherited from the four closed scan evidences:

- Playwright e2e: 15 Chromium tests passed in each scan task.
- Student manual localhost browser operation is recorded in the student evidence.
- Browser plugin limitations were recorded and Playwright was used as the reliable real-browser fallback.

## Code Cross-Check Paths

This closeout does not inspect new runtime paths beyond the four evidence files. It references original file/path evidence from:

- `2026-05-26-phase-12-student-experience-gap-scan.md`
- `2026-05-26-phase-12-admin-experience-gap-scan.md`
- `2026-05-26-phase-12-auth-organization-boundary-gap-scan.md`
- `2026-05-26-phase-12-ai-redaction-runtime-gap-scan.md`

## Risk Defense

- Documentation/evidence/queue/state only.
- No source code, tests, packages, lockfiles, schemas, migrations, scripts, env files, provider config, staging/prod/cloud, or deployment changes.
- Follow-up tasks preserve forbidden-scope guardrails.
- Gap severity is used for prioritization, not as proof that implementation is unsafe without reproducing in the follow-up task.

## Verification Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `npm.cmd run format:check`
- `git diff --check`

## Sensitive Information Red Lines

Do not record secrets, tokens, Authorization headers, database URLs, real customer data, raw provider payloads, raw prompts, raw answers, raw model responses, raw retrieved chunks, full教材, full paper/OCR text, plaintext redeem codes, generated passwords, or `.env.local` / `.env.example` contents.
