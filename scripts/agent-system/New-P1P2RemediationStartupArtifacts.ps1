[CmdletBinding()]
param(
    [string]$RepositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "../..")).Path,
    [string]$AuditRepositoryRoot = "D:/tiku-readonly-audit"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$originalAuditSourceSha = "7aac83765ca4b650b73b1612013e26a0111775ae"
$p0ProductBaselineSha = "e136ca28acde82282a17c65ccfb828a01e872c0b"
$expectedAuditSha = "a84224fa12ec85b28e6acd945deba2afa28c6c02"
$findingRegisterPath = Join-Path $AuditRepositoryRoot "findings/finding-register.yaml"
$impactMapPath = Join-Path $RepositoryRoot "docs/05-execution-logs/audits-reviews/2026-07-15-p0-remediation-p1-p2-impact-map.yaml"
$outputRoot = Join-Path $RepositoryRoot "docs/05-execution-logs/audits-reviews"
$ledgerPath = Join-Path $outputRoot "2026-07-15-p1-p2-remediation-finding-ledger-v1.yaml"
$revalidationMapPath = Join-Path $outputRoot "2026-07-15-p1-p2-post-p0-revalidation-map-v1.yaml"
$clusterPath = Join-Path $outputRoot "2026-07-15-p1-p2-remediation-root-cause-clusters-v1.yaml"

function Get-ScalarValue {
    param([string]$Block, [string]$Key)
    $match = [regex]::Match($Block, "(?m)^    $([regex]::Escape($Key)):\s*(.*?)\s*$")
    if (-not $match.Success) { return "" }
    return $match.Groups[1].Value.Trim().Trim("'").Trim('"')
}

function Get-InlineList {
    param([string]$Block, [string]$Key)
    $raw = Get-ScalarValue -Block $Block -Key $Key
    if ([string]::IsNullOrWhiteSpace($raw) -or $raw -eq "[]") { return @() }
    $raw = $raw.TrimStart("[").TrimEnd("]")
    return @($raw.Split(",") | ForEach-Object { $_.Trim().Trim("'").Trim('"') } | Where-Object { $_ })
}

function Get-SectionItems {
    param([string]$Block, [string]$Key)
    $match = [regex]::Match($Block, "(?ms)^    $([regex]::Escape($Key)):\s*\r?\n(.*?)(?=^    [A-Za-z][A-Za-z0-9]*:|\z)")
    if (-not $match.Success) { return @() }
    return @([regex]::Matches($match.Groups[1].Value, "(?m)^      -\s+(.*?)\s*$") | ForEach-Object { $_.Groups[1].Value.Trim().Trim("'").Trim('"') })
}

function Get-EvidencePaths {
    param([string[]]$Evidence)
    $result = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
    foreach ($line in $Evidence) {
        foreach ($match in [regex]::Matches($line, "(?<path>(?:src|tests|drizzle|e2e|docs)/[A-Za-z0-9_.@()\[\]/+\-]+)")) {
            $path = $match.Groups["path"].Value.TrimEnd(".", ",", ";")
            [void]$result.Add($path)
        }
    }
    return @($result | Sort-Object)
}

function ConvertTo-YamlScalar {
    param([AllowEmptyString()][string]$Value)
    if ($null -eq $Value) { return "''" }
    return "'" + $Value.Replace("'", "''") + "'"
}

function ConvertTo-YamlInlineList {
    param([object[]]$Values)
    if ($null -eq $Values -or $Values.Count -eq 0) { return "[]" }
    return "[" + (($Values | ForEach-Object { ConvertTo-YamlScalar ([string]$_) }) -join ", ") + "]"
}

function Add-YamlStringList {
    param([System.Text.StringBuilder]$Builder, [string]$Key, [object[]]$Values, [int]$Indent = 4)
    $space = " " * $Indent
    if ($null -eq $Values -or $Values.Count -eq 0) {
        [void]$Builder.AppendLine("${space}${Key}: []")
        return
    }
    [void]$Builder.AppendLine("${space}${Key}:")
    foreach ($value in $Values) {
        [void]$Builder.AppendLine("${space}  - $(ConvertTo-YamlScalar ([string]$value))")
    }
}

function Get-ImpactIds {
    param([string]$Block, [string]$Category)
    $match = [regex]::Match($Block, "(?ms)^    $([regex]::Escape($Category)):\s*(.*?)(?=^    [A-Za-z][A-Za-z0-9]*:|\z)")
    if (-not $match.Success) { return @() }
    return @([regex]::Matches($match.Groups[1].Value, "F-\d{4}") | ForEach-Object { $_.Value } | Sort-Object -Unique)
}

