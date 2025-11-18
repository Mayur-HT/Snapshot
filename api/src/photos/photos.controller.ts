import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
  UnauthorizedException,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { PrismaService } from "../prisma/prisma.service";
import { getUserFromRequest } from "../auth/auth.util";
import { Request } from "express";

const uploadsDir = process.env.UPLOAD_DIR || "./uploads";

function fileNameEdit(
  req: any,
  file: Express.Multer.File,
  cb: (error: Error | null, filename: string) => void
) {
  const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const ext = file.originalname?.split(".").pop();
  cb(null, unique + (ext ? "." + ext : ""));
}

@Controller("photos")
export class PhotosController {
  constructor(private prisma: PrismaService) {}

  @Post("upload")
  @UseInterceptors(
    FilesInterceptor("photos", 20, {
      storage: diskStorage({ destination: uploadsDir, filename: fileNameEdit }),
      limits: { fileSize: 25 * 1024 * 1024 },
    })
  )
  async upload(
    @Req() req: Request,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    const user = await getUserFromRequest(req, this.prisma);
    if (!user) throw new UnauthorizedException();
    if (!files || files.length === 0) throw new BadRequestException("No files");

    const created = await Promise.all(
      files.map(async (f) => {
        const photo = await this.prisma.photo.create({
          data: { ownerId: user.id, url: "/uploads/" + f.filename },
        });

        // Process face detection and matching in background
        this.processPhotoForFaceMatching(photo.id, f.path).catch(console.error);

        // Auto-share with group members
        this.autoShareWithGroups(photo.id, user.id).catch(console.error);

        return photo;
      })
    );

    return { count: created.length, photos: created };
  }

  private async processPhotoForFaceMatching(
    photoId: string,
    photoPath: string
  ) {
    try {
      // TODO: Implement actual face detection using a library like face-api.js, @tensorflow/tfjs, or similar
      // For now, this is a placeholder that demonstrates the structure

      // Step 1: Detect faces in the photo
      // const faces = await detectFaces(photoPath);

      // Step 2: For each detected face, try to match with user profile photos
      // const allUsers = await this.prisma.user.findMany({
      //   where: { faceEmbedding: { not: null } },
      // });

      // Step 3: Match faces and create FaceTag entries
      // for (const face of faces) {
      //   const matchedUser = await matchFace(face.embedding, allUsers);
      //   if (matchedUser) {
      //     await this.prisma.faceTag.create({
      //       data: {
      //         photoId,
      //         matchedUserId: matchedUser.id,
      //         boxX: face.box.x,
      //         boxY: face.box.y,
      //         boxW: face.box.width,
      //         boxH: face.box.height,
      //         embedding: face.embedding,
      //       },
      //     });
      //
      //     // Auto-share photo with matched user
      //     await this.sharePhotoWithUser(photoId, matchedUser.id);
      //   }
      // }

      // Placeholder: For demonstration, we'll create a simple matching based on a heuristic
      // In production, this should use actual face recognition
      console.log(
        `Processing photo ${photoId} for face matching (placeholder)`
      );
    } catch (error) {
      console.error("Error processing photo for face matching:", error);
    }
  }

  private async autoShareWithGroups(photoId: string, ownerId: string) {
    try {
      // Get all groups the user is a member of
      const groups = await this.prisma.group.findMany({
        where: {
          OR: [{ ownerId }, { members: { some: { userId: ownerId } } }],
        },
        include: {
          members: true,
        },
      });

      // Share photo with all group members (except the owner)
      for (const group of groups) {
        for (const member of group.members) {
          if (member.userId !== ownerId) {
            // Check if already shared
            const existing = await this.prisma.share.findFirst({
              where: {
                photoId,
                toUserId: member.userId,
              },
            });

            if (!existing) {
              await this.prisma.share.create({
                data: {
                  photoId,
                  toUserId: member.userId,
                },
              });
            }
          }
        }
      }
    } catch (error) {
      console.error("Error auto-sharing with groups:", error);
    }
  }

  private async sharePhotoWithUser(photoId: string, userId: string) {
    try {
      // Check if already shared
      const existing = await this.prisma.share.findFirst({
        where: {
          photoId,
          toUserId: userId,
        },
      });

      if (!existing) {
        await this.prisma.share.create({
          data: {
            photoId,
            toUserId: userId,
          },
        });
      }
    } catch (error) {
      console.error("Error sharing photo with user:", error);
    }
  }

  @Get("mine")
  async mine(@Req() req: Request) {
    const user = await getUserFromRequest(req, this.prisma);
    if (!user) throw new UnauthorizedException();
    const photos = await this.prisma.photo.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return { photos };
  }

  @Get("shared")
  async shared(@Req() req: Request) {
    const user = await getUserFromRequest(req, this.prisma);
    if (!user) throw new UnauthorizedException();

    const shares = await this.prisma.share.findMany({
      where: { toUserId: user.id },
      include: {
        photo: {
          include: {
            owner: {
              select: { id: true, name: true, email: true, selfieUrl: true },
            },
            faces: {
              include: {
                matchedUser: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    selfieUrl: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { shares: shares.map((s) => s.photo) };
  }
}
