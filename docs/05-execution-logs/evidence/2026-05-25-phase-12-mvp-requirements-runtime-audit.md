# Evidence: Phase 12 MVP Requirements Runtime Audit

## Status

`round_1_validated`

## Scope Boundary

This task performs a local/dev, three-round audit only. It does not implement fixes.

Forbidden actions:

- no business/runtime code change;
- no dependency, package, lockfile, schema, migration, or script change;
- no `.env.local` read or output;
- no staging/prod connection;
- no deployment;
- no cloud resource, DNS, Tencent Cloud COS, public object storage URL, or provider configuration change;
- no destructive data operation;
- no secret value, token, Authorization header, database URL, raw provider payload, raw prompt, raw answer, raw model response, full paper, full textbook, OCR full text, or customer/customer-like private content recorded.

## Recovery Records

| Item                   | Result                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| Started from           | clean `master`                                                                              |
| Branch                 | `codex/phase-12-mvp-requirements-runtime-audit`                                             |
| Current phase          | `phase-11-staging-release-planning`                                                         |
| Staging implementation | remains paused                                                                              |
| External readiness     | DNS not configured, ICP pending, cloud server not purchased, database service not purchased |

## Documents Read

| Document                                                                                  | Status |
| ----------------------------------------------------------------------------------------- | ------ |
| `AGENTS.md`                                                                               | read   |
| `docs/03-standards/code-taste-ten-commandments.md`                                        | read   |
| `docs/02-architecture/adr/*.md`                                                           | read   |
| `docs/01-requirements/00-index.md`                                                        | read   |
| `docs/04-agent-system/state/project-state.yaml`                                           | read   |
| `docs/04-agent-system/state/task-queue.yaml`                                              | read   |
| `docs/05-execution-logs/evidence/2026-05-25-phase-11-local-system-validation.md`          | read   |
| `docs/05-execution-logs/evidence/2026-05-25-phase-11-cloud-adapter-readiness-contract.md` | read   |

## Audit Principle

The SSOT is `docs/01-requirements/`. User-reported issues are treated as examples, not as the audit boundary.

Each round must read documents and inspect code/runtime fresh enough to support the finding. Completion cannot be inferred from conversation memory or from route/file existence alone.

## Three-Round Audit Plan

| Round   | Purpose                                | Evidence requirement                                              |
| ------- | -------------------------------------- | ----------------------------------------------------------------- |
| Round 1 | SSOT decomposition into role-based ACs | Requirement/module/story references and initial AC inventory      |
| Round 2 | Code/API/test mapping                  | UI/API/service/repository/test mapping and status classification  |
| Round 3 | Local runtime and UX walkthrough       | Browser/API observations, sanitized screenshots/paths when useful |

## Closeout Model

The audit is split into independent queue tasks:

| Task                                              | Purpose                              | Closeout expectation              |
| ------------------------------------------------- | ------------------------------------ | --------------------------------- |
| `phase-12-mvp-requirements-runtime-audit-round-1` | SSOT decomposition                   | commit, merge, push, clean branch |
| `phase-12-mvp-requirements-runtime-audit-round-2` | code/API/test mapping                | commit, merge, push, clean branch |
| `phase-12-mvp-requirements-runtime-audit-round-3` | browser/runtime/UX walkthrough       | commit, merge, push, clean branch |
| `phase-12-mvp-requirements-runtime-audit-summary` | consolidated report and repair queue | commit, merge, push, clean branch |

## Round 1 Log

### Fresh Reads