function Get-CandidateCluster {
    param([string]$FindingId, [string]$RiskLevel, [string]$Title, [string]$P0Cluster, [string[]]$Capabilities)

    if ($RiskLevel -eq "P2") {
        $p2Map = @{
            "F-0023" = "P2-RC-01"; "F-0024" = "P2-RC-01"; "F-0041" = "P2-RC-01"; "F-0165" = "P2-RC-01"
            "F-0042" = "P2-RC-02"; "F-0058" = "P2-RC-02"; "F-0072" = "P2-RC-02"
            "F-0047" = "P2-RC-03"; "F-0048" = "P2-RC-03"; "F-0057" = "P2-RC-03"; "F-0100" = "P2-RC-03"
            "F-0120" = "P2-RC-03"; "F-0133" = "P2-RC-03"; "F-0138" = "P2-RC-03"; "F-0139" = "P2-RC-03"
            "F-0040" = "P2-RC-04"; "F-0043" = "P2-RC-04"; "F-0044" = "P2-RC-04"
        }
        if ($p2Map.ContainsKey($FindingId)) { return $p2Map[$FindingId] }
        throw "Unclassified P2 finding: $FindingId"
    }

    if ($Title -match "列表|分页|排序|筛选|URL|非JSON|乱序响应|请求是否已生效|审计|联系配置|第一页|前\d+条|最近\d+") { return "P1-RC-04" }
    if ($Title -match "组织训练|企业训练|训练统计|跨角色.*交接") { return "P1-RC-09" }
    if ($Title -match "answer_record|mock_exam|exam_report|作答|答题|答案|模拟考试|评分|考试报告|错题|练习历史") { return "P1-RC-08" }
    if ($Title -match "authorization|edition|effectiveEdition|授权|对象级|公开ID|public id|越权") { return "P1-RC-03" }
    if ($Title -match "model_config|prompt_template|AI任务|AI 任务|AI调用|AI 调用|AI历史|模型|Prompt|Provider|供应商|fallback|AI出题|AI组卷") { return "P1-RC-07" }
    if ($Title -match "knowledge_node|resource|chunk|embedding|RAG|citation|知识点|知识库|资源|索引|向量|引用来源|引用片段") { return "P1-RC-06" }
    if ($Title -match "question|material|paper|snapshot|题目|材料|试卷|内容发布|内容复制|草稿|快照") { return "P1-RC-05" }
    if ($Title -match "employee|quota|redeem_code|组织层级|员工|配额|卡密|兑换") { return "P1-RC-02" }
    if ($Title -match "session|会话|注销|登录|手机号|账号域|凭证|Cookie|密码") { return "P1-RC-01" }

    $capabilityPriority = [ordered]@{
        "P1-RC-01" = @("SC-IDENTITY-SESSION", "SC-ACCESS-TERMINATION", "SC-PHONE-PRIVACY")
        "P1-RC-09" = @("SC-ORG-TRAINING-LIFECYCLE", "SC-ORG-ANALYTICS-PRIVACY")
        "P1-RC-08" = @("SC-ANSWER-SESSION")
        "P1-RC-07" = @("SC-AI-DOMAIN-SEPARATION", "SC-AI-PAPER-PLAN-SELECT", "SC-AI-QUESTION-DRAFT", "SC-AI-TASK-LIFECYCLE", "SC-MODEL-PROMPT-GOVERNANCE", "SC-AI-CALL-LOG-REDACTION")
        "P1-RC-06" = @("SC-KNOWLEDGE-RAG-SCOPE", "SC-RESOURCE-PIPELINE", "SC-FILE-AND-CONTENT-PRIVACY")
        "P1-RC-05" = @("SC-CONTENT-LIFECYCLE", "SC-PAPER-SNAPSHOT")
        "P1-RC-03" = @("SC-EFFECTIVE-AUTHORIZATION", "SC-PUBLIC-ID-OBJECT-AUTH", "SC-WORKSPACE-BOUNDARY")
        "P1-RC-02" = @("SC-REDEEM-CODE-GOVERNANCE", "SC-EDITION-QUOTA-CONTEXT", "SC-ORG-SCOPE-ISOLATION")
        "P1-RC-04" = @("SC-BACKEND-LIST-CONTRACT", "SC-LEARNER-LIST-CONTRACT", "SC-INTERACTION-STATE-CONTRACT")
    }
    foreach ($entry in $capabilityPriority.GetEnumerator()) {
        if (@($Capabilities | Where-Object { $_ -in $entry.Value }).Count -gt 0) { return $entry.Key }
    }

    $p1Map = @{
        "RC-01" = "P1-RC-01"; "RC-02" = "P1-RC-02"; "RC-03" = "P1-RC-03"; "RC-04" = "P1-RC-05"
        "RC-05" = "P1-RC-06"; "RC-06" = "P1-RC-07"; "RC-07" = "P1-RC-08"; "RC-08" = "P1-RC-09"
    }
    if ($p1Map.ContainsKey($P0Cluster)) { return $p1Map[$P0Cluster] }
    throw "Unclassified P1 finding: $FindingId (P0 cluster: $P0Cluster)"
}

