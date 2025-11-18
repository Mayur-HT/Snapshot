import jwt from 'jsonwebtoken';

export type JwtPayload = { sub: string; email: string };

export function signJwt(payload: JwtPayload) {
  const secret = process.env.JWT_SECRET || 'devsecret';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

export function verifyJwt<T = JwtPayload>(token: string): T {
  const secret = process.env.JWT_SECRET || 'devsecret';
  return jwt.verify(token, secret) as T;
}
