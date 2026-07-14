# Content Admin Platform PIC Coverage And Exception Ledger

Date: 2026-07-13

Program: `content-admin-platform-b-to-f-2026-07-13`

Requirement SSOT: `docs/01-requirements/traceability/2026-07-13-content-admin-p0-platform-interaction-contract.md`

## Status Vocabulary

- `accepted_baseline`: 合同已批准，尚未由本 Program 的目标页面族证明。
- `partial`: 已有实现证据，但本 Program 尚有明确缺口。
- `compliant`: 当前目标页面族和测试/验收已证明。
- `exception`: 有完整例外记录和替代保护。
- `not_applicable`: 经任务审查证明不适用。

## PIC Coverage Matrix

| PIC    | Initial status    | Primary batches   | Required proof                                    | Current exception |
| ------ | ----------------- | ----------------- | ------------------------------------------------- | ----------------- |
| PIC-01 | accepted_baseline | B0, E1-E5, F      | workspace/role/org context + server auth tests    | none              |
| PIC-02 | partial           | B2, D0-D4, E, F   | URL filter/sort/page/pageSize restore             | none              |
| PIC-03 | partial           | B2, D0-D4         | debounce + stale cancellation/latest intent       | none              |
| PIC-04 | partial           | B1, D, E          | distinct state matrix and announcements           | none              |
| PIC-05 | partial           | B3/B4, C, E       | primary/secondary/destructive/disabled reason     | none              |
| PIC-06 | partial           | B4, C             | shared create/edit business validation            | none              |
| PIC-07 | partial           | B3/B4, C, E       | duplicate prevention, preserve input, conflict    | none              |
| PIC-08 | partial           | B3, D3, E         | Drawer focus loop/Escape/restore                  | none              |
| PIC-09 | accepted_baseline | C0-C6             | dedicated editor route + dirty/return/refresh     | none              |
| PIC-10 | partial           | B1-B4, C, D, E, F | keyboard/focus/labels/errors/state/target size    | none              |
| PIC-11 | partial           | D, E, F           | no page overflow, table-local scroll              | none              |
| PIC-12 | accepted_baseline | B0, E, F          | consistent terms/states/actions, distinct clients | none              |
| PIC-13 | accepted_baseline | every task        | AI/edition/auth/org/phone/redeem boundary review  | none              |

Batch A 完成 P0-01~14，不等于 PIC-01~13 已全平台完成。`partial` 仅表示已有历史实现证据，后续任务仍须对其目标 route 重新验证。

## B0 Contract-To-Code Map

此表只说明 `f29b2c382fed36bd9d493d2c83212479c2f021d3` 基线中可复用的消费者和测试入口；路径存在不等于 PIC 已合规，`Observed gap` 才是后续任务必须关闭的缺口。

