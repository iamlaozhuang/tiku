# Employee Personal AI Selected Context Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让同时拥有个人授权与组织身份的员工按服务端重验后的精确 `authorizationPublicId` 独立使用个人或组织 AI 出题/组卷，并让 request history、result history、result detail 与 learning-session 回归遵守同一 selected-context 隔离边界，静态关闭 F-0143。

**Architecture:** 新增一个共享授权上下文服务，并明确分离两条策略：history/detail 使用 raw ownership policy，只证明当前 actor 确实拥有所选 personal/org authorization；generation 使用 current effective authorization policy，继续要求 advanced、匹配 profession/level、所需 capability 及现有 production-enablement 例外。Route 从查询参数取得精确授权 public id，先经服务端解析得到 owner/source/org/quota facts，再把 authorization public id 下推到 request/result repository 的 task join 条件。UI 以 personal context 优先默认，所有 generation/history/detail 请求都携带当前选择，切换时先使旧请求失效并清空旧历史/详情再加载新上下文。

**Tech Stack:** Next.js 16 Route Handlers、TypeScript 5、React 19、Drizzle ORM 0.45、PostgreSQL read model、Vitest 4、Testing Library、PowerShell P1/Module Run v2 guards。

## Execution Status

- Tasks 0–6: complete；各 Task 均由独立 Subagent 实施，主线程逐项复核。
- Task 7 Steps 1–7: complete；focused `9/9` files、`226/226` tests，full unit `421/421` files、`2773/2773` tests，lint/typecheck/format/build 通过，两轮审查最终 `Critical 0 / Important 0 / Minor 0`；Step 7 由包含本计划的单一产品 commit 完成。
- Round 2 修复：关闭 numeric-string scope/idempotency Critical、history pagination sequence Important、exact-selected detail port Minor；未扩大产品或审批边界。
- Remaining: `ready_for_closeout` transition 与 pre-push、ff-only/push/product worktree cleanup、最终 closed projection 与 deferred checkpoint；产品提交由包含本计划的单一 commit 完成。

## Global Constraints

- 任务固定为 `p1-remediation-rc-02-employee-personal-ai-context-2026-07-18`，WIP=1；分支固定为 `codex/p1-rc02-employee-personal-ai-context`，worktree 固定为 `D:/tiku/.worktrees/p1-rc02-employee-personal-ai-context`。
- 权威规格为 `docs/superpowers/specs/2026-07-18-employee-personal-ai-selected-context-design.md`；用户已于 2026-07-18 书面回复“批准规格”。
- 本计划编写基线、`master` 与 `origin/master` 均为 `0fe8edae7a7efc00154f5c54227623be55796983`；每个执行任务开始前必须重新核对，禁止凭计划内 SHA 继续。
- 产品执行前必须先把 written-spec approval 通过现有 P1 transition-only 合法物化为 `currentExecutionGate: satisfied`。若现有 guard 不接受该精确 transition，停止并申请独立窄口径治理热修；不得修改 scripts、绕过 guard 或复用普通 `in_progress` SHA ancestor checkpoint。
- 精确 allowedFiles 以 task queue 为准；禁止修改 `AGENTS.md`、scripts、依赖/lockfile、schema、migration、seed、env、e2e 与外部只读审计库。
- 不执行真实数据库、外部 Provider、browser/runtime acceptance、P2、PR、force push 或部署；本任务只声明 static level closure。
- raw ownership policy 不读取或判断 active/expired/cancelled/edition/capability/upgrade/downgrade/continuation；这些属于 F-0142。generation policy 不降低现有 effective authorization、advanced、scope、capability、quota-owner 或 production-enablement 边界。
- Client 的 `authorizationSource`、`ownerType`、`ownerPublicId`、`organizationPublicId`、`quotaOwnerType`、`quotaOwnerPublicId` 永不权威；服务端始终覆盖。
- request/result list、count、detail 必须同时按 actor、resolved owner 与 exact `authorizationPublicId` 过滤；personal 与 organization、多个 personal authorization 之间禁止隐式 union。
- canonical generation/history/detail handler 缺少 raw repository 或 effective service 依赖时必须 fail closed；测试兼容不得恢复“依赖缺失即跳过授权重验”的旧路径。
- API 继续使用 public id、camelCase 与 `{ code, message, data, pagination? }`；缺失授权上下文 fail closed，响应不得泄露其他授权候选、内部 id、Provider payload 或异常文本。
- TDD 固定为 RED → 最小 GREEN → 聚焦回归；每个 Task 使用独立 Subagent，主线程逐项复核；任务间串行，禁止并行修改共享文件。
- 项目要求一个 finding 一个产品提交。Task 0–6 只形成可复核 checkpoint，不创建中间 commit；Task 7 创建单一产品提交，再按 P1 transition 创建 ready governance commit。
- 只有已通过 P1 `transition_only` 的精确治理提交可使用 ancestor checkpoint；其他普通 `in_progress` SHA 漂移继续 hard-block。
- 若实现需要新持久字段、schema/migration、扩大授权 union、信任客户端 owner、F-0142 生命周期策略、其他 finding 修复或越出 allowlist，立即停止。