function New-ClusterDefinitions {
    return @(
        [ordered]@{ id="P1-RC-01"; phase="P1"; name="identity_session_account_boundary"; hypothesis="账号域身份唯一性、服务端 session 撤销和高权限账号生命周期缺少统一权威边界。"; counter="若当前账号写路径已统一冲突检测、所有登出均撤销服务端 session，且反例测试覆盖九角色，则该假设不足以解释残余 finding。"; dependencies=@(); blast="user/session/auth API、登录态消费者与九角色入口。"; compatibility="历史账号冲突、存量 session 与多端登录可能需要兼容策略。"; security="账号接管、残留 session、跨账号域身份混淆。"; boundary="只处理身份唯一性和 session 生命周期权威路径，不纳入 organization 对象级授权。"; approval="源码与产品测试可由未来 P1 Program 授权；数据清理、实际 session 失效或迁移需单独批准。" },
        [ordered]@{ id="P1-RC-02"; phase="P1"; name="organization_employee_quota_lifecycle"; hypothesis="organization 拓扑、employee 生命周期和 quota/redeem_code 维护缺少同一事务与租户约束。"; counter="若所有写路径都显式锁定 organization、原子校验 quota 并处理离职/重复兑换，则需要拆分为更小根因。"; dependencies=@("P1-RC-01"); blast="organization、employee、quota、redeem_code、组织后台。"; compatibility="存量 employee 归属、配额账本和组织层级数据。"; security="跨 organization 写入、配额越用、离职账号残留权限。"; boundary="只收敛组织成员与配额生命周期，不实现 edition 对象级范围解释。"; approval="schema/migration 源码、数据库 apply/backfill、外部 quota 服务分别审批。" },
        [ordered]@{ id="P1-RC-03"; phase="P1"; name="authorization_edition_scope_read_model"; hypothesis="authorization/edition 的有效范围缺少唯一解释器，读写路径对 organization/profession/level 的判断不一致。"; counter="若 ADR-007 与需求 SSOT 已在所有消费者形成同一 effective scope，则残余问题应下沉到各领域对象权限。"; dependencies=@("P1-RC-01","P1-RC-02"); blast="authorization、personal_auth、org_auth、effectiveEdition 与所有受限对象查询。"; compatibility="历史授权状态、升级/到期语义与旧客户端字段。"; security="越权读取、跨 organization/profession/level 数据泄漏。"; boundary="统一范围解释和对象级守卫，不顺手修复领域生命周期。"; approval="必须执行高级版需求读取规则；数据修复、迁移和实际授权变更需单独批准。" },
        [ordered]@{ id="P1-RC-04"; phase="P1"; name="shared_api_query_mutation_contract"; hypothesis="共享 query/mutation 契约未统一处理分页、排序、错误分类、未知结果、幂等和状态查询。"; counter="若问题仅存在于单一领域 UI 且 API 契约已稳定，则应回归该领域簇，不应以共享层合并。"; dependencies=@("P1-RC-01","P1-RC-03"); blast="共享 API client、分页列表、mutation hooks、错误边界和前后端 DTO。"; compatibility="旧客户端对错误码、null/[]、分页与枚举的假设。"; security="错误降级可能掩盖越权；重复 mutation 可能造成数据破坏。"; boundary="只改可复用契约和最小消费者，不用目录相邻性合并领域问题。"; approval="新增依赖、浏览器验证或远程 API 调用需单独批准。" },
        [ordered]@{ id="P1-RC-05"; phase="P1"; name="content_editor_paper_lifecycle"; hypothesis="question/material/paper 的编辑、复制、发布与 snapshot 未围绕不可变版本和合法状态转换建模。"; counter="若权威写路径已有不可变 snapshot、事务和完整状态守卫，则残余 UI 缺口不能由此根因解释。"; dependencies=@("P1-RC-03","P1-RC-04"); blast="内容后台、question、material、paper、paper_section、snapshot。"; compatibility="已发布内容、历史 paper snapshot 与旧草稿。"; security="跨范围内容访问、发布绕过、不可逆内容丢失。"; boundary="最小闭合内容权威写路径和消费者契约，不纳入 knowledge 索引。"; approval="schema/migration 源码及存量内容回填分别审批。" },
        [ordered]@{ id="P1-RC-06"; phase="P1"; name="knowledge_resource_index_lifecycle"; hypothesis="resource/knowledge_node/chunk/index generation 缺少单一生命周期、可重建标识和 citation 完整性约束。"; counter="若索引全由可追溯 snapshot 重建且删除/更新原子传播，RAG 质量问题需另立模型或检索根因。"; dependencies=@("P1-RC-03","P1-RC-05"); blast="resource、knowledge_base、knowledge_node、chunk、embedding、RAG、citation。"; compatibility="旧向量、孤儿 chunk、citation 定位和重建成本。"; security="跨 organization 检索、敏感 resource 泄漏、伪 citation。"; boundary="闭合资源到索引及 citation 的可追溯链，不调整 Provider 或线上向量库。"; approval="Provider、数据库、向量重建与 runtime 验证需单独批准。" },
        [ordered]@{ id="P1-RC-07"; phase="P1"; name="ai_task_generation_provenance"; hypothesis="model_config/prompt_template/AI task/result/quota 未保存执行时 provenance 与确定状态机。"; counter="若每个结果已有不可变配置/Prompt/输入 snapshot 和确定重试语义，则需把残余 finding 拆到 UI 或领域消费端；不得以旧 quick acceptance/MML 残留重开 2026-07-02 已关闭或 superseded 的 20 类问题。"; dependencies=@("P1-RC-01","P1-RC-03","P1-RC-04","P1-RC-06"); blast="AI 配置、生成任务、ai_call_log、quota、结果详情与内容后台。"; compatibility="历史任务缺 provenance、旧状态枚举和结果格式。"; security="Prompt/配置越权、quota 绕过、敏感信息泄漏。"; boundary="从 2026-07-02 AI SSOT alignment、goal-completion audit 和 acceptance-baseline normalization 恢复；只处理当前审计 finding 的新鲜锚点，静态验证任务状态/provenance，不调用真实 Provider。"; approval="必须执行 AI 基线恢复规则；Provider、secret/env、线上调用和 schema/migration 分别审批。" },
        [ordered]@{ id="P1-RC-08"; phase="P1"; name="learner_answer_report_history"; hypothesis="answer_record/practice/mock_exam/ai_scoring/exam_report 未共享不可变提交快照、幂等状态转换和可恢复历史。"; counter="若提交、评分、报告已由同一事务/事件链保证且跨设备恢复完整，则个别展示问题应拆出。"; dependencies=@("P1-RC-01","P1-RC-03","P1-RC-04","P1-RC-05","P1-RC-07"); blast="学员端答题、mock_exam、ai_scoring、exam_report、mistake_book、历史与偏好。"; compatibility="历史 answer_record、旧报告、评分重试和进行中考试。"; security="跨用户读取、重复提交、评分篡改和报告泄漏。"; boundary="闭合一次提交到报告的权威状态链，不纳入组织聚合统计。"; approval="schema/migration、数据回填、真实 AI 评分和浏览器端验收分别审批。" },
        [ordered]@{ id="P1-RC-09"; phase="P1"; name="organization_training_handoff"; hypothesis="企业训练跨内容发布、employee 提交、评分和统计的状态交接没有可追踪的组织范围快照。"; counter="若每次交接均保存 organization/authorization/content snapshot 并具备幂等事件，则残余问题需按各消费者拆分。"; dependencies=@("P1-RC-02","P1-RC-03","P1-RC-04","P1-RC-05","P1-RC-07","P1-RC-08"); blast="组织后台、训练分发、员工端、评分、统计和跨角色 handoff。"; compatibility="存量训练、员工变动、内容版本与历史统计。"; security="跨 organization 训练泄漏、统计越权和错误归因。"; boundary="只闭合跨角色交接与组织范围快照，不重做上游领域能力。"; approval="必须执行高级版需求读取规则；数据库、浏览器/runtime 与部署分别审批。" },
        [ordered]@{ id="P2-RC-01"; phase="P2"; name="query_navigation_async"; hypothesis="查询、分页、URL 状态与异步响应缺少统一的可取消请求和权威导航状态。"; counter="若 API 与路由层已有稳定状态机，则应按页面局部问题处理。"; dependencies=@(); blast="列表、筛选、分页、URL 与异步 hooks。"; compatibility="旧 URL、历史查询参数和缓存键。"; security="低；但过期响应可能展示错误租户数据，必须回归授权守卫。"; boundary="P1 冻结后复检；当前只登记影响，不实现。"; approval="P2 Goal 未授权；浏览器验证另行批准。" },
        [ordered]@{ id="P2-RC-02"; phase="P2"; name="edit_dirty_data_loss"; hypothesis="长表单和破坏性编辑缺少 dirty guard、版本冲突与恢复动作。"; counter="若服务端已有 optimistic locking 且 UI 完整提示恢复，则需拆分具体页面。"; dependencies=@(); blast="编辑器、长表单、离开确认与草稿恢复。"; compatibility="旧草稿和并发编辑版本。"; security="低；但恢复不得跨用户或 organization。"; boundary="P1 冻结后复检；当前只登记影响，不实现。"; approval="P2 Goal、浏览器验证及 schema/migration 分别审批。" },
        [ordered]@{ id="P2-RC-03"; phase="P2"; name="contract_error_recovery"; hypothesis="错误状态、恢复动作和可解释性在 API、schema、authorization 与 UI 间缺少端到端契约。"; counter="若底层契约稳定，仅文案或局部交互缺失，则应降为页面级任务而非共享根因。"; dependencies=@(); blast="API 错误、恢复动作、schema/authorization 消费者与 UI。"; compatibility="旧错误码、null/[] 和客户端降级。"; security="错误处理不得吞掉 401/403 或暴露内部信息。"; boundary="P1 冻结后按真实权威路径重分簇，不预设为纯 UI。"; approval="P2 Goal 未授权；schema/migration、数据库和浏览器验证分别审批。" },
        [ordered]@{ id="P2-RC-04"; phase="P2"; name="accessibility"; hypothesis="modal focus、reduced-motion、主题对比度等可访问性约束未形成组件级强制基线。"; counter="若共享组件已通过自动化和人工可访问性门禁，则残余应是单页误用。"; dependencies=@(); blast="Design Tokens、Modal/Drawer、动画与主题。"; compatibility="视觉回归和键盘操作路径。"; security="无直接安全边界，但不得破坏受保护操作的确认与焦点。"; boundary="P1 冻结后复检；当前只登记影响，不实现。"; approval="P2 Goal 和浏览器/人工辅助技术验证另行批准。" }
    )
}

