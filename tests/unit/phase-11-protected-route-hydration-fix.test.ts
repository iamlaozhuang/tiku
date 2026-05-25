import { createElement, type ComponentType, type ReactNode } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { act, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProtectedRouteGuard } from "@/components/ProtectedRouteGuard";

const navigationMocks = vi.hoisted(() => ({
  pathname: "/home",
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigationMocks.pathname,
  useRouter: () => ({
    replace: navigationMocks.replace,
  }),
}));

function createGuardTree() {
  const HydrationTestGuard = ProtectedRouteGuard as ComponentType<{
    children?: ReactNode;
    requiredRole: "student";
  }>;

  return createElement(
    HydrationTestGuard,
    { requiredRole: "student" },
    createElement("div", null, "student home"),
  );
}

describe("phase 11 protected route hydration fix", () => {
  beforeEach(() => {
    localStorage.clear();
    navigationMocks.replace.mockReset();
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.unstubAllGlobals();
  });

  it("hydrates missing local sessions without server/client markup mismatch", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const container = document.createElement("div");
    const jsdomWindow = window;
    let root: Root | null = null;

    vi.stubGlobal("window", undefined);
    container.innerHTML = renderToString(createGuardTree());
    vi.stubGlobal("window", jsdomWindow);
    document.body.append(container);

    await act(async () => {
      root = hydrateRoot(container, createGuardTree());
    });

    await waitFor(() => {
      expect(navigationMocks.replace).toHaveBeenCalledWith("/login");
    });

    expect(
      consoleError.mock.calls.some((call) =>
        call.some((entry) => String(entry).includes("Hydration failed")),
      ),
    ).toBe(false);

    await act(async () => {
      root?.unmount();
    });
    consoleError.mockRestore();
  });
});
