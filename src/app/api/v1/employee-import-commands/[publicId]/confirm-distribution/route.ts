import { createEmployeeImportCommandRouteHandlers } from "@/server/services/employee-import-command-route";

const employeeImportCommandRouteHandlers =
  createEmployeeImportCommandRouteHandlers();

export const POST = employeeImportCommandRouteHandlers.confirmDistribution.POST;
