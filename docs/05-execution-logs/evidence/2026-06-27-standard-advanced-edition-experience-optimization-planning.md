# Standard Advanced Edition Experience Optimization Planning Evidence

Task id: `standard-advanced-edition-experience-optimization-planning-2026-06-27`

Branch: `codex/standard-advanced-experience-planning-20260627`

Task kind: `docs_state_planning`

result: pass

resultDetail: pass_docs_state_planning_package_prepared_no_runtime_no_final_pass

moduleRunVersion: 2

Batch range: docs/state planning batch for standard and advanced edition experience optimization.

RED: Requirement and evidence inventory identified planning gaps only; no runtime, source, DB, Provider, Cost Calibration, staging, or final-Pass gate was opened.

GREEN: Capability matrices, UX/detail issue inventory, risk tier split, follow-up task recommendations, copyable approval text, audit review, acceptance record, and scoped validation evidence were prepared inside the allowed docs/state surface.

Commit: `520a4d9b1dcf2fcbf80f3ebeb1141c40016e0fc4` baseline before this local docs/state closeout commit.

localFullLoopGate: L0_docs_state_planning_only; blocked remainder remains blocked for browser/runtime, DB/schema execution, Provider/Cost, staging/prod/deploy, payment/OCR/export/external-service, release readiness, and final Pass.

threadRolloverGate: no new thread required; if context rolls over, resume from this evidence file, the task plan, `project-state.yaml`, and `task-queue.yaml`; do not infer runtime readiness.

automationHandoffPolicy: not seeded for automation; future tasks require fresh approval according to their risk tier.

nextModuleRunCandidate: standard-advanced-backend-ux-design-first-contract-2026-06-27

## Summary

This docs/state-only task records a planning package for standard and advanced edition feature details and UX optimization. It creates no executable product change, no runtime validation, no browser run, no DB access, no Provider call, no Cost Calibration execution, no staging/prod work, no payment/external-service work, no PR, no force push, and no release-readiness or final-Pass claim.

Cost Calibration Gate remains blocked pending fresh explicit approval.

## Changed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-27-standard-advanced-edition-experience-optimization-planning.md`
- `docs/05-execution-logs/evidence/2026-06-27-standard-advanced-edition-experience-optimization-planning.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-standard-advanced-edition-experience-optimization-planning.md`
- `docs/05-execution-logs/acceptance/2026-06-27-standard-advanced-edition-experience-optimization-planning.md`

## Approval Boundary

Current user requested this specific docs/state-only planning task and allowed local commit, fast-forward merge to `master`, master gates, push to `origin/master`, and deletion of the merged short branch.

The approval excludes source, tests, e2e, schema, migration, seed, package/lockfiles, `.env*`, browser/dev-server/e2e runtime, DB, Provider, Cost Calibration, staging/prod/deploy, payment, OCR/export, external services, PR, force push, release readiness, and final Pass.

## Requirement Mapping Result

Mapped to SSOT documents under `docs/01-requirements/**` and ADR-007:

- Standard MVP baseline: account/session, `personal_auth`, platform-managed `org_auth`, `redeem_code`, formal `question` and `paper`, `practice`, `mock_exam`, `exam_report`, `mistake_book`, AI scoring/explanation/hint, `kn_recommendation`, RAG/knowledge base, admin operations, `audit_log`, and `ai_call_log`.
- Advanced extension: edition-aware `authorization`, `auth_upgrade`, computed `effectiveEdition`, advanced learner AI generation, organization training, organization analytics, organization admin AI generation, content admin AI draft/review, advanced operations quota governance, and retention/log governance.
- Role-separated repair: 8 mandatory role rows remain the acceptance lens for local UX/guard behavior. Historical local browser evidence may support planning, but this task does not rerun or re-declare runtime acceptance.

## Standard Capability Matrix

