# P1 RC-02 卡密权益预览与显式确认审查

日期：2026-07-16

任务：`p1-remediation-rc-02-redeem-entitlement-preview-2026-07-16`

## Transition Disposition

Decision: APPROVE_SCOPE

F-0132 当前静态失效路径可复现：第一次“预览权益”不访问服务端，只保存规范化输入；确认区回显明文和泛化说明；第二次直接调用不可逆 `/redeem`；合同没有卡种、版本、期限、预览版本或升级目标字段。F-0004 的消费原子性反证不足以关闭知情确认缺口。

批准范围严格限定为 learner `redeem_code` server preview、显式升级目标、previewVersion、事务内 confirm 重验、同用户响应丢失恢复、单实例有界 preview 限流及对应单元测试。若必须新增 schema/migration、依赖、外部限流基础设施、真实数据库或扩展到其他授权 finding，本批准自动失效并停止。

preview 响应不得含明文卡密、哈希、numeric id 或消费用户信息；确认不能信任客户端类型、范围或版本；多目标不能自动选；已有效高级不能消费升级卡；stale preview 和错误目标必须无副作用。

## Round 1

Result: pass

从不可逆 consume 的线性化点逆向审查 UI → route → service → repository。确认根因不是按钮文案，而是不存在服务端只读权益快照与目标选择合同。仅增加 UI 本地确认会继续信任过时输入；仅增加 preview 而在事务外重验，会保留 type/target TOCTOU；因此两者必须作为同一 finding 的最小闭环。

范围拒绝顺手重做授权历史或全局 authorization selector。现有 conditional unused update 与 `auth_upgrade.redeem_code_id` / `personal_auth.redeem_code_id` 唯一约束继续作为单消费底线；同用户 replay 通过既有提交事实恢复，不引入无法持久化的伪 idempotency key。

## Round 2

Result: pass

对抗范围复核通过：preview 使用 POST 避免卡密进入 URL；响应只允许 public id 与权益元数据；版本摘要必须覆盖 code 类型/范围/期限和候选集合；确认必须在事务内重建快照并验证目标。单实例限流是当前无依赖/无 schema 范围内的静态防线，跨实例限流、真实并发、连接中断和多实例响应丢失明确保留给 RV-0021，不得包装成生产验收。

transition 阶段只允许五份治理文件。产品实现开始前必须先通过 P1 `transition_only` 与 Module ancestor checkpoint 守卫；守卫未通过则不得委派 Subagent 或修改产品代码。

## Final Disposition

Decision: pending
