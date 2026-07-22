import { spawn } from "node:child_process";
import { resolve } from "node:path";

export const localOfficeDocumentConversionBudgets = Object.freeze({
  maxInputBytes: 52_428_800,
  maxChildHeapMiB: 256,
  childAbortTimeoutMs: 25_000,
  hardWallTimeoutMs: 30_000,
  maxStdinBytes: 52_428_804,
  maxStdoutBytes: 8_388_608,
  maxStderrBytes: 16_384,
  maxUncompressedBytes: 134_217_728,
  maxZipEntries: 2_048,
  maxTableCells: 100_000,
  maxPageOrSlideCount: 500,
  maxMarkdownOutputBytes: 4_194_304,
  maxActiveConversions: 1,
  maxQueuedConversions: 2,
  queueWaitTimeoutMs: 5_000,
});

type SupportedOfficeExtension = "docx" | "pdf" | "pptx";

type LocalOfficeDocumentConversionFailureReason =
  | "conversion_aborted"
  | "conversion_busy"
  | "conversion_failed"
  | "conversion_timeout"
  | "format_mismatch"
  | "input_limit_exceeded"
  | "no_extractable_text"
  | "resource_limit_exceeded";

type LocalOfficeDocumentConversionIsolationEvidence = {
  childProcess: true;
  nodePermissionModel: true;
  fsWriteAllowed: false;
  childSpawnAllowed: false;
  workerAllowed: false;
  wasiAllowed: false;
  ocrEnabled: false;
  networkAttemptCount: 0;
  environmentKeys: ["LANG", "NODE_ENV", "TZ"];
  pageOrSlideLimitStage: "post_ast";
};

export type LocalOfficeDocumentConversionResult =
  | {
      status: "converted";
      detectedType: SupportedOfficeExtension;
      markdownContent: string;
      pageOrSlideCount: number;
      isolation: LocalOfficeDocumentConversionIsolationEvidence;
    }
  | {
      status: "failed";
      reason: LocalOfficeDocumentConversionFailureReason;
    };

export type ConvertLocalOfficeDocumentBytesInput = {
  bytes: Buffer;
  expectedExtension: SupportedOfficeExtension;
  signal?: AbortSignal;
};

type ChildSuccessMessage = {
  version: 1;
  status: "converted";
  detectedType: SupportedOfficeExtension;
  markdownContent: string;
  pageOrSlideCount: number;
  networkAttemptCount: 0;
  fsWriteAllowed: false;
  childSpawnAllowed: false;
  workerAllowed: false;
  wasiAllowed: false;
  environmentKeys: ["LANG", "NODE_ENV", "TZ"];
};

type ChildFailureMessage = {
  version: 1;
  status: "failed";
  reason: Exclude<
    LocalOfficeDocumentConversionFailureReason,
    "conversion_aborted" | "conversion_busy" | "conversion_timeout"
  >;
};

type ChildMessage = ChildSuccessMessage | ChildFailureMessage;

type QueuedConversion<T> = {
  execute: () => Promise<T>;
  reject: (reason: Error) => void;
  resolve: (value: T | PromiseLike<T>) => void;
  timer: ReturnType<typeof setTimeout>;
};

class LocalOfficeConversionAdmissionController {
  private activeCount = 0;
  private readonly queue: QueuedConversion<unknown>[] = [];

  run<T>(execute: () => Promise<T>): Promise<T> {
    if (
      this.activeCount <
      localOfficeDocumentConversionBudgets.maxActiveConversions
    ) {
      return this.start(execute);
    }

    if (
      this.queue.length >=
      localOfficeDocumentConversionBudgets.maxQueuedConversions
    ) {
      return Promise.reject(new Error("conversion_busy"));
    }

    return new Promise<T>((resolvePromise, rejectPromise) => {
      const queued: QueuedConversion<T> = {
        execute,
        reject: rejectPromise,
        resolve: resolvePromise,
        timer: setTimeout(() => {
          const queueIndex = this.queue.indexOf(
            queued as QueuedConversion<unknown>,
          );

          if (queueIndex !== -1) {
            this.queue.splice(queueIndex, 1);
            rejectPromise(new Error("conversion_busy"));
          }
        }, localOfficeDocumentConversionBudgets.queueWaitTimeoutMs),
      };

      this.queue.push(queued as QueuedConversion<unknown>);
    });
  }

  snapshot() {
    return {
      activeCount: this.activeCount,
      queuedCount: this.queue.length,
    };
  }

  private async start<T>(execute: () => Promise<T>): Promise<T> {
    this.activeCount += 1;

    try {
      return await execute();
    } finally {
      this.activeCount -= 1;
      this.drain();
    }
  }