| Area                               | Standard edition capability                                                   | Current planning status                                                                            | Primary next risk                            |
| ---------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Account/session                    | Login, registration, session, user enable/disable, password reset by ops      | Core requirement baseline; role/session details still need task-scoped runtime proof after changes | permission/authorization contract            |
| Personal authorization             | `redeem_code`, `personal_auth`, purchase contact guidance, expiry visibility  | Required baseline; no cleartext `redeem_code` evidence allowed                                     | source-only or contract, then browser        |
| Platform-managed organization auth | `organization`, `employee`, `org_auth`, org tree, quota/overlap rules         | Standard remains platform-managed; employee import and lifecycle remain detailed follow-ups        | contract and DB if atomic scopes change      |
| Formal content                     | `question`, `material`, `paper`, `paper_section`, publish/unpublish/snapshot  | Formal content is the source of truth; generated/training content must not auto-write here         | source-only, DB if model changes             |
| Student learning                   | `practice`, `mock_exam`, `exam_report`, objective `mistake_book`              | Standard learner UX details remain local-completable when scoped                                   | UI/source-only and browser                   |
| Standard AI/RAG                    | `ai_scoring`, `ai_explanation`, `ai_hint`, `kn_recommendation`, RAG citations | Requirement exists, but live Provider/RAG execution remains gated                                  | Provider/Cost and DB/vector where applicable |
| Admin operations                   | Content backend, ops backend, logs, resources, knowledge base                 | Role-separated workspace and visible denial are key UX/guard concerns                              | UI/source-only, contract, browser            |

## Advanced Capability Matrix

| Area                        | Advanced edition capability                                                                 | Current planning status                                                                                | Primary next risk                                  |
| --------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| Edition-aware authorization | Original `edition`, computed `effectiveEdition`, `auth_upgrade`, quota owner                | ADR-007 and requirement SSOT are stable; implementation must stay service-layer enforced               | permission/authorization contract, DB/schema       |
| Learner AI generation       | Advanced personal and organization employees get discoverable `AI训练`, `AI出题`, `AI组卷`  | Historical evidence indicates local entry/guard behavior exists; real generation and cost remain gated | Provider/Cost, formal adoption                     |
| Organization training       | Advanced organization employees/admins get `企业训练`; standard org rows denied/unavailable | Local UX/guard path can be split from training product loop and data persistence                       | UI/source-only, browser, DB if persistence changes |
| Organization analytics      | Summary-only completion, score, quota, participation views                                  | Online summary only; export/raw answer viewer remains out of scope                                     | UI/source-only, privacy contract                   |
| Organization admin AI       | Advanced org admins get organization-owned AI question and AI `paper` drafts                | Current inventory marks admin AI surfaces as local contract/entry level, not product-complete loop     | source/service/API, Provider                       |
| Content admin AI            | Content admins get `AI出题`/`AI组卷` draft/review entries                                   | Entry/local contract is not enough for full draft/review workflow                                      | source/API/service, Provider, formal adoption      |
| Ops auth/quota              | Standard/advanced issuance, upgrade, multi-scope `org_auth`, quota summaries                | Requires careful split; production quota defaults still blocked by Cost Calibration                    | DB/schema, contract, Cost Calibration              |
| Retention/log governance    | Redacted `audit_log`, `ai_call_log`, hidden/restore, snapshots                              | Redaction rules stable; raw viewers and hard-delete executors remain blocked                           | source-only or DB depending task                   |

## UX And Detail Issue Inventory

