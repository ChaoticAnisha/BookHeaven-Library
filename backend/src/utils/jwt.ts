import jwt from 'jsonwebtoken';
import { config } from '../config/config';

export const generateToken = (id: string, role: string): string => {
  return jwt.sign({ id, role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): { id: string; role: string } => {
  return jwt.verify(token, config.jwtSecret) as { id: string; role: string };
};
