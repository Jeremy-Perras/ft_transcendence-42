import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { UserService } from "./user.service";

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private userService: UserService) {}
  async canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const userId = ctx.getContext().req.user;
    const friendId = ctx.getContext().req.body.variables.recipientId;
    const user = await this.userService.getUserById(userId);
    if (user) {
      return user.blockedBy.some((f) => f.id === friendId) ? false : true;
    }
    return false;
  }
}
