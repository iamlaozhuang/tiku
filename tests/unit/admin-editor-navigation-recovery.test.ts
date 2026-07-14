import { createElement, StrictMode, useState } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { navigationReplace } = vi.hoisted(() => ({
  navigationReplace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: navigationReplace }),
}));

import {
  useAdminEditorListReturnRecovery,
  useAdminEditorNavigationGuard,
} from "@/hooks/useAdminEditorNavigationGuard";
import { writeAdminEditorReturnSnapshot } from "@/lib/admin-editor-navigation";

function GuardHarness({ resource }: { resource: "materials" | "questions" }) {
  const [dirty, setDirty] = useState(false);
  const guard = useAdminEditorNavigationGuard({
    resource,
    returnTo: `/content/${resource}?page=2&pageSize=50&sortBy=updatedAt&sortOrder=asc`,
  });

  return createElement(
    "div",
    null,
    createElement(
      "button",
      {
        onClick: () => {
          setDirty(true);
          guard.onDirtyStateChange(true);
        },
      },
      dirty ? "dirty" : "clean",
    ),
    createElement(
      "button",
      { onClick: () => guard.navigateToList() },
      "return",
    ),
  );
}

function ListRecoveryHarness({
  disableEdit = false,
  ready,
  resource,
}: {
  disableEdit?: boolean;
  ready: boolean;
  resource: "materials" | "questions";
}) {
  useAdminEditorListReturnRecovery({ ready, resource });

  return createElement(
    "section",
    null,
    createElement("button", { "data-admin-editor-entry": "create" }, "create"),
    createElement(
      "button",
      {
        "data-admin-editor-entry": `edit:${resource}-public-001`,
        disabled: disableEdit,
      },
      "edit",
    ),
    createElement(
      "section",
      { "data-slot": "admin-list-toolbar" },
      createElement("button", null, "toolbar"),
    ),
  );
}

afterEach(() => {
  cleanup();
  navigationReplace.mockReset();
  sessionStorage.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  window.history.replaceState(null, "", "/content/questions");
});

describe.each(["questions", "materials"] as const)(
  "%s editor navigation guard",
  (resource) => {
    it("does not silently leave dirty input when discard is cancelled", () => {
      window.history.replaceState(null, "", `/content/${resource}/new`);
      const confirmMock = vi.spyOn(window, "confirm").mockReturnValue(false);
      render(createElement(GuardHarness, { resource }));

      fireEvent.click(screen.getByRole("button", { name: "clean" }));
      fireEvent.click(screen.getByRole("button", { name: "return" }));

      expect(confirmMock).toHaveBeenCalledOnce();
      expect(navigationReplace).not.toHaveBeenCalled();
      expect(window.location.pathname).toBe(`/content/${resource}/new`);
    });

    it("leaves to the validated target after discard confirmation", async () => {
      window.history.replaceState(null, "", `/content/${resource}/new`);
      vi.spyOn(window, "confirm").mockReturnValue(true);
      const backMock = vi
        .spyOn(window.history, "back")
        .mockImplementation(() => {
          window.dispatchEvent(new PopStateEvent("popstate"));
        });
      render(createElement(GuardHarness, { resource }));

      fireEvent.click(screen.getByRole("button", { name: "clean" }));
      fireEvent.click(screen.getByRole("button", { name: "return" }));

      await waitFor(() =>
        expect(navigationReplace).toHaveBeenCalledWith(
          `/content/${resource}?page=2&pageSize=50&sortBy=updatedAt&sortOrder=asc`,
        ),
      );
      expect(backMock).toHaveBeenCalledOnce();
    });

    it("registers beforeunload only while dirty", () => {
      window.history.replaceState(null, "", `/content/${resource}/new`);
      render(createElement(GuardHarness, { resource }));
      const cleanEvent = new Event("beforeunload", { cancelable: true });
      window.dispatchEvent(cleanEvent);
      expect(cleanEvent.defaultPrevented).toBe(false);

      fireEvent.click(screen.getByRole("button", { name: "clean" }));
      const dirtyEvent = new Event("beforeunload", { cancelable: true });
      window.dispatchEvent(dirtyEvent);
      expect(dirtyEvent.defaultPrevented).toBe(true);
    });

    it("guards browser Back and restores the sentinel when cancelled", () => {
      window.history.replaceState(null, "", `/content/${resource}/new`);
      const confirmMock = vi.spyOn(window, "confirm").mockReturnValue(false);
      const pushStateMock = vi.spyOn(window.history, "pushState");
      render(createElement(GuardHarness, { resource }));
      fireEvent.click(screen.getByRole("button", { name: "clean" }));

      act(() => window.dispatchEvent(new PopStateEvent("popstate")));

      expect(confirmMock).toHaveBeenCalledOnce();
      expect(pushStateMock).toHaveBeenCalledTimes(2);
      expect(navigationReplace).not.toHaveBeenCalled();
    });
  },
);

