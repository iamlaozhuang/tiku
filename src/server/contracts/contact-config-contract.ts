export type ContactConfigChannelType = "phone" | "wechat_work";

export type ContactConfigChannelDto = {
  channelType: ContactConfigChannelType;
  label: string;
  value: string;
  serviceHours: string;
  usage: string;
  href: string | null;
};

export type PurchaseGuidanceContactConfigDto = {
  publicId: string;
  title: string;
  summary: string;
  channels: ContactConfigChannelDto[];
  safetyNotice: string;
  updatedAt: string;
};

export type PurchaseGuidanceContactConfigResultDto = {
  contactConfig: PurchaseGuidanceContactConfigDto;
};

export type UpdateContactConfigInputDto = {
  title: string;
  summary: string;
  channels: ContactConfigChannelDto[];
  safetyNotice: string;
};
