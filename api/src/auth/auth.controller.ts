import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname, join } from "node:path";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcrypt";
import { signJwt } from "../common/jwt";

const uploadsDir = process.env.UPLOAD_DIR || "./uploads";

function fileNameEdit(
  req: any,
  file: Express.Multer.File,
  cb: (error: Error | null, filename: string) => void
) {
  const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
  cb(null, unique + extname(file.originalname));
}

@Controller("auth")
export class AuthController {
  constructor(private prisma: PrismaService) {}

  @Post("register")
  @UseInterceptors(
    FileInterceptor("selfie", {
      storage: diskStorage({ destination: uploadsDir, filename: fileNameEdit }),
      limits: { fileSize: 10 * 1024 * 1024 },
    })
  )
  async register(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      email: string;
      name: string;
      password: string;
      inviteToken?: string;
    }
  ) {
    if (!file) throw new BadRequestException("Selfie is required");
    const { email, name, password, inviteToken } = body;
    if (!email || !name || !password)
      throw new BadRequestException("Missing fields");
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestException("Email already used");
    const passwordHash = await bcrypt.hash(password, 10);
    const selfieUrl = "/uploads/" + file.filename;
    const user = await this.prisma.user.create({
      data: { email, name, passwordHash, selfieUrl },
    });

    // Handle invite token if provided
    if (inviteToken) {
      await this.processInviteToken(inviteToken, user.id);
    }

    const token = signJwt({ sub: user.id, email: user.email });
    return {
      token,
      user: { id: user.id, email: user.email, name: user.name, selfieUrl },
    };
  }

  @Post("login")
  async login(
    @Body() body: { email: string; password: string; inviteToken?: string }
  ) {
    const { email, password, inviteToken } = body;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException("Invalid credentials");
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new BadRequestException("Invalid credentials");

    // Handle invite token if provided
    if (inviteToken) {
      await this.processInviteToken(inviteToken, user.id);
    }

    const token = signJwt({ sub: user.id, email: user.email });
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        selfieUrl: user.selfieUrl,
      },
    };
  }

  private async processInviteToken(token: string, userId: string) {
    const invite = await this.prisma.groupInvite.findUnique({
      where: { token },
      include: { group: true },
    });

    if (!invite) return; // Invalid token, but don't fail registration/login
    if (invite.used) return; // Already used
    if (new Date() > invite.expiresAt) return; // Expired

    // Check if user is already a member
    const existing = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: invite.groupId,
          userId: userId,
        },
      },
    });

    if (existing) {
      // Mark invite as used even if already a member
      await this.prisma.groupInvite.update({
        where: { id: invite.id },
        data: { used: true, usedAt: new Date(), usedBy: userId },
      });
      return;
    }

    // Add user to group
    await this.prisma.groupMember.create({
      data: {
        groupId: invite.groupId,
        userId: userId,
      },
    });

    // Mark invite as used
    await this.prisma.groupInvite.update({
      where: { id: invite.id },
      data: { used: true, usedAt: new Date(), usedBy: userId },
    });
  }
}