---

## File Structure

### New product files

- `src/server/services/personal-ai-generation-authorization-context.ts`：共享 raw ownership 与 effective generation 两条策略。
- `src/server/services/personal-ai-generation-authorization-context.test.ts`：personal/org/foreign/non-effective/edition/scope/capability 对抗矩阵。

### Modified product files

- `src/server/services/personal-ai-generation-request-route.ts` 及测试：POST generation 采用 shared generation resolver；GET request history 采用 raw ownership resolver。
- `src/server/repositories/personal-ai-generation-request-repository.ts` 及测试：list/count 按 task 的 exact authorization public id 过滤。
- `src/server/services/personal-ai-generation-result-route.ts` 及测试：list/detail 必须携带并重验 selected authorization。
- `src/server/services/personal-ai-generation-result-history-service.ts` 及测试：authorization public id 贯穿 validator、list/count/detail 查询。
- `src/server/models/personal-ai-generation-result-history.ts`、`src/server/validators/personal-ai-generation-result-history.ts`：history/detail query 要求 `authorizationPublicId`。
- `src/server/repositories/personal-ai-generation-result-repository.ts` 及测试：通过已存在的 `aiGenerationTask` join 精确过滤 authorization。
- `src/app/api/v1/personal-ai-generation-requests/route.ts`、`src/app/api/v1/personal-ai-generation-results/route.ts`、`src/app/api/v1/personal-ai-generation-results/[publicId]/route.ts`：注入 raw effective-authorization repository。
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx` 及测试、`tests/unit/student-personal-ai-generation-ui.test.ts`：selected id 贯穿 request/result/detail URL，personal 优先默认，切换时清空并重载。
- `src/server/services/personal-ai-generation-learning-session-route.test.ts`：只新增 employee-personal result 回归，不修改 learning-session source。

### Governance/evidence files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-18-p1-remediation-rc-02-employee-personal-ai-context-design.md`
- `docs/05-execution-logs/evidence/2026-07-18-p1-remediation-rc-02-employee-personal-ai-context.md`
- `docs/05-execution-logs/audits-reviews/2026-07-18-p1-remediation-rc-02-employee-personal-ai-context.md`
- `docs/superpowers/specs/2026-07-18-employee-personal-ai-selected-context-design.md`
- 本实施计划。

## Stable Interfaces

共享服务固定区分 raw owner context 与 effective generation context：

