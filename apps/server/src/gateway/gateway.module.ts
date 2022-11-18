import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { MyGateway } from "./gateway";
import { GatewayService } from "./gateway.service";

@Module({ imports: [PrismaModule], providers: [GatewayService, MyGateway] })
export class GatewayModule {}
