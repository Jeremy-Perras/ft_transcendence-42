import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "../prisma/prisma.service";

export enum Role {
  Member,
  Admin,
  Owner,
}
export const ROLE_KEY = "role";
export const RoleGuard = (role: Role) => SetMetadata(ROLE_KEY, role);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const role = this.reflector.getAllAndOverride<Role>(ROLE_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    const userId = +ctx.getContext().req.user;
    const channelId = ctx.getArgs<{ channelId: number }>().channelId;
    switch (role) {
      case Role.Member: {
        const channel = await this.prisma.channel.findUnique({
          select: {
            members: {
              where: {
                userId,
              },
            },
            ownerId: true,
          },
          where: {
            id: channelId,
          },
        });
        if (!channel) throw new NotFoundException("Channel not found");
        if (channel.ownerId === userId || channel.members.length > 0) {
          return true;
        }
        return false;
      }
      case Role.Admin: {
        const channel = await this.prisma.channel.findUnique({
          select: {
            members: {
              where: {
                AND: {
                  isAdministrator: true,
                  userId,
                },
              },
            },
            ownerId: true,
          },
          where: {
            id: channelId,
          },
        });
        if (!channel) throw new NotFoundException("Channel not found");
        if (channel.ownerId === userId || channel.members.length > 0) {
          return true;
        }
        return false;
      }
      case Role.Owner: {
        const channel = await this.prisma.channel.findUnique({
          select: {
            ownerId: true,
          },
          where: {
            id: channelId,
          },
        });
        return channel?.ownerId === userId;
      }
      default:
        return true;
    }
  }
}