```ts
export type PersonalAiGenerationAuthorizationUserContext = {
  userPublicId: string;
  userType: "personal" | "employee";
  organizationPublicId: string | null;
};

export type OwnedPersonalAiGenerationAuthorizationContext = {
  authorizationSource: "personal_auth" | "org_auth";
  authorizationPublicId: string;
  ownerType: "personal" | "organization";
  ownerPublicId: string;
  organizationPublicId: string | null;
  quotaOwnerType: "personal" | "organization";
  quotaOwnerPublicId: string;
};

export type PersonalAiGenerationAuthorizationOwnershipRepository = Pick<
  EffectiveAuthorizationRepository,
  "listPersonalAuthsByUserPublicId" | "listOrgAuthsByUserPublicId"
>;

export async function resolveOwnedPersonalAiGenerationAuthorizationContext(input: {
  authorizationPublicId: string;
  userContext: PersonalAiGenerationAuthorizationUserContext;
  authorizationRepository: PersonalAiGenerationAuthorizationOwnershipRepository;
}): Promise<OwnedPersonalAiGenerationAuthorizationContext | null>;

export async function resolveEffectivePersonalAiGenerationAuthorizationContext(input: {
  authorizationPublicId: string;
  requestedScope: { profession: Profession; level: number } | null;
  taskType: "ai_question_generation" | "ai_paper_generation";
  userContext: PersonalAiGenerationAuthorizationUserContext;
  authorizationRepository: PersonalAiGenerationAuthorizationOwnershipRepository;
  effectiveAuthorizationService: Pick<
    EffectiveAuthorizationService,
    "listEffectiveAuthorizations"
  >;
}): Promise<EffectiveAuthorizationContextDto | null>;
```

raw ownership algorithm 固定为：并行读取当前 user 的 raw personal/org rows；exact id 命中 personal 时 owner/quota owner 均为 user；命中 org 时还必须等于当前 `organizationPublicId`，owner/quota owner 均为该 organization；0 个或多于 1 个 exact match 均 fail closed。generation resolver 先调用 raw ownership，再从 current effective contexts 中选择同一个 exact source/owner/id/scope/capability context；`blockedReason` 只允许 `null | production_enablement_blocked`。

Repository query 固定携带 exact authorization：

```ts
export type ListPersonalAiGenerationRequestHistoryQuery = {
  authorizationPublicId: string;
  ownerType?: PersonalAiGenerationRequestOwnerType;
  ownerPublicId: string;
  actorPublicId?: string;
  taskType?: PersonalAiGenerationTaskType;
  page?: number;
  pageSize?: number;
  limit?: number;
  offset?: number;
};

export type ListPersonalAiGenerationResultQuery = {
  authorizationPublicId: string;
  ownerType?: PersonalAiGenerationResultOwnerType;
  ownerPublicId: string;
  actorPublicId?: string;
  taskType?: PersonalAiGenerationResultTaskType;
  page?: number;
  pageSize?: number;
  limit?: number;
  offset?: number;
};

export type GetPersonalAiGenerationResultQuery = {
  authorizationPublicId: string;
  ownerType?: PersonalAiGenerationResultOwnerType;
  ownerPublicId: string;
  actorPublicId: string;
  resultPublicId: string;
};

export type PersonalAiGenerationResultHistoryRepositoryPort = Pick<
  PersonalAiGenerationResultRepository,
  "listDraftResults" | "countDraftResults"
> &
  Pick<
    PersonalAiGenerationResultSelectedAuthorizationLookupRepository,
    "findDraftResultByPublicId"
  >;
```

Drizzle condition 必须使用已存在 task join，不新增 schema：

```ts
eq(aiGenerationTask.authorization_public_id, query.authorizationPublicId);
```

UI helper 固定显式接收 selected id：

```ts
function createPersonalAiGenerationHistoryPath(
  pathname: string,
  taskType: StudentPersonalAiGenerationTaskType,
  page: number,
  authorizationPublicId: string,
): string;

async function fetchPersonalAiGenerationResultDetail(
  studentSessionValue: StudentSessionRequestToken,
  resultPublicId: string,
  authorizationPublicId: string,
): Promise<PersonalAiGenerationResultDetailResponse>;
```

---

### Task 0: Materialize Written Spec Approval and Recheck Scope

**Files:** state、queue、spec、current task plan/evidence/audit、本实施计划。

**Interfaces:** 只把已发生的 written-spec approval 物化为 `currentExecutionGate: satisfied`；不扩大 allowlist/capability。

- [x] **Step 1: Recover from repository truth**

```powershell
git status --short
git rev-parse HEAD
git rev-parse master
git rev-parse origin/master
```

