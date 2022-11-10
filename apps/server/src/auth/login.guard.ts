import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class LoginGuard extends AuthGuard("auth") {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    try {
      const result = (await super.canActivate(context)) as boolean;
      await super.logIn(request);
      return result;
    } catch (error) {
      request.session.destroy();
      throw new UnauthorizedException();
    }
  }
}
