# Evidence: role-separated-post-repair-runtime-rerun-2026-06-24

## Summary

- Task id: `role-separated-post-repair-runtime-rerun-2026-06-24`.
- Branch: `codex/post-repair-runtime-rerun-20260624`.
- Task kind: `acceptance_runtime_walkthrough`.
- Approval consumed: `ROLE_SEPARATED_POST_REPAIR_RUNTIME_RERUN_SCOPE_2026_06_24`.
- Status: runtime observation completed; eight role rows observed. Strict row acceptance remains `fail` for all rows
  because functional gaps, UI-language gaps, or Provider-governance gaps remain.
- Non-claim: this evidence does not declare standard/advanced MVP final Pass.

## Approval Boundary

- laozhuang approved package `ROLE_SEPARATED_POST_REPAIR_RUNTIME_RERUN_SCOPE_2026_06_24` on 2026-06-24.
- Approved: local-only Browser/runtime observation for the eight role rows, with credentials entered only by laozhuang.
- Additional chat instruction: after role observation, laozhuang asked Codex to operate logout. Codex may click only an
  explicit visible `退出登录` UI control and must not inspect browser storage, cookies, credential files, or credential
  values.
- Not approved: dev-server start, credential entry by Codex, credential file access, account creation or mutation, seed,
  database read/write, source/test/e2e/script edits, schema/migration, dependency/package/lockfile changes, `.env*`,
  Provider, Cost Calibration, staging/prod/cloud/deploy, payment, external services, PR, force push, screenshots, browser
  storage inspection, raw page dumps, or final MVP Pass.

## SSOT Read List

- `docs/01-requirements/00-index.md`.
- `docs/01-requirements/modules/01-user-auth.md`.
- `docs/01-requirements/modules/06-admin-ops.md`.
- `docs/01-requirements/stories/epic-06-admin-ops.md`.
- `docs/01-requirements/advanced-edition/00-index.md`.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`.
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`.
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`.
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`.
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`.
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`.
- `docs/01-requirements/advanced-edition/stories/epic-04-ops-authorization-quota-governance.md`.
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`.

## Requirement Mapping Result

Maps to R1-R15 from the 2026-06-24 role-separated MVP alignment.

## Role Mapping Result

In-scope rows are `personal_standard_student`, `personal_advanced_student`, `org_standard_employee`,
`org_advanced_employee`, `org_standard_admin`, `org_advanced_admin`, `content_admin`, and `ops_admin`.

## Acceptance Mapping Result

Row results may be recorded only as `pass`, `fail`, or `blocked`; final Pass remains blocked.

## Local Target Check

| Check                            | Result | Redacted evidence                                                                                    |
| -------------------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| Local port availability          | pass   | `127.0.0.1:3000` is listening; no dev server was started by Codex.                                   |
| Local login HTTP check           | pass   | `http://127.0.0.1:3000/login` returned HTTP `200`.                                                   |
| Browser page identity            | pass   | In-app Browser opened `http://127.0.0.1:3000/login`; title matched Tiku local app.                   |
| Login page basic readiness       | pass   | Login page exposes a form and password field; no credential value was entered or recorded by Codex.  |
| Console health before role login | pass   | Browser error/warn count was `0` before owner-entered role login.                                    |
| Owner credential entry           | pass   | laozhuang entered credentials manually for observed rows; Codex did not enter or record credentials. |

## Runtime Observation Matrix

