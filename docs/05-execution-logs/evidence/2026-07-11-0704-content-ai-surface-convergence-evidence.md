# 0704 内容 AI 页面收敛 Evidence

## 范围

- roleLabel：内容管理员、超级管理员监督视角、组织管理员既有回归视角
- routeLabel：AI出题、AI组卷
- runtime：localhost UI source/test only
- screenshot：仅复核既有私有截图，未新增截图、DOM 或网络轨迹

## 问题与修复

| routeLabel  | 状态类别                                    | 问题类别       | 修复摘要                                                                                                   |
| ----------- | ------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------- |
| AI出题      | ready / disabled / loading / empty / error  | 信息层级       | 页面收敛为“生成条件、唯一主操作、本次结果与评审、任务记录”工作台；生成结果仍只进入待审题目草稿和人工评审。 |
| AI组卷      | ready / disabled / loading / empty / error  | 业务语义       | 明确“生成组卷方案、平台正式题库本地选题、缺口提示、待审试卷”流程，不暗示 AI 直接生成正式题目正文。         |
| AI出题/组卷 | forbidden / standard-unavailable            | 权限与版本边界 | 保留内容角色、组织角色和 effectiveEdition 的既有守卫；页面重排不扩大入口权限或组织范围。                   |
| AI出题/组卷 | ready / empty / loading / error / paginated | 历史记录       | 本次结果与历史任务拆分；历史分页改用共享 `AdminPagination`，空记录仍展示总数和稳定分页位置。               |
| AI出题/组卷 | reviewable / adopted / rejected             | 正式内容边界   | 保留查看、编辑、驳回、评审采用和正式草稿详情入口；未改变请求、采用或发布合同。                             |

## 测试计数

- RED：1 个测试文件，3 个预期失败用例，分别命中新工作台骨架、AI组卷正式题源边界和共享分页。
- GREEN targeted：2 个测试文件，54 个测试通过。
- lint：通过，0 error / 0 warning。
- typecheck：通过。
- format check：全仓通过。
- `git diff --check`：通过。
- Module Run v2 pre-commit：通过，8 个文件扫描。
- Module Run v2 pre-push：通过，使用任务批准的远端 ahead 检查豁免。

## 边界确认

- Provider 保持关闭，未执行 Provider-enabled 行为。
- 未访问 env/secret，未连接或修改数据库，未执行 staging/prod/deploy/Cost Calibration。
- 未新增依赖，未修改 package/lockfile、API、service、repository、schema、migration 或 seed。
- 未记录 raw prompt、raw AI output、Provider payload、完整题目/试卷/材料/资源、凭证、会话或内部 ID。
- 本证据只支持 localhost UI 优化结论，不支持 staging、production 或 release readiness 声明。
