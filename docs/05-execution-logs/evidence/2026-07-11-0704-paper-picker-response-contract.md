# 0704 组卷选择器响应契约修复证据

## 范围

- taskId：`0704-paper-picker-response-contract-2026-07-11`
- 批次：B1A / A01
- roleLabel：内容管理员
- routeLabel：试卷组卷工作台 / 题目选择 / 材料优先选择
- 状态类别：loading、ready、empty、error、pagination、selected、disabled
- evidenceMode：仅记录脱敏问题编号、状态、修复摘要、命令和测试计数

## RED

1. 将题目和材料 fixture 改为正式 `data: T[] + pagination` 后，组件测试 9 项中 4 项失败，并出现题目/材料数组为 `undefined` 的运行时异常。
2. 修正数组消费后新增真实第 2 页用例，组件测试 10 项中 1 项失败：材料模式点击下一页仍请求第 1 页，无法显示第 2 页记录。

## GREEN

- 题目列表直接读取数组 envelope。
- 材料列表直接读取数组 envelope。
- 材料列表请求使用当前 `page`，不再固定为第 1 页。
- 组件覆盖题目选择、材料优先选择、关联题目添加、题目第 2 页和材料第 2 页。
- focused component：1 file / 10 tests passed。
- affected regression：5 files / 33 tests passed。
- cumulative unit：357 files / 1931 tests passed，默认并发，未降低 worker。

## 静态门禁

- lint：pass，0 errors / 0 warnings。
- typecheck：pass，TypeScript no emit。
- format check：pass，full repository。
- diff check：pass。
- Module Run v2 pre-commit hardening：pass，7 个登记文件完成 scope、敏感证据和术语扫描。

## 环境恢复

- worktree 清理后本地依赖命令链接缺失，使用现有 package 与 lockfile 重建本地依赖目录。
- package、lockfile 和 workspace 配置最终 diff：0。
- 未新增、删除或升级依赖；未执行应用构建脚本批准或引入依赖配置。

## 浏览器复核

- 修复分支不读取 env/secret，故使用合入本地 master 后的既有 0704DB localhost 服务做脱敏交互复核。
- 当前状态：pending post-merge；不抓 raw DOM，不记录凭证、会话、业务标识或完整内容。

## 边界

- API、service、repository、validator、schema、migration、seed 均未修改。
- 未扩大角色、题源、发布、快照或正式内容写入能力。
- 未执行 Provider、env/secret、直接数据库、staging、production、deploy 或 Cost Calibration。
- evidence 不含凭证、token、cookie、DB URL、手机号、卡密、完整内容、raw prompt、raw AI output、Provider payload 或内部数字主键。
