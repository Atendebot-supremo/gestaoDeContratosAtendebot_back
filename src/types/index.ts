export enum ErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFLICT = 'CONFLICT'
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: ErrorCode;
}

export const createSuccessResponse = <T>(
  data: T,
  message?: string
): APIResponse<T> => ({
  success: true,
  data,
  message
});

export const createErrorResponse = (
  error: string,
  code: ErrorCode,
  message?: string
): APIResponse => ({
  success: false,
  error,
  code,
  message
});

