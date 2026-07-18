"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
  EmployeeCredentialManifestDto,
  EmployeeImportCommandDto,
  EmployeeImportPreflightDto,
} from "@/server/contracts/employee-import-command-contract";

import {
  createEmployeeImportCommandClient,
  type EmployeeImportCommandClient,
  type EmployeeImportCommandPreviewInput,
  type EmployeeImportCommandSubmitInput,
} from "./employee-import-command-client";

const COMMAND_QUERY_KEY = "employeeImportCommand";
const IDEMPOTENCY_HISTORY_KEY = "employeeImportCommandIdempotencyKey";

export type EmployeeImportCommandUiStatus =
  | "idle"
  | "previewing"
  | "preview_ready"
  | "preview_stale"
  | "submitting"
  | "processing"
  | "open"
  | "confirmed"
  | "conflict"
  | "error";

export type EmployeeImportCommandUiState = {
  command: EmployeeImportCommandDto | null;
  highestCredentialRevision: number;
  idempotencyKey: string | null;
  manifest: EmployeeCredentialManifestDto | null;
  message: string | null;
  preview?: EmployeeImportPreflightDto | null;
  previewInput?: EmployeeImportCommandPreviewInput | null;
  status: EmployeeImportCommandUiStatus;
  submittedInput: EmployeeImportCommandSubmitInput | null;
};

type EmployeeImportCommandInternalState = Omit<
  EmployeeImportCommandUiState,
  "preview" | "previewInput"
> & {
  preview: EmployeeImportPreflightDto | null;
  previewInput: EmployeeImportCommandPreviewInput | null;
};

type UseEmployeeImportCommandOptions = {
  client?: EmployeeImportCommandClient;
  sessionToken: string | null;
};

type EmployeeImportMutation = {
  epoch: number;
  kind: "confirm" | "issue" | "preview" | "submit";
};

function isEmployeeImportCommandDto(
  value: EmployeeImportCommandDto | EmployeeImportPreflightDto,
): value is EmployeeImportCommandDto {
  return "publicId" in value;
}

function readHistoryIdempotencyKey(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = (window.history.state as Record<string, unknown> | null)?.[
    IDEMPOTENCY_HISTORY_KEY
  ];

  return typeof value === "string" && value.length > 0 ? value : null;
}

function readCommandPublicId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return new URLSearchParams(window.location.search).get(COMMAND_QUERY_KEY);
}

function createHistoryStateWithIdempotencyKey(
  idempotencyKey: string | null,
): Record<string, unknown> | null {
  const currentState = window.history.state;
  const nextState =
    currentState !== null &&
    typeof currentState === "object" &&
    !Array.isArray(currentState)
      ? { ...(currentState as Record<string, unknown>) }
      : {};

  if (idempotencyKey === null) {
    delete nextState[IDEMPOTENCY_HISTORY_KEY];
  } else {
    nextState[IDEMPOTENCY_HISTORY_KEY] = idempotencyKey;
  }

  return Object.keys(nextState).length === 0 ? null : nextState;
}

function replaceCommandLocation(
  commandPublicId: string,
  idempotencyKey: string | null,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const searchParams = new URLSearchParams(window.location.search);
  searchParams.set(COMMAND_QUERY_KEY, commandPublicId);
  const query = searchParams.toString();
  const nextLocation = `${window.location.pathname}${query.length === 0 ? "" : `?${query}`}${window.location.hash}`;
  window.history.replaceState(
    createHistoryStateWithIdempotencyKey(idempotencyKey),
    "",
    nextLocation,
  );
}

function replaceIdempotencyHistoryKey(
  idempotencyKey: string | null,
  clearCommandPublicId = false,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const searchParams = new URLSearchParams(window.location.search);
  if (clearCommandPublicId) {
    searchParams.delete(COMMAND_QUERY_KEY);
  }
  const query = searchParams.toString();
  window.history.replaceState(
    createHistoryStateWithIdempotencyKey(idempotencyKey),
    "",
    `${window.location.pathname}${query.length === 0 ? "" : `?${query}`}${window.location.hash}`,
  );
}

