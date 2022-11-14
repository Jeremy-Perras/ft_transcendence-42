import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Request,
  UseGuards,
} from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { ChannelService } from "./channel.service";

@Injectable()
export class BanRoleGuard implements CanActivate {
  constructor(private channelService: ChannelService) {}
  async canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const userId = ctx.getContext().req.user;
    const channelId = ctx.getContext().req.body.variables.idchannel;
    if (userId) {
      const channel = await this.channelService.getChannelById(channelId);
      return channel?.banned.some((ban) => ban.userId === userId)
        ? false
        : true;
    }
    return false;
  }
}
@Injectable()
@UseGuards(BanRoleGuard)
export class AdminRoleGuard implements CanActivate {
  constructor(private channelService: ChannelService) {}
  async canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const userId = ctx.getContext().req.user;
    const channelId = ctx.getContext().req.body.variables.idchannel;
    if (userId) {
      const channel = await this.channelService.getChannelById(channelId);
      return channel?.admins.some((admin) => admin.userId === userId)
        ? true
        : false;
    }
    return false;
  }
}

@Injectable()
@UseGuards(BanRoleGuard)
export class OwnerRoleGuard implements CanActivate {
  constructor(private channelService: ChannelService) {}
  async canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const userId = ctx.getContext().req.user;
    const channelId = ctx.getContext().req.body.variables.idchannel;
    if (userId) {
      const channel = await this.channelService.getChannelById(channelId);
      return channel?.owner.id === userId ? true : false;
    }
    return false;
  }
}

@Injectable()
@UseGuards(BanRoleGuard)
export class OwnerOrAdminRoleGuard implements CanActivate {
  constructor(private channelService: ChannelService) {}
  async canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const userId = ctx.getContext().req.user;
    const channelId = ctx.getContext().req.body.variables.idchannel;
    if (userId) {
      const channel = await this.channelService.getChannelById(channelId);
      return channel?.admins.some((admin) => admin.userId === userId)
        ? true
        : channel?.owner.id === userId
        ? true
        : false;
    }
    return false;
  }
}
