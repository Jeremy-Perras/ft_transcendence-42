import { Server, Socket } from "socket.io";
import { SocketService } from "./socket.service";
export declare class SocketGateway {
    private socketService;
    constructor(socketService: SocketService);
    server: Server;
    onModuleInit(): void;
    handleConnection(client: Socket, ...args: any[]): void;
    handleEvent(client: Socket, data: string): string;
}