| PIC    | Existing consumers / source                                                                                                                                                                                                                                | Existing tests                                                                                                                                                                                        | Observed gap at B0                                                                                                                                                    | Canonical owner                                    |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| PIC-01 | `src/components/admin/AdminStateTemplate/AdminStateTemplate.tsx`; `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`; `src/server/services/admin-workspace-role-guard-service.ts`                                                              | `tests/unit/admin-workspace-role-guard-contract.test.ts`; `tests/unit/admin-dashboard-layout-navigation.test.ts`                                                                                      | 已有工作区上下文条带和服务端派生的 route access，但尚未逐 route 证明角色、组织上下文与服务端授权三者一致。                                                            | E1-E5 各页面族；E5 跨角色收口；F5 最终证明         |
| PIC-02 | `src/features/admin/question-material-management/AdminQuestionMaterialManagementClient.tsx`; `src/features/admin/paper-management/AdminPaperManagementClient.tsx`; `src/features/admin/resource-knowledge-management/AdminResourceKnowledgeManagement.tsx` | `tests/unit/admin-question-material-ui.test.ts`; `tests/unit/admin-paper-ui.test.ts`; `src/components/admin/AdminList/AdminList.test.tsx`                                                             | 部分列表能读写 URL，但实现分散；题目与材料尚无统一的 filter/sort/page/pageSize 解析、浏览器返回与恢复合同。                                                           | B2 共享合同；D0-D3 题目/材料证明；E1-E5 推广       |
| PIC-03 | `src/features/admin/question-material-management/AdminQuestionMaterialManagementClient.tsx`; `src/features/admin/paper-management/AdminPaperManagementClient.tsx`; `src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx`            | `tests/unit/admin-question-material-ui.test.ts`; `tests/unit/admin-paper-ui.test.ts`; `tests/unit/organization-training-admin-entry-surface.test.ts`                                                  | 列表请求只有 effect 失活保护，组织详情有局部 request serial；没有共享 debounce、真实取消和乱序响应下的 latest-intent-wins 测试。                                      | B2 共享原语；D0-D2 竞态合同与消费者；D4 累计证明   |
| PIC-04 | `src/components/admin/AdminStateTemplate/AdminStateTemplate.tsx`; `src/features/admin/content-admin-runtime.tsx`; `src/features/admin/question-material-management/AdminQuestionMaterialManagementClient.tsx`                                              | `tests/unit/admin-common-ux-state-audit.test.ts`; `tests/unit/admin-question-material-ui.test.ts`; `tests/unit/organization-training-admin-entry-surface.test.ts`                                     | loading/empty/error/forbidden/edition/missing 只有分散实现；initial、refreshing、filter-empty、conflict 仍未形成可访问且互斥的共享状态矩阵。                          | B1 共享状态；D1-D2 列表应用；E1-E5 推广            |
| PIC-05 | `src/components/ui/button.tsx`; `src/features/admin/question-material-management/AdminQuestionMaterialManagementClient.tsx`; `src/features/admin/paper-management/AdminPaperManagementClient.tsx`                                                          | `tests/unit/admin-question-material-ui.test.ts`; `tests/unit/admin-paper-ui.test.ts`; `tests/unit/admin-shell-common-interaction.test.ts`                                                             | 已有 destructive/disabled 与部分锁定原因，但主次动作、危险确认和禁用理由尚未跨列表、Drawer、editor 和页面族统一。                                                     | B3 反馈原语；B4 禁用原因；C1-C5 editor；E1-E5 推广 |
| PIC-06 | `src/lib/content-integrity.ts`; `src/features/admin/question-material-management/AdminQuestionMaterialManagementClient.tsx`                                                                                                                                | `src/lib/content-integrity.test.ts`; `tests/unit/admin-question-material-ui.test.ts`                                                                                                                  | 题目/材料创建与编辑目前在同一大组件复用校验，但尚未抽成窄的表单合同，也未证明独立 editor route 仍使用同源业务验证。                                                   | B4 表单合同；C1-C4 两类 editor；C6 累计证明        |
| PIC-07 | `src/features/admin/question-material-management/AdminQuestionMaterialManagementClient.tsx`; `src/features/admin/paper-management/AdminPaperManagementClient.tsx`; `src/server/contracts/admin-interaction-contract.ts`                                    | `tests/unit/admin-question-material-ui.test.ts`; `tests/unit/admin-shell-common-interaction.test.ts`; `tests/unit/admin-paper-ui.test.ts`                                                             | 题目保存有 in-flight 去重、输入保留和 conflict 区分，其他页面仍多为局部 message；缺共享 Toast、对象级状态更新和跨消费者冲突恢复。                                     | B3 对象状态/Toast；B4 表单恢复；C/E 页面应用       |
| PIC-08 | `src/components/admin/AdminDetailDrawer/index.tsx`; `src/features/admin/question-material-management/AdminContentDetailDrawer.tsx`; `src/features/admin/paper-composer/PaperComposerQuestionPickerDrawer.tsx`                                              | `tests/unit/admin-question-material-ui.test.ts`; `src/features/admin/paper-composer/AdminPaperComposerPage.test.tsx`                                                                                  | Drawer 原语已有标题、初始焦点、Tab loop、Escape 和触发点恢复代码，但缺对该原语本身及各真实消费者的完整焦点闭环回归。                                                  | B3 Drawer 原语测试；D3 返回/焦点恢复；E 页面推广   |
| PIC-09 | `src/features/admin/question-material-management/AdminQuestionMaterialManagementClient.tsx`; `src/features/admin/paper-composer/AdminPaperComposerPage.tsx`; `src/app/(admin)/content/papers/[publicId]/compose/page.tsx`                                  | `tests/unit/admin-question-material-ui.test.ts`; `src/features/admin/paper-composer/AdminPaperComposerPage.test.tsx`                                                                                  | 题目/材料长表单仍嵌在列表大组件；没有独立 create/edit route、dirty-leave、刷新恢复和确定的返回合同。                                                                  | C0 wireflow；C1-C5 实现；C6 累计证明               |
| PIC-10 | `src/components/admin/AdminList/index.tsx`; `src/components/admin/AdminDetailDrawer/index.tsx`; `src/features/admin/question-material-management/AdminQuestionMaterialManagementClient.tsx`                                                                | `src/components/admin/AdminList/AdminList.test.tsx`; `tests/unit/admin-question-material-ui.test.ts`; `src/features/admin/paper-composer/AdminPaperComposerPage.test.tsx`                             | 已有 labels、aria error 关联、部分公告和焦点处理；尚未逐页面验证键盘顺序、焦点可见、错误定位、状态公告和目标尺寸。                                                    | B1-B4 原语；C/D/E 消费者；F1-F4 验收               |
| PIC-11 | `src/components/admin/admin-layout-primitives.ts`; `src/components/admin/AdminList/index.tsx`; `src/features/admin/resource-knowledge-management/AdminResourceKnowledgeManagement.tsx`                                                                     | `src/components/admin/AdminList/AdminList.test.tsx`; `tests/unit/admin-layout-primitives-ui.test.ts`; `tests/unit/admin-paper-ui.test.ts`                                                             | 表格已有局部横向滚动容器，但尚未证明所有 desktop-first 页面无页面级横向溢出；学员端仍须保持 mobile-first。                                                            | D1-D4 列表证明；E1-E5 推广；F1-F4 验收             |
| PIC-12 | `src/components/admin/AdminStateTemplate/AdminStateTemplate.tsx`; `src/components/admin/AdminList/index.tsx`; `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`                                                                               | `tests/unit/admin-student-uiux-consistency-closeout.test.ts`; `tests/unit/admin-role-overview-ui.test.ts`; `tests/unit/admin-dashboard-layout-navigation.test.ts`                                     | 共享组件提供部分统一词汇和容器，但各工作区的状态、动作和任务容器尚未完成 route-family 级一致性审计；学员交互不能被后台桌面模式同化。                                  | E1-E5 页面族收口；F1-F4 角色验收；F5 总结          |
| PIC-13 | `src/server/services/admin-workspace-role-guard-service.ts`; `src/features/admin/organization-workspace/admin-organization-workspace-access.ts`; `src/server/services/admin-ai-generation-formal-adoption-service.ts`                                      | `tests/unit/admin-workspace-role-guard-contract.test.ts`; `tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts`; `tests/unit/admin-ai-generation-entry-surface.test.ts` | 当前边界测试不是本 Program 的全页面证明；每项改动仍须重新审查 AI 数据域、edition/auth、组织范围、企业训练、手机号与 `redeem_code`，且不得重开无新鲜失败证据的旧问题。 | 每个任务；E5/E6 跨域收口；F5 最终证明              |

