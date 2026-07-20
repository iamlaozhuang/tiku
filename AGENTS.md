你是题库系统（Tiku）的 AI 开发助手。生成或修改任何代码、数据库、接口时，必须严格遵守以下命名规范。完整术语和枚举数据源见 `docs/03-standards/glossary.yaml`。

## 命名风格

- 数据库表名、字段名：`snake_case`（单数名词）
- REST API 路径：`kebab-case`（复数名词），如 `/api/v1/exam-papers`
- API JSON 字段：`camelCase`
- Python 变量/函数：`snake_case`；类：`PascalCase`
- TypeScript/JS 变量/函数：`camelCase`；类/组件/类型：`PascalCase`
- CSS 类名：`kebab-case`
- 环境变量、常量：`UPPER_SNAKE_CASE`

## 术语表（严格使用以下英文标识，禁止自行翻译）

### 核心业务

- 专业 `profession`（monopoly/marketing/logistics）
- 等级 `level`
- 科目 `subject`（theory/skill）
- 题目 `question`
- 试卷 `paper`
- 材料 `material`
- 大题/模块 `paper_section`（不要用 section，会与 HTML 冲突）
- 材料题组 `question_group`
- 选项 `question_option`（不要用 option，会与 UI 组件冲突）
- 评分点 `scoring_point`
- 知识点 `knowledge_node`
- 标签 `tag`
- 解析（老师解析）`analysis`（区别于 AI 讲解 `ai_explanation`）
- 标准答案 `standard_answer`
- 试卷原始文件 `paper_asset`
- 试卷类型 `paper_type`
- 试卷附件用途 `paper_attachment_usage`

### 用户与授权

- 用户/账号 `user`
- 学员 `student`
- 管理员 `admin`
- 企业/组织 `organization`（缩写 `org`）
- 企业层级 `org_tier`（province/city/district）
- 员工 `employee`
- 卡密 `redeem_code`
- 授权 `authorization`（缩写 `auth`，不要用 license）
- 个人授权 `personal_auth`
- 企业授权 `org_auth`
- 购买联系方式 `contact_config`
- 用户类型 `user_type`
- 授权范围类型 `auth_scope_type`

### 答题与考试

- 练习 `practice`
- 模拟考试 `mock_exam`（缩写 `mock`，不要用 exam）
- 作答记录 `answer_record`
- 考试报告 `exam_report`
- 错题本 `mistake_book`
- 作答模式 `exam_mode`

### AI 与知识库

- AI 评分 `ai_scoring`
- AI 讲解 `ai_explanation`
- AI 提示 `ai_hint`
- 知识点推荐 `kn_recommendation`
- 模型供应商 `model_provider`
- 模型配置 `model_config`
- Prompt 模板 `prompt_template`
- 资源 `resource`
- 知识库 `knowledge_base`
- 向量 `embedding`
- 检索片段 `chunk`
- 引用来源 `citation`
- 命中状态 `evidence_status`（sufficient/weak/none）
- 学习建议 `learning_suggestion`

### 系统

- 审计日志 `audit_log`
- AI 调用日志 `ai_call_log`
- 快照 `snapshot`（缩写 snap）
- 会话 `session`
- AI 调用状态 `ai_call_status`

## 数据库关键约定

- 主键：`id`（BIGINT 自增）
- 外键：`{实体}_id`
- 时间戳：`_at` 后缀（`created_at`、`expires_at`）
- 布尔：`is_` 前缀
- 状态：`status` 后缀
- 枚举值存为 `snake_case` 小写字符串
- 关联表：两个实体名按字母序拼接（`paper_question`）
- 索引：`idx_{表名}_{字段名}`；唯一索引：`udx_{表名}_{字段名}`
- 排序字段用 `sort_order`（避免保留字 `order`）
- 迁移文件：`{YYYYMMDDHHMMSS}_{描述}.sql`

## API 关键约定

- 路径版本：`/api/v1/`
- 时间格式：ISO 8601（`2026-05-12T12:00:00Z`）
- 空值：可选字段返回 `null`，不省略 key；列表无内容返回 `[]`
- 响应结构：`{ code, message, data, pagination? }`
- 分页参数：`page`（从1开始）、`pageSize`、`sortBy`、`sortOrder`
- 资源嵌套最多两层
- 动作用动词子路径：`POST /api/v1/mock-exams/{id}/submit`

## 前端代码约定