| Issue group                      | Detail                                                                                                                                                                  | Suggested risk tier                                                   |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Learner copy and discoverability | Clarify `theory`/`skill` subject grouping, paper count wording, standard-unavailable/upgrade guidance, and advanced `AI训练` placement without relying on hidden routes | pure UI/source-only, then browser validation                          |
| Workspace separation             | Role-aware backend landing, logout, scoped navigation, unrelated-route denial, and no-permission states for ops/content/org admins                                      | UI/source-only plus permission contract; browser validation later     |
| Organization admin experience    | `org_standard_admin` and `org_advanced_admin` need first-class organization workspace, scoped employee/auth status, training/AI only for advanced                       | permission/authorization contract; browser validation                 |
| Ops authorization flows          | `redeem_code` quantity generation, required `profession`/`level`, explicit `org_auth` edition selector, manual upgrade, multi-scope package warnings                    | contract first; DB/schema for atomic scopes                           |
| Employee import                  | Template must bind employees to `organization` only and preview inherited scopes/quota; no `profession`, `level`, `edition`, or `orgAuthScopePublicId` input            | source-only for template guidance; contract/DB if preview uses scopes |
| AI product loops                 | Learner/content/org AI entry is separate from full request API, task lifecycle, Provider execution, generated result quality, quota/cost, and adoption                  | Provider/Cost and source/API/service; formal adoption gated           |
| Standard AI/RAG                  | Scoring/explanation/hint/RAG are requirement baseline but real Provider, env/secret, vector, and cost work remain separately gated                                      | Provider/DB/dependency as applicable                                  |
| Staging and release              | Local planning does not unblock staging; concrete isolated target and owner infrastructure remain required                                                              | staging/prod/deploy blocked                                           |

## Risk Classification

| Risk tier                         | Examples                                                                                                                      | Allowed next shape                                                                        |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Docs/state-only                   | Requirement alignment, UX contract, capability matrix, queue split, approval package                                          | Can proceed with docs/state approval and scoped docs validation                           |
| Pure UI/source-only               | Copy, discoverable nav entries, local unavailable/denied states, design-token compliant UI polish with no schema/API/Provider | Needs fresh source approval, focused unit/static gates; browser optional only if approved |
| Permission/authorization contract | `effectiveEdition`, role guard, route denial, DTO/mappers, service checks, public-id-safe responses                           | Needs scoped source/test approval and focused tests; browser follow-up separate           |
| Browser validation                | Local role matrix, discoverable entries, route denial using local accounts                                                    | Needs fresh dev-server/browser/account or fixture approval; evidence must be redacted     |
| DB/schema/migration               | `auth_upgrade`, source `edition`, atomic `org_auth_scope`, quota ledger, persistence changes                                  | Needs schema/migration approval, rollback/recovery, no staging/prod DB                    |
| Provider/Cost                     | Real model call, provider config, prompt/model selection, usage/cost measurement                                              | Needs Provider/env approval; Cost Calibration remains separate unless explicitly approved |
| Payment/external-service          | Payment, invoice, settlement, external callbacks, export/OCR external services                                                | Future scope only, fresh approval required                                                |
| Staging/prod/deploy               | Cloud resources, deployment, domain, TLS, staging smoke, production readiness                                                 | Blocked until owner provides target/infrastructure and fresh approval                     |

## Proposed Follow-Up Task Queue Split

These are recommendations only. This task does not seed executable implementation tasks.

