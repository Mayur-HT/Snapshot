import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaService } from "./prisma/prisma.service";
import { AuthController } from "./auth/auth.controller";
import { UsersController } from "./users/users.controller";
import { PhotosController } from "./photos/photos.controller";
import { GroupsController } from "./groups/groups.controller";

@Module({
  imports: [],
  controllers: [
    AppController,
    AuthController,
    UsersController,
    PhotosController,
    GroupsController,
  ],
  providers: [AppService, PrismaService],
})
export class AppModule {}