describe("editor list return recovery", () => {
  it("consumes once, restores scroll, and focuses the initiating edit control", async () => {
    window.history.replaceState(
      null,
      "",
      "/content/questions?page=2&pageSize=50&sortBy=updatedAt&sortOrder=asc",
    );
    const scrollToMock = vi.fn();
    vi.stubGlobal("scrollTo", scrollToMock);
    writeAdminEditorReturnSnapshot(sessionStorage, "questions", {
      createdAt: Date.now(),
      initiatingControl: "edit:questions-public-001",
      returnTo:
        "/content/questions?page=2&pageSize=50&sortBy=updatedAt&sortOrder=asc",
      scrollY: 640,
    });

    const { rerender } = render(
      createElement(ListRecoveryHarness, {
        ready: false,
        resource: "questions",
      }),
    );
    expect(scrollToMock).not.toHaveBeenCalled();

    rerender(
      createElement(ListRecoveryHarness, {
        ready: true,
        resource: "questions",
      }),
    );
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "edit" })).toHaveFocus(),
    );
    expect(scrollToMock).toHaveBeenCalledWith({ behavior: "auto", top: 640 });
    expect(sessionStorage.length).toBe(0);
  });

  it("uses the list toolbar when the initiating control is missing", async () => {
    window.history.replaceState(null, "", "/content/materials");
    vi.stubGlobal("scrollTo", vi.fn());
    writeAdminEditorReturnSnapshot(sessionStorage, "materials", {
      createdAt: Date.now(),
      initiatingControl: "edit:materials-missing-001",
      returnTo: "/content/materials",
      scrollY: 0,
    });

    render(
      createElement(ListRecoveryHarness, {
        ready: true,
        resource: "materials",
      }),
    );

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "toolbar" })).toHaveFocus(),
    );
  });

  it("uses the list toolbar when the initiating edit control became disabled", async () => {
    window.history.replaceState(null, "", "/content/materials");
    vi.stubGlobal("scrollTo", vi.fn());
    writeAdminEditorReturnSnapshot(sessionStorage, "materials", {
      createdAt: Date.now(),
      initiatingControl: "edit:materials-public-001",
      returnTo: "/content/materials",
      scrollY: 0,
    });

    render(
      createElement(ListRecoveryHarness, {
        disableEdit: true,
        ready: true,
        resource: "materials",
      }),
    );

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "toolbar" })).toHaveFocus(),
    );
  });

  it("restores once under React StrictMode effect replay", async () => {
    window.history.replaceState(null, "", "/content/questions");
    const scrollToMock = vi.fn();
    vi.stubGlobal("scrollTo", scrollToMock);
    writeAdminEditorReturnSnapshot(sessionStorage, "questions", {
      createdAt: Date.now(),
      initiatingControl: "create",
      returnTo: "/content/questions",
      scrollY: 240,
    });

    render(
      createElement(
        StrictMode,
        null,
        createElement(ListRecoveryHarness, {
          ready: true,
          resource: "questions",
        }),
      ),
    );

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "create" })).toHaveFocus(),
    );
    expect(scrollToMock).toHaveBeenCalledTimes(1);
  });

  it("discards the snapshot when the mounted list URL is not canonical", async () => {
    window.history.replaceState(
      null,
      "",
      "/content/materials?unknown=untrusted",
    );
    const scrollToMock = vi.fn();
    vi.stubGlobal("scrollTo", scrollToMock);
    writeAdminEditorReturnSnapshot(sessionStorage, "materials", {
      createdAt: Date.now(),
      initiatingControl: "create",
      returnTo: "/content/materials",
      scrollY: 240,
    });

    render(
      createElement(ListRecoveryHarness, {
        ready: true,
        resource: "materials",
      }),
    );

    await waitFor(() => expect(sessionStorage.length).toBe(0));
    expect(scrollToMock).not.toHaveBeenCalled();
  });
});
