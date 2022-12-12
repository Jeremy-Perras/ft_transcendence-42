import { InvalidCacheTarget } from "@apps/shared";
import { PrismaService } from "../../src/prisma/prisma.service";
import { SocketGateway } from "./socket.gateway";
export declare class SocketService {
    private socketGateway;
    private prismaService;
    constructor(socketGateway: SocketGateway, prismaService: PrismaService);
    emitInvalidateCache(cacheTarget: InvalidCacheTarget, ids: number[], targetId: number): void;
    isUserConnected(userId: number): boolean;
    onDisconnected(userId: number): Promise<void>;
}
