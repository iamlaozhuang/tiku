export type ContentImageDto = {
  publicId: string;
  contentType: string;
  fileSizeByte: number;
  createdAt: string;
  url: string;
};

export type ContentImageResultDto = {
  contentImage: ContentImageDto;
};
