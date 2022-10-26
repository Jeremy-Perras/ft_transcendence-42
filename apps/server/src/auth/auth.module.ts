import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthService } from "./auth.service";
import { FakeStrategy } from "./fake.strategy";

@Module({
  imports: [PassportModule, PrismaModule],
  providers: [AuthService, FakeStrategy],
})
export class AuthModule {}