## Route-family Ledger

| Route/page family              | Workspace          | Target batch | Current status | Protected boundary                                            |
| ------------------------------ | ------------------ | ------------ | -------------- | ------------------------------------------------------------- |
| question/material list         | content            | B/D          | partial        | content lifecycle, P0 semantic integrity                      |
| question/material editor       | content            | C            | compliant      | lock/copy/published reference                                 |
| paper/knowledge/resource       | content            | E1           | compliant      | publish snapshot, RAG/resource boundary                       |
| content AI draft/review        | content            | E1           | compliant      | formal content separation, Provider closed                    |
| user/org/auth/redeem/log       | operations         | E2           | compliant      | phone masking, plaintext redeem UI exception, audit redaction |
| organization admin/training/AI | organization       | E3           | compliant      | organization scope, edition, non-formal training domain       |
| practice/mock/report/AI        | learner            | E4           | partial        | mobile-first, authorization context, persisted snapshot       |
| super admin cross-workspace    | operations/content | E5           | partial        | no authorization or lifecycle bypass                          |

45 个当前 page entry、68 个脱敏 role/page view、E1-E5 owner、proof root、风险与验证方式的唯一精确清单见
`docs/05-execution-logs/evidence/2026-07-14-content-admin-platform-e0-route-family-inventory.md`；本台账不复制该事实表。