Round 1 reread:

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-01-user-auth.md`
- `docs/01-requirements/stories/epic-02-question-paper.md`
- `docs/01-requirements/stories/epic-03-student-experience.md`
- `docs/01-requirements/stories/epic-04-ai-scoring.md`
- `docs/01-requirements/stories/epic-05-rag-knowledge.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`

Round 1 extracted 64 user stories as the audit inventory.

### SSOT Goal Decomposition

The MVP SSOT defines three product closure goals:

| Goal            | SSOT source                                                     | Required closure                                                                                             |
| --------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Content closure | `00-index.md` §1, `02-question-paper.md`, `06-admin-ops.md` §5  | maintain questions, materials, theory papers, skill papers, compose papers, publish, archive                 |
| Student closure | `00-index.md` §1, `01-user-auth.md`, `03-student-experience.md` | individual and employee users access authorized content, practice, mock_exam, report, objective mistake_book |
| AI/RAG closure  | `00-index.md` §1, `04-ai-scoring.md`, `05-rag-knowledge.md`     | ai_scoring, ai_explanation, ai_hint, kn_recommendation, RAG citation display                                 |

Round 1 audit rule: any later claim of "closed" must say which goal and which role/AC it closes. A local runtime slice or a page render is not enough to claim MVP closure.

### Role Inventory

| Role                  | Required runtime areas                                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| unauthenticated       | login/register/route guard, no access to protected student/admin routes                                                         |
| student/personal user | register, login, redeem_code, personal_auth, home, practice, mock_exam, exam_report, mistake_book, profile/auth display         |
| student/employee user | login, organization binding, org_auth-derived access, union with personal_auth, termination on org/auth invalidation            |
| content_admin         | question/material/paper/knowledge_node maintenance, publish/archive/copy, kn_recommendation review                              |
| ops_admin             | user, employee, organization, org_auth, redeem_code, contact_config, resource/knowledge_base, audit_log, ai_call_log            |
| super_admin           | all ops/content plus model_provider/model_config/prompt/fallback and admin role management                                      |
| system/runtime        | session, lockout, authorization union, audit logging, AI logging, RAG retrieval/citation, snapshot rules, concurrency/atomicity |

### User Story Inventory

| Epic                       | Stories | Round 1 audit units                                                                                                                                                                                                                   |
| -------------------------- | ------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Epic 01 user/auth          |      14 | registration, session, employee creation/import, password reset, account disable/enable, redeem_code redemption/generation, purchase guidance, organization tree, org_auth, employee movement, effective authorization, expiry notice |
| Epic 02 question/paper     |      11 | question create/edit by type, disable/copy, filters, multi_choice scoring, fill_blank scoring, material CRUD, paper draft composition, publish validation, archive/delete constraints, paper copy, metadata/assets                    |
| Epic 03 student experience |       9 | home, theory practice, skill practice, pause/resume, mock_exam, answer saving, report, mock list, objective mistake_book                                                                                                              |
| Epic 04 AI scoring         |       8 | subjective ai_scoring, retry, scoring page, objective ai_explanation, subjective ai_hint/reanswer, kn_recommendation, model config, prompt templates                                                                                  |
| Epic 05 RAG/knowledge      |       9 | hybrid retrieval/rerank, evidence_status/security filtering, resource upload/convert, Markdown review/publish, resource state machine, vector rebuild, chunking, knowledge_node tree, weak knowledge analysis                         |
| Epic 06 admin ops          |      13 | common admin UX, users, organizations, org_auth, redeem_code, resource/knowledge_base, model config, questions, papers, knowledge tree, audit_log, ai_call_log, admin roles                                                           |

### Non-Goals That Must Not Be Misclassified

| Non-goal                                        | SSOT source      | Audit handling                                                             |
| ----------------------------------------------- | ---------------- | -------------------------------------------------------------------------- |
| online payment                                  | `00-index.md` §2 | not a gap                                                                  |
| enterprise self-service backend                 | `00-index.md` §2 | not a gap; platform ops must still manage organizations/employees/org_auth |
| course learning/textbook reading                | `00-index.md` §2 | not a gap                                                                  |
| specialized practice by category/knowledge_node | `00-index.md` §2 | not a gap for MVP                                                          |
| intelligent/random/AI paper generation          | `00-index.md` §2 | not a gap                                                                  |
| PDF/Word automated paper import, OCR            | `00-index.md` §2 | not a gap; manual structured entry and attachments still are in scope      |
| complex question review workflow                | `00-index.md` §2 | not a gap; paper draft/publish/archive remains in scope                    |
| user self-service password/mobile changes       | `00-index.md` §2 | not a gap; ops reset is in scope                                           |
| AI token billing/user AI consumption detail     | `00-index.md` §2 | not a gap; ai_call_log and cost summary remain in scope                    |
| admin mobile adaptation                         | `00-index.md` §2 | not a gap; student mobile-first remains in scope                           |

### Round 1 AC Grouping For Later Mapping

| Group                      | Representative SSOT IDs                          | Required role coverage                      |
| -------------------------- | ------------------------------------------------ | ------------------------------------------- |
| Auth and sessions          | US-01-01, US-01-02, US-06-13                     | unauthenticated, student, admin             |
| Personal authorization     | US-01-07, US-01-08, US-01-09, US-01-13, US-01-14 | student, ops_admin                          |
| Organization authorization | US-01-03, US-01-04, US-01-10, US-01-11, US-01-12 | employee student, ops_admin                 |
| Student learning           | US-03-01 through US-03-09                        | student                                     |
| Content question/material  | US-02-01 through US-02-06, US-06-08              | content_admin                               |
| Paper lifecycle            | US-02-07 through US-02-11, US-06-09              | content_admin, student                      |
| AI features                | US-04-01 through US-04-08                        | student, content_admin, super_admin, system |
| RAG/resource/knowledge     | US-05-01 through US-05-09, US-06-06, US-06-10    | ops_admin, content_admin, student, system   |
| Admin UX/logging           | US-06-01, US-06-02 through US-06-13              | ops_admin, content_admin, super_admin       |

### Round 1 Preliminary Risk Signals

These are not final findings yet; Round 2/3 must confirm them against code and runtime.

| Signal                                                                                                   | Reason it matters                                                                            |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Requirements are broader than earlier local validation evidence                                          | Phase 11 evidence validated representative paths, not all SSOT acceptance units.             |
| "closed task" can mean local slice, not MVP closure                                                      | Future evidence must avoid claiming whole-module completion without AC matrix support.       |
| Content and ops closures require both UI and service actions                                             | File/API existence alone does not satisfy create/edit/disable/copy/publish/redeem/cancel UX. |
| Role coverage must distinguish super_admin, ops_admin, content_admin, personal student, employee student | A single seeded admin account cannot prove all permission boundaries.                        |

Round 1 status: `complete_for_ssot_decomposition`.

## Round 2 Log

Pending.

## Round 3 Log

Pending.

## MVP Requirements Runtime Coverage Matrix

Round 1 baseline matrix. Runtime mapping is intentionally deferred to Round 2 and browser/UX confirmation to Round 3.

| Module                      | SSOT stories | Primary roles                                             | Round 1 status |
| --------------------------- | -----------: | --------------------------------------------------------- | -------------- |
| User/auth                   |           14 | student, employee student, ops_admin, super_admin, system | decomposed     |
| Question/paper              |           11 | content_admin, student, system                            | decomposed     |
| Student experience          |            9 | student                                                   | decomposed     |
| AI scoring/explanation/hint |            8 | student, content_admin, super_admin, system               | decomposed     |
| RAG/knowledge               |            9 | ops_admin, content_admin, student, system                 | decomposed     |
| Admin ops/logging           |           13 | ops_admin, content_admin, super_admin                     | decomposed     |

## Issue Register

Round 1 does not classify implementation defects yet. It establishes the SSOT inventory and flags a process-level risk:

| Severity | Area          | Finding                                                                        | Next audit action                                                                                  |
| -------- | ------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| P0       | Audit/process | Past evidence can close local slices without proving full SSOT module closure. | Round 2 must map every story group to UI/API/service/test; Round 3 must sample role-based runtime. |

## Proposed Repair Queue

Pending until Round 3 and summary. No repair task is allowed to be seeded solely from Round 1 without code/runtime confirmation.

## Validation Commands

Round 1 validation:

| Command                                                                                                                                                              | Result | Notes                                                           |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------- |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-12-mvp-requirements-runtime-audit-round-1` | pass   | Task was claimable with dependency closed.                      |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`                                                       | pass   | Required docs, scripts, npm scripts, and skills were available. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`                                                          | pass   | Naming scan completed.                                          |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`                                  | pass   | Inventory showed only allowed docs/state files changed.         |
| `git diff --check`                                                                                                                                                   | pass   | No whitespace errors.                                           |

Formatting:

- `node .\node_modules\prettier\bin\prettier.cjs --write ...` passed after sandbox escalation; only this task's docs/state files were targeted.

## Repository Hygiene Closeout Checklist

| Check                                                                                        | Result |
| -------------------------------------------------------------------------------------------- | ------ |
| Only allowed docs/state files changed                                                        | pass   |
| No runtime/business code change                                                              | pass   |
| No package or lockfile change                                                                | pass   |
| No schema, migration, or script change                                                       | pass   |
| No `.env.local` or `.env.example` read/change                                                | pass   |
| No staging/prod, deployment, cloud, DNS, COS, public URL, provider, or object storage change | pass   |
| No secret/token/raw provider/full content recorded                                           | pass   |
| Round 2/3/summary tasks registered as pending                                                | pass   |

## Taste Compliance Self-Check

- Frontend visual taste: no UI code changed.
- Loading/empty/error states: no frontend state implementation changed.
- Interaction feedback: no clickable UI implementation changed.
- Tailwind class order: no Tailwind classes changed.
- Backend/API contract: no API implementation changed.
- N+1/SQL/schema: no query, schema, migration, or repository code changed.
- Naming discipline: registered project terms were used, including `student`, `content_admin`, `ops_admin`, `super_admin`, `question`, `paper`, `material`, `redeem_code`, `org_auth`, `audit_log`, `ai_call_log`, `kn_recommendation`, and `RAG`.
- Clean logic: Round 1 only decomposed SSOT requirements and did not infer implementation completion.
- Secret hygiene: no `.env.local`, secret, token, Authorization header, raw prompt, raw answer, raw model response, or provider payload recorded.
- Environment isolation: no staging/prod/cloud/deployment/provider action.
