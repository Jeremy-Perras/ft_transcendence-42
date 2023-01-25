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
        // console.log("player 1 : ", gameData.player1.playerMove);
        // console.log("player 2 : ", gameData.player2.playerMove);

        this.gameService.MovePads(gameId);
        this.gameService.MoveBall(gameId);
        if (gameData?.game.type === "GIFT") {
          this.gameService.moveGift(gameId);
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
    { gameId, timestamp }: { gameId: number; timestamp: number }
  ) {
    const currentUserId = client.request.session.passport.user;
    this.gameService.playerMove(
      playerMove.UP,
      currentUserId,
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
    const currentUserId = client.request.session.passport.user;
    this.gameService.playerMove(
      playerMove.DOWN,
      currentUserId,
      gameId,
      timestamp
    );
  }

  @SubscribeMessage("stopPad")
  async onstopPad(
    @ConnectedSocket() client: Socket,
    @MessageBody() { gameId, timestamp }: { gameId: number; timestamp: number }
  ) {
    const currentUserId = client.request.session.passport.user;
    this.gameService.playerMove(
      playerMove.STILL,
      currentUserId,
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

  @SubscribeMessage("watchLive")
  async onWatchLive(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    gameId: number
  ) {
    client.emit("gameStarting", { gameId: gameId });
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
