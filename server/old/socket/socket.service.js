"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const shared_1 = require("@apps/shared");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../src/prisma/prisma.service");
const socket_gateway_1 = require("./socket.gateway");
let SocketService = class SocketService {
    socketGateway;
    prismaService;
    constructor(socketGateway, prismaService) {
        this.socketGateway = socketGateway;
        this.prismaService = prismaService;
    }
    emitInvalidateCache(cacheTarget, ids, targetId) {
        ids.forEach((id) => {
            this.socketGateway.server
                .to(id.toString())
                .emit("invalidateCache", { cacheTarget, targetId });
        });
        return;
    }
    isUserConnected(userId) {
        const rooms = this.socketGateway.server.sockets.adapter.rooms;
        return !!rooms.get(userId.toString());
    }
    async onDisconnected(userId) {
        const friends = await this.prismaService.user.findUnique({
            select: { friends: { select: { id: true } } },
            where: { id: userId },
        });
        if (friends) {
            this.emitInvalidateCache(shared_1.InvalidCacheTarget.LOGOUT, friends?.friends.map((u) => u.id), userId);
        }
    }
};
SocketService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => socket_gateway_1.SocketGateway))),
    __metadata("design:paramtypes", [socket_gateway_1.SocketGateway,
        prisma_service_1.PrismaService])
], SocketService);
exports.SocketService = SocketService;
//# sourceMappingURL=socket.service.js.map