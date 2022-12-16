import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "../prisma/prisma.service";
import { ChannelRole } from "@prisma/client";

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

    let channel;
    if (role === Role.Admin || role === Role.Owner || role === Role.Member) {
      channel = await this.prisma.channel.findFirst({
        select: {
          ownerId: true,
          members: {
            select: {
              userId: true,
              role: true,
            },
            where: {
              userId,
            },
          },
        },
        where: {
          id: channelId,
          OR: [
            {
              ownerId: userId,
            },
            {
              members: {
                some: {
                  userId,
                },
              },
            },
          ],
        },
      });
    }

    switch (role) {
      case Role.Member: {
        if (!channel) {
          return false;
        }
        return true;
      }
      case Role.Admin: {
        if (!channel) {
          return false;
        } else if (
          channel.members.some((m) => m.role === ChannelRole.ADMIN) ||
          userId === channel.ownerId
        ) {
          return true;
        }
        return false;
      }
      case Role.Owner: {
        if (!channel) {
          return false;
        } else if (channel.ownerId === userId) {
          return true;
        }
        return false;
      }
      default:
        return true;
    }
  }
}