function statusFromCommand(
  command: EmployeeImportCommandDto,
): EmployeeImportCommandUiStatus {
  if (command.status === "processing") {
    return "processing";
  }
  if (command.credentialDistributionStatus === "confirmed") {
    return "confirmed";
  }

  return "open";
}

function initialState(): EmployeeImportCommandInternalState {
  const hasCommandToRecover = readCommandPublicId() !== null;

  return {
    command: null,
    highestCredentialRevision: 0,
    idempotencyKey: readHistoryIdempotencyKey(),
    manifest: null,
    message: hasCommandToRecover ? "正在查询员工导入命令。" : null,
    preview: null,
    previewInput: null,
    status: hasCommandToRecover ? "submitting" : "idle",
    submittedInput: null,
  };
}

export function useEmployeeImportCommand({
  client: suppliedClient,
  sessionToken,
}: UseEmployeeImportCommandOptions) {
  const client = useMemo(
    () => suppliedClient ?? createEmployeeImportCommandClient(),
    [suppliedClient],
  );
  const [state, setState] =
    useState<EmployeeImportCommandInternalState>(initialState);
  const stateRef = useRef(state);
  const mountedRef = useRef(true);
  const operationEpochRef = useRef(0);
  const mutationRef = useRef<EmployeeImportMutation | null>(null);
  const previousSessionTokenRef = useRef(sessionToken);
  const sensitiveRef = useRef<{
    idempotencyKey: string | null;
    manifest: EmployeeCredentialManifestDto | null;
    previewInput: EmployeeImportCommandPreviewInput | null;
    submittedInput: EmployeeImportCommandSubmitInput | null;
  }>({
    idempotencyKey: state.idempotencyKey,
    manifest: null,
    previewInput: null,
    submittedInput: null,
  });

  const updateState = useCallback(
    (
      updater: (
        current: EmployeeImportCommandInternalState,
      ) => EmployeeImportCommandInternalState,
    ) => {
      if (!mountedRef.current) {
        return;
      }
      const next = updater(stateRef.current);
      sensitiveRef.current = {
        idempotencyKey: next.idempotencyKey,
        manifest: next.manifest,
        previewInput: next.previewInput,
        submittedInput: next.submittedInput,
      };
      stateRef.current = next;
      setState(next);
    },
    [],
  );

  const isOperationCurrent = useCallback(
    (operationEpoch: number) =>
      mountedRef.current && operationEpochRef.current === operationEpoch,
    [],
  );

  const applyFailure = useCallback(
    (
      result: { httpStatus: number; response: { message: string } },
      operationEpoch: number,
    ) => {
      if (!isOperationCurrent(operationEpoch)) {
        return;
      }
      const shouldClearRecoveryLocation =
        result.httpStatus === 401 ||
        result.httpStatus === 403 ||
        result.httpStatus === 404;
      if (shouldClearRecoveryLocation) {
        replaceIdempotencyHistoryKey(null, true);
      }
      updateState((current) => ({
        ...current,
        command: shouldClearRecoveryLocation ? null : current.command,
        highestCredentialRevision: shouldClearRecoveryLocation
          ? 0
          : current.highestCredentialRevision,
        idempotencyKey: shouldClearRecoveryLocation
          ? null
          : current.idempotencyKey,
        manifest: shouldClearRecoveryLocation ? null : current.manifest,
        message: result.response.message,
        status: result.httpStatus === 409 ? "conflict" : "error",
        submittedInput: shouldClearRecoveryLocation
          ? null
          : current.submittedInput,
      }));
    },
    [isOperationCurrent, updateState],
  );

  const applyCommand = useCallback(
    (
      command: EmployeeImportCommandDto,
      idempotencyKey: string | null,
      operationEpoch: number,
    ) => {
      if (!isOperationCurrent(operationEpoch)) {
        return false;
      }
      const isCompleted = command.status === "completed";
      replaceCommandLocation(
        command.publicId,
        isCompleted ? null : idempotencyKey,
      );
      updateState((current) => ({
        ...current,
        command,
        highestCredentialRevision:
          current.command?.publicId === command.publicId
            ? Math.max(
                current.highestCredentialRevision,
                command.credentialRevision,
              )
            : command.credentialRevision,
        idempotencyKey: isCompleted ? null : idempotencyKey,
        manifest:
          current.command?.publicId === command.publicId &&
          current.manifest?.credentialRevision === command.credentialRevision &&
          current.manifest.issuePublicId === command.currentIssuePublicId &&
          command.credentialDistributionStatus === "open"
            ? current.manifest
            : null,
        message: null,
        preview: isCompleted ? null : current.preview,
        previewInput: isCompleted ? null : current.previewInput,
        status: statusFromCommand(command),
        submittedInput: isCompleted ? null : current.submittedInput,
      }));
      return true;
    },
    [isOperationCurrent, updateState],
  );

  const refresh = useCallback(
    async (commandPublicId?: string, existingOperationEpoch?: number) => {
      const operationEpoch =
        existingOperationEpoch ?? ++operationEpochRef.current;
      if (existingOperationEpoch === undefined) {
        updateState((current) => ({
          ...current,
          message: null,
          status: "submitting",
        }));
      }
      const publicId = commandPublicId ?? stateRef.current.command?.publicId;
      if (
        sessionToken === null ||
        publicId === null ||
        publicId === undefined
      ) {
        return null;
      }

      try {
        const result = await client.get(sessionToken, publicId);
        if (!isOperationCurrent(operationEpoch)) {
          return null;
        }
        const command = result.response.data;
        if (result.response.code !== 0 || command === null) {
          applyFailure(result, operationEpoch);
          return null;
        }
        applyCommand(command, stateRef.current.idempotencyKey, operationEpoch);
        return command;
      } catch {
        if (!isOperationCurrent(operationEpoch)) {
          return null;
        }
        updateState((current) => ({
          ...current,
          message: "员工导入命令暂时无法查询。",
          status: "error",
        }));
        return null;
      }
    },
    [
      applyCommand,
      applyFailure,
      client,
      isOperationCurrent,
      sessionToken,
      updateState,
    ],
  );

  useEffect(() => {
    const commandPublicId = readCommandPublicId();
    const didSessionChange = previousSessionTokenRef.current !== sessionToken;

    if (didSessionChange) {
      previousSessionTokenRef.current = sessionToken;
      operationEpochRef.current += 1;
      mutationRef.current = null;
      replaceIdempotencyHistoryKey(null, true);
      updateState((current) => ({
        ...current,
        command: null,
        highestCredentialRevision: 0,
        idempotencyKey: null,
        manifest: null,
        message:
          commandPublicId !== null && sessionToken === null
            ? "管理员会话已失效。"
            : null,
        preview: null,
        previewInput: null,
        status:
          commandPublicId !== null && sessionToken === null ? "error" : "idle",
        submittedInput: null,
      }));
    }

    if (
      !didSessionChange &&
      commandPublicId !== null &&
      sessionToken !== null
    ) {
      void refresh(commandPublicId);
    }
  }, [refresh, sessionToken, updateState]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      operationEpochRef.current += 1;
      mutationRef.current = null;
      sensitiveRef.current = {
        idempotencyKey: null,
        manifest: null,
        previewInput: null,
        submittedInput: null,
      };
      stateRef.current = {
        ...stateRef.current,
        idempotencyKey: null,
        manifest: null,
        preview: null,
        previewInput: null,
        submittedInput: null,
      };
    };
  }, []);

  const preview = useCallback(
    async (input: EmployeeImportCommandPreviewInput) => {
      if (sessionToken === null || mutationRef.current !== null) {
        return null;
      }
      const operationEpoch = ++operationEpochRef.current;
      mutationRef.current = { epoch: operationEpoch, kind: "preview" };
      updateState((current) => ({
        ...current,
        message: null,
        preview: null,
        previewInput: input,
        status: "previewing",
      }));

      try {
        const result = await client.preview(sessionToken, input);
        if (!isOperationCurrent(operationEpoch)) {
          return null;
        }
        const nextPreview = result.response.data;
        if (result.response.code !== 0 || nextPreview === null) {
          applyFailure(result, operationEpoch);
          return null;
        }
        updateState((current) => ({
          ...current,
          message: null,
          preview: nextPreview,
          previewInput: input,
          status: "preview_ready",
        }));
        return nextPreview;
      } catch {
        if (isOperationCurrent(operationEpoch)) {
          updateState((current) => ({
            ...current,
            message: "员工导入预检暂时不可用。",
            preview: null,
            status: "error",
          }));
        }
        return null;
      } finally {
        if (mutationRef.current?.epoch === operationEpoch) {
          mutationRef.current = null;
        }
      }
    },
    [applyFailure, client, isOperationCurrent, sessionToken, updateState],
  );

  const invalidatePreview = useCallback(() => {
    if (mutationRef.current?.kind === "preview") {
      operationEpochRef.current += 1;
      mutationRef.current = null;
    }
    updateState((current) => ({
      ...current,
      preview: null,
      previewInput: null,
      status:
        current.status === "previewing" ||
        current.status === "preview_ready" ||
        current.status === "preview_stale"
          ? "idle"
          : current.status,
    }));
  }, [updateState]);

  const confirmPreview = useCallback(async () => {
    const reviewedPreview = stateRef.current.preview;
    const reviewedInput = stateRef.current.previewInput;
    if (
      sessionToken === null ||
      reviewedPreview === null ||
      reviewedInput === null ||
      !reviewedPreview.canConfirm ||
      stateRef.current.status !== "preview_ready" ||
      mutationRef.current !== null
    ) {
      return null;
    }

    const operationEpoch = ++operationEpochRef.current;
    mutationRef.current = { epoch: operationEpoch, kind: "submit" };
    const existingIdempotencyKey = stateRef.current.idempotencyKey;
    const idempotencyKey = existingIdempotencyKey ?? crypto.randomUUID();
    const confirmationInput: EmployeeImportCommandSubmitInput = {
      ...reviewedInput,
      expectedPreviewRevision: reviewedPreview.previewRevision,
    };
    replaceIdempotencyHistoryKey(
      idempotencyKey,
      existingIdempotencyKey === null,
    );
    updateState((current) => ({
      ...current,
      idempotencyKey,
      manifest: null,
      message: null,
      status: "submitting",
      submittedInput: confirmationInput,
    }));

    try {
      const result = await client.submit(
        sessionToken,
        idempotencyKey,
        confirmationInput,
      );
      if (!isOperationCurrent(operationEpoch)) {
        return null;
      }
      const data = result.response.data;
      if (
        result.response.code === 0 &&
        data !== null &&
        isEmployeeImportCommandDto(data)
      ) {
        applyCommand(data, idempotencyKey, operationEpoch);
        return data;
      }
      if (data !== null && !isEmployeeImportCommandDto(data)) {
        replaceIdempotencyHistoryKey(null, true);
        updateState((current) => ({
          ...current,
          idempotencyKey: null,
          message: result.response.message,
          preview: data,
          previewInput: reviewedInput,
          status:
            result.response.code === 409608 ? "preview_stale" : "preview_ready",
          submittedInput: null,
        }));
        return null;
      }
      applyFailure(result, operationEpoch);
      return null;
    } catch {
      if (isOperationCurrent(operationEpoch)) {
        updateState((current) => ({
          ...current,
          message: "提交结果未知，可使用相同输入安全恢复。",
          status: "error",
        }));
      }
      return null;
    } finally {
      if (mutationRef.current?.epoch === operationEpoch) {
        mutationRef.current = null;
      }
    }
  }, [
    applyCommand,
    applyFailure,
    client,
    isOperationCurrent,
    sessionToken,
    updateState,
  ]);

  const submit = useCallback(
    async (input: EmployeeImportCommandSubmitInput) => {
      if (sessionToken === null) {
        updateState((current) => ({
          ...current,
          message: "管理员会话已失效。",
          status: "error",
        }));
        return null;
      }

      if (mutationRef.current !== null) {
        return null;
      }

      const operationEpoch = ++operationEpochRef.current;
      mutationRef.current = { epoch: operationEpoch, kind: "submit" };

      const existingIdempotencyKey = stateRef.current.idempotencyKey;
      const idempotencyKey = existingIdempotencyKey ?? crypto.randomUUID();
      replaceIdempotencyHistoryKey(
        idempotencyKey,
        existingIdempotencyKey === null,
      );
      updateState((current) => ({
        ...current,
        command: existingIdempotencyKey === null ? null : current.command,
        highestCredentialRevision:
          existingIdempotencyKey === null
            ? 0
            : current.highestCredentialRevision,
        idempotencyKey,
        manifest: null,
        message: null,
        status: "submitting",
        submittedInput: input,
      }));

      try {
        const result = await client.submit(sessionToken, idempotencyKey, input);
        if (!isOperationCurrent(operationEpoch)) {
          return null;
        }
        const command = result.response.data;
        if (
          result.response.code !== 0 ||
          command === null ||
          !isEmployeeImportCommandDto(command)
        ) {
          applyFailure(result, operationEpoch);
          return null;
        }
        applyCommand(command, idempotencyKey, operationEpoch);
        return command;
      } catch {
        if (!isOperationCurrent(operationEpoch)) {
          return null;
        }
        updateState((current) => ({
          ...current,
          message: "提交结果未知，可使用相同输入安全恢复。",
          status: "error",
        }));
        return null;
      } finally {
        if (mutationRef.current?.epoch === operationEpoch) {
          mutationRef.current = null;
        }
      }
    },
    [
      applyCommand,
      applyFailure,
      client,
      isOperationCurrent,
      sessionToken,
      updateState,
    ],
  );

  const issueCredentials = useCallback(async () => {
    const command = state.command;
    if (
      sessionToken === null ||
      command === null ||
      mutationRef.current !== null
    ) {
      return;
    }

    const operationEpoch = ++operationEpochRef.current;
    mutationRef.current = { epoch: operationEpoch, kind: "issue" };
    const expectedRevision = command.credentialRevision;
    updateState((current) => ({
      ...current,
      manifest: null,
      message: null,
      status: "submitting",
    }));

    try {
      try {
        const result = await client.issueCredentials(
          sessionToken,
          command.publicId,
          { expectedCredentialRevision: expectedRevision },
        );
        if (!isOperationCurrent(operationEpoch)) {
          return;
        }
        const manifest = result.response.data;
        if (result.response.code === 0 && manifest !== null) {
          updateState((current) =>
            manifest.credentialRevision > current.highestCredentialRevision
              ? {
                  ...current,
                  command:
                    current.command === null
                      ? null
                      : {
                          ...current.command,
                          credentialDistributionStatus: "open",
                          credentialRevision: manifest.credentialRevision,
                          currentIssuePublicId: manifest.issuePublicId,
                        },
                  highestCredentialRevision: manifest.credentialRevision,
                  manifest,
                  message: null,
                  status: "open",
                }
              : current,
          );
          return;
        }
        if (result.httpStatus !== 503) {
          applyFailure(result, operationEpoch);
          return;
        }
      } catch {
        // The follow-up GET below determines whether the issue transaction won.
      }

      if (!isOperationCurrent(operationEpoch)) {
        return;
      }
      const latestCommand = await refresh(command.publicId, operationEpoch);
      if (!isOperationCurrent(operationEpoch)) {
        return;
      }
      updateState((current) => ({
        ...current,
        manifest: null,
        message:
          latestCommand === null
            ? "无法确认上一版结果，已阻止继续换新；请刷新后重新查询。"
            : latestCommand.credentialRevision > expectedRevision
              ? "上一版响应丢失，需显式换新分发。"
              : "可重新发起换新。",
        status: latestCommand === null ? "conflict" : "error",
      }));
    } finally {
      if (mutationRef.current?.epoch === operationEpoch) {
        mutationRef.current = null;
      }
    }
  }, [
    client,
    applyFailure,
    isOperationCurrent,
    refresh,
    sessionToken,
    state.command,
    updateState,
  ]);

  const confirmDistribution = useCallback(async () => {
    const command = state.command;
    const manifest = state.manifest;
    if (
      sessionToken === null ||
      command === null ||
      manifest === null ||
      mutationRef.current !== null
    ) {
      return;
    }

    const operationEpoch = ++operationEpochRef.current;
    mutationRef.current = { epoch: operationEpoch, kind: "confirm" };
    updateState((current) => ({
      ...current,
      manifest: null,
      status: "submitting",
    }));
    try {
      const result = await client.confirmDistribution(
        sessionToken,
        command.publicId,
        {
          expectedCredentialRevision: manifest.credentialRevision,
          issuePublicId: manifest.issuePublicId,
        },
      );
      if (!isOperationCurrent(operationEpoch)) {
        return;
      }
      const confirmedCommand = result.response.data;
      if (result.response.code === 0 && confirmedCommand !== null) {
        applyCommand(confirmedCommand, null, operationEpoch);
        return;
      }
      applyFailure(result, operationEpoch);
    } catch {
      if (!isOperationCurrent(operationEpoch)) {
        return;
      }
      updateState((current) => ({
        ...current,
        message: "分发确认结果未知，请重新查询命令状态。",
        status: "error",
      }));
    } finally {
      if (mutationRef.current?.epoch === operationEpoch) {
        mutationRef.current = null;
      }
    }
  }, [
    applyCommand,
    applyFailure,
    client,
    isOperationCurrent,
    sessionToken,
    state.command,
    state.manifest,
    updateState,
  ]);

  const clearPlaintext = useCallback(() => {
    const canceledMutation = mutationRef.current;
    const didCancelMutation = canceledMutation !== null;
    const shouldPreserveRecoveryKey = canceledMutation?.kind === "submit";
    operationEpochRef.current += 1;
    mutationRef.current = null;
    if (!shouldPreserveRecoveryKey) {
      replaceIdempotencyHistoryKey(null, true);
    }
    updateState((current) => ({
      ...current,
      idempotencyKey: shouldPreserveRecoveryKey ? current.idempotencyKey : null,
      manifest: null,
      message: shouldPreserveRecoveryKey
        ? "提交结果未知，原始输入已清除；重新上传相同文件将使用原幂等键恢复。"
        : didCancelMutation
          ? "操作结果未知，敏感内容已清除；请刷新页面重新查询。"
          : current.message,
      status: didCancelMutation ? "conflict" : current.status,
      preview: null,
      previewInput: null,
      submittedInput: null,
    }));
  }, [updateState]);

  return {
    canConfirmPreview:
      state.preview !== null &&
      state.preview.canConfirm &&
      state.status === "preview_ready",
    canConfirm: state.manifest !== null && state.status === "open",
    canIssue:
      state.command?.status === "completed" &&
      state.command.credentialDistributionStatus === "open" &&
      state.status !== "conflict" &&
      state.status !== "submitting",
    clearPlaintext,
    confirmPreview,
    confirmDistribution,
    invalidatePreview,
    issueCredentials,
    preview,
    refresh,
    state,
    submit,
  };
}