| Order | Proposed task id                                                                | Purpose                                                                                                                                | Risk tier                                                | Fresh approval needed before execution            |
| ----- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------- |
| 1     | `standard-advanced-backend-ux-design-first-contract-2026-06-27`                 | Produce design-first IA/workspace UX contract for ops/content/org admin workspaces, denied states, upgrade states, and component reuse | docs/state-only                                          | docs-only approval                                |
| 2     | `standard-learner-experience-copy-and-unavailable-state-source-only-2026-06-27` | Tighten standard learner subject/count wording and unavailable/upgrade states without browser runtime                                  | pure UI/source-only                                      | source approval                                   |
| 3     | `advanced-learner-entry-and-organization-training-entry-source-only-2026-06-27` | Refine `AI训练`/`企业训练` discoverability and standard denial using service-computed capability data                                  | pure UI/source-only plus permission contract             | source/test approval                              |
| 4     | `backend-workspace-role-guard-contract-tdd-2026-06-27`                          | Harden ops/content/org workspace role guards, route denial, logout/landing contract                                                    | permission/authorization contract                        | source/test approval                              |
| 5     | `ops-redeem-code-edition-auth-contract-planning-2026-06-27`                     | Plan `redeem_code`, `org_auth` edition selector, manual upgrade, and employee import contract boundaries                               | docs/state-only                                          | docs-only approval                                |
| 6     | `ops-redeem-code-generation-source-contract-tdd-2026-06-27`                     | Implement quantity + `profession`/`level` generation contract without plaintext card evidence                                          | permission/authorization contract                        | source/test approval                              |
| 7     | `org-auth-edition-upgrade-contract-tdd-2026-06-27`                              | Implement or harden explicit `edition`, standard-to-advanced upgrade semantics, and redacted audit summaries where schema permits      | permission/authorization contract or DB if schema needed | source/test or schema approval                    |
| 8     | `standard-advanced-local-role-browser-validation-2026-06-27`                    | Rerun smallest approved local browser matrix after source tasks                                                                        | browser validation                                       | fresh browser/dev-server/account/fixture approval |
| 9     | `org-auth-atomic-scope-schema-approval-package-2026-06-27`                      | Prepare reviewed `org_auth_scope` schema/migration package for multi-scope enterprise authorization                                    | DB/schema planning                                       | schema approval before execution                  |
| 10    | `content-organization-ai-generation-product-loop-planning-2026-06-27`           | Split content/org AI request APIs, draft/review queues, task lifecycle, and formal adoption                                            | docs/state-only                                          | docs-only approval first                          |
| 11    | `content-organization-ai-generation-product-loop-source-tdd-2026-06-27`         | Implement scoped non-Provider local product loop pieces after planning                                                                 | source/API/service                                       | source/test approval; Provider still blocked      |
| 12    | `provider-smoke-or-cost-calibration-approval-package-2026-06-27`                | Decide disabled-provider acceptance, single redacted Provider smoke, or true Cost Calibration gate                                     | Provider/Cost planning                                   | fresh Provider/Cost approval                      |
| 13    | `staging-target-materialization-and-smoke-approval-2026-06-27`                  | Register concrete isolated staging target and define redacted smoke                                                                    | staging/prod/deploy                                      | fresh target and staging approval                 |
| 14    | `payment-export-ocr-future-scope-decision-package-2026-06-27`                   | Keep payment/export/OCR/external-service as future scope or split approval packages                                                    | payment/external-service                                 | fresh future-scope approval                       |

## Copyable Approval Text

### Docs-Only UX Contract

```text
我批准执行 docs/state-only 任务 standard-advanced-backend-ux-design-first-contract-2026-06-27。允许修改 project-state.yaml、task-queue.yaml、docs/01-requirements/** 以及本任务 task plan/evidence/audit/acceptance。禁止修改源码、测试、e2e、schema/migration/seed、package/lockfile、.env*；禁止浏览器/dev-server/e2e、DB、Provider、Cost Calibration、staging/prod/deploy、payment/OCR/export/external-service、PR、force push、release readiness 和 final Pass。
```

### Low-Risk Source/UI Task

```text
我批准执行一个低风险 source-only UI/体验任务：<task-id>。允许只修改任务队列列明的 src 前端文件、必要的 focused unit test 和 docs/evidence/audit；禁止 schema/migration/seed、package/lockfile、.env*、DB、Provider、Cost Calibration、staging/prod/deploy、payment/OCR/export/external-service、浏览器/e2e（除非另行批准）、PR、force push、release readiness 和 final Pass。验证以 focused unit、lint、typecheck、scoped Prettier、git diff --check 和 Module Run v2 门禁为准。
```

### Permission/Authorization Contract Task

```text
我批准执行权限/授权 contract 任务：<task-id>。允许修改任务队列列明的 contract/validator/mapper/service/route guard/source test 文件和 docs/evidence/audit；必须保持 effectiveEdition 由服务层计算，UI 不能作为授权边界；禁止 schema/migration/seed、DB 连接或写入、Provider、Cost Calibration、staging/prod/deploy、payment/OCR/export/external-service、PR、force push、release readiness 和 final Pass，除非另行明确批准。
```

