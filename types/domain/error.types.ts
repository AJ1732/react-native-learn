export type AppError = Error & {
  isNetworkError?: boolean;
};
