import { describe, expect, it } from "vitest";

import { normalizeOrgAuthTrainingScopeSummaryInput } from "./org-auth-training-scope-summary";

describe("org auth training scope summary validator", () => {
  it("normalizes org_auth training scope input and redacted references", () => {
    expect(
      normalizeOrgAuthTrainingScopeSummaryInput({
        userPublicId: " employee_user_public_123 ",
        employeePublicId: " employee_public_123 ",
        orgAuthPublicId: " org_auth_public_123 ",
        purchaserOrganizationPublicId: " org_purchaser_public_123 ",
        coveredOrganizationPublicIds: [
          " org_city_public_123 ",
          "org_city_public_123",
          "org_district_public_456",
          "",
        ],
        authScopeType: "specified_nodes",
        profession: "monopoly",
        level: 3,
        accountQuota: 100,
        usedQuota: 38,
        paperPublicId: " paper_public_123 ",
        mockExamPublicId: " mock_exam_public_123 ",
        redeemCodePublicId: " redeem_code_public_123 ",
        auditLogPublicId: " audit_log_public_123 ",
        aiCallLogPublicId: " ai_call_log_public_123 ",
        plaintextRedeemCode: "must be ignored",
      }),
    ).toEqual({
      success: true,
      value: {
        userPublicId: "employee_user_public_123",
        employeePublicId: "employee_public_123",
        orgAuthPublicId: "org_auth_public_123",
        purchaserOrganizationPublicId: "org_purchaser_public_123",
        coveredOrganizationPublicIds: [
          "org_city_public_123",
          "org_district_public_456",
        ],
        authScopeType: "specified_nodes",
        profession: "monopoly",
        level: 3,
        accountQuota: 100,
        usedQuota: 38,
        paperPublicId: "paper_public_123",
        mockExamPublicId: "mock_exam_public_123",
        redeemCodePublicId: "redeem_code_public_123",
        auditLogPublicId: "audit_log_public_123",
        aiCallLogPublicId: "ai_call_log_public_123",
      },
    });
  });

  it("rejects missing org_auth, invalid scope, and invalid quota", () => {
    expect(
      normalizeOrgAuthTrainingScopeSummaryInput({
        userPublicId: "employee_user_public_123",
        employeePublicId: "employee_public_123",
        orgAuthPublicId: "",
        purchaserOrganizationPublicId: "org_purchaser_public_123",
        coveredOrganizationPublicIds: [],
        authScopeType: "specified_nodes",
        profession: "monopoly",
        level: 3,
        accountQuota: 100,
        usedQuota: 38,
      }),
    ).toEqual({
      success: false,
      message: "Invalid org auth training scope summary input.",
    });

    expect(
      normalizeOrgAuthTrainingScopeSummaryInput({
        userPublicId: "employee_user_public_123",
        employeePublicId: "employee_public_123",
        orgAuthPublicId: "org_auth_public_123",
        purchaserOrganizationPublicId: "org_purchaser_public_123",
        coveredOrganizationPublicIds: ["org_city_public_123"],
        authScopeType: "specified_nodes",
        profession: "monopoly",
        level: 3,
        accountQuota: 100,
        usedQuota: 101,
      }).success,
    ).toBe(false);
  });
});
