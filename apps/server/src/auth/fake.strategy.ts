import { Strategy } from "passport-custom";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Injectable()
export class FakeStrategy extends PassportStrategy(Strategy, "fake") {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(): Promise<any> {
    const user = await this.authService.getFirstUser();
    return user;
  }
}
