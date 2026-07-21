type PaginatedCollectionPage<TItem> = {
  items: readonly TItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  } | null;
};

type CompletePaginatedCollectionOptions<TItem> = {
  expectedPageSize: number;
  getItemKey: (item: TItem) => string | number;
  loadPage: (page: number) => Promise<PaginatedCollectionPage<TItem>>;
  onProgress?: (items: TItem[]) => void;
};

function createCollectionIntegrityError() {
  return new Error("Unable to verify a complete paginated collection.");
}

export async function loadCompletePaginatedCollection<TItem>({
  expectedPageSize,
  getItemKey,
  loadPage,
  onProgress,
}: CompletePaginatedCollectionOptions<TItem>): Promise<TItem[]> {
  if (!Number.isInteger(expectedPageSize) || expectedPageSize <= 0) {
    throw createCollectionIntegrityError();
  }

  let expectedTotal: number | null = null;
  let page = 1;
  let verifiedItems: TItem[] = [];
  const seenItemKeys = new Set<string | number>();

  while (expectedTotal === null || verifiedItems.length < expectedTotal) {
    const result = await loadPage(page);
    const pagination = result.pagination;

    if (
      pagination === null ||
      pagination.page !== page ||
      pagination.pageSize !== expectedPageSize ||
      !Number.isInteger(pagination.total) ||
      pagination.total < 0 ||
      (expectedTotal !== null && pagination.total !== expectedTotal) ||
      result.items.length > expectedPageSize
    ) {
      throw createCollectionIntegrityError();
    }

    expectedTotal ??= pagination.total;

    if (result.items.length === 0 && verifiedItems.length < expectedTotal) {
      throw createCollectionIntegrityError();
    }

    const pageItemKeys = new Set<string | number>();

    for (const item of result.items) {
      const itemKey = getItemKey(item);

      if (
        (typeof itemKey === "string" && itemKey.trim().length === 0) ||
        seenItemKeys.has(itemKey) ||
        pageItemKeys.has(itemKey)
      ) {
        throw createCollectionIntegrityError();
      }

      pageItemKeys.add(itemKey);
    }

    const nextVerifiedItems = [...verifiedItems, ...result.items];

    if (nextVerifiedItems.length > expectedTotal) {
      throw createCollectionIntegrityError();
    }

    verifiedItems = nextVerifiedItems;
    for (const itemKey of pageItemKeys) {
      seenItemKeys.add(itemKey);
    }
    onProgress?.([...verifiedItems]);

    if (verifiedItems.length === expectedTotal) {
      return verifiedItems;
    }

    if (result.items.length !== expectedPageSize) {
      throw createCollectionIntegrityError();
    }

    page += 1;
  }

  return verifiedItems;
}