Expected: 除本实施计划外无不明改动；三个 branch/reference SHA 均为 `0fe8edae7a7efc00154f5c54227623be55796983`。任何其他漂移停止。

- [x] **Step 2: Record the exact approval transition**

```yaml
currentExecutionGate:
  status: satisfied
  reason: current_user_approved_written_f0143_spec_2026_07_18
  approvalRequestPath: docs/superpowers/specs/2026-07-18-employee-personal-ai-selected-context-design.md
  resumeAction: execute_f0143_employee_personal_ai_selected_context_plan_red_to_green
```

只更新对应 spec/status、project-state、task-queue、plan/evidence/audit approval ledger；保持 task `in_progress`、`executionStage: scope_frozen`、allowedFiles、blockedFiles、capabilities 不变。

- [x] **Step 3: Run transition-only checks**

```powershell
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.ps1 -Phase manual
```

Expected: P1 明确接受 transition-only。若报普通 in-progress SHA drift 或 scope change，停止并汇报具体 guard/file；不得编辑 scripts。

---

### Task 1: Implement the Two Server Authorization Policies

**Files:** create `personal-ai-generation-authorization-context.ts` and `.test.ts` only。

- [x] **Step 1: Write raw ownership RED tests**

Cover employee-owned personal authorization、current organization authorization、foreign personal/org、old organization、unknown id、duplicate exact id，且 inactive/expired raw row 仍可用于 history ownership。

```ts
expect(
  await resolveOwnedPersonalAiGenerationAuthorizationContext({
    authorizationPublicId: "personal_auth_employee_owned_001",
    userContext: employeeUserContext,
    authorizationRepository,
  }),
).toEqual({
  authorizationSource: "personal_auth",
  authorizationPublicId: "personal_auth_employee_owned_001",
  ownerType: "personal",
  ownerPublicId: employeeUserContext.userPublicId,
  organizationPublicId: null,
  quotaOwnerType: "personal",
  quotaOwnerPublicId: employeeUserContext.userPublicId,
});
```

- [x] **Step 2: Write generation-policy RED tests**

Cover exact personal advanced and org advanced pass；standard、wrong scope、missing capability、foreign id、source/owner mismatch fail；`production_enablement_blocked` remains allowed for local browser generation。Assert failures do not call any persistence/Provider port because this service exposes none。

- [x] **Step 3: Run RED**

```powershell
corepack pnpm@11.9.0 exec vitest run src/server/services/personal-ai-generation-authorization-context.test.ts --maxWorkers=1
```

Expected: FAIL because the shared service does not exist。

- [x] **Step 4: Implement minimal GREEN**

Use raw repository methods only in ownership resolver；do not call upgrade/lifecycle helpers。Generation resolver must compare the raw context with the effective DTO field-for-field before checking advanced/scope/capability。

- [x] **Step 5: Run GREEN and policy scan**

Run Step 3 plus:

```powershell
rg -n "status|starts_at|expires_at|upgrade|downgrade|continuation" src/server/services/personal-ai-generation-authorization-context.ts
```

Expected: tests PASS；raw ownership implementation contains no lifecycle decision。

---

### Task 2: Wire Generation POST to the Shared Effective Policy

**Files:** request route/source test、request API route。

- [x] **Step 1: Write POST RED tests**

Add employee + org standard + personal advanced selected-personal pass；employee with both advanced selects each independently；tampered client owner/source/org/quota facts are overwritten。For foreign id、wrong current org、standard、wrong profession/level、missing capability assert response `403057`、`createOrReuseRequest` zero calls、Provider execution zero calls。

- [x] **Step 2: Run RED**

```powershell
corepack pnpm@11.9.0 exec vitest run src/server/services/personal-ai-generation-authorization-context.test.ts src/server/services/personal-ai-generation-request-route.test.ts --maxWorkers=1
```

Expected: new employee-personal POST cases FAIL because the route still derives source/owner from `userType`。

- [x] **Step 3: Replace duplicated route selection**

