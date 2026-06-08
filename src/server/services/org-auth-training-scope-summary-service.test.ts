import { describe, expect, it } from "vitest";

import { buildOrgAuthTrainingScopeSummaryReadModel } from "./org-auth-training-scope-summary-service";

function createBaseInput() {
  const plaintextRedeemCode = ["PLAIN", "REDEEM", "CODE"].join("-");
  const trainingContent = ["TRAINING", "CONTENT"].join("-");
  const organizationContactPhone = ["138", "0000", "0000"].join("");

  return {
    id: 801,
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
    plaintextRedeemCode,
    trainingContent,
    organizationContactPhone,
    token: "secret-token",
  };
}

describe("org auth training scope summary service", () => {
  it("builds an org_auth training scope summary without sensitive payloads", () => {
    const input = createBaseInput();
    const result = buildOrgAuthTrainingScopeSummaryReadModel(input);
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "employee_user_public_123",
        employeePublicId: "employee_public_123",
        runtimeStatus: "local_contract_only",
        orgAuth: {
          publicId: "org_auth_public_123",
          authScopeType: "specified_nodes",
          profession: "monopoly",
          level: 3,
          purchaserOrganizationPublicId: "org_purchaser_public_123",
          coveredOrganizationPublicIds: [
            "org_city_public_123",
            "org_district_public_456",
          ],
          quota: {
            accountQuota: 100,
            usedQuota: 38,
            availableQuota: 62,
          },
        },
        trainingScope: {
          paperPublicId: "paper_public_123",
          mockExamPublicId: "mock_exam_public_123",
          contentAccessStatus: "scope_only",
        },
        redeemCodeReference: {
          publicId: "redeem_code_public_123",
          redactionStatus: "redacted",
        },
        evidenceReferences: {
          auditLogPublicId: "audit_log_public_123",
          aiCallLogPublicId: "ai_call_log_public_123",
          redactionStatus: "redacted",
        },
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(input.plaintextRedeemCode);
    expect(serializedResult).not.toContain(input.trainingContent);
    expect(serializedResult).not.toContain(input.organizationContactPhone);
    expect(serializedResult).not.toContain(input.token);
  });

  it("accepts current_and_descendants scope with nullable paper and mock_exam context", () => {
    expect(
      buildOrgAuthTrainingScopeSummaryReadModel({
        ...createBaseInput(),
        authScopeType: "current_and_descendants",
        coveredOrganizationPublicIds: [],
        paperPublicId: null,
        mockExamPublicId: null,
        redeemCodePublicId: null,
      }).code,
    ).toBe(0);
  });

  it("rejects missing org_auth and impossible quota inputs", () => {
    expect(
      buildOrgAuthTrainingScopeSummaryReadModel({
        ...createBaseInput(),
        orgAuthPublicId: "",
      }),
    ).toEqual({
      code: 400012,
      message: "Invalid org auth training scope summary input.",
      data: null,
    });

    expect(
      buildOrgAuthTrainingScopeSummaryReadModel({
        ...createBaseInput(),
        usedQuota: 101,
      }).code,
    ).toBe(400012);
  });
});
