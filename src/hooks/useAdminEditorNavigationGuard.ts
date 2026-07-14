"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import {
  consumeAdminEditorReturnSnapshot,
  validateAdminEditorListUrl,
  type AdminEditorReturnSnapshot,
  type AdminEditorResource,
} from "@/lib/admin-editor-navigation";

const DISCARD_CONFIRMATION = "当前修改尚未保存，确定放弃修改并离开吗？";

export function useAdminEditorNavigationGuard({
  resource,
  returnTo,
}: {
  resource: AdminEditorResource;
  returnTo: string;
}) {
  const router = useRouter();
  const validatedReturnTo =
    validateAdminEditorListUrl(resource, returnTo) ?? `/content/${resource}`;
  const dirtyRef = useRef(false);
  const sentinelActiveRef = useRef(false);
  const pendingNavigationRef = useRef<string | null>(null);

  const pushSentinel = useCallback(() => {
    const currentHref = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.history.pushState(window.history.state, "", currentHref);
    sentinelActiveRef.current = true;
  }, []);

  const onDirtyStateChange = useCallback(
    (isDirty: boolean) => {
      dirtyRef.current = isDirty;
      if (isDirty && !sentinelActiveRef.current) pushSentinel();
    },
    [pushSentinel],
  );

  const canDiscard = useCallback(() => {
    return !dirtyRef.current || window.confirm(DISCARD_CONFIRMATION);
  }, []);

  const navigate = useCallback(
    (target: string, { skipConfirmation = false } = {}) => {
      if (pendingNavigationRef.current !== null) return false;
      if (!skipConfirmation && !canDiscard()) return false;

      dirtyRef.current = false;
      if (sentinelActiveRef.current) {
        pendingNavigationRef.current = target;
        window.history.back();
      } else {
        router.replace(target);
      }
      return true;
    },
    [canDiscard, router],
  );

  const navigateToList = useCallback(
    () => navigate(validatedReturnTo),
    [navigate, validatedReturnTo],
  );

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!dirtyRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    }

    function handlePopState() {
      if (!sentinelActiveRef.current) return;
      sentinelActiveRef.current = false;

      const pendingNavigation = pendingNavigationRef.current;
      pendingNavigationRef.current = null;
      if (pendingNavigation !== null) {
        router.replace(pendingNavigation);
        return;
      }

      if (dirtyRef.current && !window.confirm(DISCARD_CONFIRMATION)) {
        pushSentinel();
        return;
      }

      dirtyRef.current = false;
      window.history.back();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [pushSentinel, router]);

  return { canDiscard, navigate, navigateToList, onDirtyStateChange };
}

function findInitiatingControl(identity: string) {
  const entry = [
    ...document.querySelectorAll<HTMLElement>("[data-admin-editor-entry]"),
  ].find((candidate) => candidate.dataset.adminEditorEntry === identity);
  if (entry === undefined) return null;
  if (
    entry.matches("button, input, select, textarea, a[href], [tabindex]") &&
    !entry.matches(":disabled, [aria-disabled='true']")
  ) {
    return entry;
  }
  const nestedControl = entry.querySelector<HTMLElement>(
    "button, input, select, textarea, a[href], [tabindex]",
  );
  return nestedControl?.matches(":disabled, [aria-disabled='true']")
    ? null
    : nestedControl;
}

function findListToolbarControl() {
  return document.querySelector<HTMLElement>(
    '[data-slot="admin-list-toolbar"] button, ' +
      '[data-slot="admin-list-toolbar"] input, ' +
      '[data-slot="admin-list-toolbar"] select, ' +
      '[data-slot="admin-list-toolbar"] [tabindex]',
  );
}

export function useAdminEditorListReturnRecovery({
  ready,
  resource,
}: {
  ready: boolean;
  resource: AdminEditorResource;
}) {
  const recoveryRef = useRef<{
    resource: AdminEditorResource;
    snapshot: AdminEditorReturnSnapshot | null;
  } | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (recoveryRef.current?.resource !== resource) {
      const currentListUrl = validateAdminEditorListUrl(
        resource,
        `${window.location.pathname}${window.location.search}`,
      );
      recoveryRef.current = {
        resource,
        snapshot: consumeAdminEditorReturnSnapshot(
          window.sessionStorage,
          resource,
          currentListUrl ?? "",
        ),
      };
    }

    const snapshot = recoveryRef.current.snapshot;
    if (snapshot === null) return;

    const animationFrame = window.requestAnimationFrame(() => {
      if (typeof window.scrollTo === "function") {
        window.scrollTo({ behavior: "auto", top: snapshot.scrollY });
      }
      const focusTarget =
        findInitiatingControl(snapshot.initiatingControl) ??
        findListToolbarControl();
      focusTarget?.focus({ preventScroll: true });
      if (recoveryRef.current?.resource === resource) {
        recoveryRef.current.snapshot = null;
      }
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [ready, resource]);
}
