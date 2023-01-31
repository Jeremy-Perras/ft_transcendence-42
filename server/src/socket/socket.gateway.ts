import { OnModuleInit } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets";
import { GameService, playerMove } from "../game/game.service";
import { Server, Socket } from "socket.io";
import { UserStatus } from "../user/user.model";

@WebSocketGateway({ cors: "*", transports: ["websocket"] })
export class SocketGateway implements OnModuleInit {
  constructor(
    private eventEmitter: EventEmitter2,
    private gameService: GameService
  ) {}

  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<number, string> = new Map();
  private gameInProgress = new Map<number, NodeJS.Timer>();

  public clearGameIntervall(id: number) {
    const interval = this.gameInProgress.get(id);
    clearInterval(interval);
  }

  public eraseGameInProgress(id: number) {
    const interval = this.gameInProgress.get(id);
    clearInterval(interval);
    this.gameInProgress.delete(id);
  }

  public getUserSocket(id: number) {
    return this.connectedUsers.get(id);
  }

  public launchGame(gameId: number) {
    const callback = () => {
      const gameData = this.gameService.games.get(gameId);
      if (gameData) {
        this.gameService.movePads(gameId);
        if (gameData?.game.type !== "GIFT") {
          this.gameService.moveBall(gameId);
        }
        if (gameData?.game.type === "GIFT") {
          this.gameService.moveGift(gameId);
          this.gameService.moveBallGift(gameId);
        }
        const dataToEmit = {
          id: gameData.id,
          player1: {
            id: gameData.player1.id,
            coord: gameData.player1.coord,
            score: gameData.player1.score,
            move: gameData.player1.playerMove,
            lastMoveTimestamp: gameData.player1.lastMoveTimestamp,
          },
          player2: {
            id: gameData.player2.id,
            coord: gameData.player2.coord,
            score: gameData.player2.score,
            move: gameData.player2.playerMove,
            lastMoveTimestamp: gameData.player2.lastMoveTimestamp,
          },
          ball: gameData.ball,
          game: gameData.game,
        };
        this.server.emit(`Game_${gameId}`, dataToEmit);
        gameData.player2.lastMoveTimestamp = 0;
        gameData.player1.lastMoveTimestamp = 0;
      }
    };
    this.gameInProgress.set(gameId, setInterval(callback, 100));
  }

  onModuleInit() {
    this.server.on("connection", (client) => {
      client.on("getstatus", (callback) => {
        const userSession = client.request.session.passport.user;
        const user = this.connectedUsers.get(userSession.id);
        if (!user) {
          callback({
            status: "ok",
          });
          this.connectedUsers.set(userSession.id, client.id);
          this.eventEmitter.emit("user.connection", userSession.id);
        } else {
          callback({
            status: "You are already connected on another device",
          });
        }
      });
    });
  }

  handleDisconnect(client: Socket) {
    const userSession = client.request.session.passport.user;
    const user = this.connectedUsers.get(userSession.id);
    if (user && user === client.id) {
      this.connectedUsers.delete(userSession.id);
    }
    this.eventEmitter.emit("user.disconnect", userSession.id);
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

  userStatus(userId: number) {
    const player = this.gameService.getPlayer(userId);
    if (player) {
      if (player.getSnapshot().matches("_.playing")) {
        return UserStatus.PLAYING;
      }
    }
    return this.isOnline(userId) ? UserStatus.ONLINE : UserStatus.OFFLINE;
  }

  @SubscribeMessage("movePadUp")
  async onMovePadUp(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    { gameId, timestamp }: { gameId: number; timestamp: number }
  ) {
    const userSession = client.request.session.passport.user;
    this.gameService.playerMove(
      playerMove.UP,
      userSession.id,
      gameId,
      timestamp
    );
  }

  @SubscribeMessage("movePadDown")
  async onMovePadDown(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    { gameId, timestamp }: { gameId: number; timestamp: number }
  ) {
    const userSession = client.request.session.passport.user;
    this.gameService.playerMove(
      playerMove.DOWN,
      userSession.id,
      gameId,
      timestamp
    );
  }

  @SubscribeMessage("stopPad")
  async onstopPad(
    @ConnectedSocket() client: Socket,
    @MessageBody() { gameId, timestamp }: { gameId: number; timestamp: number }
  ) {
    const userSession = client.request.session.passport.user;
    this.gameService.playerMove(
      playerMove.STILL,
      userSession.id,
      gameId,
      timestamp
    );
  }

  @SubscribeMessage("boostActivated")
  async onBoostActivated(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    gameId: number
  ) {
    const userSession = client.request.session.passport.user;
    this.gameService.handleBoostOn(gameId, userSession.id);
  }

  @SubscribeMessage("boostDeactivated")
  async onBoostDeactivated(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    gameId: number
  ) {
    const userSession = client.request.session.passport.user;
    this.gameService.handleBoostOff(gameId, userSession.id);
  }

  @SubscribeMessage("watchLive")
  async onWatchLive(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    gameId: number
  ) {
    client.emit("gameStarting", { gameId: gameId });
  }
}
