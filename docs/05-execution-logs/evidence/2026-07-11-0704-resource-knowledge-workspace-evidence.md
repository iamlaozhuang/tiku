# 0704 资源与知识点工作区 Evidence

## 范围

- roleLabel：内容管理员、超级管理员监督视角
- routeLabel：资源管理、知识点树
- runtime：localhost UI source/test only
- screenshot：仅复核既有私有截图，未新增截图、DOM 或网络轨迹

## 问题与修复

| routeLabel | 状态类别                                             | 问题类别   | 修复摘要                                                                                                              |
| ---------- | ---------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------- |
| 资源管理   | ready / empty / filtered-empty / error / forbidden   | 分页与筛选 | 固定前 100 条客户端筛选改为服务端查询、真实总数、共享工具栏与分页；本地目录和数据库来源合并后保持页大小与连续页边界。 |
| 资源管理   | ready / detail-loading / detail-empty / detail-error | 详情入口   | 每条资料提供只读详情，展示安全元数据、章节目录、可读预览、检索状态和处理时间线；不展示存储路径、向量或内容分片。      |
| 资源管理   | ready / disabled / confirming                        | 任务编排   | 上传面板按需展开；查看、校对、发布、重建检索索引和停用保持独立职责，既有写操作端点和请求体未改变。                    |
| 知识点树   | ready / filtered-empty / error / forbidden           | 隐式选择   | 移除首条记录隐式操作目标；未显式选择节点时编辑、移动和停用不可执行。                                                  |
| 知识点树   | ready / selected / disabled                          | 树形交互   | 左树右详情；展示完整路径、适用等级、绑定题目、推荐状态和关联资料说明；父级改为可读树选项，“排序”改为“显示顺序”。      |
| 知识点树   | ready                                                | 数据完整性 | 不使用破坏层级的全局分页；按服务端页连续加载完整树数据，搜索保留完整路径，避免固定 20/100 条静默截断。                |

## 测试计数

- RED：1 个测试文件，2 个预期失败用例，分别命中隐式节点选择和资源固定前 100 条/常驻上传面板。
- GREEN targeted：4 个测试文件，32 个测试通过。
- lint：通过，0 error / 0 warning。
- typecheck：通过。
- format check：全仓通过。
- `git diff --check`：通过。
- Module Run v2 pre-commit：通过，13 个文件扫描。
- Module Run v2 pre-push：首次按预期阻断在缺少 evidence/audit 与状态 SHA，材料化后复跑通过。

## 边界确认

- Provider 保持关闭，未执行 Provider-enabled 行为。
- 未访问 env/secret，未连接或修改数据库，未执行 staging/prod/deploy/Cost Calibration。
- 未新增依赖，未修改 package/lockfile、schema、migration 或 seed。
- 未记录完整资料内容、原始分片、向量、对象存储路径、凭证、会话或内部 ID。
- 本证据只支持 localhost UI 优化结论，不支持 staging、production 或 release readiness 声明。
