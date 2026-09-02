import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
  meta?: any;
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: T,
  error?: any,
  meta?: any
): Response => {
  const payload: ApiResponse<T> = {
    success,
    message,
    ...(data !== undefined && { data }),
    ...(error !== undefined && { error }),
    ...(meta !== undefined && { meta }),
  };
  return res.status(statusCode).json(payload);
};

export const sendSuccess = <T>(res: Response, message: string, data?: T, statusCode = 200, meta?: any) => {
  return sendResponse(res, statusCode, true, message, data, undefined, meta);
};

export const sendError = (res: Response, message: string, statusCode = 400, error?: any) => {
  return sendResponse(res, statusCode, false, message, undefined, error);
};
