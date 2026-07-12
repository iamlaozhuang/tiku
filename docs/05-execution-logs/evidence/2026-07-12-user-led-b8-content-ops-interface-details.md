# User-led B8 Content And Operations Interface Details Evidence

## 范围

- 基线：`5cbbc1849006188ef6b979674bd0183b941050df`
- 分支：`codex/user-led-b8-content-ops-details`
- 仅删除内容后台内部验收文案，并为企业授权、员工账号两张表增加局部 token 化单元格间距。
- 未修改共享表格原语、服务端授权、Provider、数据库、schema、migration、fixture、seed、依赖、lockfile 或 `.env*`。
- 未操作浏览器或创建新截图；本批设计判断基于用户已提供截图、现有设计系统、需求与源码。

## TDD 证据

1. RED：首轮 2 个文件、30 个用例中 4 个预期失败，分别命中两处内部验收文案和两张缺少单元格间距的表格。
2. GREEN：实现后 2 个文件、30 个用例通过。
3. 保护性回归：内容后台、运营授权/员工表、A15 卡密和 Provider-closed 共 4 个文件、69 个用例通过。
4. 全量回归首轮在并行资源竞争下出现 1 个既有试卷管理文件的 2 个非确定性失败；该文件单独以 1 worker 运行 8/8 通过，随后全量以 25% worker 和 20 秒超时运行 360/360 文件、1982/1982 用例通过。

## 实现结果

- 删除生产运行时中的 `ContentOpsStagingRoleArrangement` 组件及内容总览、知识点树两个用法。
- 内容后台不再展示“内容运营本地验收”“内容运营体验安排”等实施阶段说明。
- 企业授权和员工账号两张表复用局部 `px-4 py-3` spacing class；加载、错误、空状态保留 `py-8`，并补齐水平 padding。
- `AdminTableFrame`、最小宽度与横向滚动边界不变；共享 `adminDataTableClassName` 未修改。
- AI Provider-closed 状态说明、任务记录可见性和 fail-closed 行为未修改。
- A14 继续保持 deferred；A15 合资格运营角色卡密明文查看/复制及脱敏审计能力未修改。

## 验证结果

| 门禁                      | 结果                                       |
| ------------------------- | ------------------------------------------ |
| RED                       | `2 files / 30 tests / 4 expected failures` |
| GREEN                     | `2 files / 30 tests` 通过                  |
| 定向保护回归              | `4 files / 69 tests` 通过                  |
| 全量 unit                 | `360 files / 1982 tests` 通过              |
| lint                      | 通过，0 error                              |
| typecheck                 | 通过                                       |
| format:check              | 通过                                       |
| webpack build             | 通过，`90/90` 静态页面生成                 |
| git diff --check          | 通过                                       |
| blocked path diff         | 无输出                                     |
| Provider                  | 未调用                                     |
| 数据库连接/写入/migration | 未执行                                     |
| 浏览器/截图               | 未执行                                     |
| 本地提交/合入/推送        | 待 closeout                                |

## 对抗式审查

- 第一轮：内部验收文案在 `src` 中无残留；局部 spacing class 只用于企业授权和员工账号表；共享表格原语与卡密列表未变。
- 第二轮：Provider-closed 状态和任务记录仍受 UI 用例保护；A15 明文授权与脱敏状态仍受授权用例保护；无服务端、数据库、依赖或环境文件 diff。
- 390px 与真实角色浏览器累计验收不在本批执行，保留给 B9；本批没有用源码断言替代后续浏览器视觉证据。

## 敏感信息

- 证据仅记录状态、数量、命令类别与公开 commit SHA。
- 未输出账号、凭证、session、cookie、token、DB URL、环境变量值、卡密明文、题目内容或 Provider payload。

## 结论

当前结果达到真实提交门禁，不扩展为 staging、production 或 release readiness。
