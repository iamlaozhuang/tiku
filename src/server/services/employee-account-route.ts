import type { ApiResponse } from "../contracts/api-response";
import type { EmployeeAccountService } from "./employee-account-service";

async function readRequestJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function createJsonResponse<TData>(response: ApiResponse<TData>): Response {
  return Response.json(response);
}

export function createEmployeeAccountRouteHandlers(
  employeeAccountService: EmployeeAccountService,
) {
  return {
    async POST(request: Request): Promise<Response> {
      const input = await readRequestJson(request);

      return createJsonResponse(
        await employeeAccountService.createEmployeeAccount(input),
      );
    },
  };
}
