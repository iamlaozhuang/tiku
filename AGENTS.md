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

## AI 智能体执行纪律 (Agent Execution Discipline)

1. **品味法则挂载与强制自检**：所有编码与修改工作开始前，必须强制读取 `docs/03-standards/code-taste-ten-commandments.md` 以及 `docs/02-architecture/adr/` 中的架构决策。每次任务结束并向用户交付代码成果前，Agent **必须**在对话流中输出一份简短的【品味合规自检 Checklist】，逐一确认是否违反了“十诫”（例如未使用纯黑色、API返回标准格式等），未经核对单自检校验，严禁声称任务完成。
2. **强制方案编制**：在开始实际编写业务逻辑前，必须在 `docs/05-execution-logs/task-plans/` 目录下创建执行方案（以 `YYYY-MM-DD-任务描述.md` 命名），明确记录已读取的规范、实现思路及风险防御。
3. **本地验证门禁**：必须在终端本地执行测试并验证通过，方可通过 Git Hooks 允许代码提交。
4. **工作区隔离门禁**：任何由 Agent 引入的工具目录（如 `.agent`）、临时缓存或日志生成目录，必须在项目初始化及引入时第一时间加入项目 `.gitignore` 以及相关打包工具（如 Next.js/Tailwind）的扫描黑名单中，严防 AI 产物污染并导致构建体系崩溃。

## 半自动化推进硬性流程

1. **禁止直接在 `master` / `main` 上开发**：除非用户明确要求只做只读审查，否则所有修改必须先创建短生命周期分支或 worktree，分支名使用 `codex/`、`feat/`、`fix/` 前缀。
2. **任务领取以队列为准**：优先读取 `docs/04-agent-system/state/project-state.yaml` 和 `docs/04-agent-system/state/task-queue.yaml`，只处理 `pending` 且依赖已完成的任务；高风险任务必须先取得明确人工批准。
3. **依赖变更先审批后落地**：新增、删除、升级 npm 包、CLI、外部 SDK、测试框架、云服务配置、数据库迁移工具时，必须先按 `docs/04-agent-system/sop/dependency-introduction-gate.md` 写明理由和 `human approval` 证据，未经批准不得改 `package.json` 或 lockfile。
4. **证据先于结论**：任务完成前必须运行任务声明的验证命令，并把输出写入 `docs/05-execution-logs/evidence/`。如果 `test` script 缺失，只能声明“lint/typecheck 通过，测试门禁缺失”，禁止声称完整测试通过。
5. **合入后清理隔离资源**：短生命周期分支合入 `master` 后，必须删除对应 worktree 和已合入分支；残留 `node_modules` 等本地产物只允许在确认路径位于 `.worktrees/` 内后删除。
6. **跨会话恢复要求**：会话中断或上下文不足时，从 `project-state.yaml`、`task-queue.yaml`、最新 evidence 和 task plan 恢复，不得凭记忆继续实现。