foreach ($requiredPath in @($findingRegisterPath, $impactMapPath)) {
    if (-not (Test-Path -LiteralPath $requiredPath)) { throw "Required input missing: $requiredPath" }
}

$actualAuditSha = (& git -C $AuditRepositoryRoot rev-parse HEAD).Trim()
if ($actualAuditSha -ne $expectedAuditSha) { throw "Audit HEAD drift: expected $expectedAuditSha, got $actualAuditSha" }

$registerText = Get-Content -LiteralPath $findingRegisterPath -Raw -Encoding UTF8
$impactText = Get-Content -LiteralPath $impactMapPath -Raw -Encoding UTF8
$impactByFinding = @{}

foreach ($clusterMatch in [regex]::Matches($impactText, "(?ms)^  - clusterId:\s*(RC-\d{2})\s*\r?\n(.*?)(?=^  - clusterId:|^unrelatedDeferred:)")) {
    $clusterId = $clusterMatch.Groups[1].Value
    $clusterBlock = $clusterMatch.Groups[2].Value
    foreach ($category in @("potentiallyCovered", "semanticChange", "revalidateAfterP0")) {
        foreach ($id in Get-ImpactIds -Block $clusterBlock -Category $category) {
            if ($impactByFinding.ContainsKey($id)) { throw "Duplicate impact mapping: $id" }
            $impactByFinding[$id] = [ordered]@{ cluster=$clusterId; category=$category }
        }
    }
}

