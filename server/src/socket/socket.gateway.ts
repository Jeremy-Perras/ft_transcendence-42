import { OnModuleInit } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets";
import { GameService, playerMove } from "../game/game.service";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ cors: "*", transports: ["websocket"] })
export class SocketGateway implements OnModuleInit {
  constructor(
    private eventEmitter: EventEmitter2,
    private gameService: GameService
  ) {}
  // private handleKey: Map<number, valueHandleKeysPlayer> = new Map();

  // private handleKey: Map<number, valueHandleKeys> = new Map();
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<number, string> = new Map();
  public gameInProgress = new Map<number, NodeJS.Timer>(); // TODO to private

  public getUserSocket(id: number) {
    return this.connectedUsers.get(id);
  }

  public launchGame(gameId: number) {
    const callback = () => {
      const gameData = this.gameService.games.get(gameId);
      this.gameService.MoveLeftPad(gameId);
      this.gameService.MoveRightPad(gameId);
      this.gameService.MoveBall(gameId);
      this.server.emit(`Game_${gameId}`, gameData);
    };
    this.gameInProgress.set(gameId, setInterval(callback, 100));
  }

  onModuleInit() {
    this.server.on("connection", (client) => {
      client.on("getstatus", (callback) => {
        const userId = client.request.session.passport.user;
        const user = this.connectedUsers.get(userId);
        if (!user) {
          callback({
            status: "ok",
          });
          this.connectedUsers.set(userId, client.id);
          this.eventEmitter.emit("user.connection", userId);
        } else {
          callback({
            status: "You are already connected on another device",
          });
        }
      });
    });
  }

  handleDisconnect(client: Socket) {
    const userId = client.request.session.passport.user;
    const user = this.connectedUsers.get(userId);
    if (user && user === client.id) {
      this.connectedUsers.delete(userId);
    }
    this.eventEmitter.emit("user.disconnect", userId);
  }

  sendToUser(userId: number, event: string, data: unknown) {
    const user = this.connectedUsers.get(userId);
    if (user) {
      this.server.to(user).emit(event, data);
    }
  }

  isOnline(userId: number) {
    return this.connectedUsers.has(userId);
  }

  @SubscribeMessage("movePadUp")
  async onMovePadUp(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    gameId: number
  ) {
    const currentUserId = client.request.session.passport.user;
    this.gameService.playerMove(playerMove.UP, currentUserId, gameId);
  }
  //["gameId" : {player1 : {x, y, currentMove, score}, player2 : {x,y,currentMove,score}, }]
  @SubscribeMessage("movePadDown")
  async onMovePadDown(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    gameId: number
  ) {
    const currentUserId = client.request.session.passport.user;
    this.gameService.playerMove(playerMove.DOWN, currentUserId, gameId);
  }

  @SubscribeMessage("stopPad")
  async onstopPad(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    gameId: number
  ) {
    const currentUserId = client.request.session.passport.user;
    this.gameService.playerMove(playerMove.STILL, currentUserId, gameId);
  }

  @SubscribeMessage("boostActivated")
  async onBoostActivated(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    gameId: number
  ) {
    const currentUserId = client.request.session.passport.user;
    this.gameService.handleBoostOn(gameId, currentUserId);
  }

  @SubscribeMessage("boostDeactivated")
  async onBoostDeactivated(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    gameId: number
  ) {
    const currentUserId = client.request.session.passport.user;
    this.gameService.handleBoostOff(gameId, currentUserId);
  }

  @SubscribeMessage("handleKey")
  async onHandleKey(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    gameId: number
  ) {
    const currentUserId = client.request.session.passport.user;
  }
}
