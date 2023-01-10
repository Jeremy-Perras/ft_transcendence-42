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
    gameService = new GameService(socketGateway, prismaService);
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

    expect(gameService.isInMatchmaking(player1Id)).toBe(gameMode);
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

    expect(gameService.isInMatchmaking(player1Id)).toBeNull();
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

    expect(gameService.isInMatchmaking(player1Id)).toBe(gameMode);
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

    expect(gameService.isInMatchmaking(player1Id)).toBeNull();
  });

  it("shoud find a game and end", async () => {
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

    expect(gameService.isInMatchmaking(player1Id)).toBeNull();
    expect(gameService.isInMatchmaking(player2Id)).toBeNull();
    expect(gameService.getGame(player1Id)).toBe(gameService.getGame(player2Id));

    gameService.endGame(gameService.getGame(player1Id)!.id);

    {
      const wait = waitFor(player1!, (state) => state.matches("_.idle"), {
        timeout: 2000,
      });
      await expect(wait).resolves.not.toThrow();
    }

    {
      const wait = waitFor(player1!, (state) => state.matches("_.idle"), {
        timeout: 2000,
      });
      await expect(wait).resolves.not.toThrow();
    }

    expect(gameService.getGame(player1Id)).toBeUndefined();
    expect(gameService.getGame(player2Id)).toBeUndefined();
  });

  it("should not lose invitation on reconnect", async () => {
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
      const wait = waitFor(player2!, (state) => state.matches("disconnected"), {
        timeout: 2000,
      });
      player2!.send({ type: "DISCONNECT" });
      await expect(wait).resolves.not.toThrow();
    }

    await new Promise<void>((resolve) =>
      setTimeout(async () => {
        {
          const wait = waitFor(player2!, (state) => state.matches("_.idle"), {
            timeout: 2000,
          });
          player2!.send({ type: "CONNECT" });
          await expect(wait).resolves.not.toThrow();
        }

        expect(player2!.getSnapshot().context.invitations.has(player1Id)).toBe(
          true
        );
        resolve();
      }, 2000)
    );
  });

  it("should return you to matchmaking if reconnect", async () => {
    const player1Id = 1;
    const gameMode = "CLASSIC";

    jest
      .spyOn(socketGateway, "isOnline")
      .mockImplementation((userId: number) => true);

    const player1 = gameService.getPlayer(player1Id);
    expect(player1).not.toBeNull();

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
      const wait = waitFor(player1!, (state) => state.matches("disconnected"), {
        timeout: 2000,
      });
      player1!.send({ type: "DISCONNECT" });
      await expect(wait).resolves.not.toThrow();
    }

    expect(gameService.isInMatchmaking(player1Id)).toBeNull();

    await new Promise<void>((resolve) =>
      setTimeout(async () => {
        {
          const wait = waitFor(
            player1!,
            (state) => state.matches("_.waitingForMatchmaking"),
            {
              timeout: 2000,
            }
          );
          player1!.send({ type: "CONNECT" });
          await expect(wait).resolves.not.toThrow();
        }
        expect(gameService.isInMatchmaking(player1Id)).toBe(gameMode);
        resolve();
      }, 2000)
    );
  });

  it("should return you to waiting for invitee", async () => {
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
      const wait = waitFor(player1!, (state) => state.matches("disconnected"), {
        timeout: 2000,
      });
      player1!.send({ type: "DISCONNECT" });
      await expect(wait).resolves.not.toThrow();
    }

    expect(player2?.getSnapshot().context.invitations.has(player1Id)).toBe(
      true
    );

    await new Promise<void>((resolve) =>
      setTimeout(async () => {
        {
          const wait = waitFor(
            player1!,
            (state) => state.matches("_.waitingForInvitee"),
            {
              timeout: 2000,
            }
          );
          player1!.send({ type: "CONNECT" });
          await expect(wait).resolves.not.toThrow();
        }
        expect(player2?.getSnapshot().context.invitations.has(player1Id)).toBe(
          true
        );
        resolve();
      }, 2000)
    );
  });

  it("should send you to idle if invitation was accepted during disconnect", async () => {
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
      const wait = waitFor(player1!, (state) => state.matches("disconnected"), {
        timeout: 2000,
      });
      player1!.send({ type: "DISCONNECT" });
      await expect(wait).resolves.not.toThrow();
    }

    {
      const wait = waitFor(player2!, (state) => state.matches("_.playing"), {
        timeout: 2000,
      });
      player2!.send({ type: "ACCEPT_INVITATION", inviterId: player1Id });
      player1!.send({ type: "CONNECT" });
      await expect(wait).rejects.toThrow();
    }

    expect(player2?.getSnapshot().context.invitations.has(player1Id)).toBe(
      false
    );

    {
      const wait = waitFor(player1!, (state) => state.matches("_.idle"), {
        timeout: 2000,
      });
      await expect(wait).resolves.not.toThrow();
    }
  });

  it("should send you to idle if invitation was rejected during disconnect", async () => {
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
      const wait = waitFor(player1!, (state) => state.matches("disconnected"), {
        timeout: 2000,
      });
      player1!.send({ type: "DISCONNECT" });
      await expect(wait).resolves.not.toThrow();
    }

    {
      const wait = waitFor(player2!, (state) => state.matches("_.idle"), {
        timeout: 2000,
      });
      player2!.send({ type: "REFUSE_INVITATION", inviterId: player1Id });
      await expect(wait).resolves.not.toThrow();
    }

    await new Promise<void>((resolve) =>
      setTimeout(async () => {
        {
          const wait = waitFor(player1!, (state) => state.matches("_.idle"), {
            timeout: 2000,
          });
          player1!.send({ type: "CONNECT" });
          await expect(wait).resolves.not.toThrow();
        }

        expect(player2?.getSnapshot().context.invitations.has(player1Id)).toBe(
          false
        );
        resolve();
      }, 1000)
    );
  });

  it("should send you back to playing", async () => {
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

    {
      const wait = waitFor(player1!, (state) => state.matches("disconnected"), {
        timeout: 2000,
      });
      player1!.send({ type: "DISCONNECT" });
      await expect(wait).resolves.not.toThrow();
    }

    await new Promise<void>((resolve) =>
      setTimeout(async () => {
        {
          const wait = waitFor(
            player1!,
            (state) => state.matches("_.playing"),
            {
              timeout: 2000,
            }
          );
          player1!.send({ type: "CONNECT" });
          await expect(wait).resolves.not.toThrow();
        }

        expect(gameService.getGame(player1Id)).toBe(
          gameService.getGame(player2Id)
        );
        resolve();
      }, 2000)
    );
  });

  it("should send you back to idle if game is over", async () => {
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

    {
      const wait = waitFor(player1!, (state) => state.matches("disconnected"), {
        timeout: 2000,
      });
      player1!.send({ type: "DISCONNECT" });
      await expect(wait).resolves.not.toThrow();
    }

    gameService.endGame(gameService.getGame(player1Id)!.id);

    await new Promise<void>((resolve) =>
      setTimeout(async () => {
        {
          const wait = waitFor(player1!, (state) => state.matches("_.idle"), {
            timeout: 2000,
          });
          player1!.send({ type: "CONNECT" });
          await expect(wait).resolves.not.toThrow();
        }

        {
          const wait = waitFor(player2!, (state) => state.matches("_.idle"), {
            timeout: 2000,
          });
          await expect(wait).resolves.not.toThrow();
        }

        expect(gameService.getGame(player1Id)).toBeUndefined();
        expect(gameService.getGame(player2Id)).toBeUndefined();
        resolve();
      }, 2000)
    );
  });

  it("should set you offline if you are disconnected for more than 3s", async () => {
    const player1Id = 1;
    const gameMode = "CLASSIC";

    jest
      .spyOn(socketGateway, "isOnline")
      .mockImplementation((userId: number) => true);

    const player1 = gameService.getPlayer(player1Id);
    expect(player1).not.toBeNull();

    {
      const wait = waitFor(player1!, (state) => state.matches("disconnected"), {
        timeout: 2000,
      });
      player1!.send({ type: "DISCONNECT" });
      await expect(wait).resolves.not.toThrow();
    }

    await new Promise<void>((resolve) => {
      setTimeout(async () => {
        expect(player1!.getSnapshot().matches("offline")).toBe(true);
        resolve();
      }, 3001);
    });
  });

  it("should cancel invite if offline", async () => {
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
      const wait = waitFor(player1!, (state) => state.matches("disconnected"), {
        timeout: 2000,
      });
      player1!.send({ type: "DISCONNECT" });
      await expect(wait).resolves.not.toThrow();
    }

    await new Promise<void>((resolve) => {
      setTimeout(async () => {
        expect(player1!.getSnapshot().matches("offline")).toBe(true);
        expect(player2!.getSnapshot().context.invitations.has(player1Id)).toBe(
          false
        );
        resolve();
      }, 3001);
    });
  });

  it("should reject invites if offline", async () => {
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
    const player3 = gameService.getPlayer(player3Id);
    expect(player3).not.toBeNull();

    {
      const wait = waitFor(
        player1!,
        (state) => state.matches("_.waitingForInvitee"),
        {
          timeout: 2000,
        }
      );
      player1!.send({ type: "INVITE", inviteeId: player3Id, gameMode });
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
      player2!.send({ type: "INVITE", inviteeId: player3Id, gameMode });
      await expect(wait).resolves.not.toThrow();
    }

    {
      const wait = waitFor(player3!, (state) => state.matches("disconnected"), {
        timeout: 2000,
      });
      player3!.send({ type: "DISCONNECT" });
      await expect(wait).resolves.not.toThrow();
    }

    await new Promise<void>((resolve) => {
      setTimeout(async () => {
        expect(player3!.getSnapshot().matches("offline")).toBe(true);
        expect(player1!.getSnapshot().matches("_.idle")).toBe(true);
        expect(player2!.getSnapshot().matches("_.idle")).toBe(true);
        resolve();
      }, 3001);
    });
  });

  it("should remove from matchmaking if offline", async () => {
    const player1Id = 1;
    const gameMode = "CLASSIC";

    jest
      .spyOn(socketGateway, "isOnline")
      .mockImplementation((userId: number) => true);

    const player1 = gameService.getPlayer(player1Id);
    expect(player1).not.toBeNull();

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
      const wait = waitFor(player1!, (state) => state.matches("disconnected"), {
        timeout: 2000,
      });
      player1!.send({ type: "DISCONNECT" });
      await expect(wait).resolves.not.toThrow();
    }

    await new Promise<void>((resolve) => {
      setTimeout(async () => {
        expect(player1!.getSnapshot().matches("offline")).toBe(true);
        expect(gameService.isInMatchmaking(player1Id)).toBeNull();
        resolve();
      }, 3001);
    });
  });

  it("should forfeit game if offline", async () => {
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
      const wait = waitFor(player2!, (state) => state.matches("_.playing"), {
        timeout: 2000,
      });
      player2!.send({ type: "JOIN_MATCHMAKING", gameMode });
      await expect(wait).resolves.not.toThrow();
    }

    {
      const wait = waitFor(player1!, (state) => state.matches("_.playing"), {
        timeout: 2000,
      });
      await expect(wait).resolves.not.toThrow();
    }

    {
      const wait = waitFor(player1!, (state) => state.matches("disconnected"), {
        timeout: 2000,
      });
      player1!.send({ type: "DISCONNECT" });
      await expect(wait).resolves.not.toThrow();
    }

    await new Promise<void>((resolve) => {
      setTimeout(async () => {
        expect(player1!.getSnapshot().matches("offline")).toBe(true);
        const wait = waitFor(player2!, (state) => state.matches("_.idle"), {
          timeout: 2000,
        });
        await expect(wait).resolves.not.toThrow();
        expect(player2!.getSnapshot().matches("_.idle")).toBe(true);
        expect(gameService.getGame(player1Id)).toBeUndefined();
        expect(gameService.getGame(player2Id)).toBeUndefined();
        const game = await prismaService.game.findFirst({
          orderBy: {
            startedAt: "desc",
          },
        });
        expect(game?.player1Score).toBe(-42);
        expect(game?.player2Score).toBe(11);
        expect(game?.player1Id).toBe(player1Id);
        expect(game?.player2Id).toBe(player2Id);
        expect(game?.finishedAt).not.toBeNull();
        resolve();
      }, 3001);
    });
  });
});