## Program Task Progress

### B1 Shared Async-State Semantics

- `AdminAsyncState` centralizes the accessible semantic matrix for initial loading, refreshing, empty, filtered empty,
  error, forbidden, unauthorized, edition unavailable, missing context, and conflict.
- `AdminStateTemplate` and `content-admin-runtime` delegate role, announcement priority, and busy state to that primitive;
  question/material and paper focused tests prove two current workspace consumers receive the shared initial-loading
  contract.
- PIC-04 and PIC-10 remain `partial`: B1 establishes the semantic foundation, while B2/B3 and D/E must still prove real
  refreshing, filtered-empty, conflict, focus, and route-family behavior. No exception or authorization expansion was
  introduced.

### B2 Shared List-Query Semantics

- A canonical URL codec, 250 ms keyword debounce, monotonic latest-intent gate, and accessible active-filter chips are
  now shared by the question and material consumers.
- Focused tests prove validated URL restore, final-keyword-only requests, one-chip removal, and stale question response
  rejection after a newer filter request has completed.
- PIC-02, PIC-03, and PIC-10 remain `partial`: D0-D4 still own explicit request-contract coverage, browser return/scroll/
  focus restoration, and cumulative list-family proof; E/F still own wider rollout and acceptance. No exception or
  authorization expansion was introduced.

### B3 Shared Detail And Feedback Semantics

- Detail Drawer now proves mount-scoped initial focus, forward/reverse focus loop, Escape handling, nested-modal respect,
  current-callback invocation, and trigger restoration across direct, content-detail, and paper-composer tests.
- A shared Toast distinguishes polite success from assertive error/conflict; question/material save, copy, and disable
  paths update only server-returned objects, retain list state on action failure, preserve form input on save failure, and
  retain the existing duplicate-save guard.
- PIC-05, PIC-07, PIC-08, and PIC-10 remain `partial`: B4/C/D/E still own disabled reasons, form contracts, route return/
  focus recovery, broad page-family rollout, and acceptance. No exception or authorization expansion was introduced.

### B4 Shared Form-Contract Semantics

- A narrow form contract now centralizes field-error lookup, selector-safe first-invalid focus, caller-owned dirty-state
  fingerprints, accessible summaries/field errors, and visible disabled reasons.
- Question and material create/edit forms continue using their original `content-integrity` functions, expose clean/dirty
  state, and associate the in-flight save control with the duplicate-submit explanation.
- PIC-05, PIC-06, PIC-07, and PIC-10 remain `partial`: C still owns dedicated editor routes, dirty-leave/return behavior,
  and two-resource route proof; E/F own broader rollout and acceptance. PIC-09 was not claimed, and no exception or
  authorization expansion was introduced.

### B5 Batch B Cumulative Audit

- Exact post-M2 Batch B net diff and all B0-B4 claims were reconciled. Shared async, list-query, Drawer/Toast/object, and
  form contracts remain separate and narrow; no blocking duplicate or universal-framework finding remained.
- Fixed full node passed 371 test files / 2,067 tests, lint, typecheck, full-repository format, and production build. The
  build used the clean root checkout at the same product commit after Turbopack rejected only the worktree dependency
  junction; no source or dependency repair was required.
- PIC statuses remain unchanged and partial according to D/C/E/F ownership; the exception ledger remains empty. B5 is a
  cumulative Batch B checkpoint, not route-family, authorization, AI, or final acceptance closure.

### D0 List-Request Contract Tests

- Existing canonical URL/latest-intent tests remain GREEN. Four additional executable expected-failure contracts capture
  question/material context-preserving refreshing, popstate URL restore, and edit-return focus/scroll restore.
- D1, D2, and D3 own conversion of their tagged `it.fails` cases into normal passing regressions. D0 changes no runtime
  behavior and does not promote PIC-02/PIC-03/PIC-04/PIC-08/PIC-10/PIC-11.
- No exception, authorization expansion, lifecycle change, skipped test, dependency, browser action, or deployment was
  introduced.

### D1 Question List Consistency

- Question filter/page revalidation now retains current rows and announces the shared accessible `refreshing` state;
  initial loading remains distinct.
- A stale question response cannot replace rows or clear the newer request's refreshing state. The current response
  alone completes the transition, while existing URL, pagination, debounce and filter contracts stay green.
