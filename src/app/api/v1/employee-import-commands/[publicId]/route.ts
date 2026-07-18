import { createEmployeeImportCommandRouteHandlers } from "@/server/services/employee-import-command-route";

const employeeImportCommandRouteHandlers =
  createEmployeeImportCommandRouteHandlers();

export const GET = employeeImportCommandRouteHandlers.item.GET;