- 组件目录 PascalCase（`QuestionCard/`），页面目录 kebab-case（`mock-exam/`）
- 组件后缀：`Page`、`Layout`、`Modal`、`Drawer`
- Hook：`use` + PascalCase（`usePaperDetail`）
- 事件处理：`handle` + 动词名词（`handleSubmitAnswer`）
- 回调 Prop：`on` + 动词名词（`onSubmitAnswer`）
- 小程序兼容：避免 HTML 原生标签名作组件名，业务逻辑抽到 hooks/services 层

## 后端代码约定

- Python 文件：`snake_case.py`；Go 文件：`snake_case.go`
- 分层：api → service → repository → model
- AI 模块独立目录：`ai/`、`rag/`

## 文档与 Git 约定

- 文档文件名：`kebab-case.md`
- 治理规范不加日期前缀；阶段性文档加日期前缀（`2026-05-12-xxx.md`）
- Git 分支：`{类型}/{描述}`（`feat/paper-publish`、`fix/redeem-code-validation`）
- Commit：`{类型}({范围}): {描述}`（`feat(paper): add publish validation`）

## 对象存储路径

```
{环境}/{资源类型}/{专业}/{年月}/{文件哈希}.{后缀}
```

路径用 `kebab-case`。环境标识：`prod` / `staging` / `dev`。

## 外部开源组件

- 保持第三方库原有命名风格
- 项目与第三方之间建封装隔离层，隔离层遵循本规范
- 类型冲突时通过 type alias 对齐术语表

## 严禁事项

1. 禁止自造缩写，所有缩写必须在术语表中注册
2. 禁止在 API JSON 字段中使用 snake_case
3. 禁止用空字符串 "" 代替 null
4. 禁止暴露自增主键到外部可见 URL

## UI/UX 代码规范摘要（详见 docs/03-standards/ui-code.md）

1. **Token 驱动**：严禁在代码中写死颜色、间距等魔法数值，必须使用 Design Tokens。
2. **多端策略**：学员端（Mobile-first）与后台端（Desktop-first）共享基础 Tokens，但组件库和布局独立。
3. **主题切换**：通过 CSS Variables 在根节点切换，禁止在组件 JS 逻辑中硬编码深浅色判断。
4. **组件结构**：保持组件无状态化，复杂逻辑抽离至 Hooks/Services；避免使用原生 HTML 标签作为组件名。

## AI 智能体执行纪律

本仓库的唯一常规执行入口是 `docs/04-agent-system/sop/minimal-safety-kernel.md` 与
`scripts/agent-system/Test-MinimalSafetyKernel.ps1`。旧 P1/P0/Module Run guard、transition 合同和 smoke 仅供历史审计，
不得重新接入 hook，也不得为新 finding/task/SHA/files 增加专属分支。

1. 编码前读取本文件、品味十诫、相关 ADR/需求 SSOT、`task-safety.json`，以及 state/queue 中当前任务与下一任务。
2. 所有写操作在 `codex/`、`feat/` 或 `fix/` 短分支/worktree 中完成，禁止直接在 `master/main` 开发。
3. 每个任务先在 `task-safety.json` 声明非空目标、精确 `allowedFiles`、验收命令和高风险批准来源；实际 diff 必须匹配。
4. 功能或修复使用 TDD；受影响产品代码必须通过 focused tests、lint、typecheck，按影响面追加 build/e2e，不得用无关 full suite 代替 focused 反馈。
5. 普通任务只需任务合同、终端验证和一次主线程对抗式审查。仅复杂/高风险任务或用户明确要求时创建 task plan/evidence/audit，禁止机械复制三件套。
6. 依赖、数据库/schema/migration、权限/授权、部署、secret/env、Provider、支付、外部服务、PR、force-push 必须取得对应 fresh approval；依赖变更继续独立提交。
7. 一任务一可审查提交；仅 ff-only 合入 `master`。Push 必须有 fresh approval，只允许已批准目标；随后验证远端同步并清理短分支/worktree。
8. state/queue 只用于排期、恢复与 WIP=1，不是 commit/push 授权机；不得为状态切换修改 guard/smoke。
9. 历史 evidence/audit/旧脚本不得删除或改写。它们标记为 superseded/read-only 后，不进入普通任务默认读取面。
10. 交付前必须运行新鲜验证并输出简短【品味合规自检 Checklist】；没有命令证据不得声称完成。

涉及 AI 生成时，仍以最新 traceability 与 goal-completion audit 为当前基线；涉及 `advanced`、`edition`、
`authorization`、`personal_auth`、`org_auth`、`redeem_code`、`auth_upgrade` 或 quota 时，仍须读取需求总索引、
高级版索引、相关 module/story、最新 traceability、edition-aware authorization requirements 与 ADR-007。稳定需求与最新
traceability 无法消解冲突时停止并请用户决策。

DO NOT send optional commentary
