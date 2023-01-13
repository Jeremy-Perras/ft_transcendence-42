import { EventEmitter2 } from "@nestjs/event-emitter";
import { waitFor } from "xstate/lib/waitFor";
import { GameService } from "../src/game/game.service";
import { PrismaService } from "../src/prisma/prisma.service";
import { SocketGateway } from "../src/socket/socket.gateway";

describe("player", () => {
  const prismaService = new PrismaService();
  let socketGateway: SocketGateway;
  let gameService: GameService;

  beforeEach(() => {
    socketGateway = new SocketGateway(new EventEmitter2());
    gameService = new GameService(prismaService, socketGateway);
  });

  it("should send invite to idle user", async () => {
    const player1Id = 1;
    const player2Id = 2;
    const gameMode = "CLASSIC";

    jest
      .spyOn(socketGateway, "isOnline")
      .mockImplementation((userId: number) => true);

    const player1 = gameService.getPlayer(player1Id);
    expect(player1).not.toBeNull();

    {
      const wait = waitFor(
        player1!,
        (state) => state.matches("_.waitingForInvitee"),
        {
          timeout: 2000,
        }
      );
      player1!.send({ type: "INVITE", inviteeId: player2Id, gameMode });
      await expect(wait).resolves.not.toThrow();
    }
  });

  it("should not send invite to offline user", async () => {
    const player1Id = 1;
    const player2Id = 2;
    const gameMode = "CLASSIC";

    jest
      .spyOn(socketGateway, "isOnline")
      .mockImplementation((userId: number) => {
        if (userId === player1Id) return true;
        else return false;
      });

    const player1 = gameService.getPlayer(player1Id);
    expect(player1).not.toBeNull();

    {
      const wait = waitFor(
        player1!,
        (state) => state.matches("_.waitingForInvitee"),
        {
          timeout: 2000,
        }
      );
      player1!.send({ type: "INVITE", inviteeId: player2Id, gameMode });
      await expect(wait).rejects.toThrow();
    }
  });

  it("should not send invite to user waiting for someone", async () => {
    const player1Id = 1;
    const player2Id = 2;
    const player3Id = 3;
    const gameMode = "CLASSIC";

    jest
      .spyOn(socketGateway, "isOnline")
      .mockImplementation((userId: number) => true);

    const player1 = gameService.getPlayer(player1Id);
    expect(player1).not.toBeNull();

    const player2 = gameService.getPlayer(player2Id);
    expect(player2).not.toBeNull();

    {
      const wait = waitFor(
        player2!,
        (state) => state.matches("_.waitingForInvitee"),
        {
          timeout: 2000,
        }
      );
      player2!.send({ type: "INVITE", inviteeId: player3Id, gameMode });
      await expect(wait).resolves.not.toThrow();
    }

    {
      const wait = waitFor(
        player1!,
        (state) => state.matches("_.waitingForInvitee"),
        {
          timeout: 2000,
        }
      );
      player1!.send({ type: "INVITE", inviteeId: player2Id, gameMode });
      await expect(wait).rejects.toThrow();
    }
  });

  it("should accept invitation", async () => {
    const player1Id = 1;
    const player2Id = 2;
    const gameMode = "CLASSIC";

    jest
      .spyOn(socketGateway, "isOnline")
      .mockImplementation((userId: number) => true);

    const player1 = gameService.getPlayer(player1Id);
    expect(player1).not.toBeNull();
    const player2 = gameService.getPlayer(player2Id);
    expect(player2).not.toBeNull();

    {
      const wait = waitFor(
        player1!,
        (state) => state.matches("_.waitingForInvitee"),
        {
          timeout: 2000,
        }
      );
      player1!.send({ type: "INVITE", inviteeId: player2Id, gameMode });
      await expect(wait).resolves.not.toThrow();
    }

    {
      const wait = waitFor(player2!, (state) => state.matches("_.playing"), {
        timeout: 2000,
      });
      player2!.send({
        type: "ACCEPT_INVITATION",
        inviterId: player1Id,
      });
      await expect(wait).resolves.not.toThrow();
    }

    {
      const wait = waitFor(player1!, (state) => state.matches("_.playing"), {
        timeout: 2000,
      });
      await expect(wait).resolves.not.toThrow();
    }
  });

  it("should refuse invitation", async () => {
    const player1Id = 1;
    const player2Id = 2;
    const gameMode = "CLASSIC";

    jest
      .spyOn(socketGateway, "isOnline")
      .mockImplementation((userId: number) => true);

    const player1 = gameService.getPlayer(player1Id);
    expect(player1).not.toBeNull();
    const player2 = gameService.getPlayer(player2Id);
    expect(player2).not.toBeNull();

    {
      const wait = waitFor(
        player1!,
        (state) => state.matches("_.waitingForInvitee"),
        {
          timeout: 2000,
        }
      );
      player1!.send({ type: "INVITE", inviteeId: player2Id, gameMode });
      await expect(wait).resolves.not.toThrow();
    }

    {
      const wait = waitFor(player2!, (state) => state.matches("_.idle"), {
        timeout: 2000,
      });
      player2!.send({
        type: "REFUSE_INVITATION",
        inviterId: player1Id,
      });
      await expect(wait).resolves.not.toThrow();
    }

    {
      const wait = waitFor(player1!, (state) => state.matches("_.idle"), {
        timeout: 2000,
      });
      await expect(wait).resolves.not.toThrow();
    }
  });

  it("should cancel the invitation", async () => {
    const player1Id = 1;
    const player2Id = 2;
    const gameMode = "CLASSIC";

    jest
      .spyOn(socketGateway, "isOnline")
      .mockImplementation((userId: number) => true);

    const player1 = gameService.getPlayer(player1Id);
    expect(player1).not.toBeNull();
    const player2 = gameService.getPlayer(player2Id);
    expect(player2).not.toBeNull();

    {
      const wait = waitFor(
        player1!,
        (state) => state.matches("_.waitingForInvitee"),
        {
          timeout: 2000,
        }
      );
      player1!.send({ type: "INVITE", inviteeId: player2Id, gameMode });
      await expect(wait).resolves.not.toThrow();
    }

    {
      const wait = waitFor(
        player2!,
        (state) => state.context.invitations.has(player1Id),
        { timeout: 2000 }
      );
      await expect(wait).resolves.not.toThrow();
    }

    {
      const wait = waitFor(player1!, (state) => state.matches("_.idle"), {
        timeout: 2000,
      });
      player1!.send({
        type: "CANCEL_INVITATION",
      });
      await expect(wait).resolves.not.toThrow();
    }

    {
      const wait = waitFor(
        player2!,
        (state) => !state.context.invitations.has(player1Id),
        { timeout: 2000 }
      );
      await expect(wait).resolves.not.toThrow();
    }
  });

  it("should not accept the invitation if sender is no longer available", async () => {
    const player1Id = 1;
    const player2Id = 2;
    const gameMode = "CLASSIC";

    jest
      .spyOn(socketGateway, "isOnline")
      .mockImplementation((userId: number) => true);

    let player1 = gameService.getPlayer(player1Id);
    expect(player1).not.toBeNull();
    const player2 = gameService.getPlayer(player2Id);
    expect(player2).not.toBeNull();

    {
      const wait = waitFor(
        player1!,
        (state) => state.matches("_.waitingForInvitee"),
        {
          timeout: 2000,
        }
      );
      player1!.send({ type: "INVITE", inviteeId: player2Id, gameMode });
      await expect(wait).resolves.not.toThrow();
    }

    gameService.removePlayer(player1Id);
    player1 = gameService.getPlayer(player1Id);
    expect(player1).not.toBeNull();

    {
      const wait = waitFor(
        player2!,
        (state) =>
          !state.context.invitations.has(player1Id) && state.matches("_.idle"),
        {
          timeout: 2000,
        }
      );
      player2!.send({
        type: "ACCEPT_INVITATION",
        inviterId: player1Id,
      });
      await expect(wait).resolves.not.toThrow();
    }

    {
      const wait = waitFor(player1!, (state) => state.matches("_.idle"), {
        timeout: 2000,
      });
      await expect(wait).resolves.not.toThrow();
    }
  });

  it("should join the matchmaking", async () => {
    const player1Id = 1;
    const gameMode = "CLASSIC";

    jest
      .spyOn(socketGateway, "isOnline")
      .mockImplementation((userId: number) => true);

    const player1 = gameService.getPlayer(player1Id);
    expect(player1).not.toBeNull();

    {
      const wait = waitFor(player1!, (state) => state.matches("_.idle"), {
        timeout: 2000,
      });
      player1!.send({
        type: "JOIN_MATCHMAKING",
        gameMode,
      });
      await expect(wait).resolves.not.toThrow();
    }

    {
      const wait = waitFor(
        player1!,
        (state) => state.matches("_.waitingForMatchmaking"),
        { timeout: 2000 }
      );
      await expect(wait).resolves.not.toThrow();
    }

    expect(gameService.matchmakingRooms.CLASSIC.has(player1Id)).toBe(true);
  });

  it("should remove from matchmaking if accept invite", async () => {
    const player1Id = 1;
    const player2Id = 2;
    const gameMode = "CLASSIC";

    jest
      .spyOn(socketGateway, "isOnline")
      .mockImplementation((userId: number) => true);

    const player1 = gameService.getPlayer(player1Id);
    expect(player1).not.toBeNull();
    const player2 = gameService.getPlayer(player2Id);
    expect(player2).not.toBeNull();

    {
      const wait = waitFor(
        player1!,
        (state) => state.matches("_.waitingForMatchmaking"),
        {
          timeout: 2000,
        }
      );
      player1!.send({ type: "JOIN_MATCHMAKING", gameMode });
      await expect(wait).resolves.not.toThrow();
    }

    {
      const wait = waitFor(
        player2!,
        (state) => state.matches("_.waitingForInvitee"),
        {
          timeout: 2000,
        }
      );
      player2!.send({
        type: "INVITE",
        inviteeId: player1Id,
        gameMode,
      });
      await expect(wait).resolves.not.toThrow();
    }

    {
      const wait = waitFor(player1!, (state) => state.matches("_.playing"), {
        timeout: 2000,
      });
      player1!.send({
        type: "ACCEPT_INVITATION",
        inviterId: player2Id,
      });
      await expect(wait).resolves.not.toThrow();
    }

    expect(gameService.matchmakingRooms.CLASSIC.has(player1Id)).toBe(false);
  });

  it("should return you to matchmaking if the invitation fails", async () => {
    const player1Id = 1;
    const player2Id = 2;
    const gameMode = "CLASSIC";

    jest
      .spyOn(socketGateway, "isOnline")
      .mockImplementation((userId: number) => true);

    const player1 = gameService.getPlayer(player1Id);
    expect(player1).not.toBeNull();
    let player2 = gameService.getPlayer(player2Id);
    expect(player2).not.toBeNull();

    {
      const wait = waitFor(
        player1!,
        (state) => state.matches("_.waitingForMatchmaking"),
        {
          timeout: 2000,
        }
      );
      player1!.send({ type: "JOIN_MATCHMAKING", gameMode });
      await expect(wait).resolves.not.toThrow();
    }

    {
      const wait = waitFor(
        player2!,
        (state) => state.matches("_.waitingForInvitee"),
        { timeout: 2000 }
      );
      player2!.send({ type: "INVITE", inviteeId: player1Id, gameMode });
      await expect(wait).resolves.not.toThrow();
    }

    gameService.removePlayer(player2Id);
    player2 = gameService.getPlayer(player2Id);
    expect(player2).not.toBeNull();

    {
      const wait = waitFor(
        player1!,
        (state) =>
          !state.context.invitations.has(player2Id) &&
          state.matches("_.waitingForMatchmaking"),
        { timeout: 2000 }
      );
      player1!.send({
        type: "ACCEPT_INVITATION",
        inviterId: player2Id,
      });
      await expect(wait).resolves.not.toThrow();
    }

    {
      const wait = waitFor(player2!, (state) => state.matches("_.idle"), {
        timeout: 2000,
      });
      await expect(wait).resolves.not.toThrow();
    }

    expect(gameService.matchmakingRooms.CLASSIC.has(player1Id)).toBe(true);
  });

  it("should leave matchmaking", async () => {
    const player1Id = 1;
    const gameMode = "CLASSIC";

    jest
      .spyOn(socketGateway, "isOnline")
      .mockImplementation((userId: number) => true);

    const player1 = gameService.getPlayer(player1Id);
    expect(player1).not.toBeNull();

    {
      const wait = waitFor(player1!, (state) => state.matches("_.idle"), {
        timeout: 2000,
      });
      player1!.send({ type: "JOIN_MATCHMAKING", gameMode });
      await expect(wait).resolves.not.toThrow();
    }

    {
      const wait = waitFor(
        player1!,
        (state) => state.matches("_.waitingForMatchmaking"),
        { timeout: 2000 }
      );
      await expect(wait).resolves.not.toThrow();
    }

    {
      const wait = waitFor(player1!, (state) => state.matches("_.idle"), {
        timeout: 2000,
      });
      player1!.send({ type: "LEAVE_MATCHMAKING" });
      await expect(wait).resolves.not.toThrow();
    }

    expect(gameService.matchmakingRooms.CLASSIC.has(player1Id)).toBe(false);
  });

  it("shoud find a game", async () => {
    const player1Id = 1;
    const player2Id = 2;
    const gameMode = "CLASSIC";

    jest
      .spyOn(socketGateway, "isOnline")
      .mockImplementation((userId: number) => true);

    const player1 = gameService.getPlayer(player1Id);
    expect(player1).not.toBeNull();
    const player2 = gameService.getPlayer(player2Id);
    expect(player2).not.toBeNull();

    {
      const wait = waitFor(
        player1!,
        (state) => state.matches("_.waitingForMatchmaking"),
        {
          timeout: 2000,
        }
      );
      player1!.send({ type: "JOIN_MATCHMAKING", gameMode });
      await expect(wait).resolves.not.toThrow();
    }

    {
      const wait = waitFor(
        player2!,
        (state) => state.matches("_.waitingForMatchmaking"),
        {
          timeout: 2000,
        }
      );
      player2!.send({ type: "JOIN_MATCHMAKING", gameMode });
      await expect(wait).resolves.not.toThrow();
    }
    console.log(gameService.games);
    console.log(player1?.getSnapshot().context, player1?.getSnapshot().value);
    console.log(player2?.getSnapshot().context, player2?.getSnapshot().value);
    {
      const wait = waitFor(player1!, (state) => state.matches("_.playing"), {
        timeout: 2000,
      });
      await expect(wait).resolves.not.toThrow();
    }

    {
      const wait = waitFor(player2!, (state) => state.matches("_.playing"), {
        timeout: 2000,
      });
      await expect(wait).resolves.not.toThrow();
    }

    expect(gameService.matchmakingRooms.CLASSIC.has(player1Id)).toBe(false);
    expect(gameService.matchmakingRooms.CLASSIC.has(player2Id)).toBe(false);
    expect(gameService.getGame(player1Id)).toBe(gameService.getGame(player2Id));
  });

  // game end

  // disconnect & reconnect
  // offline
});
