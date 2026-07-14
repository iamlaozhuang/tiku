export type AdminEditorResource = "materials" | "questions";
export type AdminEditorInitiatingControl = "create" | `edit:${string}`;

export type AdminEditorReturnSnapshot = {
  version: 1;
  createdAt: number;
  initiatingControl: AdminEditorInitiatingControl;
  returnTo: string;
  scrollY: number;
};

type AdminEditorReturnSnapshotInput = Omit<
  AdminEditorReturnSnapshot,
  "version"
>;

const SNAPSHOT_VERSION = 1;
const MAX_RETURN_TO_LENGTH = 2048;
const MAX_QUERY_VALUE_LENGTH = 256;
const PUBLIC_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/u;
const NUMERIC_ID_PATTERN = /^\d+$/u;
const POSITIVE_INTEGER_PATTERN = /^[1-9]\d*$/u;
const UNSAFE_QUERY_VALUE_PATTERN = /[\u0000-\u001f\u007f\ufffd]/u;
const MALFORMED_PERCENT_ESCAPE_PATTERN = /%(?![0-9A-Fa-f]{2})/u;

export const ADMIN_EDITOR_RETURN_SNAPSHOT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const commonQueryKeys = [
  "page",
  "pageSize",
  "sortBy",
  "sortOrder",
  "keyword",
  "profession",
  "subject",
  "level",
  "status",
] as const;
const questionQueryKeys = [
  ...commonQueryKeys,
  "questionType",
  "knowledgeNodePublicId",
  "tagPublicId",
  "questionDetail",
] as const;
const materialQueryKeys = [...commonQueryKeys, "materialDetail"] as const;
const questionTypes = new Set([
  "case_analysis",
  "calculation",
  "fill_blank",
  "multi_choice",
  "short_answer",
  "single_choice",
  "true_false",
]);

function getListRoot(resource: AdminEditorResource) {
  return `/content/${resource}`;
}

function isPositiveSafeInteger(value: string) {
  if (!POSITIVE_INTEGER_PATTERN.test(value)) return false;
  const numberValue = Number(value);
  return Number.isSafeInteger(numberValue) && numberValue > 0;
}

function isSafeText(value: string) {
  return (
    value.length > 0 &&
    value.length <= MAX_QUERY_VALUE_LENGTH &&
    !UNSAFE_QUERY_VALUE_PATTERN.test(value)
  );
}

function isPublicId(value: string) {
  return PUBLIC_ID_PATTERN.test(value) && !NUMERIC_ID_PATTERN.test(value);
}

function isValidQueryValue(key: string, value: string) {
  switch (key) {
    case "page":
      return isPositiveSafeInteger(value);
    case "pageSize":
      return value === "20" || value === "50" || value === "100";
    case "sortBy":
      return value === "updatedAt";
    case "sortOrder":
      return value === "asc" || value === "desc";
    case "profession":
      return (
        value === "logistics" || value === "marketing" || value === "monopoly"
      );
    case "subject":
      return value === "skill" || value === "theory";
    case "level":
      return isPositiveSafeInteger(value) && Number(value) <= 999;
    case "status":
      return value === "available" || value === "disabled";
    case "questionType":
      return questionTypes.has(value);
    case "knowledgeNodePublicId":
    case "tagPublicId":
    case "questionDetail":
    case "materialDetail":
      return isPublicId(value);
    case "keyword":
      return isSafeText(value);
    default:
      return false;
  }
}

export function validateAdminEditorListUrl(
  resource: AdminEditorResource,
  candidate: string,
): string | null {
  if (
    candidate.length === 0 ||
    candidate.length > MAX_RETURN_TO_LENGTH ||
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\") ||
    MALFORMED_PERCENT_ESCAPE_PATTERN.test(candidate) ||
    UNSAFE_QUERY_VALUE_PATTERN.test(candidate)
  ) {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate, "https://tiku.local");
  } catch {
    return null;
  }

  const root = getListRoot(resource);
  if (
    parsed.origin !== "https://tiku.local" ||
    parsed.pathname !== root ||
    parsed.hash !== ""
  ) {
    return null;
  }

  const allowedKeys =
    resource === "questions" ? questionQueryKeys : materialQueryKeys;
  const allowedKeySet = new Set<string>(allowedKeys);
  for (const key of parsed.searchParams.keys()) {
    const values = parsed.searchParams.getAll(key);
    if (
      !allowedKeySet.has(key) ||
      values.length !== 1 ||
      !isValidQueryValue(key, values[0] ?? "")
    ) {
      return null;
    }
  }

  const canonicalSearchParams = new URLSearchParams();
  for (const key of allowedKeys) {
    const value = parsed.searchParams.get(key);
    if (value === null) continue;
    canonicalSearchParams.set(
      key,
      key === "page" || key === "level" ? String(Number(value)) : value,
    );
  }

  const canonicalQuery = canonicalSearchParams.toString();
  return canonicalQuery.length === 0 ? root : `${root}?${canonicalQuery}`;
}

