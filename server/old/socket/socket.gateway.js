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
exports.SocketGateway = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const socket_service_1 = require("./socket.service");
let SocketGateway = class SocketGateway {
    socketService;
    constructor(socketService) {
        this.socketService = socketService;
    }
    server;
    onModuleInit() {
        this.server.on("connection", (socket) => {
            const [socketId, userId] = socket.rooms;
        });
    }
    handleConnection(client, ...args) {
        client.join(client.request.session.passport.user.toString());
    }
    handleEvent(client, data) {
        return data;
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], SocketGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)("event"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", String)
], SocketGateway.prototype, "handleEvent", null);
SocketGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: "*" }),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => socket_service_1.SocketService))),
    __metadata("design:paramtypes", [socket_service_1.SocketService])
], SocketGateway);
exports.SocketGateway = SocketGateway;
//# sourceMappingURL=socket.gateway.js.map