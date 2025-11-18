import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UnauthorizedException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { getUserFromRequest } from "../auth/auth.util";
import { Request } from "express";
import { randomBytes } from "crypto";

@Controller("groups")
export class GroupsController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async createGroup(@Req() req: Request, @Body() body: { name: string }) {
    const user = await getUserFromRequest(req, this.prisma);
    if (!user) throw new UnauthorizedException();
    if (!body.name) throw new BadRequestException("Group name is required");

    const group = await this.prisma.group.create({
      data: {
        name: body.name,
        ownerId: user.id,
        members: {
          create: {
            userId: user.id, // Add owner as member
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, selfieUrl: true },
            },
          },
        },
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return group;
  }

  @Get()
  async getGroups(@Req() req: Request) {
    const user = await getUserFromRequest(req, this.prisma);
    if (!user) throw new UnauthorizedException();

    const groups = await this.prisma.group.findMany({
      where: {
        OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, selfieUrl: true },
            },
          },
        },
        owner: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { members: true },
        },
      },
      orderBy: { id: "desc" },
    });

    return { groups };
  }

  @Get(":id")
  async getGroup(@Req() req: Request, @Param("id") id: string) {
    const user = await getUserFromRequest(req, this.prisma);
    if (!user) throw new UnauthorizedException();

    const group = await this.prisma.group.findFirst({
      where: {
        id,
        OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, selfieUrl: true },
            },
          },
        },
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!group) throw new NotFoundException("Group not found");
    return group;
  }

  @Post(":id/members")
  async addMember(
    @Req() req: Request,
    @Param("id") groupId: string,
    @Body() body: { email: string }
  ) {
    const user = await getUserFromRequest(req, this.prisma);
    if (!user) throw new UnauthorizedException();
    if (!body.email) throw new BadRequestException("Email is required");

    // Check if user is owner or member
    const group = await this.prisma.group.findFirst({
      where: {
        id: groupId,
        OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
      },
    });

    if (!group) throw new NotFoundException("Group not found");

    // Find user by email
    const targetUser = await this.prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!targetUser) throw new NotFoundException("User not found");

    // Check if already a member
    const existing = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: targetUser.id,
        },
      },
    });

    if (existing) throw new BadRequestException("User is already a member");

    // Add member
    await this.prisma.groupMember.create({
      data: {
        groupId,
        userId: targetUser.id,
      },
    });

    return { success: true, message: "Member added successfully" };
  }

  @Delete(":id/members/:userId")
  async removeMember(
    @Req() req: Request,
    @Param("id") groupId: string,
    @Param("userId") userId: string
  ) {
    const user = await getUserFromRequest(req, this.prisma);
    if (!user) throw new UnauthorizedException();

    // Check if user is owner
    const group = await this.prisma.group.findFirst({
      where: {
        id: groupId,
        ownerId: user.id,
      },
    });

    if (!group)
      throw new NotFoundException("Group not found or you are not the owner");

    // Don't allow removing the owner
    if (userId === user.id) {
      throw new BadRequestException("Cannot remove group owner");
    }

    await this.prisma.groupMember.deleteMany({
      where: {
        groupId,
        userId,
      },
    });

    return { success: true, message: "Member removed successfully" };
  }

  @Post(":id/invite")
  async createInvite(
    @Req() req: Request,
    @Param("id") groupId: string,
    @Body() body: { email?: string }
  ) {
    const user = await getUserFromRequest(req, this.prisma);
    if (!user) throw new UnauthorizedException();

    // Check if user is owner or member
    const group = await this.prisma.group.findFirst({
      where: {
        id: groupId,
        OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
      },
    });

    if (!group) throw new NotFoundException("Group not found");

    // Generate unique token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const invite = await this.prisma.groupInvite.create({
      data: {
        groupId,
        token,
        email: body.email || null,
        invitedBy: user.id,
        expiresAt,
      },
    });

    // Generate invite URL
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const inviteUrl = `${baseUrl}/groups/accept/${token}`;

    // TODO: Send email if email is provided
    // For now, we'll return the URL so the frontend can handle it

    return {
      invite: {
        id: invite.id,
        token: invite.token,
        email: invite.email,
        inviteUrl,
        expiresAt: invite.expiresAt,
      },
    };
  }

  @Get("accept/:token")
  async acceptInvite(@Req() req: Request, @Param("token") token: string) {
    const user = await getUserFromRequest(req, this.prisma);
    if (!user) throw new UnauthorizedException();

    const invite = await this.prisma.groupInvite.findUnique({
      where: { token },
      include: { group: true },
    });

    if (!invite) throw new NotFoundException("Invalid invite token");
    if (invite.used)
      throw new BadRequestException("Invite has already been used");
    if (new Date() > invite.expiresAt)
      throw new BadRequestException("Invite has expired");

    // Check if user is already a member
    const existing = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: invite.groupId,
          userId: user.id,
        },
      },
    });

    if (existing) {
      // Mark invite as used even if already a member
      await this.prisma.groupInvite.update({
        where: { id: invite.id },
        data: { used: true, usedAt: new Date(), usedBy: user.id },
      });
      return {
        success: true,
        message: "You are already a member of this group",
        group: invite.group,
      };
    }

    // Add user to group
    await this.prisma.groupMember.create({
      data: {
        groupId: invite.groupId,
        userId: user.id,
      },
    });

    // Mark invite as used
    await this.prisma.groupInvite.update({
      where: { id: invite.id },
      data: { used: true, usedAt: new Date(), usedBy: user.id },
    });

    return {
      success: true,
      message: "Successfully joined group",
      group: invite.group,
    };
  }

  @Delete(":id")
  async deleteGroup(@Req() req: Request, @Param("id") id: string) {
    const user = await getUserFromRequest(req, this.prisma);
    if (!user) throw new UnauthorizedException();

    const group = await this.prisma.group.findFirst({
      where: {
        id,
        ownerId: user.id,
      },
    });

    if (!group)
      throw new NotFoundException("Group not found or you are not the owner");

    await this.prisma.group.delete({
      where: { id },
    });

    return { success: true, message: "Group deleted successfully" };
  }
}
