import { Request } from 'express';
import { verifyJwt } from '../common/jwt';
import { PrismaService } from '../prisma/prisma.service';

export async function getUserFromRequest(req: Request, prisma: PrismaService) {
  const auth = req.headers['authorization'];
  if (!auth) return null;
  const [scheme, token] = auth.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  try {
    const payload = verifyJwt<{ sub: string }>(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    return user || null;
  } catch {
    return null;
  }
}
