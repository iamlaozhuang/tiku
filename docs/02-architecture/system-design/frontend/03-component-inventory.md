# 组件清单 (Component Inventory)

基于 MVP 阶段的 User Stories 需求，梳理提取的 UI 组件库清单。本清单区分为“基础组件（无业务状态）”与“业务复合组件”。

## 1. 基础组件 (Base Components)

两端基础组件库，建议优先采用成熟且支持 Headless/Tailwind 的开源库（如 Radix UI, shadcn/ui 等）进行封装，而非从零手写。

| 组件分类 | 包含组件 | 说明 | 学员端 | 后台端 |
|---|---|---|:---:|:---:|
| **通用 (General)** | Button, Icon, Typography | 基础交互和排版 | ✅ | ✅ |
| **布局 (Layout)** | Container, Grid, Flex, Divider | 页面基础骨架 | ✅ | ✅ |
| **导航 (Navigation)** | TabBar, Sidebar, Breadcrumb, Tabs | 页面跳转与层级导航 | ✅ (Tab) | ✅ (Side) |
| **数据录入 (Data Entry)** | Input, Select, Checkbox, Radio, Textarea, Upload | 表单填写基础 | ✅ | ✅ |
| **数据展示 (Data Display)**| Card, Table, Tag, Badge, Avatar, Tree | 数据列表与块状展示 | ✅ (Card) | ✅ (Table/Tree) |
| **反馈 (Feedback)** | Modal/Dialog, Toast, Alert, Skeleton, Spinner | 状态提示与加载过渡 | ✅ | ✅ |

---

## 2. 业务复合组件 (Business Components)

基于具体业务需求封装，包含特定的 UI 逻辑，但应当保持内部数据的无状态性，通过 Props 传入数据和回调。

### 2.1 答题与试卷 (Exam & Question)

| 组件名 | 说明 | 涉及终端 |
|---|---|---|
| `QuestionCard` | 单个题目卡片，根据题型渲染内部控件（选择题 Radio/Checkbox，主观题 Textarea） | 学员端 |
| `MaterialBlock` | 材料题展示区块，支持长文本和引用 | 两端 |
| `AnswerSheet` | 答题卡抽屉/弹窗，展示题目完成状态和快速跳转 | 学员端 |
| `ExamTimer` | 考试倒计时器，包含紧急状态变色提醒 | 学员端 |
| `PaperSectionTitle` | 大题/模块的标题分隔区块 | 两端 |
| `ScoringPointList` | 主观题评分点展示列表（老师打分或 AI 评分展示用） | 两端 |

### 2.2 AI 与学习报告 (AI & Report)

| 组件名 | 说明 | 涉及终端 |
|---|---|---|
| `AIExplanationBox` | AI 解析或 AI 提示展示框，支持 Markdown 渲染 | 学员端 |
| `ReportScoreRing` | 考试报告页的得分环形图组件 | 学员端 |
| `RadarChart` | 知识点掌握程度雷达图 | 学员端 |
| `CitationList` | RAG 知识库引用的来源列表（包含原文件及页码跳转） | 学员端 |
| `RetryActionArea` | AI 生成失败（如超时）时的手动重试操作区 | 两端 |

### 2.3 用户与授权 (Auth & Account)

| 组件名 | 说明 | 涉及终端 |
|---|---|---|
| `RedeemCodeInput` | 卡密兑换输入框，包含前端格式校验规则 | 学员端 |
| `UserAvatarDropdown` | 用户头像与设置下拉菜单 | 两端 |
| `OrgSelector` | 员工登录时的企业层级选择器（如遇组织变更） | 学员端 |

### 2.4 后台管理专用 (Admin Specific)

| 组件名 | 说明 | 涉及终端 |
|---|---|---|
| `FilterBar` | 复杂的组合筛选栏（如根据专业、等级、状态筛选试卷） | 后台端 |
| `DataSummaryCards` | 后台首页的概览数据统计卡片阵列 | 后台端 |
| `StatusBadge` | 枚举状态（如：未发布、已发布、下架）的彩色标签 | 后台端 |
| `AuditLogTimeline` | 审计日志的垂直时间轴展示 | 后台端 |

---

## 3. 布局模版 (Layouts)

| 布局名 | 适用范围 | 结构描述 |
|---|---|---|
| `StudentAppLayout` | 学员端常规页面 | 顶部 Header (含后退/标题) + 中间 Content + 底部 TabBar |
| `StudentExamLayout` | 学员端答题/考试中 | 顶部 Header (含 Timer & 提交按钮) + 中间单列 Content + 悬浮答题卡按钮 |
| `AdminDashboardLayout`| 后台管理页面 | 左侧深色 Sidebar + 顶部白色 TopBar (含面包屑和用户信息) + 中间宽屏 Content 区域 |