| Role row                    | Expected allowed behavior                                                                                        | Observed allowed status | Expected denied or unavailable behavior                                                                                                                                                              | Observed denied status | Row result | Redacted notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `personal_standard_student` | Standard learner home reachable with `学员首页`, `理论`, `练习`, and `模拟考试`.                                 | pass                    | Home has no visible `AI训练` or `企业训练`; `/ops/users` and `/content/papers` do not expose backend pages; `/ai-generation` keeps `AI出题` and `AI组卷` disabled.                                   | fail                   | fail       | Chinese UI check is not clean: `/ai-generation` exposes the English technical label `personal-learning-ai`, and the disabled direct-route reason says `请先登录` for an already logged-in standard learner instead of standard-unavailable or upgrade guidance. Home UI chrome is Chinese, but paper titles include English fixture data.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `personal_advanced_student` | Discoverable learner `AI训练` with `AI出题` and `AI组卷` actions where local gates permit.                       | fail                    | No direct write to formal `question` or `paper`; `/ops/users` and `/content/papers` do not expose backend pages.                                                                                     | pass                   | fail       | Home remains reachable with Chinese learner chrome, but no visible home `AI训练` entry was found. Direct `/ai-generation` shows `AI训练`, `AI出题`, and `AI组卷`, but both AI action buttons are disabled and the page still shows `请先登录` for an owner-reported logged-in advanced learner. Chinese UI check is not clean because the English technical label `personal-learning-ai` is visible; paper titles still include English fixture data. Backend direct routes redirect to the Chinese login page without exposing ops/content workspaces; Browser error/warn count stayed `0`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `org_standard_employee`     | Standard organization-authorized learner home reachable with `学员首页`, `理论`, `技能`, `练习`, and `模拟考试`. | pass                    | Home has no visible `AI训练` or `企业训练`; direct `/ai-generation` and `/organization-training` are denied or standard-unavailable; `/ops/users` and `/content/papers` do not expose backend pages. | fail                   | fail       | Profile visible state showed valid standard enterprise authorization. Home chrome is Chinese and standard learner actions are available, but paper titles still include English fixture data. Direct `/ai-generation` exposes `AI训练`, disabled `AI出题`/`AI组卷`, the English technical label `personal-learning-ai`, and `请先登录` instead of a standard employee unavailable/upgrade denial. Direct `/organization-training` opens an employee training empty state rather than denying standard employee access. Ops/content direct routes redirect to the Chinese login page without exposing workspaces; Browser error/warn count stayed `0`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `org_advanced_employee`     | Discoverable learner `AI训练` and assigned `企业训练` under valid organization context.                          | fail                    | No access outside scoped `organization`; no admin, content, or global operations surfaces.                                                                                                           | pass                   | fail       | Profile visible summary confirmed valid advanced enterprise authorization with no expired-state text. Home chrome is Chinese and standard learner actions remain available, but home has no visible `AI训练` or `企业训练` entry. Direct `/ai-generation` shows `AI训练`, `AI出题`, and `AI组卷`, but both AI actions are disabled and the page still shows `请先登录`; it also exposes the English technical label `personal-learning-ai`. Direct `/organization-training` opens a Chinese empty state rather than an assigned `企业训练` entry. Ops/content/backend training direct routes redirect to the Chinese login page without exposing workspaces; Browser error/warn count stayed `0`.                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `org_standard_admin`        | Organization workspace for employee management and organization authorization/status viewing.                    | fail                    | No enterprise training management; no organization AI generation; no system operations or content workspace.                                                                                         | fail                   | fail       | Login/session reached `/ops/users` and exposed global operations surfaces including user management, enterprise management, `redeem_code` card generation entry, resources, audit logs, and AI call log labels. Direct `/organization/portal` showed `无权访问此后台工作区`, so the required organization workspace was not available. Direct organization training and organization AI routes also showed the same no-access state, which is acceptable for advanced-only features, but direct `/ops/redeem-codes` remained accessible and showed card management UI. Content backend direct route showed no-access. Chinese UI was present, but visible technical English labels such as `contact_config`, `Admin Ops`, and fixture ids remain user-visible. Browser error/warn count stayed `0`.                                                                                                                                                                                                                                                                                                                  |
| `org_advanced_admin`        | Organization workspace with employee/auth status, enterprise training, and organization AI.                      | fail                    | No global system operations or content authoring outside scoped `organization`.                                                                                                                      | fail                   | fail       | Login/session reached `/ops/users` and exposed global operations surfaces including user management, enterprise management, `redeem_code` card management, resources, audit logs, and AI call log labels. Direct `/organization/portal`, `/organization/organization-training`, `/organization/ai-question-generation`, and `/organization/ai-paper-generation` all showed `无权访问此后台工作区`, so the required advanced organization workspace, enterprise training, and organization `AI出题`/`AI组卷` entries were not available. Direct content backend route showed no-access, but direct `/ops/redeem-codes` remained accessible and showed card management UI. Chinese UI check is not clean because visible technical English labels such as `contact_config`, `Admin Ops`, `runtime API`, `publicId`, and role names remain user-visible on ops pages. Browser error/warn count stayed `0`.                                                                                                                                                                                                              |
| `content_admin`             | Content workspace with content management plus `AI出题` and `AI组卷` draft/review entries.                       | pass                    | No global operations `redeem_code`, global `org_auth`, Provider, cost, or organization admin surfaces.                                                                                               | pass                   | fail       | Content backend was reachable at `/content/papers`; `AI出题` and `AI组卷` navigation entries were visible, and direct `/content/ai-question-generation` plus `/content/ai-paper-generation` were reachable with draft/review workflow copy and no formal-write claim. Direct `/ops/redeem-codes`, `/ops/organizations`, and `/organization/portal` showed no-access states, so the sampled denied boundaries passed. Browser error/warn count stayed `0`. Chinese UI check is not clean because visible technical English labels such as `publicId`, `paper`, `question`, and `Provider` remain user-visible on content pages.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `ops_admin`                 | System operations workspace with users, organizations, `redeem_code`, `org_auth`, and logs.                      | pass                    | Content authoring routes denied; no content draft creation or content AI draft/review workspace unless later approved.                                                                               | pass                   | fail       | `/ops/users` was reachable and exposed user, organization, `redeem_code`, resource, audit, and logout navigation. `/ops/organizations` reached a stable enterprise authorization page with standard/advanced authorization selector, authorization scope, profession, level, multi-scope coverage, organization maintenance, and employee import controls. `/ops/redeem-codes` reached a stable card-management page with generation entry, redacted card list, and no plaintext card values. `/ops/ai-audit-logs` showed audit/AI log surfaces. Direct `/content/papers`, `/content/ai-question-generation`, `/content/ai-paper-generation`, and `/organization/portal` showed no-access states. Browser error/warn count stayed `0`. Chinese UI check is not clean because visible English technical labels remain, including `contact_config`, `Admin Ops`, `AI Ops`, `runtime API`, `publicId`, `org_auth`, `Provider`, `Model configuration`, `Provider key`, `Secret value`, and `Save provider`. Provider configuration controls were observed but not interacted with because Provider work remains blocked. |

