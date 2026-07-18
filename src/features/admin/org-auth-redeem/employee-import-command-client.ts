import type { ApiResponse } from "@/server/contracts/api-response";
import type {
  EmployeeCredentialManifestDto,
  EmployeeDistributionConfirmationInput,
  EmployeeCredentialIssueInput,
  EmployeeImportCommandDto,
  EmployeeImportCommandConfirmationInput,
  EmployeeImportCommandConfirmationResult,
  EmployeeImportPreflightDto,
  EmployeeImportPreflightInput,
} from "@/server/contracts/employee-import-command-contract";

export type EmployeeImportCommandPreviewInput = EmployeeImportPreflightInput;
export type EmployeeImportCommandSubmitInput =
  EmployeeImportCommandConfirmationInput;

export type EmployeeImportCommandClientResult<TData> = {
  httpStatus: number;
  response: ApiResponse<TData | null>;
};

export type EmployeeImportCommandClient = {
  confirmDistribution: (
    sessionToken: string,
    commandPublicId: string,
    input: EmployeeDistributionConfirmationInput,
  ) => Promise<EmployeeImportCommandClientResult<EmployeeImportCommandDto>>;
  get: (
    sessionToken: string,
    commandPublicId: string,
  ) => Promise<EmployeeImportCommandClientResult<EmployeeImportCommandDto>>;
  issueCredentials: (
    sessionToken: string,
    commandPublicId: string,
    input: EmployeeCredentialIssueInput,
  ) => Promise<
    EmployeeImportCommandClientResult<EmployeeCredentialManifestDto>
  >;
  preview: (
    sessionToken: string,
    input: EmployeeImportCommandPreviewInput,
  ) => Promise<EmployeeImportCommandClientResult<EmployeeImportPreflightDto>>;
  submit: (
    sessionToken: string,
    idempotencyKey: string,
    input: EmployeeImportCommandSubmitInput,
  ) => Promise<
    EmployeeImportCommandClientResult<EmployeeImportCommandConfirmationResult>
  >;
};

type FetchImplementation = typeof fetch;

function createHeaders(sessionToken: string, idempotencyKey?: string): Headers {
  const headers = new Headers({
    authorization: `Bearer ${sessionToken}`,
    "content-type": "application/json",
  });

  if (idempotencyKey !== undefined) {
    headers.set("idempotency-key", idempotencyKey);
  }

  return headers;
}

async function parseResult<TData>(
  response: Response,
): Promise<EmployeeImportCommandClientResult<TData>> {
  return {
    httpStatus: response.status,
    response: (await response.json()) as ApiResponse<TData | null>,
  };
}

async function post<TData>(input: {
  body: string;
  fetchImplementation: FetchImplementation;
  idempotencyKey?: string;
  path: string;
  sessionToken: string;
}): Promise<EmployeeImportCommandClientResult<TData>> {
  const response = await input.fetchImplementation(input.path, {
    body: input.body,
    cache: "no-store",
    credentials: "same-origin",
    headers: createHeaders(input.sessionToken, input.idempotencyKey),
    method: "POST",
  });

  return parseResult<TData>(response);
}

export function createEmployeeImportCommandClient(
  fetchImplementation: FetchImplementation = fetch,
): EmployeeImportCommandClient {
  return {
    preview(sessionToken, input) {
      return post<EmployeeImportPreflightDto>({
        body: JSON.stringify(input),
        fetchImplementation,
        path: "/api/v1/employee-import-commands/preview",
        sessionToken,
      });
    },

    async submit(sessionToken, idempotencyKey, input) {
      const request = {
        body: JSON.stringify(input),
        fetchImplementation,
        idempotencyKey,
        path: "/api/v1/employee-import-commands",
        sessionToken,
      };

      try {
        const result =
          await post<EmployeeImportCommandConfirmationResult>(request);

        return result.httpStatus === 503
          ? await post<EmployeeImportCommandConfirmationResult>(request)
          : result;
      } catch {
        return post<EmployeeImportCommandConfirmationResult>(request);
      }
    },

    async get(sessionToken, commandPublicId) {
      const encodedCommandPublicId = encodeURIComponent(commandPublicId);
      const response = await fetchImplementation(
        `/api/v1/employee-import-commands/${encodedCommandPublicId}`,
        {
          cache: "no-store",
          credentials: "same-origin",
          headers: createHeaders(sessionToken),
        },
      );

      return parseResult<EmployeeImportCommandDto>(response);
    },

    issueCredentials(sessionToken, commandPublicId, input) {
      const encodedCommandPublicId = encodeURIComponent(commandPublicId);
      return post<EmployeeCredentialManifestDto>({
        body: JSON.stringify(input),
        fetchImplementation,
        path: `/api/v1/employee-import-commands/${encodedCommandPublicId}/issue-credentials`,
        sessionToken,
      });
    },

    confirmDistribution(sessionToken, commandPublicId, input) {
      const encodedCommandPublicId = encodeURIComponent(commandPublicId);
      return post<EmployeeImportCommandDto>({
        body: JSON.stringify(input),
        fetchImplementation,
        path: `/api/v1/employee-import-commands/${encodedCommandPublicId}/confirm-distribution`,
        sessionToken,
      });
    },
  };
}
