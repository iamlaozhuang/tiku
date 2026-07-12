# 0704 键盘与确定性分页验收证据

**日期：** 2026-07-12

**任务：** `0704-keyboard-pagination-acceptance-2026-07-12`

**分支：** `codex/0704-keyboard-pagination-acceptance`

**基线：** `b22a7745a2bbeda8d5d23e493bc77e021eee2dc2`

## 环境门禁

- localhost 已使用显式进程级 0704DB override 恢复，服务健康，`.env.local` 未修改。
- 已就绪的个人高级学员角色可登录并进入学员首页，证明本轮不是默认数据库误挂载。
- 私有目录将 `content_admin` 标记为就绪，但当前 0704DB 实际密码登录失败；该项记录为账号材料与当前数据库状态不一致，不记为真实内容管理员登录通过。
- 凭证仅在浏览器内存使用并已清空；未输出账号、密码、session、cookie、token、DB URL 或 env 值。

## A21 键盘焦点

| 阶段       | 结果 | 说明                                                                                              |
| ---------- | ---- | ------------------------------------------------------------------------------------------------- |
| RED        | pass | 2 个文件、19 项测试中出现 1 项预期失败：Escape 关闭组卷确认对话框后焦点落到 BODY。                |
| GREEN      | pass | 2 个文件、19 项测试全部通过；取消/确认双向循环、Escape 关闭和触发按钮焦点恢复成立。               |
| Playwright | pass | 1 项真实键盘用例通过；共享详情抽屉覆盖初始焦点、Tab、Shift+Tab、可见焦点、Escape 与触发按钮恢复。 |

- Playwright 第一次运行仅因 fixture 未声明并行材料列表请求而失败；该请求被拦截、未到达 0704DB。补齐空列表 fixture 后 1/1 通过。
- Playwright 所有 `/api/v1/**` 请求均由脱敏 route fixture 处理；未读取或修改数据库。
- 失败和成功运行后的 `test-results` / `playwright-report` 均已清理；未保留截图、trace、error context 或 raw DOM。
- content_admin 真实账号人工抽屉复核因账号材料不一致而阻断，不用 fixture 结果冒充真实账号通过。

## A22 确定性分页

- 构造 45 条试卷记录，test fixture 按请求的 `page` 与 `pageSize` 执行服务器式切片。
- page 1 显示第 1-20 条，page 2 显示不同的第 21-40 条；第二页不再复用第一页记录。
- 20、50、100 页大小请求均回到 page 1，URL 参数与总数保持一致。
- 关键词筛选回到 page 1 并得到 1 条结果；重置恢复默认 page、pageSize、排序与空关键词。
- 只增强测试 fixture 与断言，未改生产 API、repository、service 或分页 hook。

## 累计门禁

| 门禁                                    | 结果                                    |
| --------------------------------------- | --------------------------------------- |
| focused unit                            | pass；2 文件、19 项                     |
| Playwright keyboard                     | pass；1 项                              |
| full unit                               | pass；360 文件、1967 项，`maxWorkers=1` |
| lint                                    | pass                                    |
| typecheck                               | pass                                    |
| full repository format                  | pass                                    |
| `git diff --check`                      | pass                                    |
| blocked path / generated artifact check | pass；无输出                            |
| Module Run v2 pre-commit hardening      | pass；9 个允许文件完成 scope 与敏感扫描 |

## A23 边界

- 本批没有创建/恢复练习或模拟考试业务会话，没有保存答案或提交考试。
- 这些正常产品 API 会写入本地 0704DB，仍需 A23 专项明确批准；不得把 B0-B6 的一般实施批准扩大解释为 DB 会话写入批准。
- 禁止直接 DB 写、fixture 补写、schema/migration/seed、destructive 操作或用本地 acceptance session 伪造学员业务闭环。

## 结论

- A21 自动化键盘合同与 A22 确定性分页证据通过；确认对话框焦点恢复缺口已最小修复。
- content_admin 真实账号人工复核和 A23 业务会话闭环仍分别受账号材料与专项写入批准约束。
- 未执行 Provider、staging、production、deploy 或 Cost Calibration；不声明 release readiness。
