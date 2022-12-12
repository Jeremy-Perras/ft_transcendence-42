import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { UserInputError } from "apollo-server-express";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class SelfGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const userId = +ctx.getContext().req.user;
    const targetUserId = ctx.getArgs<{ userId: number }>().userId;
    if (userId === targetUserId) {
      throw new UserInputError("You cannot do this action to yourself");
    }
    return true;
  }
}

@Injectable()
export class BlockGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const userId = +ctx.getContext().req.user;
    const targetUserId = ctx.getArgs<{ userId: number }>().userId;

    const blocked = await this.prisma.userBlocking.findMany({
      where: {
        OR: [
          {
            blockeeId: userId,
            blockerId: targetUserId,
          },
          {
            blockeeId: targetUserId,
            blockerId: userId,
          },
        ],
      },
    });

    blocked.forEach((block) => {
      if (block.blockerId === userId) {
        throw new ForbiddenException("You are blocking this user");
      }
      if (block.blockerId === userId) {
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
    const userId = +ctx.getContext().req.user;
    const targetUserId = ctx.getArgs<{ userId: number }>().userId;

    const friendship = await this.prisma.userFriends.findMany({
      where: {
        OR: [
          {
            inviteeId: userId,
            inviterId: targetUserId,
          },
          {
            inviteeId: targetUserId,
            inviterId: userId,
          },
        ],
      },
    });

    if (friendship.length === 0) {
      throw new ForbiddenException("You are not friends with this user");
    }

    return true;
  }
}

@Injectable()
export class ExistingUserGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const targetUserId = ctx.getArgs<{ userId: number }>().userId;

    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return true;
  }
}
