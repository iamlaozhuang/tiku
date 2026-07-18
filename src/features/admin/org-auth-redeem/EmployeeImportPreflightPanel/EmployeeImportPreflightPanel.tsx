"use client";

import type {
  EmployeeImportPreflightDto,
  EmployeeImportSourceFormat,
} from "@/server/contracts/employee-import-command-contract";

type OrganizationOption = { name: string; publicId: string };

type EmployeeImportPreflightPanelProps = {
  canConfirm: boolean;
  content: string;
  isBusy: boolean;
  message: string | null;
  organizationPublicId: string;
  organizations: OrganizationOption[];
  preview: EmployeeImportPreflightDto | null;
  sourceFormat: EmployeeImportSourceFormat;
  onConfirm: () => void;
  onContentChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  onInvalidatePreview: () => void;
  onOrganizationChange: (value: string) => void;
  onPreview: () => void;
  onSourceFormatChange: (value: EmployeeImportSourceFormat) => void;
  onTemplateDownload: () => void;
};

const outcomeLabels = {
  bind: "绑定现有账号",
  block: "阻断",
  new: "新建员工",
  skip: "无需写入",
} as const;

const reasonLabels = {
  cross_domain_conflict: "账号域冲突",
  cross_organization_conflict: "跨组织冲突",
  current_authorization_insufficient: "当前授权不足",
  disabled_account: "账号已停用",
  duplicate_phone: "手机号重复",
  invalid_row: "行数据无效",
  organization_not_found: "目标组织不可用",
  quota_insufficient: "额度不足",
} as const;

const quotaStatusLabels = {
  available: "可用",
  insufficient: "不足",
  not_required: "不需要",
  unavailable: "不可用",
} as const;

function editionLabel(edition: "standard" | "advanced" | null): string {
  return edition === "advanced"
    ? "高级版"
    : edition === "standard"
      ? "标准版"
      : "无有效版本";
}

export function EmployeeImportPreflightPanel({
  canConfirm,
  content,
  isBusy,
  message,
  organizationPublicId,
  organizations,
  preview,
  sourceFormat,
  onConfirm,
  onContentChange,
  onFileChange,
  onInvalidatePreview,
  onOrganizationChange,
  onPreview,
  onSourceFormatChange,
  onTemplateDownload,
}: EmployeeImportPreflightPanelProps) {
  const handleEdit = (callback: () => void) => {
    onInvalidatePreview();
    callback();
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span>目标组织</span>
          <select
            aria-label="员工导入目标组织"
            className="border-border bg-background h-9 w-full rounded-md border px-3"
            data-testid="employee-import-organization-select"
            value={organizationPublicId}
            onChange={(event) =>
              handleEdit(() => onOrganizationChange(event.target.value))
            }
          >
            <option value="">请选择目标组织</option>
            {organizations.map((organization) => (
              <option key={organization.publicId} value={organization.publicId}>
                {organization.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span>源格式</span>
          <select
            aria-label="员工导入源格式"
            className="border-border bg-background h-9 w-full rounded-md border px-3"
            value={sourceFormat}
            onChange={(event) =>
              handleEdit(() =>
                onSourceFormatChange(
                  event.target.value as EmployeeImportSourceFormat,
                ),
              )
            }
          >
            <option value="csv">CSV</option>
            <option value="tsv">TSV</option>
          </select>
        </label>
      </div>

      <label className="space-y-1 text-sm">
        <span>员工导入内容</span>
        <textarea
          aria-label="员工导入内容"
          className="border-border bg-background min-h-48 w-full rounded-md border p-3 font-mono text-sm"
          data-testid="employee-import-textarea"
          value={content}
          onChange={(event) =>
            handleEdit(() => onContentChange(event.target.value))
          }
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <label className="border-border bg-background inline-flex h-9 cursor-pointer items-center rounded-md border px-3 text-sm font-medium">
          选择文件
          <input
            accept=".csv,.tsv,text/csv,text/tab-separated-values"
            className="sr-only"
            data-testid="employee-import-file-input"
            type="file"
            onChange={(event) => {
              onInvalidatePreview();
              onFileChange(event.target.files?.[0] ?? null);
              event.currentTarget.value = "";
            }}
          />
        </label>
        <button
          className="border-border bg-background h-9 rounded-md border px-3 text-sm font-medium"
          data-testid="employee-import-template-download"
          type="button"
          onClick={onTemplateDownload}
        >
          下载模板
        </button>
        <button
          className="bg-primary text-primary-foreground h-9 rounded-md px-3 text-sm font-medium disabled:opacity-50"
          data-testid="employee-import-submit"
          disabled={
            isBusy || content.length === 0 || organizationPublicId.length === 0
          }
          type="button"
          onClick={onPreview}
        >
          服务端预检
        </button>
        <button
          className="bg-primary text-primary-foreground h-9 rounded-md px-3 text-sm font-medium disabled:opacity-50"
          data-testid="employee-import-confirm"
          disabled={isBusy || !canConfirm}
          type="button"
          onClick={onConfirm}
        >
          确认导入员工
        </button>
      </div>

      {message === null ? null : (
        <p className="text-muted-foreground text-sm">{message}</p>
      )}
      {preview === null ? null : (
        <section
          className="border-border space-y-3 rounded-md border p-3"
          aria-label="员工导入服务端预检"
          data-testid="employee-import-preview"
        >
          <p className="text-sm">
            新建 {preview.counts.new} · 绑定 {preview.counts.bind} · 跳过{" "}
            {preview.counts.skip} · 阻断 {preview.counts.block}
          </p>
          <ul className="space-y-2">
            {preview.rows.map((row) => (
              <li
                className="bg-muted rounded-md p-3 text-sm"
                key={row.rowNumber}
              >
                <p>
                  {row.rowNumber}. {row.maskedPhone} · {row.name} ·{" "}
                  {outcomeLabels[row.outcome]}
                </p>
                <p className="text-muted-foreground">
                  授权
                  {row.inheritedAuthorizationSummary.status === "available"
                    ? "可用"
                    : "不可用"}
                  ；范围 {row.inheritedAuthorizationSummary.activeScopeCount}
                  ；版本{" "}
                  {editionLabel(
                    row.inheritedAuthorizationSummary.effectiveEdition,
                  )}
                </p>
                <p className="text-muted-foreground">
                  额度{quotaStatusLabels[row.quotaImpact.status]}；需要{" "}
                  {row.quotaImpact.requiredSeatCount}
                  ；可用 {row.quotaImpact.availableSeatCount ?? "不可用"}
                </p>
                {row.redactedReason === null ? null : (
                  <p className="text-destructive">
                    原因：{reasonLabels[row.redactedReason]}
                  </p>
                )}
              </li>
            ))}
          </ul>
          {preview.confirmDisabledReason === null ? null : (
            <p className="text-destructive text-sm">
              确认已禁用：
              {preview.confirmDisabledReason === "blocked_rows"
                ? "存在阻断行"
                : "没有需要写入的行"}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
