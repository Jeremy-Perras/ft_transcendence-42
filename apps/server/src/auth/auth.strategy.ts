import { Strategy } from "passport-custom";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Request } from "express";

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy, "auth") {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(req: Request): Promise<number | undefined> {
    const user = await this.authService.getUserById(+req.body.id);
    return user?.id;
  }
}
