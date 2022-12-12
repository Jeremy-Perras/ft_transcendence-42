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
var AuthService_1, LogOutService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogOutService = exports.AuthService = void 0;
const shared_1 = require("@apps/shared");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const socket_service_1 = require("../../old/socket/socket.service");
let AuthService = AuthService_1 = class AuthService {
    prismaService;
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    logger = new common_1.Logger(AuthService_1.name);
    async getUserById(userId) {
        try {
            const user = await this.prismaService.user.findFirst({
                where: { id: userId },
            });
            return user;
        }
        catch (error) {
            this.logger.debug(error);
        }
    }
};
AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], AuthService);
exports.AuthService = AuthService;
let LogOutService = LogOutService_1 = class LogOutService {
    prismaService;
    socketService;
    constructor(prismaService, socketService) {
        this.prismaService = prismaService;
        this.socketService = socketService;
    }
    logger = new common_1.Logger(LogOutService_1.name);
    async getUserById(userId) {
        try {
            const users = await this.prismaService.user.findFirst({
                select: { friends: { select: { id: true } } },
                where: { id: userId },
            });
            if (users) {
                this.socketService.emitInvalidateCache(shared_1.InvalidCacheTarget.LOGOUT, users?.friends.map((u) => u.id), userId);
            }
        }
        catch (error) {
            this.logger.debug(error);
        }
    }
};
LogOutService = LogOutService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_b = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _b : Object, socket_service_1.SocketService])
], LogOutService);
exports.LogOutService = LogOutService;
//# sourceMappingURL=auth.service.js.map