  private drain() {
    while (
      this.activeCount <
        localOfficeDocumentConversionBudgets.maxActiveConversions &&
      this.queue.length > 0
    ) {
      const queued = this.queue.shift();

      if (queued === undefined) {
        return;
      }

      clearTimeout(queued.timer);
      void this.start(queued.execute).then(queued.resolve, queued.reject);
    }
  }
}

const admissionController = new LocalOfficeConversionAdmissionController();
let totalSpawnCount = 0;

export function readLocalOfficeConversionRuntimeSnapshot() {
  return {
    ...admissionController.snapshot(),
    totalSpawnCount,
  };
}

const childSource = String.raw`
const budgets = ${JSON.stringify(localOfficeDocumentConversionBudgets)};
const protocolVersion = 1;
let sent = false;
let networkAttemptCount = 0;
const allowedEnvironmentKeys = new Set(["LANG", "NODE_ENV", "TZ"]);
for (const environmentKey of Object.keys(process.env)) {
  if (!allowedEnvironmentKeys.has(environmentKey)) delete process.env[environmentKey];
}

function send(message) {
  if (sent) return;
  sent = true;
  process.stdout.write(JSON.stringify({ version: protocolVersion, ...message }));
}

function fail(reason) {
  send({ status: "failed", reason });
}

function installNetworkDenyHooks() {
  const deny = () => {
    networkAttemptCount += 1;
    throw new Error("network_disabled");
  };

  globalThis.fetch = deny;

  return Promise.all([
    import("node:http"),
    import("node:https"),
    import("node:net"),
    import("node:tls"),
    import("node:dns"),
  ]).then(([httpModule, httpsModule, netModule, tlsModule, dnsModule]) => {
    for (const moduleValue of [httpModule.default, httpsModule.default]) {
      moduleValue.get = deny;
      moduleValue.request = deny;
    }
    netModule.default.connect = deny;
    netModule.default.createConnection = deny;
    tlsModule.default.connect = deny;
    dnsModule.default.lookup = deny;
    dnsModule.default.resolve = deny;
    dnsModule.default.reverse = deny;
  });
}

function countPageOrSlideNodes(nodes) {
  let count = 0;
  const stack = Array.isArray(nodes) ? [...nodes] : [];

  while (stack.length > 0) {
    const node = stack.pop();
    if (node?.type === "page" || node?.type === "slide") count += 1;
    if (Array.isArray(node?.children)) stack.push(...node.children);
  }

  return count;
}

function countExtractableTextCharacters(nodes) {
  let count = 0;
  const stack = Array.isArray(nodes) ? [...nodes] : [];

  while (stack.length > 0) {
    const node = stack.pop();
    if (
      node?.type !== "image" &&
      typeof node?.text === "string"
    ) {
      count += node.text.trim().length;
    }
    if (Array.isArray(node?.children)) stack.push(...node.children);
  }

  return count;
}

const chunks = [];
let totalInputBytes = 0;

process.stdin.on("data", (chunk) => {
  totalInputBytes += chunk.length;
  if (totalInputBytes > budgets.maxStdinBytes) {
    fail("input_limit_exceeded");
    process.stdin.destroy();
    return;
  }
  chunks.push(chunk);
});

process.stdin.on("error", () => fail("conversion_failed"));

process.stdin.on("end", async () => {
  try {
    const framedInput = Buffer.concat(chunks, totalInputBytes);
    if (framedInput.length < 4) return fail("conversion_failed");
    const declaredLength = framedInput.readUInt32BE(0);
    if (
      declaredLength > budgets.maxInputBytes ||
      framedInput.length !== declaredLength + 4
    ) {
      return fail("input_limit_exceeded");
    }

    console.log = () => {};
    console.info = () => {};
    console.debug = () => {};
    console.warn = () => {};
    console.error = () => {};

    await installNetworkDenyHooks();
    const abortController = new AbortController();
    const abortTimer = setTimeout(
      () => abortController.abort(),
      budgets.childAbortTimeoutMs,
    );

    try {
      const { OfficeParser } = await import("officeparser");
      const ast = await OfficeParser.parseOffice(framedInput.subarray(4), {
        abortSignal: abortController.signal,
        decompressionLimits: {
          maxTableCells: budgets.maxTableCells,
          maxUncompressedBytes: budgets.maxUncompressedBytes,
          maxZipEntries: budgets.maxZipEntries,
        },
        extractAttachments: false,
        includeRawContent: false,
        ocr: false,
        pdfWorkerSrc: "",
      });
      const pageOrSlideCount = countPageOrSlideNodes(ast.content);
      if (pageOrSlideCount > budgets.maxPageOrSlideCount) {
        return fail("resource_limit_exceeded");
      }
      if (countExtractableTextCharacters(ast.content) === 0) {
        return fail("no_extractable_text");
      }

      const generated = await ast.to("md", { includeImages: false });
      const markdownContent = String(generated.value).trim();
      if (markdownContent.length === 0) return fail("no_extractable_text");
      if (
        Buffer.byteLength(markdownContent, "utf8") >
        budgets.maxMarkdownOutputBytes
      ) {
        return fail("resource_limit_exceeded");
      }
      if (networkAttemptCount !== 0) return fail("conversion_failed");
      const permission = process.permission;
      if (
        permission === undefined ||
        permission.has("fs.write") ||
        permission.has("child") ||
        permission.has("worker") ||
        permission.has("wasi")
      ) {
        return fail("conversion_failed");
      }
      const environmentKeys = Object.keys(process.env).sort();
      if (JSON.stringify(environmentKeys) !== JSON.stringify(["LANG", "NODE_ENV", "TZ"])) {
        return fail("conversion_failed");
      }

      send({
        status: "converted",
        detectedType: ast.type,
        markdownContent,
        pageOrSlideCount,
        networkAttemptCount,
        fsWriteAllowed: false,
        childSpawnAllowed: false,
        workerAllowed: false,
        wasiAllowed: false,
        environmentKeys,
      });
    } finally {
      clearTimeout(abortTimer);
    }
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : "";
    const name = typeof error === "object" && error !== null && "name" in error
      ? String(error.name)
      : "";
    const message = typeof error === "object" && error !== null && "message" in error
      ? String(error.message)
      : "";
    if (name === "AbortError" || code === "OPERATION_ABORTED") {
      fail("resource_limit_exceeded");
    } else if (
      code === "ZIP_ENTRY_COUNT_LIMIT_EXCEEDED" ||
      code === "ZIP_SIZE_LIMIT_EXCEEDED" ||
      code === "MAX_NESTING_DEPTH_EXCEEDED" ||
      message.includes("ZIP entry count exceeds limit") ||
      message.includes("ZIP uncompressed size limit exceeded") ||
      message.includes("Document nesting depth exceeded")
    ) {
      fail("resource_limit_exceeded");
    } else {
      fail("conversion_failed");
    }
  }
});

process.on("uncaughtException", () => fail("conversion_failed"));
process.on("unhandledRejection", () => fail("conversion_failed"));
`;

