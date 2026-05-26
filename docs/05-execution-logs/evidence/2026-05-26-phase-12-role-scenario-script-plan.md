# Phase 12 Role Scenario Script Plan Evidence

## Task

- TaskId: `phase-12-role-scenario-script-plan`
- Branch: `codex/phase-12-role-scenario-script-plan`
- StartedAt: `2026-05-26`

## Initial Recovery

- Started from clean `master == origin/master == b0ef984`.
- Claim readiness passed on branch `codex/phase-12-role-scenario-script-plan`.
- Dependency `phase-12-role-scenario-experience-registration` was closed.

## Actual Checked Files

- Governance and SSOT:
  - `AGENTS.md`
  - `docs/03-standards/code-taste-ten-commandments.md`
  - `docs/02-architecture/adr/*.md`
  - `docs/02-architecture/interfaces/student-experience-contract.md`
  - `docs/02-architecture/interfaces/admin-ops-contract.md`
  - `docs/02-architecture/interfaces/ai-rag-contract.md`
  - `docs/02-architecture/interfaces/question-paper-contract.md`
  - `docs/02-architecture/interfaces/runtime-slice-contract.md`
  - `docs/02-architecture/interfaces/phase-11-role-based-full-flow-acceptance-contract.md`
  - `docs/01-requirements/00-index.md`
  - `docs/01-requirements/stories/epic-01-user-auth.md`
  - `docs/01-requirements/stories/epic-02-question-paper.md`
  - `docs/01-requirements/stories/epic-03-student-experience.md`
  - `docs/01-requirements/stories/epic-04-ai-scoring.md`
  - `docs/01-requirements/stories/epic-05-rag-knowledge.md`
  - `docs/01-requirements/stories/epic-06-admin-ops.md`
- Current implementation inventory:
  - `src/app/**`
  - `src/features/student/**`
  - `src/features/admin/**`
  - `e2e/**`
  - `tests/unit/**`

## Actual Browser Operation Paths

- None in this script-planning task.
- The plan assigns browser paths to follow-up scan tasks and keeps this task docs-only.

## Role / Scenario / Expected / Actual

| Role                            | Scenario script                                                | Expected result                                                                                              | Actual in this task |
| ------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------- |
| `student`                       | S1 authorized learning flow; S2 no-authorization flow          | Later scans verify practice, mock_exam, report, mistake_book, and authorization visibility.                  | Script created.     |
| unauthenticated                 | S3 route/session boundary                                      | Later scans verify redirect and protected API denial.                                                        | Script created.     |
| `content_admin` / `super_admin` | S4 content management flow                                     | Later scans verify question/material/paper/knowledge_node UX and contracts.                                  | Script created.     |
| `ops_admin` / `super_admin`     | S5 operations, organization, employee, authorization flow      | Later scans verify user/org/org_auth/redeem_code management and edge states.                                 | Script created.     |
| `super_admin`                   | S6 AI/RAG/model_config/redaction flow                          | Later scans verify model_config, prompt_template, audit_log, ai_call_log, redaction, and mock AI boundaries. | Script created.     |
| mixed roles                     | S7 disabled/archived/inactive/duplicate/illegal parameter flow | Later scans verify lifecycle, duplicate submit, invalid input, disabled/archived/inactive states.            | Script created.     |

## Script Summary

The detailed scripts are in `docs/05-execution-logs/task-plans/2026-05-26-phase-12-role-scenario-script-plan.md`.

Coverage includes:

- Login / session / protected route boundaries.
- `practice`, `mock_exam`, `exam_report`, and `mistake_book`.
- AI paths: `ai_scoring`, `ai_explanation`, `ai_hint`, `kn_recommendation`, and `learning_suggestion`.
- Admin content: `question`, `material`, `paper`, `knowledge_node`.
- Admin operations: `user`, `organization`, `employee`, `org_auth`, `redeem_code`, purchase guidance.
- AI/RAG operations: `model_provider`, `model_config`, `prompt_template`, `resource`, `knowledge_base`, `audit_log`, `ai_call_log`.
- Edge states: empty data, loading, error, permission denied, invalid parameters, duplicate submit, expired/cancelled/disabled authorization, disabled/archived/inactive data, and redaction/masking.

## Gap List

This task creates scripts and does not claim product/runtime gaps. It records scan targets that must be classified by follow-up tasks.

| Type                         | Severity | Candidate area                                                                                        | Follow-up task                                 |
| ---------------------------- | -------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| requirements/runtime unknown | medium   | Whether current student UX covers every practice/mock/mistake_book/report AC.                         | `phase-12-student-experience-gap-scan`         |
| requirements/runtime unknown | medium   | Whether admin role distinctions and content/ops actions satisfy SSOT.                                 | `phase-12-admin-experience-gap-scan`           |
| permission boundary unknown  | high     | No-login, insufficient-permission, organization/employee, authorization loss, route guard/API denial. | `phase-12-auth-organization-boundary-gap-scan` |
| redaction boundary unknown   | high     | model_config/prompt_template/ai_call_log/audit_log redaction and secret masking.                      | `phase-12-ai-redaction-runtime-gap-scan`       |

## Command Results

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
  - Result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
  - Result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
  - Result: inventory pass before commit; showed only `project-state.yaml`, `task-queue.yaml`, and this script-plan task's plan/evidence files.
- `git diff --check`
  - Result: pass.

## Runtime/UI/Test/Docs Touch Status

- Runtime code touched: no.
- UI code touched: no.
- Test code touched: no.
- Docs/state/queue/task-plan/evidence touched: yes.
- Package/lockfile touched: no.
- Schema/migration touched: no.

## Forbidden Scope Self-Check

- `.env.local` read/modify/output: not touched.
- `.env.example` read/modify/output: not touched.
- Package/lockfile changes: none.
- Source/schema/migration/script changes: none.
- Real provider/cloud/staging/prod/deploy access: none.
- Destructive data operation: none.
- Secret/token/Authorization/database URL/generated redeem_code plaintext/raw provider payload/raw prompt/raw answer/raw model response/full paper/full教材/OCR full text/customer-like private evidence: none.

## 品味合规自检 Checklist

- 命名规范：脚本使用 `student`, `admin`, `organization`, `employee`, `practice`, `mock_exam`, `mistake_book`, `ai_scoring`, `ai_explanation`, `ai_hint`, `kn_recommendation`, `model_config`, `prompt_template`, `audit_log`, and `ai_call_log`。
- API envelope：脚本明确要求后续检查 `{ code, message, data, pagination? }`。
- Loading/Empty/Error：脚本把 empty/loading/error 纳入后续体验验证边界。
- Secret redaction：脚本禁止记录 secret、token、Authorization header、database URL、generated redeem_code plaintext、raw provider payload、raw prompt、raw answer、raw model response。
- 数据库安全：未修改 schema/migration，未执行数据写入或破坏性操作。
- 依赖安全：未修改 package/lockfile，未新增、升级、删除依赖。
- 环境隔离：未连接 provider/cloud/staging/prod，未部署，未读取 `.env.local` / `.env.example`。