Add raw repository dependency, call `resolveEffectivePersonalAiGenerationAuthorizationContext`, then continue using `createRequestInputWithEffectiveAuthorizationContext` so all client facts are overwritten。Canonical local-browser generation 缺少 raw repository 或 effective service 时返回同一 `403057`，不得保留 `undefined` 代表跳过重验的路径。Remove the route-local `matchesPersonalAiGenerationUserBoundary`/selected-source derivation after tests prove parity，并同步把现有 route-test fakes 改为显式提供 raw ownership rows。

- [x] **Step 4: Wire production composition and run GREEN**

Inject `studentAuthorizationRedeemRuntimeRepositories.effectiveAuthorizationRepository` alongside its effective service in request API route。Run Step 2；Expected PASS。

---

### Task 3: Isolate Request History by Selected Authorization

**Files:** request route/source test、request repository/source test、request API route。

- [x] **Step 1: Write repository RED tests**

Prove list and count gateway queries require/pass `authorizationPublicId` and the Drizzle condition includes `aiGenerationTask.authorization_public_id`。Multiple personal authorization rows with the same actor/owner must not mix。

- [x] **Step 2: Write route RED tests**

GET without/empty/foreign authorization id fails before repository；employee selecting owned personal resolves personal owner；owned org resolves organization owner；inactive owned personal remains history-readable；stale query owner fields are ignored。

- [x] **Step 3: Run RED**

```powershell
corepack pnpm@11.9.0 exec vitest run src/server/services/personal-ai-generation-request-route.test.ts src/server/repositories/personal-ai-generation-request-repository.test.ts --maxWorkers=1
```

- [x] **Step 4: Implement exact route/repository propagation**

Read `authorizationPublicId` from search params，resolve with raw ownership service，then pass exact id + resolved owner + current actor to list/count。Add the exact task-table condition to both list and count paths；do not filter on client owner fields。

- [x] **Step 5: Run GREEN**

Run Step 3；Expected PASS, including count isolation。

---

### Task 4: Isolate Result History and Detail by Selected Authorization

**Files:** result model、validator、history service/test、result repository/test、result route/test、result collection/detail API routes。

- [x] **Step 1: Write model/service/repository RED tests**

Require non-empty `authorizationPublicId` in history/detail normalization；assert list/count/detail propagation；assert result repository condition uses joined task authorization id；two personal authorizations and personal/org contexts never mix。

- [x] **Step 2: Write route RED tests**

List/detail without/empty/foreign selected id，以及 canonical handler 缺少 raw ownership dependency，均在 result repository 前 fail closed；employee personal resolves personal owner and employee org resolves organization owner；detail for result under another authorization is 404/fail closed without leaking its existence。

- [x] **Step 3: Run RED**

```powershell
corepack pnpm@11.9.0 exec vitest run src/server/services/personal-ai-generation-result-history-service.test.ts src/server/services/personal-ai-generation-result-route.test.ts src/server/repositories/personal-ai-generation-result-repository.test.ts --maxWorkers=1
```

- [x] **Step 4: Implement exact propagation**

Add required `authorizationPublicId` to history/detail model and validator values；pass it through history service list/count/detail。History service and route repository ports use list/count plus `PersonalAiGenerationResultSelectedAuthorizationLookupRepository`，其中 exact-selected detail query 在类型层强制 `authorizationPublicId`，既有 optional count 与 learning-session owner-only lookup 语义保持不变；detail uses the exact lookup instead of loading one page then finding in memory。Add authorization id to result repository gateway/query/condition；history condition also retains the task owner-type/actor constraints, and detail condition adds the joined task authorization id。Result route reads query id for collection and detail, resolves raw ownership, and creates query solely from server facts；缺少 lookup 或 ownership dependency 时 fail closed。

- [x] **Step 5: Wire both API routes and run GREEN**

Create student authorization runtime repositories in both result API modules and inject the raw effective-authorization repository plus the Postgres result repository intersection (`list/count/find`)。Run Step 3；Expected PASS。

---

### Task 5: Make the UI Selection Own Every Read Surface

**Files:** StudentPersonalAiGenerationPage source/test、student-personal-ai-generation-ui unit test。

- [x] **Step 1: Write URL/default RED tests**

Assert personal context is selected before organization when both exist；request history、result list、result detail URLs all carry encoded `authorizationPublicId`；generation already carries the same selected id。

