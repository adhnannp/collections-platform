import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";
import { STATUS_CODES } from "../utils/http.statuscodes";
import { HttpError } from "../utils/http.error";
import { MESSAGES } from "../utils/Response.messages";

export const errorHandler = (err: HttpError | Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error(`${req.method} ${req.url} - ${err.message}`, { stack: err.stack });
  const status = err instanceof HttpError ? err.statusCode : STATUS_CODES.INTERNAL_SERVER_ERROR;
  const message = err instanceof HttpError ? err.message : MESSAGES.INTERNAL_SERVER_ERROR;
  res.status(status).json({ message });
};