- PIC-02/PIC-03/PIC-04/PIC-10/PIC-11 remain `partial`: D2 owns material parity, D3 owns browser/edit return recovery,
  D4 owns cumulative list proof, and E/F own family rollout/acceptance. No exception or protected-boundary expansion was
  introduced.

### D2 Material List Consistency

- Material filter/page revalidation now uses the same retained-row and accessible `refreshing` semantics as questions.
- A stale material response cannot replace rows or clear the newer request state; only the latest intent finishes the
  transition. Material lifecycle and locked-copy rules are unchanged.
- PIC-02/PIC-03/PIC-04/PIC-10/PIC-11 remain `partial`: D3 owns browser/edit return recovery, D4 owns cumulative list
  proof, and E/F own page-family rollout and acceptance. No exception or protected-boundary expansion was introduced.

### D3 List Return Recovery

- Browser popstate reparses the canonical list URL and restores filter, sort, page and pageSize state for a renewed
  request; direct URL behavior remains unchanged.
- Question/material existing-edit return restores captured scroll and the initiating control on cancel/save, with a
  deterministic list-toolbar fallback if the trigger disappears.
- PIC-02/PIC-08/PIC-10/PIC-11 remain `partial` until D4 cumulative proof and E/F rollout/acceptance. Dirty-leave remains
  C5-owned; no exception, authorization/lifecycle expansion or deployment was introduced.

### D4 Batch D Cumulative Audit

- D0-D3 commit/diff ownership reconciled; no executable expected-failure residue remains. The fixed full node passed 371
  files / 2,073 tests, lint, typecheck, full format and production build.
- Question/material lists now cumulatively prove canonical initial/popstate restore, pagination/filter state, retained-row
  refreshing, stale-response rejection and edit-return focus/scroll fallback.
- PIC-02/PIC-03/PIC-04/PIC-08/PIC-10/PIC-11 remain `partial` because C/E/F still own editor routes, page-family rollout
  and role acceptance. The exception ledger remains empty; no deployment or protected-boundary expansion occurred.

### C0 Editor Route Wireflow

- The canonical route decision is `/content/questions/new`, `/content/questions/[publicId]/edit`,
  `/content/materials/new`, and `/content/materials/[publicId]/edit`; list-owned Detail Drawers remain read-only.
- The C0 plan owns the validated same-family `returnTo`, one-shot non-sensitive return snapshot, explicit save/return,
  dirty-leave, locked deep-link and copy-after-POST contracts plus exact C1-C5 source/test ownership.
- PIC-05/PIC-06/PIC-07/PIC-09/PIC-10/PIC-13 remain unchanged: C0 is a docs-only design decision, C1-C5 own runtime
  proof, and C6 owns cumulative proof. No exception, authorization expansion or deployment was introduced.

### C1 Question Create Editor

- The product question-list create action now opens `/content/questions/new`; the dedicated editor reuses the existing
  semantic-validation form contract and POST API envelope instead of duplicating either contract.
- Empty semantic input is blocked with first-invalid focus. In-flight duplication is blocked, recoverable conflict/network
  failure preserves authored input, and successful creation replaces the form with a non-resubmittable completion state.
- PIC-05/PIC-06/PIC-07/PIC-09/PIC-10 are partially proven for question creation only. C2 owns question edit/copy/lock,
  C3-C5 own material routes and route recovery/dirty leave, and C6 owns cumulative promotion. PIC-13 remains unchanged;
  no authorization, lifecycle, AI, dependency, exception, credential or deployment boundary changed.

### C2 Question Edit Copy Lock

- `/content/questions/[publicId]/edit` now loads unlocked questions through the shared validation form, PATCHes the
  existing API contract once, resets the clean baseline after success, and exposes safe missing/forbidden/error returns.
- Locked deep links never mount an editable form. Explicit copy uses the existing POST endpoint and the returned public id
  to enter the copied editor; a server lock race preserves authored input, blocks further PATCH and offers copy/return.
- Product list create/edit/copy paths now use dedicated editors from both question/material entry pages. The existing
  content-AI `questionPublicId` draft link redirects to the same route and retains explicit draft-publish wording/status;
  no generation, Provider, ownership, authorization or superseded AI issue class was changed or reopened.
