# 0704 错误状态、角色与版本边界修复方案

**日期：** 2026-07-12

**任务：** `0704-role-error-boundary-2026-07-12`

**分支：** `codex/0704-role-error-boundary`

**基线：** `adb75ce3cd9548dfa24241e15dfb84055318d63c`

## 目标与问题映射

- A04：企业训练列表处于加载失败或 `integrityStatus = partial` 时，暂停“新建企业训练”，显示可见原因，并提供重试和返回组织概览入口。
- A18：统一会话与角色判定。只有真实未登录进入登录态；已登录但角色不符进入 forbidden；会话接口异常进入可重试错误态。
- A19：标准版组织管理员直达高级版组织路由时，保留组织后台壳、标准版上下文、导航和返回组织概览入口，同时不渲染高级页面内容。

## 已读取基线

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-ui-remediation-baseline.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-0-global-foundation.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-2-org-admin-workspace.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-local-design-board-materialization.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-baseline-design-review.md`
- `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux/README.md`
- 设计板 page matrix 中组织管理员与企业训练的脱敏条目。
- B0 问题台账、B1B 企业训练读取 evidence/audit、B2 Provider-closed evidence/audit。

## 第一性原理与实现边界

1. 登录、角色、版本和组织上下文是不同事实，不得用一次 `/login` 跳转掩盖所有失败。
2. UI 壳只表达当前已确认的工作区上下文；服务端角色、`effectiveEdition` 和组织范围校验继续作为授权边界。
3. 列表不完整时不能假设“未返回的历史训练不存在”；新建入口必须 fail closed，但合法只读列表仍可展示。
4. 标准版不可用不是未登录，也不是能力授权；保留组织壳不得渲染高级页面 children 或扩大菜单能力。
5. 不改 Provider、AI 合同、正式内容、数据库、schema、migration、seed、依赖、env/secret、staging/prod/deploy 或 Cost Calibration。

## RED 计划

1. 为会话角色合同写纯函数测试：未登录、正确角色、已登录错误角色、非鉴权错误分别得到 `unauthorized`、`authorized`、`forbidden`、`error`。
2. 为学员壳写管理员会话直达 RED：不得跳转 `/login`，不得泄漏学员壳，必须显示角色专属 forbidden 和返回后台入口。
3. 为后台壳写学员会话直达 RED：不得跳转 `/login`；标准组织管理员直达高级路由时必须保留组织导航和上下文，但不渲染高级 children。
4. 为企业训练列表写 `partial` 和加载失败 RED：新建按钮禁用；partial 合法行仍显示；重试成功后入口恢复；错误态提供组织概览返回入口。
5. 将既有水合回归用例的未登录前置条件显式建模为 session API 未认证响应，避免继续依赖“网络错误等于未登录”的旧语义。

## 最小 GREEN

- 在既有 session boundary contract 中集中会话与角色分类，不把 UI 显隐当授权。
- `ProtectedRouteGuard` 和 `AdminDashboardLayout` 复用同一分类语义；未知运行时失败显示安全错误态，不跳登录。
- `AdminStateTemplate` 支持嵌入已授权后台壳，避免嵌套 `main`，默认独立页面行为不变。
- 企业训练页面消费 `OrganizationTrainingAdminLifecycleFlowDto` 的完整性字段，增加显式重试序号与创建双重保护。

## 对抗式验收矩阵

| 边界              | 必须通过                                                                                |
| ----------------- | --------------------------------------------------------------------------------------- |
| 未登录            | 学员/后台路由进入登录专属状态并跳转 `/login`。                                          |
| 错误角色          | 管理员访问学员页、学员访问后台页均显示 forbidden，不跳登录，不渲染目标工作区 children。 |
| 会话异常          | 显示可重试错误态，不伪装成未登录。                                                      |
| 标准版            | 组织壳与标准版上下文保留；高级训练/统计/AI 内容、历史和操作不渲染。                     |
| 高级版            | 合法组织管理员继续进入企业训练，菜单和现有流程不回归。                                  |
| 组织上下文        | missing-context 与 forbidden、unauthorized 保持区分，不推断组织范围。                   |
| 列表完整性        | `partial` 展示合法行和脱敏告警，新建禁用；重试 complete 后恢复。                        |
| 列表错误          | 新建禁用，提供重试与返回组织概览；不产生创建 POST。                                     |
| Provider/正式内容 | 零 Provider 请求，零正式内容写入，零权限扩大。                                          |

## 验证门禁

1. RED 失败记录与 focused GREEN。
2. 受影响角色守卫、组织工作区、企业训练组件和 B1B/B2 累计回归。
3. 全量 `npm.cmd run test:unit`。
4. `npm.cmd run lint`、`npm.cmd run typecheck`、`npm.cmd run format:check`、`git diff --check`。
5. 如路由/layout 合同变化，执行 webpack production build。
6. Module Run v2 pre-commit hardening。
7. localhost 仅做脱敏健康与可用角色验收；原 0704DB 未恢复时明确延期，不猜测 env 或凭证。

## 停止条件

- 角色能力扩大、标准版进入高级 children、组织范围推断、列表不完整仍可创建。
- Provider 请求、敏感字段进入 UI/测试输出/evidence、正式内容直写。
- 依赖、lockfile、schema、migration、seed、env 或部署文件变化。
- 无法解释的既有测试失败。
