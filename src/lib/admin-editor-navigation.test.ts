import { describe, expect, it } from "vitest";

import {
  ADMIN_EDITOR_RETURN_SNAPSHOT_MAX_AGE_MS,
  consumeAdminEditorReturnSnapshot,
  createAdminEditorHref,
  resolveAdminEditorReturnTo,
  validateAdminEditorListUrl,
  writeAdminEditorReturnSnapshot,
} from "@/lib/admin-editor-navigation";

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear() {
      values.clear();
    },
    getItem(key) {
      return values.get(key) ?? null;
    },
    key(index) {
      return [...values.keys()][index] ?? null;
    },
    removeItem(key) {
      values.delete(key);
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };
}

describe("admin editor navigation codec", () => {
  it("accepts and canonicalizes only same-family list state", () => {
    expect(
      validateAdminEditorListUrl(
        "questions",
        "/content/questions?status=disabled&pageSize=50&page=2&sortOrder=asc&sortBy=updatedAt&questionType=single_choice",
      ),
    ).toBe(
      "/content/questions?page=2&pageSize=50&sortBy=updatedAt&sortOrder=asc&status=disabled&questionType=single_choice",
    );
    expect(
      validateAdminEditorListUrl(
        "materials",
        "/content/materials?page=1&pageSize=20&sortBy=updatedAt&sortOrder=desc&materialDetail=material-public-001",
      ),
    ).toBe(
      "/content/materials?page=1&pageSize=20&sortBy=updatedAt&sortOrder=desc&materialDetail=material-public-001",
    );
  });

  it.each([
    ["questions", "https://evil.example/content/questions"],
    ["questions", "//evil.example/content/questions"],
    ["questions", "/content/materials"],
    ["materials", "/content/questions"],
    ["questions", "/content/questions/new"],
    ["questions", "/content/questions/question-001/edit"],
    ["questions", "/content/questions#private"],
    ["questions", "/content/questions?unknown=value"],
    ["questions", "/content/questions?page=zero"],
    ["questions", "/content/questions?keyword=bad%escape"],
    ["questions", "/content/questions?page=1&page=2"],
    ["questions", "/content/questions?questionType=made_up"],
    ["questions", "/content/questions?questionDetail=123"],
    ["materials", "/content/materials?questionType=single_choice"],
  ] as const)(
    "rejects unsafe or malformed %s return target",
    (resource, target) => {
      expect(validateAdminEditorListUrl(resource, target)).toBeNull();
    },
  );

  it("falls back for missing, duplicate, invalid, or cross-family returnTo", () => {
    const valid = encodeURIComponent(
      "/content/questions?page=3&pageSize=20&sortBy=updatedAt&sortOrder=desc",
    );

    expect(resolveAdminEditorReturnTo("questions", "")).toBe(
      "/content/questions",
    );
    expect(resolveAdminEditorReturnTo("questions", `?returnTo=${valid}`)).toBe(
      "/content/questions?page=3&pageSize=20&sortBy=updatedAt&sortOrder=desc",
    );
    expect(
      resolveAdminEditorReturnTo(
        "questions",
        `?publishDraft=1&returnTo=${valid}`,
      ),
    ).toBe(
      "/content/questions?page=3&pageSize=20&sortBy=updatedAt&sortOrder=desc",
    );
    expect(
      resolveAdminEditorReturnTo(
        "questions",
        `?returnTo=${valid}&returnTo=${valid}`,
      ),
    ).toBe("/content/questions");
    expect(
      resolveAdminEditorReturnTo(
        "questions",
        `?returnTo=${encodeURIComponent("/content/materials")}`,
      ),
    ).toBe("/content/questions");
  });

  it("creates one encoded returnTo on create and edit routes", () => {
    const returnTo =
      "/content/materials?page=2&pageSize=50&sortBy=updatedAt&sortOrder=asc";
    const createHref = createAdminEditorHref({
      resource: "materials",
      returnTo,
    });
    const editHref = createAdminEditorHref({
      publicId: "material-public-001",
      resource: "materials",
      returnTo,
    });

    expect(createHref).toBe(
      "/content/materials/new?returnTo=%2Fcontent%2Fmaterials%3Fpage%3D2%26pageSize%3D50%26sortBy%3DupdatedAt%26sortOrder%3Dasc",
    );
    expect(editHref).toBe(
      "/content/materials/material-public-001/edit?returnTo=%2Fcontent%2Fmaterials%3Fpage%3D2%26pageSize%3D50%26sortBy%3DupdatedAt%26sortOrder%3Dasc",
    );
    expect(
      new URL(editHref, "https://tiku.local").searchParams.getAll("returnTo"),
    ).toHaveLength(1);
    expect(() =>
      createAdminEditorHref({
        publicId: "123",
        resource: "materials",
        returnTo,
      }),
    ).toThrow("Admin editor public id is invalid.");
  });
});