- PIC-05/PIC-06/PIC-07/PIC-09/PIC-10 are partially proven for question create/edit/copy/lock. C3-C5 and C6 retain
  material/navigation/cumulative ownership; PIC-13 remains unchanged and the exception ledger remains empty.

### C3 Material Create Editor

- The product material-list create action now opens `/content/materials/new` from both content entry pages; the dedicated
  editor reuses the existing material semantic-validation form and POST API envelope instead of duplicating contracts.
- Semantic-empty title/body, empty tables, invalid media, missing classification and body length above 30000 remain
  blocked with accessible errors. Conflict/network failure preserves input, duplicate submission is blocked, and success
  becomes a non-resubmittable completion until C4 supplies the dynamic edit route.
- PIC-05/PIC-06/PIC-07/PIC-09/PIC-10 are partially proven for both create routes plus question edit/copy/lock. C4/C5 own
  material edit/copy/lock and navigation recovery, and C6 owns cumulative promotion. PIC-13 and the empty exception ledger
  remain unchanged; no authorization, lifecycle, dependency, credential, database, AI or deployment boundary changed.

### C4 Material Edit Copy Lock

- `/content/materials/[publicId]/edit` now loads unlocked materials into the shared semantic form, PATCHes the unchanged
  API contract, resets the clean baseline after success, and exposes safe missing/forbidden/error returns.
- Locked deep links never mount a form. Explicit copy enters only the server-returned material editor; a service lock race
  preserves authored input, blocks further PATCH, and offers copy/return. Product list edit/copy paths use the same route,
  while Detail Drawer and lifecycle/authorization service rules remain unchanged.
- PIC-05/PIC-06/PIC-07/PIC-09/PIC-10 are partially proven across both resource create/edit/copy/lock flows. C5 retains
  dirty-leave/return/focus/scroll recovery and C6 retains cumulative promotion. PIC-13 and the empty exception ledger
  remain unchanged; no authorization, dependency, database, AI, credential or deployment boundary changed.

### C5 Editor Navigation Recovery

- Question/material list create, edit and copy entries now carry one validated same-family `returnTo` plus a bounded,
  one-shot, non-sensitive session snapshot. Return restores URL-owned list state, scroll and initiating control, with a
  deterministic toolbar fallback for missing or disabled targets.
- Both dedicated editors now block dirty cancel/return/copy and browser history until discard is confirmed; refresh/tab
  close uses `beforeunload`. Failed mutation and lock conflict preserve authored input, while successful create/save/copy
  retains the return target without replaying POST.
- PIC-05/PIC-06/PIC-07/PIC-09/PIC-10 are now partially proven across both complete editor route families. C6 retains
  cumulative promotion and fixed full-regression ownership. PIC-13 and the empty exception ledger remain unchanged; no
  authorization, lifecycle, dependency, database, AI, credential or deployment boundary changed.

### C6 Batch C Cumulative Audit

- C0-C5 ownership, the exact Batch C product/test delta and the four canonical routes were reconciled. A second-round
  attack found that same-origin dashboard links could bypass dirty confirmation; C6 added a narrow link guard and four
  RED-first regressions without changing authorization or introducing a router framework.
- The fixed full node passed 375 files / 2,142 tests, lint, typecheck, full format and production build. All focused C
  suites contain no skipped or expected-failure residue; API/service/schema/dependency/AI/database/deployment files
  remain outside the delta.
- PIC-06 and PIC-09 are compliant for the question/material editor family. PIC-05/PIC-07/PIC-10 remain partial for E/F
  rollout and role acceptance; PIC-13 and the empty exception ledger remain unchanged.

### E0 Route-Family Inventory

- All 45 current page entries and all 68 sanitized role/page views have an exact E1-E5 owner, source/test proof root,
  applicable current PIC status, protected risk and later validation method in the E0 evidence.
- E0 promotes no PIC status. It records four later-task gap candidates, including production reachability proof for the
  source-comment-only `/design-system` route and cross-workspace alias/direct-URL checks; none is an approved exception.
- Product source/tests, A01-A30, closed AI issue classes and deployment remain unchanged; the exception ledger is empty.

### E1 Content Page-Family Rollout

