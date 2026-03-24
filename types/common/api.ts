export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type ImageAsset = {
  uri: string;
  mimeType: string | null;
  fileName: string | null;
};
