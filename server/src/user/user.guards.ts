import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import UserSession from "../auth/userSession.model";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class SelfGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const userSession: UserSession = ctx.getContext().req.user;
    const targetUserId = ctx.getArgs<{ userId: number }>().userId;
    if (userSession.id === targetUserId) {
      throw new UnauthorizedException("You cannot do this action to yourself");
    }
    return true;
  }
}

@Injectable()
export class BlockGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const userSession: UserSession = ctx.getContext().req.user;
    const targetUserId = ctx.getArgs<{ userId: number }>().userId;

    const blocked = await this.prisma.userBlock.findMany({
      where: {
        OR: [
          {
            blockeeId: userSession.id,
            blockerId: targetUserId,
          },
          {
            blockeeId: targetUserId,
            blockerId: userSession.id,
          },
        ],
      },
    });

    blocked.forEach((block) => {
      if (block.blockerId === userSession.id) {
        throw new ForbiddenException("You are blocking this user");
      }
      if (block.blockeeId === userSession.id) {
        throw new ForbiddenException("You are blocked by this user");
      }
    });

    return true;
  }
}

@Injectable()
export class FriendGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const userSession: UserSession = ctx.getContext().req.user;
    const targetUserId = ctx.getArgs<{ userId: number }>().userId;

    const friendship = await this.prisma.friendRequest.findMany({
      where: {
        OR: [
          {
            senderId: userSession.id,
            receiverId: targetUserId,
          },
          {
            senderId: targetUserId,
            receiverId: userSession.id,
          },
        ],
      },
    });

    if (friendship.length !== 2) {
      throw new ForbiddenException("You are not friends with this user");
    }

    return true;
  }
}
