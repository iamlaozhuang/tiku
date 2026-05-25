# Phase 11 Role-Based Full-Flow Acceptance Rerun Task Plan

## Scope

Plan and execute one reusable role-based local acceptance automation pass for the Phase 11 release-candidate decision surface, then produce a staging acceptance template for later owner acceptance. This task is execution-ready for the next session, but this planning commit does not run the acceptance flow.

## Readiness Inputs

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/interfaces/phase-11-staging-release-planning-contract.md`
- `docs/04-agent-system/sop/mvp-queue-runner.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Human Approval Recorded

The user approved:

- one local role-based full-flow acceptance automation rerun;
- a reusable staging acceptance template;
- reusable automation assets;
- newly added test-only data;
- use of project-owned textbook and real paper assets as bounded test references;
- a data-readiness preflight and role execution order that accounts for different data prerequisites per role.

This approval does not authorize dependency/package/lockfile changes, schema/migration changes, script changes, `.env.local` or secret access, staging/prod connection, deployment, cloud resource changes, real provider calls, destructive data operations, or evidence that records full textbook, full paper, OCR full text, raw prompt, raw answer, raw model response, Authorization headers, tokens, secrets, or customer-like private content.

## Artifact Isolation

Committed reusable assets must stay under task-owned paths:

- `e2e/role-based-acceptance/**` for reusable role-flow specs, helpers, fixtures, and redacted test-only selectors.
- `docs/02-architecture/interfaces/phase-11-role-based-full-flow-acceptance-contract.md` for the acceptance contract if needed.
- `docs/05-execution-logs/acceptance/role-based-full-flow/**` for staging templates and durable human-review checklists.
- `docs/05-execution-logs/task-plans/2026-05-24-phase-11-role-based-full-flow-acceptance-rerun.md`
- `docs/05-execution-logs/evidence/2026-05-24-phase-11-role-based-full-flow-acceptance-rerun.md`

Runtime-generated screenshots, traces, video, and raw browser reports must remain outside committed source or inside existing ignored locations such as `/test-results` or `/playwright-report`. If artifact isolation requires a new ignore rule, pause for approval before editing `.gitignore`.

## Role Flows

The future task must cover, at minimum:

1. Student flow: login/session, visible authorized content, practice or mock entry, answer submission, report or feedback visibility, and purchase/contact guidance when authorization is missing.
2. Content ops flow: question/material write path, paper composition/publish path, and content visibility propagation.
3. System ops flow: user, organization, org_auth, redeem_code, and contact_config runtime management.
4. Oversight flow: audit_log and ai_call_log evidence points for relevant operations, with sensitive payload redaction.

## Test Data Rules

- Use only test-only records with a deterministic prefix such as `acceptance-20260524-`.
- Newly added test data must be clearly recoverable or isolated from ordinary development data.
- Project-owned textbook and real paper assets may be referenced only by bounded identifiers, titles, or short redacted snippets needed to prove UI behavior.
- Do not record full paper content, full textbook content, OCR full text, raw prompt, raw answer, raw model response, secrets, provider payloads, or customer-like private data in committed artifacts.
- Pause if the flow needs schema/migration/script changes, dependency changes, real provider calls, staging/prod access, or destructive cleanup beyond test-only records.

## Role Data Readiness Matrix

| Role or phase             | Data prerequisites                                                                                                                 | If already present                                                               | If missing                                                                                                                 | Evidence requirement                                                             |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Preflight Data Inventory  | Test-only user, organization, org_auth, redeem_code, contact_config, material, question, published paper, and audit/AI log anchors | Reuse only if records are clearly test-only and bounded to this acceptance run   | Create only test-only data through approved local runtime entrypoints; pause if schema/migration/script changes are needed | Inventory table with record labels or public identifiers only                    |
| System Ops Data Readiness | Admin/system ops account, organization tree, org_auth, redeem_code, contact_config                                                 | Verify management screens/API show expected test-only records                    | Create or repair test-only records before student/content flows                                                            | Runtime proof for each managed entity and no sensitive data in evidence          |
| Content Ops Readiness     | Material, question, paper composition, publish status, student visibility bridge                                                   | Reuse an already published test-only paper if it matches required role scenarios | Create bounded question/material/paper data and publish it before student flow                                             | Published paper identifier, visibility proof, and redacted content summary       |
| Student Positive Flow     | Authorized student, visible paper/content, answerable practice or mock session                                                     | Reuse authorized test-only student if authorization scope matches                | Create or assign test-only personal_auth/org_auth before positive flow                                                     | Login/session proof, authorized access, answer submission, report/feedback proof |
| Student Negative Flow     | Student without valid authorization or with missing scope plus contact_config                                                      | Reuse a clearly isolated negative student account                                | Create isolated no-auth or expired-scope test-only account; do not alter positive user                                     | Purchase/contact guidance proof and no accidental access                         |
| Oversight Flow            | Prior operations that should produce audit_log and, where AI is mocked locally, ai_call_log entries                                | Verify logs for current acceptance-run identifiers                               | Run only local approved operations that generate missing log anchors                                                       | Redacted audit/AI log evidence, no raw provider payloads                         |
| Staging Template          | Local acceptance results and unresolved findings                                                                                   | Reuse current local evidence as template input                                   | Create template only; do not connect to staging                                                                            | Template-ready checklist with staging-only placeholders                          |

