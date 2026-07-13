import { describe, expect, it } from "vitest";

import { upsertAdminObjectByPublicId } from "@/lib/admin-object-state";

describe("upsertAdminObjectByPublicId", () => {
  it("replaces only the matching object without mutating the current list", () => {
    const first = { publicId: "question-first", status: "available" };
    const second = { publicId: "question-second", status: "available" };
    const current = [first, second];
    const updatedFirst = { ...first, status: "disabled" };

    const next = upsertAdminObjectByPublicId(current, updatedFirst);

    expect(next).toEqual([updatedFirst, second]);
    expect(next).not.toBe(current);
    expect(next[1]).toBe(second);
    expect(current).toEqual([first, second]);
  });

  it("prepends a newly returned object and preserves existing identities", () => {
    const existing = { publicId: "material-existing", title: "原材料" };
    const inserted = { publicId: "material-copy", title: "原材料（副本）" };

    const next = upsertAdminObjectByPublicId([existing], inserted);

    expect(next).toEqual([inserted, existing]);
    expect(next[1]).toBe(existing);
  });
});