## Runtime Notes

- UI language is now an explicit row-level acceptance check. The visible UI should use Chinese labels for navigation,
  actions, states, and denial/unavailable messages.
- Fixture or seed data titles that are visible to users are recorded separately from UI chrome, because they still affect
  owner-visible acceptance even when they are not component labels.
- After `personal_advanced_student` observation, Codex clicked the visible `退出登录` button per laozhuang's chat
  instruction. The Browser returned to the local Chinese login page; Codex did not inspect storage or credentials.
- After `org_standard_employee` observation, Codex clicked the visible `退出登录` button per laozhuang's chat
  instruction. The Browser returned to the local Chinese login page; Codex did not inspect storage or credentials.
- After `org_advanced_employee` observation, Codex clicked the visible `退出登录` button per laozhuang's chat
  instruction. The Browser returned to the local Chinese login page; Codex did not inspect storage or credentials.
- After `org_standard_admin` observation, Codex clicked the visible `退出登录` control per laozhuang's chat instruction.
  The Browser returned to the local Chinese login page; Codex did not inspect storage or credentials.
- After `org_advanced_admin` observation, Codex clicked the visible `退出登录` control per laozhuang's chat instruction.
  The Browser returned to the local Chinese login page; Codex did not inspect storage or credentials.
- After `content_admin` observation, Codex clicked the visible `退出登录` control per laozhuang's chat instruction. The
  Browser returned to the local Chinese login page; Codex did not inspect storage or credentials.
- After `ops_admin` observation, Codex clicked the visible `退出登录` control per laozhuang's chat instruction. The Browser
  returned to the local Chinese login page; Codex did not inspect storage or credentials.

## Validation Results

- `npx.cmd prettier --write --ignore-unknown ...`: pass; scoped docs/state files were formatted.
- `npx.cmd prettier --check --ignore-unknown ...`: pass; output included `All matched files use Prettier code style!`.
- `git diff --check`: pass; no whitespace findings.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId role-separated-post-repair-runtime-rerun-2026-06-24`:
  pass; output included `OK_SSOT_READ_LIST`, `OK_REQUIREMENT_MAPPING_RESULT`, five `OK_SCOPE` entries, and
  `pre-commit hardening passed`.

## Changed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-role-separated-post-repair-runtime-rerun.md`.
- `docs/05-execution-logs/evidence/2026-06-24-role-separated-post-repair-runtime-rerun.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-role-separated-post-repair-runtime-rerun.md`.

## Blocked Remainder

Final Pass, Provider, Cost Calibration, staging/prod, payment, external services, account mutation, database work,
source/test/e2e/script changes, dependency changes, `.env*`, PR, and force push remain blocked.

## Redaction Notes

Evidence may include only role labels, local route/workflow labels, visible allowed/denied status, pass/fail/blocked
labels, and redacted blocker summaries. It must not include passwords, credential file contents, tokens, cookies,
browser storage, Authorization headers, `.env*`, database rows, raw page dumps, screenshots, Provider payloads, prompts,
raw generated content, private answers, plaintext `redeem_code`, or full `question`/`paper` content.
