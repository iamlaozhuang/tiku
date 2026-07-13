# User-led B1-B2 Organization Training Runtime Recovery Audit

## 审查结论

两轮对抗式审查通过，未发现阻断提交的问题。数据库操作严格限制为现有 additive migration 的单事务执行，产品 diff 只移除企业训练 UI 的内部数值错误码。

APPROVE：B1-B2 适合按既定授权执行提交、ff-only 合入、master 复验、普通 push 与短分支清理。

## 第一轮：数据库与授权边界对抗

- **目标数据库**：只使用 localhost 服务的 process-level 0704DB override；未修改 `.env.local`，未输出连接信息。
- **迁移前置**：列、索引、journal 缺失均有元数据证据；仓库外备份成功且格式、hash 已校验。
- **执行原子性**：只执行已审阅文件中的两条 additive SQL，并置于同一 transaction；索引失败会回滚列变更。
- **journal 边界**：恢复库无 journal，因此禁止 `drizzle-kit migrate` 历史重放，也未合成历史记录。
- **破坏面**：无 DROP、DELETE、UPDATE、数据回填、schema 源码、fixture、seed 或新 migration。
- **授权隔离**：标准版 fail-closed、组织范围、deadline、takedown、duplicate submit、答案脱敏和正式题域隔离均受 162 个定向用例保护。
- **Provider**：保持关闭，未发生模型调用。

## 第二轮：产品状态与回归对抗

- **错误文案**：列表、创建、复制、下架、发布、详情失败不再展示内部数值码；业务动作仍清晰。
- **恢复路径**：列表失败继续禁用创建，并保留重试和返回组织概览；没有把失败伪装成空列表。
- **状态完整性**：loading、empty、partial failure、detail error 和 mutation alert 行为未删减。
- **范围控制**：产品 diff 仅涉及管理员企业训练页面与对应测试；repository/service/route/mapper/schema 源码不变。
- **真实运行时**：员工 visible-list 返回标准成功 envelope；管理员真实角色复核明确保留给 B9，不以当前员工会话冒充管理员证据。
- **质量门禁**：360/360 files、1982/1982 tests、lint、typecheck、format 和 90/90 webpack build 全部通过。
- **敏感信息**：浏览器与数据库证据均为 redacted aggregate，不含凭证、session、cookie、token、业务行或连接信息。

## 品味合规自检 Checklist

- [x] 1. 未新增颜色、渐变、字体、间距或视觉魔法值。
- [x] 2. Loading / Empty / Error / Partial failure 状态保持完整。
- [x] 3. 重试、返回路径和 mutation alert 反馈未削弱。
- [x] 4. 代码通过 Prettier，未留下 lint warning。
- [x] 5. 未修改数据库查询，不新增 N+1 风险。
- [x] 6. 只执行既有 additive migration；无 schema 源码或新 migration 变更。
- [x] 7. API 标准 envelope 与字段契约未修改。
- [x] 8. 未新增叙事性代码注释或无价值抽象。
- [x] 9. 直接使用明确中文业务文案，未保留 identity helper。
- [x] 10. 未新增 React state 或可变数据更新路径。

## 残余限制

- 当前真实浏览器会话仅能证明企业高级版员工列表恢复；管理员、四类角色和 viewport 累计验收属于 B9。
- localhost 结果不能代表 staging、production 或 release readiness。
