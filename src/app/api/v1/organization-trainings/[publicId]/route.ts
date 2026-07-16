import { createOrganizationTrainingRuntimeRouteHandlers } from "@/server/services/organization-training-route";

const organizationTrainingRouteHandlers =
  createOrganizationTrainingRuntimeRouteHandlers();

export const GET = organizationTrainingRouteHandlers.adminDetail.GET;
export const PATCH = organizationTrainingRouteHandlers.adminDetail.PATCH;
