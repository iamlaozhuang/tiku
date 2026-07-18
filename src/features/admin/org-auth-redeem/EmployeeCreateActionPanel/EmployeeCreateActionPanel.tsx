"use client";

import type { EmployeeImportPreflightDto } from "@/server/contracts/employee-import-command-contract";

type EmployeeCreateActionPanelProps = {
  canConfirm: boolean;
  initialPassword: string;
  isBusy: boolean;
  message: string | null;
  name: string;
  organizationPublicId: string;
  organizations: { name: string; publicId: string }[];
  phone: string;
  preview: EmployeeImportPreflightDto | null;
  onConfirm: () => void;
  onInitialPasswordChange: (value: string) => void;
  onInvalidatePreview: () => void;
  onNameChange: (value: string) => void;
  onOrganizationChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onPreview: () => void;
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

export function EmployeeCreateActionPanel(
  props: EmployeeCreateActionPanelProps,
) {
  const edit = (callback: () => void) => {
    props.onInvalidatePreview();
    callback();
  };

  return (
    <div className="space-y-4">
      <label className="block space-y-1 text-sm">
        <span>目标组织</span>
        <select
          aria-label="员工创建目标组织"
          className="border-border bg-background h-9 w-full rounded-md border px-3"
          value={props.organizationPublicId}
          onChange={(event) =>
            edit(() => props.onOrganizationChange(event.target.value))
          }
        >
          <option value="">请选择目标组织</option>
          {props.organizations.map((organization) => (
            <option key={organization.publicId} value={organization.publicId}>
              {organization.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1 text-sm">
        <span>手机号</span>
        <input
          aria-label="员工手机号"
          className="border-border bg-background h-9 w-full rounded-md border px-3"
          value={props.phone}
          onChange={(event) =>
            edit(() => props.onPhoneChange(event.target.value))
          }
        />
      </label>
      <label className="block space-y-1 text-sm">
        <span>姓名</span>
        <input
          aria-label="员工姓名"
          className="border-border bg-background h-9 w-full rounded-md border px-3"
          value={props.name}
          onChange={(event) =>
            edit(() => props.onNameChange(event.target.value))
          }
        />
      </label>
      <label className="block space-y-1 text-sm">
        <span>初始密码（可选）</span>
        <input
          aria-label="员工初始密码"
          className="border-border bg-background h-9 w-full rounded-md border px-3"
          type="password"
          value={props.initialPassword}
          onChange={(event) =>
            edit(() => props.onInitialPasswordChange(event.target.value))
          }
        />
      </label>
      <div className="flex gap-2">
        <button
          className="bg-primary text-primary-foreground h-9 rounded-md px-3 text-sm font-medium disabled:opacity-50"
          disabled={props.isBusy}
          type="button"
          onClick={props.onPreview}
        >
          服务端预检
        </button>
        <button
          className="bg-primary text-primary-foreground h-9 rounded-md px-3 text-sm font-medium disabled:opacity-50"
          disabled={props.isBusy || !props.canConfirm}
          type="button"
          onClick={props.onConfirm}
        >
          确认创建员工
        </button>
      </div>
      {props.message === null ? null : (
        <p className="text-muted-foreground text-sm">{props.message}</p>
      )}
      {props.preview === null ? null : (
        <div className="border-border space-y-1 rounded-md border p-3 text-sm">
          {props.preview.rows.map((row) => (
            <div className="space-y-1" key={row.rowNumber}>
              <p>
                {row.maskedPhone} · {row.name} · {outcomeLabels[row.outcome]}
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
            </div>
          ))}
          {props.preview.confirmDisabledReason === null ? null : (
            <p className="text-destructive">
              确认已禁用：
              {props.preview.confirmDisabledReason === "blocked_rows"
                ? "存在阻断行"
                : "没有需要写入的行"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
