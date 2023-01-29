import {
  Controller,
  UseGuards,
  Get,
  Req,
  Redirect,
  Post,
  Body,
  UnauthorizedException,
} from "@nestjs/common";
import { authenticator } from "otplib";
import { UserService } from "../user/user.service";
import { AuthenticatedGuard } from "./authenticated.guard";
import AuthenticatedRequest from "./authenticatedRequest.interface";
import { LoginGuard } from "./login.guard";

@Controller("/auth")
export class AuthController {
  constructor(private userService: UserService) {}

  @UseGuards(LoginGuard)
  @Get("/callback")
  @Redirect(
    process.env.NODE_ENV === "production" ? "/" : "http://localhost:5173",
    301
  )
  callback(): void {
    return;
  }

  @Post("/verify-otp")
  async otp(@Req() req: AuthenticatedRequest, @Body("token") token: string) {
    const secret = await this.userService.getUser2FASecret(req.user.id);
    if (secret && authenticator.check(token, secret)) {
      req.user.twoFactorVerified = true;
      return "ok";
    }
    throw new UnauthorizedException();
  }

  @Get("/session")
  session(@Req() req: AuthenticatedRequest) {
    if (!req.user) throw new UnauthorizedException();
    return req.user;
  }

  @UseGuards(AuthenticatedGuard)
  @Get("/logout")
  async logout(@Req() req: AuthenticatedRequest) {
    req.session.destroy(() => {
      return "ok";
    });
  }
}