- [x] **Step 2: Write switch-isolation RED tests**

Start personal load, switch to org before old history/detail promises resolve, and prove old personal responses cannot repopulate org view。Switch must immediately clear request rows、result rows、pagination、selected result/detail and increment both history and detail load sequences before reload。Add a dedicated RED where an old personal detail resolves after the org switch and must be ignored。

- [x] **Step 3: Run RED**

```powershell
corepack pnpm@11.9.0 exec vitest run src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx tests/unit/student-personal-ai-generation-ui.test.ts --maxWorkers=1
```

- [x] **Step 4: Implement selected-id propagation and reset**

Add authorization id to history path/detail fetch signatures and every initial/retry/pagination/detail call。Change initial authorization confirmation from boolean-only output to return the exact selected authorization public id (or `null`), and pass that local value directly to both initial history requests instead of reading asynchronously updated React state。Request/result history use independent load sequences：context/task switch 与 combined reload 同时失效两侧，单侧 pagination 只失效对应侧；detail load sequence 仍在 context switch、pagination、history reload 和更新 detail selection 时失效。`handleSelectAuthorizationContext` must no-op on same id；otherwise set selection, invalidate in-flight history/detail, clear old history/detail synchronously, reset pagination, then call `loadAiGenerationHistories(activeTaskType, 1, 1, authorizationPublicId)`。

- [x] **Step 5: Run GREEN and endpoint scan**

Run Step 3 plus:

```powershell
rg -n "personal-ai-generation-(requests|results)" src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx
```

Expected: every GET construction is visibly selected-context aware；tests PASS。

---

### Task 6: Preserve Employee Personal Learning Sessions

**Files:** `src/server/services/personal-ai-generation-learning-session-route.test.ts` only。

- [x] **Step 1: Add the regression test**

For employee session, make persisted result lookup succeed only under personal owner (`ownerType: personal`, owner/actor = employee user public id), then assert learning-session creation succeeds and no organization owner is substituted。

- [x] **Step 2: Run focused test**

```powershell
corepack pnpm@11.9.0 exec vitest run src/server/services/personal-ai-generation-learning-session-route.test.ts --maxWorkers=1
```

Expected: PASS on existing source. If RED requires a learning-session source change, stop because source is outside the approved allowlist and may import F-0142 policy。

---

### Task 7: Full Verification, Two Adversarial Reviews and Closeout

**Files:** current implementation plan/evidence/audit；state/queue only at exact ready transition；no new product scope。

- [x] **Step 1: Run the exact focused suite**

```powershell
corepack pnpm@11.9.0 exec vitest run src/server/services/personal-ai-generation-authorization-context.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts src/server/services/personal-ai-generation-result-history-service.test.ts src/server/services/personal-ai-generation-learning-session-route.test.ts src/server/repositories/personal-ai-generation-request-repository.test.ts src/server/repositories/personal-ai-generation-result-repository.test.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx tests/unit/student-personal-ai-generation-ui.test.ts --maxWorkers=1
```

Expected: every named file PASS。

- [x] **Step 2: Run full static regression**

```powershell
npm.cmd run test:unit -- --maxWorkers=1
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run format:check
npm.cmd run build
git diff --check
```

Expected: all exit 0；不得替代为真实 DB/Provider/browser claims。

- [x] **Step 3: Main-thread Round 1 adversarial review**

Attack raw/effective policy confusion、employee personal/org cross-selection、foreign/old org、duplicate raw matches、client metadata tampering、standard/scope/capability fail-closed、zero persistence/Provider、list/count/detail exact filtering、multiple personal authorization mixing、stale UI responses、public-id/redaction、F-0142 scope creep。修完 blocker 后才记录 pass。

- [x] **Step 4: Independent Round 2 review**

使用未参与实现的独立 Subagent，从批准规格重新审查 whole diff，不读取 Round 1 结论作为前提。重点寻找 client-trusted ownership、history lifecycle filtering、detail enumeration、missing count filter、API composition omissions、learning-session regression 与 allowlist 越界。