function isChildMessage(value: unknown): value is ChildMessage {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  if (candidate.version !== 1) {
    return false;
  }

  if (candidate.status === "failed") {
    return (
      candidate.reason === "conversion_failed" ||
      candidate.reason === "format_mismatch" ||
      candidate.reason === "input_limit_exceeded" ||
      candidate.reason === "no_extractable_text" ||
      candidate.reason === "resource_limit_exceeded"
    );
  }

  return (
    candidate.status === "converted" &&
    (candidate.detectedType === "docx" ||
      candidate.detectedType === "pdf" ||
      candidate.detectedType === "pptx") &&
    typeof candidate.markdownContent === "string" &&
    Number.isSafeInteger(candidate.pageOrSlideCount) &&
    Number(candidate.pageOrSlideCount) >= 0 &&
    candidate.networkAttemptCount === 0 &&
    candidate.fsWriteAllowed === false &&
    candidate.childSpawnAllowed === false &&
    candidate.workerAllowed === false &&
    candidate.wasiAllowed === false &&
    Array.isArray(candidate.environmentKeys) &&
    candidate.environmentKeys.length === 3 &&
    candidate.environmentKeys[0] === "LANG" &&
    candidate.environmentKeys[1] === "NODE_ENV" &&
    candidate.environmentKeys[2] === "TZ"
  );
}

