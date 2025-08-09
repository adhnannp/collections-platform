import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { HttpError } from '../utils/http.error';
import { STATUS_CODES } from '../utils/http.statuscodes';
import { MESSAGES } from '../utils/Response.messages';

const JWT_SECRET: Secret = process.env.JWT_SECRET || '1234cfqwre3q25dwercastvertvdfcasdf.234234';

if (!JWT_SECRET) {
  throw new HttpError(STATUS_CODES.BAD_REQUEST,'JWT_SECRET environment variable is not set');
}

export interface JwtPayload {
  id: string;
  role: string;
}

export const signAccessToken = (payload: JwtPayload, expiresIn: string = '1h'): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as SignOptions);
};

export const signRefreshToken = (payload: JwtPayload, expiresIn: string = '7d'): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as SignOptions);
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new HttpError(STATUS_CODES.UNAUTHORIZED,MESSAGES.INVALID_TOKEN);
  }
};