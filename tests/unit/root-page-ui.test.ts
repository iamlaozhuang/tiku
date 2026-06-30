import { createElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import RootPage from "@/app/page";

afterEach(() => {
  cleanup();
});

describe("RootPage UI affordances", () => {
  it("keeps entry links on token-backed hover and active press feedback", () => {
    render(createElement(RootPage));

    for (const label of ["进入学员端", "内容后台", "运营后台"]) {
      const link = screen.getByRole("link", { name: label });
      const className = link.getAttribute("class") ?? "";

      expect(className).not.toContain("hover:bg-green-50");
      expect(className).toContain("transition-transform");
      expect(className).toContain("active:scale-[0.98]");
    }
  });
});
