import { PrismaService } from "../prisma/prisma.service";
import { SocketService } from "../../old/socket/socket.service";
export declare class AuthService {
    private prismaService;
    constructor(prismaService: PrismaService);
    private readonly logger;
    getUserById(userId: number): Promise<any>;
}
export declare class LogOutService {
    private prismaService;
    private socketService;
    constructor(prismaService: PrismaService, socketService: SocketService);
    private readonly logger;
    getUserById(userId: number): Promise<void>;
}
