import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getUserFromRequest } from '../auth/auth.util';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private prisma: PrismaService) {}

  @Get('me')
  async me(@Req() req: Request) {
    const user = await getUserFromRequest(req, this.prisma);
    if (!user) throw new UnauthorizedException();
    return { id: user.id, email: user.email, name: user.name, selfieUrl: user.selfieUrl };
  }
}
