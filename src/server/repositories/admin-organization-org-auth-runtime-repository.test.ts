import { describe, expect, it } from "vitest";

import { buildOrganizationAncestorPaths } from "./admin-organization-org-auth-runtime-repository";

const commonFields = {
  revision: 1,
  status: "active" as const,
};

describe("admin organization tree repository helpers", () => {
  it("builds the complete province-city-district path for a station", () => {
    const paths = buildOrganizationAncestorPaths(
      [
        {
          ...commonFields,
          id: 4,
          public_id: "organization-public-station",
          name: "测试站点",
          org_tier: "station",
          parent_organization_id: 3,
        },
      ],
      [
        {
          ...commonFields,
          id: 1,
          public_id: "organization-public-province",
          name: "测试省",
          org_tier: "province",
          parent_organization_id: null,
        },
        {
          ...commonFields,
          id: 2,
          public_id: "organization-public-city",
          name: "测试地市",
          org_tier: "city",
          parent_organization_id: 1,
        },
        {
          ...commonFields,
          id: 3,
          public_id: "organization-public-district",
          name: "测试县区",
          org_tier: "district",
          parent_organization_id: 2,
        },
      ],
    );

    expect(paths.get(4)).toEqual([
      {
        publicId: "organization-public-province",
        name: "测试省",
        orgTier: "province",
      },
      {
        publicId: "organization-public-city",
        name: "测试地市",
        orgTier: "city",
      },
      {
        publicId: "organization-public-district",
        name: "测试县区",
        orgTier: "district",
      },
    ]);
  });

  it("bounds malformed ancestor cycles without duplicating nodes", () => {
    const paths = buildOrganizationAncestorPaths(
      [
        {
          ...commonFields,
          id: 3,
          public_id: "organization-public-district",
          name: "测试县区",
          org_tier: "district",
          parent_organization_id: 2,
        },
      ],
      [
        {
          ...commonFields,
          id: 1,
          public_id: "organization-public-province",
          name: "测试省",
          org_tier: "province",
          parent_organization_id: 2,
        },
        {
          ...commonFields,
          id: 2,
          public_id: "organization-public-city",
          name: "测试地市",
          org_tier: "city",
          parent_organization_id: 1,
        },
      ],
    );

    expect(paths.get(3)?.map((item) => item.name)).toEqual([
      "测试省",
      "测试地市",
    ]);
  });
});
