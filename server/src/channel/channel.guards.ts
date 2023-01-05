import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ExistingChannelGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const channelId = ctx.getArgs<{ id: number }>().id;

    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
    });
    if (!channel) {
      throw new NotFoundException("Channel not found");
    }

    return true;
  }
}

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { id, userId } = ctx.getArgs<{
      id: number;
      userId: number;
    }>();

    const channel = await this.prisma.channel.findUnique({
      select: {
        ownerId: true,
      },
      where: { id: id },
    });

    if (!channel) {
      throw new NotFoundException("Channel not found");
    }

    if (channel.ownerId === userId) {
      throw new ForbiddenException(
        "This action is not allowed on the channel's owner"
      );
    }

    return true;
  }
}
