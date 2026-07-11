export type AdminOverviewScope = "platform" | "operations" | "content";

export type AdminOperationsOverviewSummaryDto = {
  userTotal: number;
  disabledUserTotal: number;
  organizationTotal: number;
  authorizationAttentionTotal: number;
  unusedRedeemCodeTotal: number;
  failedAiCallTotal: number;
};

export type AdminContentOverviewSummaryDto = {
  availableQuestionTotal: number;
  disabledQuestionTotal: number;
  draftPaperTotal: number;
  publishedPaperTotal: number;
  archivedPaperTotal: number;
  aiDraftReviewTotal: number;
};

export type AdminRoleOverviewBoundaryDto = {
  dataMode: "aggregate_only";
  highRiskMutationAllowed: false;
  sensitiveDetailIncluded: false;
};

type AdminRoleOverviewBaseDto = {
  boundary: AdminRoleOverviewBoundaryDto;
  roleLabel: "超级管理员" | "运营管理员" | "内容管理员";
  updatedAt: string;
};

export type AdminPlatformOverviewDto = AdminRoleOverviewBaseDto & {
  scope: "platform";
  roleLabel: "超级管理员";
  operations: AdminOperationsOverviewSummaryDto;
  content: AdminContentOverviewSummaryDto;
};

export type AdminOperationsOverviewDto = AdminRoleOverviewBaseDto & {
  scope: "operations";
  summary: AdminOperationsOverviewSummaryDto;
};

export type AdminContentOverviewDto = AdminRoleOverviewBaseDto & {
  scope: "content";
  summary: AdminContentOverviewSummaryDto;
};

export type AdminRoleOverviewDto =
  | AdminPlatformOverviewDto
  | AdminOperationsOverviewDto
  | AdminContentOverviewDto;

export function isAdminOverviewScope(
  value: string | null,
): value is AdminOverviewScope {
  return value === "platform" || value === "operations" || value === "content";
}
