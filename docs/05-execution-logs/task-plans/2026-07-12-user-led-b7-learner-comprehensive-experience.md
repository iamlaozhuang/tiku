# User-led B7 Learner Comprehensive Experience

## 目标

在不改变授权、Provider、数据库和答题业务边界的前提下，收口本线程新鲜学员端体验问题：减少首页重复入口和解释性噪声，明确员工兑换个人卡密的影响范围，移除模拟考试可见内部标识并本地化恢复提示，补齐报告总分与精确用时语义。

## 已读取基线

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/` 全部 ADR，重点 `adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/stories/epic-03-student-experience.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-3-org-employee-workspace.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-4-personal-students.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-ui-remediation-baseline.md`
- B6 task plan、evidence、audit 与本线程既有学员端截图
- Product Design `index`、`audit` 与 `critical-overrides`

## 问题登记

| roleLabel                                              | route label                | 状态类别   | 问题类别     | 严重程度 | 实际表现                                                                                   | 期望表现                                                           | 复现步骤                       | 建议方案                                                     | 疑似同根因                         |
| ------------------------------------------------------ | -------------------------- | ---------- | ------------ | -------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------ | ------------------------------------------------------------ | ---------------------------------- |
| 个人标准版、个人高级版、企业标准版员工、企业高级版员工 | 学员首页                   | 正常态     | 信息架构     | P2       | 顶部快捷入口与固定底部导航重复，且首屏解释“不是两套系统/最多 20 套”等实现细节              | 首页以授权范围和试卷为主，快捷入口只补充底部导航未覆盖的任务       | 登录任一学员角色进入首页       | 删除重复的个人中心、错题本快捷入口，改为面向任务的简短说明   | 页面级导航未区分全局导航与补充任务 |
| 企业标准版员工、企业高级版员工                         | 卡密兑换                   | 正常态     | 授权语义     | P2       | 页面只说开通个人授权，未明确不会改变企业授权或企业额度；账号帮助插入主流程                 | 员工在提交前明确理解兑换只增加个人授权，企业权益不变；帮助信息后置 | 员工进入卡密兑换               | 依据会话用户类型显示非技术说明，并将账号帮助移到授权结果之后 | 页面丢弃了已加载的用户类型上下文   |
| 四类学员角色                                           | 模拟考试、评分中、考试报告 | 正常态     | 内部信息泄露 | P2       | 标题下展示 mock/exam report publicId                                                       | 用户只看到试卷名、状态与下一步                                     | 进入模拟考试、评分中或报告详情 | 删除可见 publicId，保留内部路由和测试属性                    | 开发诊断字段进入展示层             |
| 四类学员角色                                           | 模拟考试                   | 弱网恢复态 | 文案本地化   | P2       | 显示 `Offline recovery: showing cached mock exam.`                                         | 中文说明当前使用本地暂存内容及联网后的行为                         | 运行时请求失败且存在缓存       | 改为清晰中文恢复提示                                         | 恢复逻辑文案未产品化               |
| 四类学员角色                                           | 模拟考试记录、考试报告     | 已完成态   | 指标语义     | P2       | 列表用“得分”代替需求中的“总分”，用 `Math.round` 丢失秒级精度；详情出现“总分 / 总分 86”重复 | 记录与详情明确总分；用时按小时、分钟、秒精确展示                   | 查看含非整分钟时长的报告       | 统一总分标签，格式化精确用时，去除详情指标重复前缀           | 展示层直接复用快照整句并做近似换算 |
| 企业标准版员工、个人标准版                             | AI训练、企业训练直接 URL   | 不可用态   | 版本边界     | P2       | 既有页面已 fail-closed，需要防回归                                                         | 无能力角色继续不触发生成或组织训练数据访问，并获得用户可读返回路径 | 直接访问高级能力路由           | 仅补回归验证，不改授权服务                                   | 版本边界依赖运行时能力而非菜单隐藏 |

## 第一性原理与实现顺序

1. 学员首要目标是选择当前授权范围内的试卷并开始学习；页面级快捷入口只承载固定导航未覆盖的任务。
2. `redeem_code` 在学员端只改变 `personal_auth`；员工的 `org_auth` 与组织额度是独立上下文，文案不得暗示升级企业版本。
3. publicId 可用于 API、URL 和测试定位，但不是用户决策信息，不进入可见标题或状态。
4. 弱网恢复必须说明用户当前看到什么和系统接下来做什么，不暴露实现英文。
5. 报告遵循需求 SSOT：总分与用时是一级指标；时长不通过四舍五入制造误差。
6. 先写 RED 测试，确认因现有行为失败；再做最小 GREEN 修改，最后只在绿灯下整理重复逻辑。

## 精确文件边界

允许修改：

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- 本计划及同名 evidence/audit
- `src/features/student/home/StudentHomePage.tsx`
- `src/features/student/profile/StudentProfileRedeemPage.tsx`
- `src/features/student/mock-exam/StudentMockExamReportPage.tsx`
- `tests/unit/student-home-ui.test.ts`
- `tests/unit/student-profile-redeem-ui.test.ts`
- `tests/unit/student-mock-exam-report-ui.test.ts`
- `tests/unit/student-practice-ui.test.ts`（仅直接入口回归断言）
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`（仅版本边界回归验证，默认不修改）
- `tests/unit/student-organization-training-ui.test.ts`（若存在，仅版本边界回归验证，默认不修改）

阻止修改：`.env*`、package/lockfile、数据库 schema、drizzle、migration、seed/fixture、服务端授权/Provider/仓储/路由、e2e、浏览器与截图产物、私有目录、staging/prod/deploy、PR、force push。

## 验证与对抗式审查

- RED/GREEN 定向 Vitest：home、profile/redeem、mock/report、practice 直接入口。
- 全量 unit、lint、typecheck、format:check、webpack build、`git diff --check`。
- 两轮对抗式审查：标准版直接 URL、企业/个人授权混淆、publicId 可见性、弱网缓存、零秒/跨小时用时、已终止报告、移动端 containment、敏感信息与 Provider/DB 误触发。
- 写 evidence、audit 和十诫品味自检；执行 Module Run v2 pre-commit、module closeout、pre-push；单批提交、ff-only 合入 master、master 复验、普通 push、0/0 比对后清理分支/worktree。
