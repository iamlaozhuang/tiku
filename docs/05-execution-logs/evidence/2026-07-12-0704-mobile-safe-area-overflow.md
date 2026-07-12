# 0704 移动端安全区与横向溢出修复证据

**日期：** 2026-07-12

**任务：** `0704-mobile-safe-area-overflow-2026-07-12`

**分支：** `codex/0704-mobile-safe-area-overflow`

**基线：** `1784bfc3229c8305595762cc3becd6acf97c3414`

## 范围

- A28：学员壳底部导航增加设备安全区，保留稳定的 56px 导航内容高度。
- A29：学员主内容和共享后台表格容器显式限制横向宽度；宽表继续只在 `AdminTableFrame` 内滚动。
- 未改角色、授权、业务流程、Provider、环境文件、数据库、schema、migration、seed、依赖或锁文件。

## TDD 证据

| 阶段      | 结果 | 说明                                                                                                   |
| --------- | ---- | ------------------------------------------------------------------------------------------------------ |
| RED       | pass | 3 个文件、12 项测试中出现 2 项预期失败，分别覆盖学员安全区/页面 containment 与后台 table containment。 |
| GREEN     | pass | 3 个文件、12 项测试全部通过。                                                                          |
| 全量 unit | pass | 360 个文件、1966 项测试全部通过，`maxWorkers=1`。                                                      |

## 静态与构建门禁

| 门禁                               | 结果                                        |
| ---------------------------------- | ------------------------------------------- |
| lint                               | pass                                        |
| typecheck                          | pass                                        |
| full repository format check       | pass                                        |
| `git diff --check`                 | pass                                        |
| blocked path diff                  | pass；无输出                                |
| webpack production build           | pass；90 个页面路由完成生成/收集            |
| Module Run v2 pre-commit hardening | pass；9 个允许文件完成 scope 与敏感证据扫描 |

## 浏览器与环境边界

- 390x844 登录页基线：根节点 `scrollWidth == clientWidth == 390`，无页面级横向溢出。
- 当前 3000 端口服务是本批开始前已存在的旧 Node 进程；角色登录数据与私有 0704 角色材料不匹配，不能证明其挂载了原 0704DB。
- 因此本批不把未登录页面冒充学员壳 runtime 通过；真实角色交互保留到 0704DB 专用 localhost 恢复后执行。
- 强制环境门禁：每次角色交互验收前，必须确认 localhost 使用显式的 0704DB 进程级 override；不得修改 `.env.local`，不得以端口可访问代替数据库目标确认。
- 私有凭证仅在浏览器内存使用，登录字段随后清空；未输出或保存凭证、session、cookie、token、数据库值或内部 ID。
- 未截图、未抓 raw DOM，未执行 Provider、staging、production、deploy 或 Cost Calibration。

## 结论

- A28/A29 的共享源码合同、全量单测、静态门禁和生产构建均通过。
- 当前角色浏览器证据仍因 0704DB 专用进程未恢复而阻断；该阻断不降低源码修复结论，也不被记录为交互通过。
- 不声明 staging、production、release readiness 或生产可用性。