describe("admin editor one-shot return snapshot", () => {
  it("stores and consumes only the bounded non-sensitive contract once", () => {
    const storage = createMemoryStorage();
    const now = Date.UTC(2026, 6, 14, 8, 0, 0);
    const returnTo =
      "/content/questions?page=2&pageSize=50&sortBy=updatedAt&sortOrder=asc";

    expect(
      writeAdminEditorReturnSnapshot(storage, "questions", {
        createdAt: now,
        initiatingControl: "edit:question-public-001",
        returnTo,
        scrollY: 480,
      }),
    ).toBe(true);
    expect(storage.getItem("tiku.adminEditorReturn.questions")).toBe(
      JSON.stringify({
        version: 1,
        createdAt: now,
        initiatingControl: "edit:question-public-001",
        returnTo,
        scrollY: 480,
      }),
    );

    expect(
      consumeAdminEditorReturnSnapshot(storage, "questions", returnTo, now),
    ).toEqual({
      createdAt: now,
      initiatingControl: "edit:question-public-001",
      returnTo,
      scrollY: 480,
      version: 1,
    });
    expect(
      consumeAdminEditorReturnSnapshot(storage, "questions", returnTo, now),
    ).toBeNull();
  });

  it.each([
    {
      version: 1,
      createdAt: 100,
      initiatingControl: "create",
      returnTo: "/content/questions",
      scrollY: -1,
    },
    {
      version: 1,
      createdAt: 100,
      initiatingControl: "edit:invalid public id",
      returnTo: "/content/questions",
      scrollY: 0,
    },
    {
      version: 1,
      createdAt: 100,
      initiatingControl: "create",
      returnTo: "/content/materials",
      scrollY: 0,
    },
    {
      version: 1,
      createdAt: 100,
      initiatingControl: "create",
      privatePayload: "must-not-survive",
      returnTo: "/content/questions",
      scrollY: 0,
    },
  ])("discards an invalid or expanded record", (record) => {
    const storage = createMemoryStorage();
    storage.setItem("tiku.adminEditorReturn.questions", JSON.stringify(record));

    expect(
      consumeAdminEditorReturnSnapshot(
        storage,
        "questions",
        "/content/questions",
        100,
      ),
    ).toBeNull();
    expect(storage.length).toBe(0);
  });

  it("discards stale, future, mismatched, and malformed storage", () => {
    const now = Date.UTC(2026, 6, 14, 8, 0, 0);

    for (const value of [
      "not-json",
      JSON.stringify({
        version: 1,
        createdAt: now - ADMIN_EDITOR_RETURN_SNAPSHOT_MAX_AGE_MS - 1,
        initiatingControl: "create",
        returnTo: "/content/questions",
        scrollY: 0,
      }),
      JSON.stringify({
        version: 1,
        createdAt: now + 1,
        initiatingControl: "create",
        returnTo: "/content/questions",
        scrollY: 0,
      }),
      JSON.stringify({
        version: 1,
        createdAt: now,
        initiatingControl: "create",
        returnTo: "/content/questions?page=2",
        scrollY: 0,
      }),
    ]) {
      const storage = createMemoryStorage();
      storage.setItem("tiku.adminEditorReturn.questions", value);
      expect(
        consumeAdminEditorReturnSnapshot(
          storage,
          "questions",
          "/content/questions",
          now,
        ),
      ).toBeNull();
      expect(storage.length).toBe(0);
    }
  });
});
