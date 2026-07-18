"use client";

import { Copy, KeyRound, ShieldCheck, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type {
  EmployeeImportCommandDto,
  EmployeeImportCommandRowDto,
} from "@/server/contracts/employee-import-command-contract";

import type { EmployeeImportCommandUiState } from "../useEmployeeImportCommand";

const rejectionReasonLabels = {
  cross_domain_conflict: "账号域冲突",
  cross_organization_conflict: "已绑定其他组织",
  current_authorization_insufficient: "当前企业授权不足",
  disabled_account: "账号已禁用",
  duplicate_phone: "手机号重复",
  invalid_row: "行格式无效",
  organization_not_found: "企业组织不存在",
  quota_insufficient: "授权额度不足",
} satisfies Record<
  Exclude<EmployeeImportCommandRowDto["rejectionReason"], null>,
  string
>;

async function copyText(value: string): Promise<boolean> {
  if (typeof navigator === "undefined" || navigator.clipboard === undefined) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

function rejectedRows(command: EmployeeImportCommandDto) {
  return command.rows.filter(
    (
      row,
    ): row is EmployeeImportCommandRowDto & {
      rejectionReason: Exclude<
        EmployeeImportCommandRowDto["rejectionReason"],
        null
      >;
    } => row.status === "rejected" && row.rejectionReason !== null,
  );
}

export function EmployeeImportCommandPanel({
  canConfirm,
  canIssue,
  onClearPlaintext,
  onConfirmDistribution,
  onIssueCredentials,
  state,
}: {
  canConfirm: boolean;
  canIssue: boolean;
  onClearPlaintext: () => void;
  onConfirmDistribution: () => void;
  onIssueCredentials: () => void;
  state: EmployeeImportCommandUiState;
}) {
  const command = state.command;
  const currentIssuePublicId = state.manifest?.issuePublicId ?? null;
  const currentIssuePublicIdRef = useRef(currentIssuePublicId);
  const copyEpochRef = useRef(0);
  const [copyFeedback, setCopyFeedback] = useState<{
    issuePublicId: string;
    message: string;
  } | null>(null);
  useEffect(() => {
    currentIssuePublicIdRef.current = currentIssuePublicId;
    copyEpochRef.current += 1;
  }, [currentIssuePublicId]);

  if (command === null) {
    return state.status === "idle" ? null : (
      <section
        className="bg-surface border-border rounded-md border p-4 shadow-sm"
        data-testid="employee-import-result"
      >
        <p className="text-text-secondary text-sm">
          {state.message ?? "员工导入命令正在提交。"}
        </p>
      </section>
    );
  }

  const rejections = rejectedRows(command);

  return (
    <section
      className="bg-surface border-brand-primary/30 rounded-md border p-4 shadow-sm"
      data-testid="employee-import-result"
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="text-brand-primary text-xs font-medium">导入结果</p>
            <h2 className="text-text-primary text-base font-semibold">
              可恢复员工导入命令
            </h2>
            <p className="text-text-secondary text-sm leading-6">
              查询结果不含密码明文；生成密码仅在显式换新后的当前分发窗口中短暂显示。
            </p>
          </div>
          <button
            type="button"
            className="border-border bg-background text-text-secondary inline-flex h-8 items-center justify-center gap-1 rounded-lg border px-2 text-xs font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onClearPlaintext}
          >
            <X className="size-3" aria-hidden="true" />
            清除敏感内容
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["成功", command.counts.succeeded],
            ["拒绝", command.counts.rejected],
            ["处理中", command.counts.pending],
          ].map(([label, count]) => (
            <div key={label} className="bg-background rounded-md p-3">
              <p className="text-text-muted text-xs">{label}</p>
              <p className="text-text-primary mt-1 text-sm font-medium">
                {label} {count}
              </p>
            </div>
          ))}
        </div>

        {rejections.length === 0 ? (
          <p className="text-text-muted text-sm">没有确定性拒绝行。</p>
        ) : (
          <ul className="text-text-secondary space-y-1 text-sm">
            {rejections.map((row) => (
              <li key={row.publicId}>
                第 {row.rowNumber} 行：
                {rejectionReasonLabels[row.rejectionReason]}
              </li>
            ))}
          </ul>
        )}

        <div className="border-border bg-background flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
          <div>
            <p className="text-text-primary text-sm font-medium">
              凭据分发 revision {command.credentialRevision}
            </p>
            <p className="text-text-muted mt-1 text-xs">
              状态 {command.credentialDistributionStatus}
            </p>
          </div>
          <button
            type="button"
            className="bg-primary text-primary-foreground inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            data-testid="employee-import-issue-credentials"
            disabled={!canIssue}
            onClick={onIssueCredentials}
          >
            <KeyRound className="size-4" aria-hidden="true" />
            {command.credentialRevision === 0 ? "生成分发密码" : "换新分发"}
          </button>
        </div>

        {state.message === null ? null : (
          <p
            className={
              state.status === "conflict"
                ? "text-danger text-sm"
                : "text-warning text-sm"
            }
          >
            {state.message}
          </p>
        )}

        {state.manifest === null ? null : (
          <div
            className="border-warning bg-warning/10 rounded-md border p-3"
            data-testid="employee-generated-password-distribution"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-warning text-xs font-medium">一次性分发</p>
                <h3 className="text-text-primary mt-1 text-sm font-semibold">
                  revision {state.manifest.credentialRevision}
                </h3>
              </div>
              <button
                type="button"
                className="bg-primary text-primary-foreground inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                data-testid="employee-import-confirm-distribution"
                disabled={!canConfirm}
                onClick={onConfirmDistribution}
              >
                <ShieldCheck className="size-4" aria-hidden="true" />
                已完成分发
              </button>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {state.manifest.rows.map((row) => (
                <div
                  key={row.rowPublicId}
                  className="border-border bg-surface rounded-md border p-3"
                >
                  <p className="text-text-primary text-sm font-medium">
                    第 {row.rowNumber} 行 / {row.name}
                  </p>
                  <p className="text-text-secondary mt-1 text-xs">
                    {row.phone}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <code className="bg-background text-text-primary rounded px-2 py-1 text-xs">
                      {row.initialPassword}
                    </code>
                    <button
                      type="button"
                      aria-label={`复制第 ${row.rowNumber} 行初始密码`}
                      className="border-border bg-background inline-flex h-7 items-center justify-center gap-1 rounded-lg border px-2 text-xs font-medium transition-transform active:scale-[0.98]"
                      onClick={() => {
                        const issuePublicId = state.manifest?.issuePublicId;
                        if (issuePublicId === undefined) {
                          return;
                        }
                        const copyEpoch = ++copyEpochRef.current;
                        void copyText(row.initialPassword).then((didCopy) => {
                          if (
                            copyEpochRef.current === copyEpoch &&
                            currentIssuePublicIdRef.current === issuePublicId
                          ) {
                            setCopyFeedback({
                              issuePublicId,
                              message: didCopy
                                ? `第 ${row.rowNumber} 行初始密码已复制。`
                                : `第 ${row.rowNumber} 行初始密码复制失败。`,
                            });
                          }
                        });
                      }}
                    >
                      <Copy className="size-3" aria-hidden="true" />
                      复制
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {copyFeedback === null ||
            copyFeedback.issuePublicId !== currentIssuePublicId ? null : (
              <p className="text-text-secondary mt-2 text-xs" role="status">
                {copyFeedback.message}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
