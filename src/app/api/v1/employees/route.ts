import { createUnavailableEmployeeAccountService } from "@/server/services/employee-account-service";
import { createEmployeeAccountRouteHandlers } from "@/server/services/employee-account-route";

const employeeAccountRouteHandlers = createEmployeeAccountRouteHandlers(
  createUnavailableEmployeeAccountService(),
);

const responseContract = {
  code: 503007,
  message: "Employee account runtime is not configured.",
  data: null,
};

void responseContract;

export const POST = employeeAccountRouteHandlers.POST;
