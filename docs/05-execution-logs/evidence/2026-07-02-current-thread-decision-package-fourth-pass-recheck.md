# 2026-07-02 Current Thread Decision Package Fourth-Pass Recheck Evidence

## Scope

Docs-only fourth-pass adversarial recheck of the current-thread requirement/UI/UX decision package.

No product source code, schema, dependency, Provider, DB, browser/e2e, staging/prod, deploy, PR, force-push, release readiness, final Pass, or production usability work was executed.

## Findings And Fixes

1. Active use-case/capability/acceptance catalogs still contained generic `org_admin` wording for advanced-only organization AI, training, analytics, and broad portal rows.
   - Normalized current rows to `org_standard_admin` read-only status surfaces versus eligible `org_advanced_admin` advanced surfaces.
   - Added/kept supersession notes only where historical wording is intentionally retained as provenance.
2. Root/story phone uniqueness wording still read as global uniqueness.
   - Clarified learner/employee account-domain uniqueness and cross-domain non-reuse with backend/organization admin accounts.
   - Preserved learner-to-employee binding inside the learner/employee account domain.
3. Active catalog rows still had blanket `redeem_code` cleartext wording.
   - Reworded to preserve the eligible `ops_admin` / `super_admin` product UI plaintext exception while keeping evidence/log/screenshot/export redaction intact.
4. Organization analytics catalog/delta wording still included stale quota-summary language.
   - Reworded to weak-point, authorization/status, and privacy-preserving summaries; enterprise AI quota consumption summary remains hidden from organization admins.
5. Employee import acceptance rows still allowed `org_admin where later allowed`.
   - First-release actors are now `ops_admin` / `super_admin`; organization-admin import is explicitly future delegated-self-service scope.

## Key Files Touched In This Pass

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/stories/epic-01-user-auth.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`
- `docs/01-requirements/traceability/requirement-fulfillment-matrix.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/01-requirements/traceability/unified-edition-delta-matrix.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`

## Validation

### Prettier Write

Command:

```powershell
$files = (@(git diff --name-only) + @(git ls-files --others --exclude-standard)) | Where-Object { $_ -match '\.(md|yaml|yml)$' } | Sort-Object -Unique; if ($files.Count -gt 0) { & npm.cmd exec -- prettier --write --ignore-unknown @files }
```

Result: exited `0`.

### Prettier Check

Command:

```powershell
$files = (@(git diff --name-only) + @(git ls-files --others --exclude-standard)) | Where-Object { $_ -match '\.(md|yaml|yml)$' } | Sort-Object -Unique; if ($files.Count -gt 0) { & npm.cmd exec -- prettier --check --ignore-unknown @files }
```

Result: exited `0`.

Output:

```text
Checking formatting...
All matched files use Prettier code style!
```

### Whitespace Check

Command:

```powershell
git diff --check
```

Result: exited `0`, no output.

### Ledger Integrity

Command:

```powershell
$path='docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md'; $ids = Select-String -Path $path -Pattern '\| `CT-REQ-[0-9]{3}` \|' | ForEach-Object { [regex]::Match($_.Line, 'CT-REQ-[0-9]{3}').Value }; $count = $ids.Count; $dupes = $ids | Group-Object | Where-Object { $_.Count -gt 1 } | ForEach-Object { $_.Name }; $missing = 1..58 | ForEach-Object { 'CT-REQ-{0:D3}' -f $_ } | Where-Object { $ids -notcontains $_ }; "count=$count"; "duplicates=$($dupes -join ',')"; "missing=$($missing -join ',')"
```

Result: exited `0`.

Output:

```text
count=58
duplicates=
missing=
```

### Residual Conflict Search

Command:

```powershell
rg -n "Cleartext `redeem_code` exposure remains forbidden|No cleartext `redeem_code`[,;]|No cleartext `redeem_code`\.|Organization-scoped summaries show completion, score, quota|Advanced edition adds organization-scoped completion, score, quota summaries|organization admins manage scoped employees|同一手机号不能重复注册。|手机号是唯一登录账号，首期不可修改|`org_admin` where later allowed|org_admin;admin|\| `UC-ADV-ORG-.*\|.*\| `org_admin`" docs/01-requirements/use-cases docs/01-requirements/traceability docs/01-requirements/advanced-edition docs/01-requirements/00-index.md docs/01-requirements/stories/epic-01-user-auth.md
```

Result: exited `1`, meaning no residual conflict matches were found.

### Remaining `org_admin` Mentions

Command:

```powershell
rg -n "\borg_admin\b" docs/01-requirements/use-cases docs/01-requirements/traceability docs/01-requirements/advanced-edition docs/01-requirements/modules docs/01-requirements/stories
```

Result: exited `0`.

Remaining hits are supersession notes or fourth-pass gap/ledger descriptions that explicitly say generic `org_admin` wording is superseded by `org_standard_admin` / `org_advanced_admin`.

## Git State

Command:

```powershell
git status --short --branch
```

Result: branch `codex/current-thread-decision-recheck-2026-07-02`; docs changes remain uncommitted.
