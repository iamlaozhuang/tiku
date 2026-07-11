import { createContactConfigRuntimeRouteHandlers } from "@/server/services/contact-config-service";

const contactConfigRouteHandlers = createContactConfigRuntimeRouteHandlers();

export const POST = contactConfigRouteHandlers.contactConfigQrImages.POST;
