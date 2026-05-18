import { describe, expect, it } from "vitest";

import { mapEffectiveAuthorizationListToApi } from "./effective-authorization-mapper";
import type {
  EffectiveOrgAuthRow,
  EffectivePersonalAuthRow,
} from "../repositories/effective-authorization-repository";

const startsAt = new Date("2026-05-18T04:00:00.000Z");
const personalExpiresAt = new Date("2026-06-18T04:00:00.000Z");
const orgExpiresAt = new Date("2026-07-18T04:00:00.000Z");

function createPersonalAuth(
  overrides: Partial<EffectivePersonalAuthRow> = {},
): EffectivePersonalAuthRow {
  return {
    id: 301,
    public_id: "personal_auth_public_123",
    profession: "monopoly",
    level: 3,
    starts_at: startsAt,
    expires_at: personalExpiresAt,
    status: "active",
    ...overrides,
  };
}

function createOrgAuth(
  overrides: Partial<EffectiveOrgAuthRow> = {},
): EffectiveOrgAuthRow {
  return {
    id: 401,
    public_id: "org_auth_public_456",
    organization_public_id: "org_city_123",
    organization_name: "杭州烟草",
    organization_status: "active",
    profession: "monopoly",
    level: 3,
    starts_at: startsAt,
    expires_at: orgExpiresAt,
    status: "active",
    ...overrides,
  };
}

describe("effective authorization mapper", () => {
  it("maps personal and org auth rows into source entries and effective union without numeric ids", () => {
    const result = mapEffectiveAuthorizationListToApi({
      personalAuths: [createPersonalAuth()],
      orgAuths: [
        createOrgAuth(),
        createOrgAuth({
          public_id: "org_auth_public_789",
          organization_public_id: "org_district_789",
          organization_name: "西湖烟草",
          profession: "marketing",
          level: 2,
        }),
      ],
    });

    expect(JSON.stringify(result)).not.toContain('"id"');
    expect(result).toEqual({
      authorizations: [
        {
          publicId: "personal_auth_public_123",
          authorizationType: "personal_auth",
          profession: "monopoly",
          level: 3,
          startsAt: "2026-05-18T04:00:00.000Z",
          expiresAt: "2026-06-18T04:00:00.000Z",
          status: "active",
          organizationPublicId: null,
          organizationName: null,
        },
        {
          publicId: "org_auth_public_456",
          authorizationType: "org_auth",
          profession: "monopoly",
          level: 3,
          startsAt: "2026-05-18T04:00:00.000Z",
          expiresAt: "2026-07-18T04:00:00.000Z",
          status: "active",
          organizationPublicId: "org_city_123",
          organizationName: "杭州烟草",
        },
        {
          publicId: "org_auth_public_789",
          authorizationType: "org_auth",
          profession: "marketing",
          level: 2,
          startsAt: "2026-05-18T04:00:00.000Z",
          expiresAt: "2026-07-18T04:00:00.000Z",
          status: "active",
          organizationPublicId: "org_district_789",
          organizationName: "西湖烟草",
        },
      ],
      effectiveAuthorizations: [
        {
          profession: "monopoly",
          level: 3,
          authorizationTypes: ["personal_auth", "org_auth"],
          expiresAt: "2026-07-18T04:00:00.000Z",
          status: "active",
        },
        {
          profession: "marketing",
          level: 2,
          authorizationTypes: ["org_auth"],
          expiresAt: "2026-07-18T04:00:00.000Z",
          status: "active",
        },
      ],
    });
  });
});
