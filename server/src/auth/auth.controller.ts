import {
  Controller,
  UseGuards,
  Body,
  Post,
  UnauthorizedException,
  Get,
  Redirect,
  Request,
} from "@nestjs/common";
import { Request as RequestExpress } from "express";
import { AuthenticatedGuard } from "./authenticated.guard";
import { LoginGuard } from "./login.guard";

@Controller("/auth")
export class AuthController {
  @Get("/login") // TODO: 42 oauth
  loginRedirect(): string {
    return `
    <html>
    <body style="height: 100vh; margin: 0;">
    <div style="height: 100%; flex: 1; display: flex; justify-content: center; align-items: center;">
    <form action="/auth/callback" method="post">
      <label for="id">user id:</label>
      <input type="number" id="id" name="id">
      <input type="submit" value="Submit">
    </form> 
    </div>
    </body>
    </html>
    `;
  }

  @UseGuards(LoginGuard)
  @Post("/callback")
  @Redirect("http://localhost:5173", 301)
  callback(@Body("id") userId: number): void {
    if (!userId) {
      throw new UnauthorizedException();
    }
  }

  @UseGuards(AuthenticatedGuard)
  @Get("/session")
  session(@Request() req: RequestExpress) {
    return { userId: req.session.passport.user };
  }

  @UseGuards(AuthenticatedGuard)
  @Get("/logout")
  logout(@Request() req: RequestExpress): string {
    req.session.destroy(() => {
      return;
    });
    return "ok";
  }
}