function runIsolatedOfficeConversionChild(
  bytes: Buffer,
  signal: AbortSignal | undefined,
): Promise<ChildMessage | { status: "parent_failed"; reason: string }> {
  return new Promise((resolvePromise) => {
    const nodeModulesRoot = resolve(process.cwd(), "node_modules");
    totalSpawnCount += 1;
    const child = spawn(
      process.execPath,
      [
        "--permission",
        `--allow-fs-read=${nodeModulesRoot}`,
        `--max-old-space-size=${localOfficeDocumentConversionBudgets.maxChildHeapMiB}`,
        "--input-type=module",
        "--eval",
        childSource,
      ],
      {
        cwd: process.cwd(),
        env: {
          LANG: "C",
          NODE_ENV: "production",
          TZ: "UTC",
        },
        shell: false,
        stdio: ["pipe", "pipe", "pipe"],
        windowsHide: true,
      },
    );
    const stdoutChunks: Buffer[] = [];
    let stdoutBytes = 0;
    let stderrBytes = 0;
    let forcedReason: string | null = null;
    let resolved = false;

    const forceStop = (reason: string) => {
      if (forcedReason === null) {
        forcedReason = reason;
        child.stdin.destroy();
        child.stdout.destroy();
        child.stderr.destroy();
        child.kill("SIGKILL");
      }
    };

    const hardTimer = setTimeout(
      () => forceStop("conversion_timeout"),
      localOfficeDocumentConversionBudgets.hardWallTimeoutMs,
    );
    const handleAbort = () => forceStop("conversion_aborted");

    signal?.addEventListener("abort", handleAbort, { once: true });
    if (signal?.aborted === true) {
      handleAbort();
    }

    child.stdin.on("error", () => {
      forcedReason ??= "conversion_failed";
    });
    child.stdout.on("error", () => {
      forcedReason ??= "conversion_failed";
    });
    child.stderr.on("error", () => {
      forcedReason ??= "conversion_failed";
    });
    child.stdout.on("data", (chunk: Buffer) => {
      stdoutBytes += chunk.length;
      if (stdoutBytes > localOfficeDocumentConversionBudgets.maxStdoutBytes) {
        forceStop("resource_limit_exceeded");
        return;
      }
      stdoutChunks.push(Buffer.from(chunk));
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderrBytes += chunk.length;
      if (stderrBytes > localOfficeDocumentConversionBudgets.maxStderrBytes) {
        forceStop("resource_limit_exceeded");
      }
    });
    child.on("error", () => {
      forcedReason ??= "conversion_failed";
    });
    child.on("close", (exitCode) => {
      if (resolved) {
        return;
      }
      resolved = true;
      clearTimeout(hardTimer);
      signal?.removeEventListener("abort", handleAbort);

      if (forcedReason !== null) {
        resolvePromise({ status: "parent_failed", reason: forcedReason });
        return;
      }

      if (exitCode !== 0) {
        resolvePromise({
          status: "parent_failed",
          reason: "conversion_failed",
        });
        return;
      }

      try {
        const parsed: unknown = JSON.parse(
          Buffer.concat(stdoutChunks).toString("utf8"),
        );
        resolvePromise(
          isChildMessage(parsed)
            ? parsed
            : { status: "parent_failed", reason: "conversion_failed" },
        );
      } catch {
        resolvePromise({
          status: "parent_failed",
          reason: "conversion_failed",
        });
      }
    });

    const header = Buffer.alloc(4);
    header.writeUInt32BE(bytes.length, 0);
    child.stdin.write(header);
    child.stdin.end(bytes);
  });
}

export async function convertLocalOfficeDocumentBytes({
  bytes,
  expectedExtension,
  signal,
}: ConvertLocalOfficeDocumentBytesInput): Promise<LocalOfficeDocumentConversionResult> {
  if (bytes.length > localOfficeDocumentConversionBudgets.maxInputBytes) {
    return { status: "failed", reason: "input_limit_exceeded" };
  }

  if (signal?.aborted === true) {
    return { status: "failed", reason: "conversion_aborted" };
  }

  try {
    const childResult = await admissionController.run(() =>
      runIsolatedOfficeConversionChild(bytes, signal),
    );

    if (childResult.status === "parent_failed") {
      return {
        status: "failed",
        reason:
          childResult.reason as LocalOfficeDocumentConversionFailureReason,
      };
    }

    if (childResult.status === "failed") {
      return { status: "failed", reason: childResult.reason };
    }

    if (childResult.detectedType !== expectedExtension) {
      return { status: "failed", reason: "format_mismatch" };
    }

    return {
      status: "converted",
      detectedType: childResult.detectedType,
      markdownContent: childResult.markdownContent,
      pageOrSlideCount: childResult.pageOrSlideCount,
      isolation: {
        childProcess: true,
        nodePermissionModel: true,
        fsWriteAllowed: false,
        childSpawnAllowed: false,
        workerAllowed: false,
        wasiAllowed: false,
        ocrEnabled: false,
        networkAttemptCount: 0,
        environmentKeys: ["LANG", "NODE_ENV", "TZ"],
        pageOrSlideLimitStage: "post_ast",
      },
    };
  } catch {
    return { status: "failed", reason: "conversion_busy" };
  }
}
