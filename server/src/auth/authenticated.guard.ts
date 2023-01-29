import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import AuthenticatedRequest from "./authenticatedRequest.interface";

const canActivate = (request: AuthenticatedRequest) => {
  if (request.isAuthenticated()) {
    const user = request.user;
    if (user.twoFactorVerified === false) {
      return false;
    } else {
      return true;
    }
  }
  return false;
};

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request: AuthenticatedRequest = context.switchToHttp().getRequest();
    return canActivate(request);
  }
}

@Injectable()
export class GqlAuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request: AuthenticatedRequest = this.getRequest(context);
    return canActivate(request);
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
