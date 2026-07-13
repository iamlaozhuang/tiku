# Content Admin P0 Data Integrity Implementation Plan

> **执行要求：** 本计划在当前线程内按 TDD 串行执行；项目禁止未经批准使用 Subagent，因此不采用子智能体执行。

**任务：** `content-admin-p0-data-integrity-2026-07-13`

**目标：** 以同一套可复用语义规则约束内容后台 `question` / `material` 客户端与 API 输入，阻止演示默认值、语义空富文本和题型结构矛盾进入正式内容，同时保留编辑、复制、停用、锁定、绑定和判断题映射行为。

**架构：** 新增浏览器与服务端均可安全导入的纯函数完整性模块；服务端 validators 负责最终归一化与拒绝，客户端复用同一问题列表进行字段错误、错误摘要和首错聚焦。现有 route → service → repository 分层、API envelope 和数据模型不变。

**技术栈：** TypeScript、React 19、Next.js 16、Vitest、Testing Library；不新增依赖。

## 已读取基线

- `AGENTS.md`、品味十诫、ADR-001 至 ADR-007。
- 标准/高级需求索引；`modules/02-question-paper.md`、`stories/epic-02-question-paper.md`、`modules/06-admin-ops.md`、`stories/epic-06-admin-ops.md`。
- 2026-07-07 full-role UI/UX source entry、global foundation、content-admin/cross-role baseline、design-board materialization/review。
- 2026-07-13 accepted P0/PIC contract，实施项为 P0-01 至 P0-14；Batch B-F、editor route、列表请求一致性和全平台推广延期。
- 仓库外 design board 只作为已有设计方向，不在本任务读取私有文件或截图；本任务不做像素级改版。

## 角色、页面与边界

- 角色：`content_admin` 与允许进入同一内容工作区的 `super_admin`；不改变权限。
- 页面族：内容后台题库题目、材料库；路由族 `/admin/content/questions`、`/admin/content/materials` 及 `/api/v1/questions`、`/api/v1/materials`。
- 保持：AI、edition、authorization、organization、企业训练、手机号、`redeem_code`、redaction、content lifecycle 规则。
- 阻断：浏览器/截图/raw DOM、账号/私有文件、DB、Provider、schema/migration/fixture/seed、依赖/env、staging/prod/deploy、PR、push、Cost Calibration。

## 文件范围

- 修改 `src/features/admin/question-material-management/AdminQuestionMaterialManagementClient.tsx`。
- 新增 `src/lib/content-integrity.ts` 及其定向测试。
- 修改 `src/server/validators/question.ts`、`src/server/validators/material.ts`。
- 修改 `src/server/validators/question.test.ts`、新增或修改 `src/server/validators/material.test.ts`。
- 修正 `src/server/services/question-service.test.ts` 中与新题型矩阵冲突的旧单选测试输入，不改变 service 行为。
- 修改 `tests/unit/admin-question-material-ui.test.ts`、`tests/unit/phase-9-content-question-material-runtime.test.ts`。
- 写入本 plan、evidence、audit、project state、task queue。

## TDD 执行步骤

### 1. RED：纯语义与 API 最终防线

- 为富文本语义空值添加表驱动失败测试：空白、空标签、`<p><br></p>`、不可见字符、空表格；验证具备可访问描述的受管图片和有实际单元格文本的表格可通过。
- 为题型矩阵添加失败测试：单选/多选的选项数量、唯一标签、正确项数量与标准答案集合；判断题 A/B 与正确/错误映射；填空自动匹配答案；AI 填空/主观题评分点；非选择题不得提交选项；评分点正数与 0.5 粒度。
- 为材料标题/正文语义非空和 30000 字符边界添加失败测试。
- 运行 validators 定向测试并记录预期 RED，确认失败来自缺少语义门禁而非测试装配。

### 2. GREEN：共享纯函数与服务端 validators

- 在 `src/lib/content-integrity.ts` 实现 HTML entity/不可见字符归一、可访问受管图片识别、表格实际内容识别、标准答案标签集合解析和题型问题列表。
- `question.ts` / `material.ts` 归一化后调用共享规则；保持英文通用错误消息和标准 route envelope，不回显原始输入。
- 只修复根因，不新增 schema、service、repository 或路由分支。

### 3. RED/GREEN：客户端作者意图与可恢复错误

- 将新建题目/材料的内容与关键分类改为空白待选择状态；示例只进入 placeholder/helper。
- 保存按钮仅在提交中禁用；提交时产生字段错误和表单摘要，阻断 fetch，首个 invalid 控件获得焦点；修正后错误清除且可重试。
- 题型切换保留非当前评分方式数据，但 payload 仅提交当前题型允许结构；判断题保持内部语义和 A/B 显示映射。
- 表格 helper 插入结构性空模板，不能单独满足正文/题干有效性；受管图片 helper 保留 metadata-only 边界。
- 添加重复提交、失败保留输入、编辑/复制/停用/锁定/绑定回归测试。

### 4. 验证与对抗式审查

- 定向：共享完整性、question/material validators、UI、runtime route tests。
- 全量：`npm.cmd run test:unit`、`npm.cmd run lint`、`npm.cmd run typecheck`、`npm.cmd run format:check`、`npm.cmd exec -- next build --webpack`、`git diff --check`。
- 两轮审查：第一轮从绕过客户端、HTML/entity/Unicode、题型切换、重复提交攻击；第二轮从回归、API envelope、隐私/权限、范围和证据声明攻击。
- 写 evidence/audit，运行 Module Run v2 pre-commit hardening。未经新的 closeout 决策不 commit/merge；普通 push 始终需要 fresh approval。

## 风险防御

- 不使用具体中文演示字符串黑名单，避免误伤真实内容并防止换文案绕过。
- 不使用 DOMParser 或新依赖，保证浏览器/服务端同构和测试稳定。
- 不将 UI 可见性当授权；不改变 role/edition/service 边界。
- 不将 HTML 标签数等同内容；媒体必须同时满足受管引用与非空 alt，表格必须有实际可见单元格文本。
- 失败证据只记录测试名、计数、路径和脱敏原因，不记录完整题目/材料内容。
