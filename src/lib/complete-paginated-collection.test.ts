import { describe, expect, it, vi } from "vitest";

import { loadCompletePaginatedCollection } from "./complete-paginated-collection";

type TestItem = { publicId: string };

function createPage(input: {
  items: TestItem[];
  page: number;
  pageSize?: number;
  total: number;
}) {
  return {
    items: input.items,
    pagination: {
      page: input.page,
      pageSize: input.pageSize ?? 2,
      total: input.total,
    },
  };
}

describe("loadCompletePaginatedCollection", () => {
  it("publishes a collection only after every stable page is verified", async () => {
    const onProgress = vi.fn();
    const loadPage = vi
      .fn()
      .mockResolvedValueOnce(
        createPage({
          items: [{ publicId: "node-1" }, { publicId: "node-2" }],
          page: 1,
          total: 3,
        }),
      )
      .mockResolvedValueOnce(
        createPage({
          items: [{ publicId: "node-3" }],
          page: 2,
          total: 3,
        }),
      );

    await expect(
      loadCompletePaginatedCollection<TestItem>({
        expectedPageSize: 2,
        getItemKey: (item) => item.publicId,
        loadPage,
        onProgress,
      }),
    ).resolves.toEqual([
      { publicId: "node-1" },
      { publicId: "node-2" },
      { publicId: "node-3" },
    ]);
    expect(loadPage).toHaveBeenCalledTimes(2);
    expect(onProgress).toHaveBeenLastCalledWith([
      { publicId: "node-1" },
      { publicId: "node-2" },
      { publicId: "node-3" },
    ]);
  });

  it.each([
    {
      name: "missing pagination",
      secondPage: { items: [{ publicId: "node-3" }], pagination: null },
    },
    {
      name: "unexpected empty page",
      secondPage: createPage({ items: [], page: 2, total: 3 }),
    },
    {
      name: "total drift",
      secondPage: createPage({
        items: [{ publicId: "node-3" }],
        page: 2,
        total: 4,
      }),
    },
    {
      name: "duplicate item",
      secondPage: createPage({
        items: [{ publicId: "node-2" }],
        page: 2,
        total: 3,
      }),
    },
    {
      name: "wrong page identity",
      secondPage: createPage({
        items: [{ publicId: "node-3" }],
        page: 1,
        total: 3,
      }),
    },
    {
      name: "empty item identity",
      secondPage: createPage({
        items: [{ publicId: "" }],
        page: 2,
        total: 3,
      }),
    },
  ])(
    "fails closed on $name without discarding the verified prefix",
    async ({ secondPage }) => {
      const verifiedPrefixes: TestItem[][] = [];
      const loadPage = vi
        .fn()
        .mockResolvedValueOnce(
          createPage({
            items: [{ publicId: "node-1" }, { publicId: "node-2" }],
            page: 1,
            total: 3,
          }),
        )
        .mockResolvedValueOnce(secondPage);

      await expect(
        loadCompletePaginatedCollection<TestItem>({
          expectedPageSize: 2,
          getItemKey: (item) => item.publicId,
          loadPage,
          onProgress: (items) => verifiedPrefixes.push(items),
        }),
      ).rejects.toThrow("complete paginated collection");
      expect(verifiedPrefixes).toEqual([
        [{ publicId: "node-1" }, { publicId: "node-2" }],
      ]);
    },
  );

  it("rejects a short non-terminal page because the next offset would skip items", async () => {
    await expect(
      loadCompletePaginatedCollection<TestItem>({
        expectedPageSize: 2,
        getItemKey: (item: TestItem) => item.publicId,
        loadPage: async () =>
          createPage({
            items: [{ publicId: "node-1" }],
            page: 1,
            total: 3,
          }),
      }),
    ).rejects.toThrow("complete paginated collection");
  });
});