- [x] **Step 5: Finalize evidence/audit and taste checklist**

Evidence 写入基线 `7 files / 144 tests`、各 Task RED/GREEN、最终测试计数、zero-write/Provider proof、exact-query proof、两轮 review、静态限制与 unchanged blocked capabilities。Audit 记录无未决 blocker。按十诫逐项完成简短品味自检。

- [x] **Step 6: Run pre-product governance gates**

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.ps1 -Phase manual
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P0RemediationGlobalBaseline.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p1-remediation-rc-02-employee-personal-ai-context-2026-07-18
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId p1-remediation-rc-02-employee-personal-ai-context-2026-07-18
```

Expected: all listed pre-product gates pass without skip/bypass。Pre-push is intentionally deferred until Step 8 has reduced the candidate to the exact `ready_for_closeout` state/queue transition；ordinary `in_progress` SHA drift remains a hard block。

- [x] **Step 7: Create the single product commit**

Stage only exact task allowlist，inspect cached diff，run real pre-commit hook，then：

```powershell
git commit -m "fix(ai-generation): honor selected employee authorization"
```

Status: finalized by the single product commit containing this plan；不得在该 commit 中包含 state/queue ready transition。

- [ ] **Step 8: Create the ready governance commit**

仅把 state/queue/evidence/audit 更新为 `ready_for_closeout`，记录 product SHA、验证与 reviews。通过 exact transition 后：

```powershell
git commit -m "chore(p1): ready employee personal ai context"
```

Then run `Test-ModuleRunV2PrePushReadiness.ps1 ... -SkipRemoteAheadCheck`; it must pass only for the exact approved transition/ancestor-checkpoint topology。

- [ ] **Step 9: ff-only merge, push and cleanup**

```powershell
git merge --ff-only codex/p1-rc02-employee-personal-ai-context
git push origin master
```

仅在 live `master == origin/master` 且 fresh-master required guards 通过后，先删除确认位于 worktree 内的 `node_modules` junction，再删除对应产品 worktree 与已合入短分支。不得领取下一 finding 或启动下一产品 RED。

- [ ] **Step 10: Persist the closed projection and stop at the deferred checkpoint**

产品分支已推送和清理后，从同步且 clean 的 `master` 建立独立 closeout worktree，只更新 task allowlist 中的 state/queue/evidence/audit：把 F-0143 与 checkpoint 物化为 `closed/pass`，不 materialize 下一产品任务。通过对应 P1/P0/Module transition checks 后 ff-only 合入、普通推送并清理 closeout worktree/短分支。

最终只读确认 `master == origin/master == live remote`、master clean、F-0143 closed、所有 F-0143 worktree/短分支已清理、无运行命令/Subagent、下一 RED 未开始；然后回复精确标记 `READY_FOR_MECHANISM_CHARTER` 并等待完整“P1 机制执行层兼容式收敛实施章程 v2.1”，不得自行从摘要启动机制改良。

---

## Plan Self-Review Checklist

- [x] 批准规格的两条策略分别映射到 Task 1，未把 F-0142 lifecycle 语义带入 history ownership。
- [x] Generation、request history、result list/count/detail、UI switch 与 learning session 分别映射到 Task 2–6。
- [x] Stable type names 在 route、service、model、validator、repository 与 UI 中一致，且 `authorizationPublicId` 为 exact required context key。
- [x] Personal/org/multiple personal authorization 不形成隐式 union；foreign、wrong org、standard、wrong scope/capability 均 fail closed。
- [x] Client owner/source/org/quota metadata 始终由服务端覆盖。
- [x] repository 复用现有 task join，不新增 schema/migration/dependency 或数据库执行。
- [x] 每个执行 Task 使用独立 Subagent，主线程串行复核；最终第二轮 reviewer 与 implementer 独立。
- [x] 单一产品提交、ready transition、ff-only merge、push 与 cleanup 遵守现有 closeout discipline。
- [x] 普通 `in_progress` SHA drift 继续 hard-block；只允许 P1 transition-only ancestor checkpoint。
- [x] 本计划无未决 placeholder、未列文件或未决接口。
