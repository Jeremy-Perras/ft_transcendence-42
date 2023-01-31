import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Strategy } from "passport-oauth2";
import { PassportStrategy } from "@nestjs/passport";
import { UserService } from "../user/user.service";
import UserSession from "./userSession.model";
import { Response } from "express";

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy, "auth") {
  constructor(private userService: UserService) {
    super({
      authorizationURL: "https://api.intra.42.fr/oauth/authorize",
      tokenURL: "https://api.intra.42.fr/oauth/token",
      callbackURL: process.env.PUBLIC_OAUTH42_CALLBACK_URL,
      clientID: process.env.PUBLIC_OAUTH42_CLIENT_ID,
      clientSecret: process.env.OAUTH42_CLIENT_SECRET,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: unknown,
    cb: (
      err: { message: string; data: unknown } | null,
      user?: UserSession
    ) => void
  ) {
    const user = await this.userService.getOrCreateUser(accessToken);
    if (typeof user === "object") {
      cb(null, user);
    } else if (typeof user === "number") {
      cb({ message: "createNewAccount", data: user });
    } else {
      cb({ message: "error", data: null });
    }
  }
}

@Injectable()
export class LoginGuard extends AuthGuard("auth") {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    try {
      const result = (await super.canActivate(context)) as boolean;
      await super.logIn(request);
      return result;
    } catch (error: any) {
      request.session.destroy();
      const response: Response = context.switchToHttp().getResponse();
      if (error && error.message === "createNewAccount") {
        const signup = `signup?id=${error.data}`;
        response.redirect(
          process.env.NODE_ENV === "production"
            ? `/${signup}`
            : `http://${process.env.IP}:5173/${signup}`
        );
      } else {
        response.redirect(
          process.env.NODE_ENV === "production"
            ? "/"
            : `http://${process.env.IP}:5173`
        );
      }
      return false;
    }
  }
}