export function resolveAdminEditorReturnTo(
  resource: AdminEditorResource,
  editorSearch: string,
) {
  const fallback = getListRoot(resource);
  const searchParams = new URLSearchParams(
    editorSearch.startsWith("?") ? editorSearch.slice(1) : editorSearch,
  );
  const hasInvalidEditorQuery = [...new Set(searchParams.keys())].some(
    (key) =>
      key !== "returnTo" &&
      !(
        resource === "questions" &&
        key === "publishDraft" &&
        searchParams.getAll(key).length === 1 &&
        searchParams.get(key) === "1"
      ),
  );
  if (hasInvalidEditorQuery || searchParams.getAll("returnTo").length !== 1) {
    return fallback;
  }

  return (
    validateAdminEditorListUrl(resource, searchParams.get("returnTo") ?? "") ??
    fallback
  );
}

export function createAdminEditorHref({
  publicId,
  resource,
  returnTo,
}: {
  publicId?: string;
  resource: AdminEditorResource;
  returnTo: string;
}) {
  const validatedReturnTo =
    validateAdminEditorListUrl(resource, returnTo) ?? getListRoot(resource);
  if (publicId !== undefined && !isPublicId(publicId)) {
    throw new Error("Admin editor public id is invalid.");
  }

  const pathname =
    publicId === undefined
      ? `/content/${resource}/new`
      : `/content/${resource}/${encodeURIComponent(publicId)}/edit`;
  const searchParams = new URLSearchParams({ returnTo: validatedReturnTo });
  return `${pathname}?${searchParams.toString()}`;
}

function getSnapshotStorageKey(resource: AdminEditorResource) {
  return `tiku.adminEditorReturn.${resource}`;
}

function isInitiatingControl(
  value: unknown,
): value is AdminEditorInitiatingControl {
  if (value === "create") return true;
  return (
    typeof value === "string" &&
    value.startsWith("edit:") &&
    isPublicId(value.slice("edit:".length))
  );
}

function isExactSnapshotRecord(
  value: unknown,
  resource: AdminEditorResource,
): value is AdminEditorReturnSnapshot {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  const expectedKeys = [
    "createdAt",
    "initiatingControl",
    "returnTo",
    "scrollY",
    "version",
  ];
  return (
    keys.length === expectedKeys.length &&
    keys.every((key, index) => key === expectedKeys[index]) &&
    record.version === SNAPSHOT_VERSION &&
    typeof record.createdAt === "number" &&
    Number.isSafeInteger(record.createdAt) &&
    record.createdAt >= 0 &&
    typeof record.scrollY === "number" &&
    Number.isFinite(record.scrollY) &&
    record.scrollY >= 0 &&
    Number.isSafeInteger(record.scrollY) &&
    isInitiatingControl(record.initiatingControl) &&
    typeof record.returnTo === "string" &&
    validateAdminEditorListUrl(resource, record.returnTo) === record.returnTo
  );
}

export function writeAdminEditorReturnSnapshot(
  storage: Storage,
  resource: AdminEditorResource,
  snapshot: AdminEditorReturnSnapshotInput,
) {
  const record: AdminEditorReturnSnapshot = {
    version: SNAPSHOT_VERSION,
    createdAt: snapshot.createdAt,
    initiatingControl: snapshot.initiatingControl,
    returnTo: snapshot.returnTo,
    scrollY: snapshot.scrollY,
  };
  const storageKey = getSnapshotStorageKey(resource);

  try {
    if (!isExactSnapshotRecord(record, resource)) {
      storage.removeItem(storageKey);
      return false;
    }
    storage.setItem(storageKey, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}

export function consumeAdminEditorReturnSnapshot(
  storage: Storage,
  resource: AdminEditorResource,
  currentListUrl: string,
  now = Date.now(),
): AdminEditorReturnSnapshot | null {
  const storageKey = getSnapshotStorageKey(resource);
  let serialized: string | null = null;

  try {
    serialized = storage.getItem(storageKey);
    storage.removeItem(storageKey);
  } catch {
    return null;
  }
  if (serialized === null) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized) as unknown;
  } catch {
    return null;
  }
  if (!isExactSnapshotRecord(parsed, resource)) return null;
  if (
    !Number.isFinite(now) ||
    parsed.createdAt > now ||
    now - parsed.createdAt > ADMIN_EDITOR_RETURN_SNAPSHOT_MAX_AGE_MS ||
    parsed.returnTo !== validateAdminEditorListUrl(resource, currentListUrl)
  ) {
    return null;
  }

  return parsed;
}
