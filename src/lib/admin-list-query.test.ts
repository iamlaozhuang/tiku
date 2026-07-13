import { describe, expect, it } from "vitest";

import {
  createAdminListLatestIntent,
  createAdminListSearchParams,
  parseAdminListUrlQuery,
} from "@/lib/admin-list-query";

const queryCodecOptions = {
  allowedSortBy: ["updatedAt"] as const,
  defaultSortBy: "updatedAt" as const,
};

describe("admin list query primitives", () => {
  it("parses and serializes canonical URL pagination and sorting", () => {
    const query = parseAdminListUrlQuery(
      new URLSearchParams("page=3&pageSize=50&sortBy=updatedAt&sortOrder=asc"),
      queryCodecOptions,
    );

    expect(query).toEqual({
      page: 3,
      pageSize: 50,
      sortBy: "updatedAt",
      sortOrder: "asc",
    });
    expect(createAdminListSearchParams(query).toString()).toBe(
      "page=3&pageSize=50&sortBy=updatedAt&sortOrder=asc",
    );
  });

  it("rejects invalid URL values before they reach a list API", () => {
    expect(
      parseAdminListUrlQuery(
        new URLSearchParams(
          "page=-4&pageSize=500&sortBy=internalId&sortOrder=sideways",
        ),
        queryCodecOptions,
      ),
    ).toEqual({
      page: 1,
      pageSize: 20,
      sortBy: "updatedAt",
      sortOrder: "desc",
    });
  });

  it("allows only the latest request intent to commit", () => {
    const latestIntent = createAdminListLatestIntent();
    const firstIntent = latestIntent.begin();
    const secondIntent = latestIntent.begin();

    expect(firstIntent.isCurrent()).toBe(false);
    expect(secondIntent.isCurrent()).toBe(true);

    secondIntent.cancel();

    expect(secondIntent.isCurrent()).toBe(false);
    expect(latestIntent.begin().isCurrent()).toBe(true);
  });
});