## Execution Order

1. **Preflight Data Inventory**: perform a read-only inventory first and classify each prerequisite as present, missing, stale, or unsafe to reuse.
2. **System Ops Data Readiness**: ensure user, organization, org_auth, redeem_code, and contact_config prerequisites exist before downstream flows.
3. **Content Ops Readiness**: ensure material/question/paper composition and publish state exist before any student positive flow.
4. **Student Positive Flow**: validate an authorized learner can access content, answer, and see feedback/report surfaces.
5. **Student Negative Flow**: validate a no-auth or missing-scope learner reaches purchase/contact guidance without content leakage.
6. **Oversight Flow**: validate audit_log and ai_call_log coverage after the operations that should produce them.
7. **Staging Template**: convert local evidence into a reusable staging acceptance template without connecting to staging.

Do not skip earlier phases based on assumptions. If a prerequisite is only available through fixture/mock/read-only/entry-only paths, record the limitation and decide whether it is sufficient for the role experience being tested.

## Browser And E2E Strategy

- Use the Browser plugin first for rendered local validation when available.
- If Browser invocation is blocked and the task explicitly needs CLI automation, use the repository `npm.cmd run test:e2e` path or Playwright CLI without adding dependencies.
- Capture the target flow as: local app loads -> role-specific entry route renders -> role-specific action completes -> expected state, audit, or evidence surface is visible.
- Required rendered checks: page identity, nonblank DOM, no framework overlay, console health, screenshot evidence, and interaction proof.

## AC-To-Runtime Matrix

| Acceptance criterion                                            | Runtime proof required                                                                                                    |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Role experience order respects data prerequisites               | Preflight inventory and role data readiness matrix completed before role flows                                            |
| Local full-flow acceptance covers all primary roles             | Browser or e2e evidence for student, content ops, system ops, and oversight flows                                         |
| Staging acceptance is reusable but not executed against staging | Staging template under `docs/05-execution-logs/acceptance/role-based-full-flow/` with no staging/prod connection evidence |
| Test-only data is allowed but isolated                          | Test data prefix, cleanup/isolation notes, no production/customer-like content                                            |
| Generated artifacts do not pollute code                         | Screenshots/traces/reports kept in ignored runtime artifact paths; committed artifacts limited to allowed paths           |
| Sensitive content is redacted                                   | Evidence contains bounded identifiers or summaries only, no secrets/raw payloads/full OCR/full paper/full textbook        |
| Findings are actionable                                         | Evidence includes question severity, validation records, `stagingDecision`, and next recommendations                      |

## Validation Commands

Run and record relevant output in evidence:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-role-based-full-flow-acceptance-rerun
npm.cmd run test:e2e
npm.cmd run build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

## Closeout Checklist

- One short-lived branch.
- One task plan.
- One evidence file.
- One reviewable commit.
- AC-to-runtime matrix updated with actual runtime proof.
- Question severity list included.
- Repository Hygiene Closeout Checklist completed.
- `stagingDecision` recorded as template-only, blocked, or ready for later approved staging execution.
- Next-step recommendation recorded.
- No generated runtime artifacts staged.

## Staging Decision

`stagingDecision: not_started_planning_only`

This task may produce a staging acceptance template, but it must not connect to, deploy to, or validate against staging without separate future approval.
