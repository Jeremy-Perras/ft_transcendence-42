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

    const blocked = await this.prisma.user.findFirst({
      select: {
        blockedBy: {
          where: {
            id: targetUserId,
          },
        },
        blocking: {
          where: {
            id: targetUserId,
          },
        },
      },
      where: {
        id: userId,
      },
    });

    if (blocked?.blockedBy && blocked.blockedBy.length > 0) {
      throw new ForbiddenException("You are blocked by this user");
    }

    if (blocked?.blocking && blocked.blocking.length > 0) {
      throw new ForbiddenException("You are blocking this user");
    }

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

    const friend = await this.prisma.user.findUnique({
      select: {
        friendedBy: {
          where: {
            id: targetUserId,
          },
        },
        friends: {
          where: {
            id: targetUserId,
          },
        },
      },
      where: { id: userId },
    });
    console.log("friendBy", friend?.friendedBy, "friend", friend?.friends);
    if (
      (friend?.friendedBy && friend.friendedBy.length === 0) ||
      (friend?.friends && friend.friends.length === 0)
    ) {
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

@Injectable()
export class ExistingMessageGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const targetMessageId = ctx.getArgs<{ messageId: number }>().messageId;
    const message = await this.prisma.directMessage.findUnique({
      where: { id: targetMessageId },
    });
    if (!message) {
      throw new NotFoundException("Message not found");
    }
    return false;
  }
}
