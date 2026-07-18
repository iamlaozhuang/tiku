# F-0115 Module pre-commit 治理热修方案

日期：2026-07-17

任务：`p1-f0115-module-precommit-hotfix-2026-07-17`

## 目标

在不降低 scope/sensitive evidence 门禁的前提下，修复 Module pre-commit 的两类确定性误报：将 Next 动态目录 `[publicId]` 作为 allowlist literal，而不是 PowerShell character class；允许显式、不可用的 fixture/placeholder 与代码标识符，同时继续 hard-block 真实 secret、真实连接串和其他越界文件。

## 第一性原理

- Scope matcher 的语义由治理 allowlist 定义：只有 `*`、`?`、`/**` 是通配，方括号是普通路径字符。
- Sensitive scan 的目标是值，不是字段名。源码中 password 字段绑定 bare `passwordHash` identifier、SQL expression 与明确 placeholder fixture 不是凭据；高熵 literal、Bearer、private key、provider key、非 fixture database URL 仍必须阻断。
- 该热修只建立一次精确 transition 路径；只有它通过 P1 `transition_only` 后可使用 ancestor checkpoint，其他 `in_progress` SHA 漂移继续 hard-block。

## Allowed Files

仅限授权文件列出的 4 份治理文档与 6 个 P1/Module guard/smoke 文件。

## Blocked Files

产品源码、task queue/project state、依赖/lockfile、schema/migration、环境文件以及授权清单外全部文件。

## TDD

1. RED：新增 bracket literal allowlist、普通 wildcard、代码 identifier/SQL expression、placeholder fixture、真实 secret/DB URL 对抗 fixture。
2. GREEN：用 escape-first glob-to-regex 匹配路径；对敏感 assignment 解析匹配值，只豁免源码 identifier/expression 和显式 fixture marker。
3. 完整运行 P1 smoke、Module precommit smoke、Module prepush smoke；负例必须继续 hard-block。
4. 两轮只读自审，写脱敏 evidence/audit。

## Stop Conditions

- 任一真实 secret、非 fixture DB URL、越界路径或普通 `in_progress` drift 被放行。
- 需要修改产品文件、task queue/state、依赖、数据库、Provider、runtime 或远端高风险动作。
- exact transition topology 不能证明单 parent、固定 base、固定 branch、固定 10 文件。

Cost Calibration Gate remains blocked。