### Local Browser Validation

```text
我批准执行本地浏览器验证任务：<task-id>。范围仅限 localhost/127.0.0.1 上的既有本地目标和队列列明的角色/路由；证据只能记录角色、路由、状态、数量和脱敏结果。禁止记录凭据、token、cookie、localStorage、原始 DOM、截图、trace、DB 行、Provider payload、prompt、原始 AI 输出、明文 redeem_code 或完整题目/试卷内容。禁止 DB/schema/migration、Provider、Cost Calibration、staging/prod/deploy、payment/external-service、PR、force push、release readiness 和 final Pass。
```

### DB/Schema Planning Or Execution

```text
我批准准备 DB/schema/migration 审批包：<task-id>。当前只允许 docs/state/evidence/audit 规划，不允许执行迁移、连接 DB、写 seed、改 schema 或生成 migration。后续如要执行，必须另行批准 exact allowedFiles、rollback/recovery、redacted evidence、drizzle generate/migrate 命令，并继续禁止 staging/prod DB、drizzle-kit push、Provider、Cost Calibration、payment/external-service、release readiness 和 final Pass。
```

### Provider Or Cost Gate

```text
我批准准备 Provider/Cost gate 审批包：<task-id>。当前只允许定义模型/Provider、凭据来源边界、最大调用次数、超时、脱敏证据字段和停止条件；不允许读取或输出 .env/secret 值，不允许执行真实 Provider 调用或 Cost Calibration。若后续批准执行，证据仍只能记录脱敏状态、token/usage/cost摘要和失败类别，不得记录 prompt、provider payload、原始响应或生成内容。
```

### Staging Target

```text
我批准准备 staging target materialization 任务：<task-id>。我将提供一个非敏感、隔离的 staging URL 或部署目标标签和值。任务只能记录目标元数据和红线，不得部署、读取 secret、连接 DB、调用 Provider、执行浏览器/e2e smoke、触碰 prod、payment/external-service、Cost Calibration、PR、force push、release readiness 或 final Pass，除非后续另行批准执行 smoke。
```

## Forbidden-Action Checklist

| Action                                                  | Result           |
| ------------------------------------------------------- | ---------------- |
| Source/test/e2e changed                                 | pass_not_touched |
| Schema/migration/seed touched                           | pass_not_touched |
| Package or lockfile changed                             | pass_not_touched |
| `.env*` read or changed                                 | pass_not_touched |
| Browser/dev-server/e2e run                              | pass_not_run     |
| DB connection or mutation                               | pass_not_run     |
| Provider call/configuration                             | pass_not_run     |
| Cost Calibration execution                              | pass_not_run     |
| Staging/prod/deploy/payment/OCR/export/external service | pass_not_run     |
| PR or force push                                        | pass_not_done    |
| Release readiness or final Pass claimed                 | pass_not_claimed |

## Validation

| Command                                                                                                                                                 | Result                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npx.cmd prettier --write --ignore-unknown ...changed docs/state files...`                                                                              | pass; scoped prettier write completed, only the evidence file required formatting.                                                                                                                                                |
| `npx.cmd prettier --check --ignore-unknown ...changed docs/state files...`                                                                              | pass; all matched files use Prettier code style.                                                                                                                                                                                  |
| `git diff --check`                                                                                                                                      | pass; no whitespace errors.                                                                                                                                                                                                       |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`                                              | pass diagnostic; `nextActionDecision: no_pending_task`, `activeQueueNonTerminalCount: 3`, `archiveCandidateCount: 2`, `highRiskRepairBlockedCount: 0`, `projectStatusRequiresHuman: true`; Cost Calibration Gate remains blocked. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ...`                     | pass; pre-commit hardening passed for this docs/state task.                                                                                                                                                                       |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ...`                | pass after evidence result anchor repair; `module-closeout readiness passed`.                                                                                                                                                     |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ... -SkipRemoteAheadCheck` | pass after final evidence result anchor repair; `pre-push readiness passed`.                                                                                                                                                      |