$unrelatedMatch = [regex]::Match($impactText, "(?ms)^unrelatedDeferred:\s*(.*?)(?=^specialCases:)")
if (-not $unrelatedMatch.Success) { throw "unrelatedDeferred section missing" }
foreach ($id in [regex]::Matches($unrelatedMatch.Groups[1].Value, "F-\d{4}") | ForEach-Object { $_.Value } | Sort-Object -Unique) {
    if ($impactByFinding.ContainsKey($id)) { throw "Duplicate unrelated mapping: $id" }
    $impactByFinding[$id] = [ordered]@{ cluster="none"; category="unrelatedDeferred" }
}

$changedFiles = @(& git -C $RepositoryRoot diff --name-only $originalAuditSourceSha $p0ProductBaselineSha -- src tests drizzle e2e | ForEach-Object { $_.Trim().Replace("\", "/") } | Where-Object { $_ })
$changedFileSet = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
foreach ($path in $changedFiles) { [void]$changedFileSet.Add($path) }

$records = [System.Collections.Generic.List[object]]::new()
$findingMatches = [regex]::Matches($registerText, "(?ms)^  - findingId:\s*(F-\d{4})\s*\r?\n(.*?)(?=^  - findingId:|\z)")
foreach ($findingMatch in $findingMatches) {
    $findingId = $findingMatch.Groups[1].Value
    $block = $findingMatch.Groups[2].Value
    $riskLevel = Get-ScalarValue -Block $block -Key "riskLevel"
    if ($riskLevel -notin @("P1", "P2")) { continue }
    if (-not $impactByFinding.ContainsKey($findingId)) { throw "Finding missing from P0 impact map: $findingId" }

    $title = Get-ScalarValue -Block $block -Key "title"
    $originalStatus = Get-ScalarValue -Block $block -Key "status"
    $requirementEvidence = Get-SectionItems -Block $block -Key "requirementEvidence"
    $codeEvidence = Get-SectionItems -Block $block -Key "codeEvidence"
    $contraryEvidence = Get-SectionItems -Block $block -Key "contraryEvidenceSearched"
    $attackOrFailurePath = Get-SectionItems -Block $block -Key "attackOrFailurePath"
    $requirementPaths = Get-EvidencePaths -Evidence $requirementEvidence
    $codePaths = Get-EvidencePaths -Evidence $codeEvidence
    $contraryPaths = Get-EvidencePaths -Evidence $contraryEvidence
    $testPaths = @($codePaths + $contraryPaths | Where-Object { $_ -match "(^tests/|test|spec)" } | Sort-Object -Unique)
    $currentRequirementPaths = @($requirementPaths | Where-Object { Test-Path -LiteralPath (Join-Path $RepositoryRoot $_) })
    $currentCodePaths = @($codePaths | Where-Object { Test-Path -LiteralPath (Join-Path $RepositoryRoot $_) })
    $currentTestPaths = @($testPaths | Where-Object { Test-Path -LiteralPath (Join-Path $RepositoryRoot $_) })
    $p0ChangedAnchors = @($codePaths + $testPaths | Where-Object { $changedFileSet.Contains($_) } | Sort-Object -Unique)
    $missingCodeAnchors = @($codePaths | Where-Object { -not (Test-Path -LiteralPath (Join-Path $RepositoryRoot $_)) } | Sort-Object -Unique)
    $impact = $impactByFinding[$findingId]

    if ($originalStatus -eq "runtime_evidence_required") {
        $evidenceStatus = "runtime_evidence_required"
        $disposition = "runtime_hold"
    } elseif ($impact.category -in @("semanticChange", "revalidateAfterP0") -or $p0ChangedAnchors.Count -gt 0 -or $missingCodeAnchors.Count -gt 0) {
        $evidenceStatus = "baseline_changed"
        $disposition = if ($impact.category -eq "semanticChange") { "partially_covered_by_p0" } else { "pending_deep_revalidation" }
    } else {
        $evidenceStatus = "confirmed"
        $disposition = if ($impact.category -eq "unrelatedDeferred") { "remediation_required" } else { "pending_deep_revalidation" }
    }

    $anchorAssessment = if ($p0ChangedAnchors.Count -gt 0) { "p0_changed_original_anchor" } elseif ($missingCodeAnchors.Count -gt 0) { "original_anchor_missing_or_moved" } else { "original_anchors_present_without_direct_p0_diff" }
    $affectedRoleIds = Get-InlineList -Block $block -Key "affectedRoleIds"
    $affectedUseCaseIds = Get-InlineList -Block $block -Key "affectedUseCaseIds"
    $affectedSharedCapabilityIds = Get-InlineList -Block $block -Key "affectedSharedCapabilityIds"
    $runtimeValidationIds = Get-InlineList -Block $block -Key "runtimeValidationIds"
    $candidateCluster = Get-CandidateCluster -FindingId $findingId -RiskLevel $riskLevel -Title $title -P0Cluster $impact.cluster -Capabilities $affectedSharedCapabilityIds

    $records.Add([pscustomobject][ordered]@{
        findingId=$findingId; riskLevel=$riskLevel; title=$title; originalStatus=$originalStatus
        sourceP0ImpactCluster=$impact.cluster; p0ImpactCategory=$impact.category
        evidenceStatus=$evidenceStatus; disposition=$disposition; executionStatus="pending"
        candidateRootCauseCluster=$candidateCluster; anchorAssessment=$anchorAssessment
        affectedRoleIds=$affectedRoleIds
        affectedUseCaseIds=$affectedUseCaseIds
        affectedSharedCapabilityIds=$affectedSharedCapabilityIds
        runtimeValidationIds=$runtimeValidationIds
        requirementEvidence=$requirementEvidence; codeEvidence=$codeEvidence; contraryEvidence=$contraryEvidence
        attackOrFailurePath=$attackOrFailurePath
        currentRequirementAnchorPaths=$currentRequirementPaths; currentCodeAnchorPaths=$currentCodePaths
        currentTestAnchorPaths=$currentTestPaths; p0ChangedAnchorPaths=$p0ChangedAnchors; missingOriginalCodeAnchorPaths=$missingCodeAnchors
        businessImpact=(Get-ScalarValue -Block $block -Key "businessImpact")
        rootCauseHypothesis=(Get-ScalarValue -Block $block -Key "rootCauseHypothesis")
        blastRadius=(Get-ScalarValue -Block $block -Key "blastRadius")
        runtimeEvidenceNeeded=(Get-ScalarValue -Block $block -Key "runtimeEvidenceNeeded")
        originalNextAction=(Get-ScalarValue -Block $block -Key "nextAction")
        sourcePacketId=(Get-ScalarValue -Block $block -Key "sourcePacketId")
        baselineId=(Get-ScalarValue -Block $block -Key "baselineId")
        baselineCommit=(Get-ScalarValue -Block $block -Key "baselineCommit")
    })
}

$records = @($records | Sort-Object findingId)
if ($records.Count -ne 143) { throw "Expected 143 P1/P2 findings, got $($records.Count)" }
if (@($records | Select-Object -ExpandProperty findingId -Unique).Count -ne 143) { throw "Finding IDs are not unique" }
if (@($records | Where-Object riskLevel -eq "P1").Count -ne 125) { throw "Expected 125 P1 findings" }
if (@($records | Where-Object riskLevel -eq "P2").Count -ne 18) { throw "Expected 18 P2 findings" }

$ledger = [System.Text.StringBuilder]::new()
[void]$ledger.AppendLine("schemaVersion: '1.0'")
[void]$ledger.AppendLine("artifactId: 'P1-P2-REMEDIATION-FINDING-LEDGER-V1'")
[void]$ledger.AppendLine("generatedAt: '2026-07-15'")
[void]$ledger.AppendLine("level: 'level_1_static_revalidation'")
[void]$ledger.AppendLine("deepRevalidationPolicy: 'just_in_time_when_candidate_root_cause_cluster_is_claimed'")
[void]$ledger.AppendLine("sourceAuditHead: '$expectedAuditSha'")
[void]$ledger.AppendLine("originalAuditSourceSha: '$originalAuditSourceSha'")
[void]$ledger.AppendLine("p0ProductStaticBaselineSha: '$p0ProductBaselineSha'")
[void]$ledger.AppendLine("counts:")
[void]$ledger.AppendLine("  total: 143")
[void]$ledger.AppendLine("  P1: 125")
[void]$ledger.AppendLine("  P2: 18")
[void]$ledger.AppendLine("statusDimensions:")
[void]$ledger.AppendLine("  evidenceStatus: [confirmed, baseline_changed, root_cause_alias, duplicate_candidate, false_positive_candidate, runtime_evidence_required]")
[void]$ledger.AppendLine("  disposition: [remediation_required, statically_closed_by_p0, partially_covered_by_p0, requirement_superseded, runtime_hold, pending_deep_revalidation]")
[void]$ledger.AppendLine("  executionStatus: [pending, in_progress, ready_for_closeout, closed]")
[void]$ledger.AppendLine("findings:")
foreach ($record in $records) {
    [void]$ledger.AppendLine("  - findingId: '$($record.findingId)'")
    [void]$ledger.AppendLine("    riskLevel: '$($record.riskLevel)'")
    [void]$ledger.AppendLine("    title: $(ConvertTo-YamlScalar $record.title)")
    [void]$ledger.AppendLine("    originalStatus: '$($record.originalStatus)'")
    [void]$ledger.AppendLine("    evidenceStatus: '$($record.evidenceStatus)'")
    [void]$ledger.AppendLine("    disposition: '$($record.disposition)'")
    [void]$ledger.AppendLine("    executionStatus: '$($record.executionStatus)'")
    [void]$ledger.AppendLine("    sourceP0ImpactCluster: '$($record.sourceP0ImpactCluster)'")
    [void]$ledger.AppendLine("    p0ImpactCategory: '$($record.p0ImpactCategory)'")
    [void]$ledger.AppendLine("    candidateRootCauseCluster: '$($record.candidateRootCauseCluster)'")
    [void]$ledger.AppendLine("    deepRevalidationRequired: true")
    [void]$ledger.AppendLine("    staticClosureClaimed: false")
    [void]$ledger.AppendLine("    businessInvariant: $(ConvertTo-YamlScalar ("系统必须阻止原 finding 所述失效模式：" + $record.title))")
    [void]$ledger.AppendLine("    businessImpact: $(ConvertTo-YamlScalar $record.businessImpact)")
    [void]$ledger.AppendLine("    originalRootCauseHypothesis: $(ConvertTo-YamlScalar $record.rootCauseHypothesis)")
    [void]$ledger.AppendLine("    originalBlastRadius: $(ConvertTo-YamlScalar $record.blastRadius)")
    [void]$ledger.AppendLine("    originalRuntimeEvidenceNeeded: '$($record.runtimeEvidenceNeeded)'")
    [void]$ledger.AppendLine("    originalNextAction: $(ConvertTo-YamlScalar $record.originalNextAction)")
    [void]$ledger.AppendLine("    sourcePacketId: $(ConvertTo-YamlScalar $record.sourcePacketId)")
    [void]$ledger.AppendLine("    originalBaselineId: $(ConvertTo-YamlScalar $record.baselineId)")
    [void]$ledger.AppendLine("    originalBaselineCommit: $(ConvertTo-YamlScalar $record.baselineCommit)")
    [void]$ledger.AppendLine("    anchorAssessment: '$($record.anchorAssessment)'")
    [void]$ledger.AppendLine("    runtimeBoundary: '$(if ($record.originalStatus -eq 'runtime_evidence_required') { 'runtime_hold_requires_separate_goal_and_approval' } else { 'static_level_1_only' })'")
    Add-YamlStringList -Builder $ledger -Key "affectedRoleIds" -Values $record.affectedRoleIds
    Add-YamlStringList -Builder $ledger -Key "affectedUseCaseIds" -Values $record.affectedUseCaseIds
    Add-YamlStringList -Builder $ledger -Key "affectedSharedCapabilityIds" -Values $record.affectedSharedCapabilityIds
    Add-YamlStringList -Builder $ledger -Key "runtimeValidationIds" -Values $record.runtimeValidationIds
    Add-YamlStringList -Builder $ledger -Key "attackOrFailurePath" -Values $record.attackOrFailurePath
    Add-YamlStringList -Builder $ledger -Key "requirementEvidence" -Values $record.requirementEvidence
    Add-YamlStringList -Builder $ledger -Key "codeEvidence" -Values $record.codeEvidence
    Add-YamlStringList -Builder $ledger -Key "contraryEvidenceSearched" -Values $record.contraryEvidence
    Add-YamlStringList -Builder $ledger -Key "currentRequirementAnchorPaths" -Values $record.currentRequirementAnchorPaths
    Add-YamlStringList -Builder $ledger -Key "currentCodeAnchorPaths" -Values $record.currentCodeAnchorPaths
    Add-YamlStringList -Builder $ledger -Key "currentTestAnchorPaths" -Values $record.currentTestAnchorPaths
    Add-YamlStringList -Builder $ledger -Key "p0ChangedAnchorPaths" -Values $record.p0ChangedAnchorPaths
    Add-YamlStringList -Builder $ledger -Key "missingOriginalCodeAnchorPaths" -Values $record.missingOriginalCodeAnchorPaths
}

$map = [System.Text.StringBuilder]::new()
[void]$map.AppendLine("schemaVersion: '1.0'")
[void]$map.AppendLine("artifactId: 'P1-P2-POST-P0-REVALIDATION-MAP-V1'")
[void]$map.AppendLine("sourceLedger: 'docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-remediation-finding-ledger-v1.yaml'")
[void]$map.AppendLine("rule: 'P0 impact category is not a remediation conclusion; no P1/P2 static closure is claimed at level 1.'")
[void]$map.AppendLine("findings:")
foreach ($record in $records) {
    [void]$map.AppendLine("  - findingId: '$($record.findingId)'")
    [void]$map.AppendLine("    riskLevel: '$($record.riskLevel)'")
    [void]$map.AppendLine("    sourceP0ImpactCluster: '$($record.sourceP0ImpactCluster)'")
    [void]$map.AppendLine("    p0ImpactCategory: '$($record.p0ImpactCategory)'")
    [void]$map.AppendLine("    anchorAssessment: '$($record.anchorAssessment)'")
    [void]$map.AppendLine("    evidenceStatus: '$($record.evidenceStatus)'")
    [void]$map.AppendLine("    disposition: '$($record.disposition)'")
    [void]$map.AppendLine("    candidateRootCauseCluster: '$($record.candidateRootCauseCluster)'")
    Add-YamlStringList -Builder $map -Key "p0ChangedAnchorPaths" -Values $record.p0ChangedAnchorPaths
}

$clusterDefinitions = New-ClusterDefinitions
$clusters = [System.Text.StringBuilder]::new()
[void]$clusters.AppendLine("schemaVersion: '1.0'")
[void]$clusters.AppendLine("artifactId: 'P1-P2-REMEDIATION-ROOT-CAUSE-CLUSTERS-V1'")
[void]$clusters.AppendLine("status: 'candidate_level_1_only'")
[void]$clusters.AppendLine("rule: 'Membership is provisional until just-in-time deep adversarial revalidation; shared directory or role alone is not a root cause.'")
[void]$clusters.AppendLine("executionPolicy:")
[void]$clusters.AppendLine("  wipLimit: 1")
[void]$clusters.AppendLine("  p2ImplementationGate: 'p1_static_baseline_frozen'")
[void]$clusters.AppendLine("  recommendedFirstP1Cluster: 'P1-RC-01'")
[void]$clusters.AppendLine("  firstTaskSelectionRule: 'Select confirmed security, authorization, or irreversible-data finding after JIT deep revalidation; do not preserve order without evidence.'")
[void]$clusters.AppendLine("p1DependencyEdges:")
foreach ($definition in $clusterDefinitions | Where-Object phase -eq "P1") {
    foreach ($dependency in $definition.dependencies) {
        [void]$clusters.AppendLine("  - ['$dependency', '$($definition.id)']")
    }
}
[void]$clusters.AppendLine("clusters:")
foreach ($definition in $clusterDefinitions) {
    $members = @($records | Where-Object candidateRootCauseCluster -eq $definition.id | Select-Object -ExpandProperty findingId)
    [void]$clusters.AppendLine("  - clusterId: '$($definition.id)'")
    [void]$clusters.AppendLine("    phase: '$($definition.phase)'")
    [void]$clusters.AppendLine("    name: '$($definition.name)'")
    [void]$clusters.AppendLine("    findingCount: $($members.Count)")
    [void]$clusters.AppendLine("    coveredFindingIds: $(ConvertTo-YamlInlineList $members)")
    [void]$clusters.AppendLine("    rootCauseHypothesis: $(ConvertTo-YamlScalar $definition.hypothesis)")
    [void]$clusters.AppendLine("    counterEvidenceThatWouldRefute: $(ConvertTo-YamlScalar $definition.counter)")
    [void]$clusters.AppendLine("    upstreamDependencies: $(ConvertTo-YamlInlineList $definition.dependencies)")
    [void]$clusters.AppendLine("    blastRadius: $(ConvertTo-YamlScalar $definition.blast)")
    [void]$clusters.AppendLine("    dataCompatibilityRisk: $(ConvertTo-YamlScalar $definition.compatibility)")
    [void]$clusters.AppendLine("    securityAndAuthorizationRisk: $(ConvertTo-YamlScalar $definition.security)")
    [void]$clusters.AppendLine("    minimumVerifiableBoundary: $(ConvertTo-YamlScalar $definition.boundary)")
    [void]$clusters.AppendLine("    approvalBoundary: $(ConvertTo-YamlScalar $definition.approval)")
    [void]$clusters.AppendLine("    acceptanceContract:")
    foreach ($contract in @(
        "正常路径保持业务不变量且响应契约稳定",
        "越权与跨 organization 访问被拒绝且不泄漏对象存在性",
        "非法状态转换无副作用并返回可解释错误",
        "重复请求与并发请求满足幂等或显式冲突契约",
        "事务中途失败可回滚且不留下半完成状态",
        "重试、回滚和幂等键行为可由测试证明",
        "null、空集合、边界值和异常输入遵循统一契约",
        "前后端字段、枚举、时间、分页及 null/[] 语义一致",
        "API 响应保持 { code, message, data, pagination? }",
        "覆盖相关角色、状态机、跨角色依赖与 P0 不变量回归",
        "按根因补齐 unit、integration、contract 或 e2e 测试",
        "runtime validation ID 仅建立入口，未经批准不执行"
    )) { [void]$clusters.AppendLine("      - $(ConvertTo-YamlScalar $contract)") }
}

[System.IO.File]::WriteAllText($ledgerPath, $ledger.ToString().Replace("`r`n", "`n"), [System.Text.UTF8Encoding]::new($false))
[System.IO.File]::WriteAllText($revalidationMapPath, $map.ToString().Replace("`r`n", "`n"), [System.Text.UTF8Encoding]::new($false))
[System.IO.File]::WriteAllText($clusterPath, $clusters.ToString().Replace("`r`n", "`n"), [System.Text.UTF8Encoding]::new($false))

$gitCommonDir = (& git -C $RepositoryRoot rev-parse --path-format=absolute --git-common-dir).Trim()
$mainWorktreeRoot = Split-Path -Parent $gitCommonDir
$prettierCandidates = @(
    (Join-Path $RepositoryRoot "node_modules/.bin/prettier.cmd"),
    (Join-Path $mainWorktreeRoot "node_modules/.bin/prettier.cmd")
)
$prettierPath = $prettierCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if ([string]::IsNullOrWhiteSpace($prettierPath)) {
    throw "Existing repository Prettier runtime not found; generated YAML cannot satisfy the commit formatting hook deterministically."
}
& $prettierPath --write --ignore-unknown --ignore-path NUL $ledgerPath $revalidationMapPath $clusterPath *> $null
if ($LASTEXITCODE -ne 0) { throw "Prettier failed for generated YAML" }

Write-Output "generated ledger=$ledgerPath"
Write-Output "generated map=$revalidationMapPath"
Write-Output "generated clusters=$clusterPath"
Write-Output "counts total=$($records.Count) P1=$(@($records | Where-Object riskLevel -eq 'P1').Count) P2=$(@($records | Where-Object riskLevel -eq 'P2').Count)"
