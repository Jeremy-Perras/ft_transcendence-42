import {
  Controller,
  UseGuards,
  Get,
  Req,
  Redirect,
  Post,
  Body,
  UnauthorizedException,
  Query,
  BadRequestException,
} from "@nestjs/common";
import { Length, Matches, Min } from "class-validator";
import { authenticator } from "otplib";
import { UserService } from "../user/user.service";
import { AuthenticatedGuard } from "./authenticated.guard";
import AuthenticatedRequest from "./authenticatedRequest.interface";
import { LoginGuard } from "./login.guard";

class TokenValidation {
  @Matches(/[0-9]{6}/)
  token: string;
}

class IdValidation {
  @Min(0)
  id: number;
}

class UserValidation extends IdValidation {
  @Length(1, 50)
  name: string;
}

@Controller("/auth")
export class AuthController {
  constructor(private userService: UserService) {}

  @UseGuards(LoginGuard)
  @Get("/callback")
  @Redirect(
    process.env.NODE_ENV === "production"
      ? "/"
      : `http://${process.env.IP}:5173`,
    301
  )
  callback(): void {
    return;
  }

  @Post("/verify-otp")
  async otp(@Req() req: AuthenticatedRequest, @Body() body: TokenValidation) {
    const secret = await this.userService.getUser2FASecret(req.user.id);
    if (secret && authenticator.check(body.token, secret)) {
      req.user.twoFactorVerified = true;
      return "ok";
    }
    throw new UnauthorizedException();
  }

  @Get("/signup")
  getSignupInfo(@Query() body: IdValidation) {
    const user = this.userService.getNewAccountInfo(body.id);
    if (user) return user;
    throw new BadRequestException();
  }

  @Post("/signup")
  async createAccount(@Body() body: UserValidation) {
    const account = await this.userService.validateNewAccount(
      body.id,
      body.name
    );
    if (typeof account === "object") {
      return "ok";
    } else {
      throw new BadRequestException(account);
    }
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
