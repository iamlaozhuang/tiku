# 2026-07-08 AI 知识点选择源对抗式复核

## Scope

- Task: `ai-knowledge-node-picker-2026-07-08`
- Review target: AI 知识点只读选项路由、学员端参数面板、后台端参数面板、targeted tests.

## Requirement Mapping Result

| Risk                    | Review Result                                                                                                               |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 误改授权或 edition 语义 | 未改登录、授权、`effectiveEdition` 判定；标准版页面禁用逻辑保持既有实现。                                                   |
| 误触 DB 写入或 schema   | 新路由只调用知识点 list repository；无 schema/migration/seed/fixture 变更。                                                 |
| Provider 被误触发       | 本分支只改参数选项与本地合约提交 UI；未新增或启用 Provider 调用。                                                           |
| 内部 id / 原始内容泄露  | DTO 与 UI 只使用 public id、pathName、profession、levelList 等必要字段；不展示内部数字 id、原始题目/材料/Provider payload。 |
| 跨授权残留知识点        | 切换专业/等级/授权时清空或阻断不属于当前选项集的 selected public ids。                                                      |
| AI出题/AI组卷只覆盖一端 | targeted tests 覆盖学员 AI出题、企业员工 AI组卷、内容后台 AI出题、企业管理员 AI组卷。                                       |

## Adversarial Checks

- 选项为空时：selected 模式阻断提交，提示改用均衡覆盖或维护知识点。
- 选项加载失败时：selected 模式阻断提交，提示稍后重试或改用均衡覆盖。
- 已选 public id 不在当前 options 时：提交被阻断，避免跨授权或跨专业残留。
- 包含下级知识点：仅在 selected 且至少选中节点后可用。
- 只读路由：未提供 POST/PATCH/DELETE；未新增写入口。

## Conclusion

当前分支范围内未发现需要扩大到 DB、Provider、fixture、package/lockfile 或授权语义的修复点。Module Run v2 已通过，剩余动作仅为提交合入推送清理。