- Paper mutation feedback and knowledge/resource lifecycle feedback now consume the shared accessible Toast; resource
  details consume the shared focus-managed Drawer with Escape and initiating-control restoration. Existing request,
  lifecycle, ownership and authorization behavior is unchanged.
- Focused proof covers content overview, paper list/detail/composer, knowledge, resource, content AI and closed
  question/material compatibility. Content AI remains draft/review-only with evidence-gated formal adoption and Provider
  closed; E0-G03 destination regression passes while E5 retains alias closure.
- `paper/knowledge/resource` and `content AI draft/review` are compliant for the E1 implementation family. Global PIC
  statuses remain unchanged pending E2-E6 and F acceptance; PIC-06/PIC-09 remain scoped to the closed editor family, and
  the exception ledger remains empty.

### E2 Operations Page-Family Rollout

- User, enterprise-authorization, card and audit read-only details now consume the shared focus-managed Drawer; user,
  organization/authorization/card and purchase-contact mutations consume the shared accessible Toast. Existing API,
  role, edition, quota, phone, card and audit contracts remain unchanged.
- Two RED-first regressions harden Drawer coordination with both nested and sibling confirmation `alertdialog` instances,
  preventing Escape/Tab ownership from moving behind the active modal. Protected phone, role and redaction regressions
  plus the impact-triggered full suite pass.
- `user/org/auth/redeem/log` is compliant for the E2 implementation family only. Global PIC statuses remain unchanged
  pending E3-E6 and F acceptance; E5 retains cross-workspace aliases and the exception ledger remains empty.

### E3 Organization Page-Family Rollout

- Organization-training list intent now has one allow-listed canonical URL contract, shared pagination and a shared
  focus-managed read-only Drawer. Create/copy/publish/takedown and organization-AI copy terminal results use the shared
  accessible Toast without changing request, scope, edition or data-domain contracts.
- Focused proof covers portal, training, analytics, organization AI, standard/advanced direct routes, Drawer focus and
  protected authorization/AI/training boundaries. Portal stays read-only, analytics aggregate-only and no-export, and AI
  adoption remains organization-private non-formal training content.
- `organization admin/training/AI` is compliant for the E3 implementation family only. Global PIC statuses remain
  unchanged pending E4-E6 and F acceptance; E5 retains cross-workspace aliases and the exception ledger remains empty.

### E4 Learner Page-Family Rollout

- Employee organization training now defaults to five summary metrics and compact assignments; selecting one training
  exposes exactly one mobile-first answer/result workspace. Submitted/read-only assignments cannot render mutation
  controls, and pending actions suppress duplicate requests.
- Focused proof covers learner shell, home, practice, mock/report, mistake-book, profile, auth, personal AI, organization
  training and protected authorization/training services. Standard and missing organization contexts fail closed;
  personal-AI context/history and historical paper resume contracts remain unchanged.
- `learner practice/mock/report/AI/organization-training` is compliant for the E4 implementation family only. Global PIC
  statuses remain unchanged pending E5/E6 and F acceptance; E5 retains cross-workspace aliases and the exception ledger
  remains empty.

## Exception Ledger

当前无 Program 批准例外。任何新增例外必须填写：

| Route | PIC  | User benefit | Risk | Alternative protection | Approval source | Task | Status |
| ----- | ---- | ------------ | ---- | ---------------------- | --------------- | ---- | ------ |
| none  | none | none         | none | none                   | none            | none | none   |

不得以“页面特殊”作为空白理由；没有替代保护和批准依据时只能记为 gap，不能记为 exception。

## Historical Protection Ledger

- A01-A30：保持 2026-07-12 cumulative closeout 的 fixed/verified/protected 结论；无新鲜证据不重开。
- AI：20 类旧问题保持 closed/superseded；Provider 默认关闭；正式内容、organization、learner 数据域不合并。
- 手机号：普通 DTO 默认脱敏；只有合资格运营单条 reveal/copy，服务端授权且审计不含手机号。
- `redeem_code`：合资格运营产品 UI 明文例外保留；证据、日志、截图、导出继续脱敏。
- 历史 AI 组卷：缺完整 `paperAssembly` 只读不可恢复；当前库无有效恢复样本，X1 未触发前不得伪造。
- authorization/edition：source edition 与 `auth_upgrade` 分离，`effectiveEdition` 动态派生，UI 不作授权边界。
