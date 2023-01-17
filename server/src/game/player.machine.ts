import { GameMode } from "@prisma/client";
import { assign, createMachine, interpret } from "xstate";
import { choose } from "xstate/lib/actions";
import { waitFor } from "xstate/lib/waitFor";
import { SocketGateway } from "../socket/socket.gateway";
import { GameService } from "./game.service";

export const PlayerMachine = (
  userId: number,
  gameService: GameService,
  socket: SocketGateway
) => {
  /** @xstate-layout N4IgpgJg5mDOIC5QAcA2BDAnmATgYgBEBJAZQGEB5AOSoFEyAVAbQAYBdRFAe1gEsAXXlwB2nEAA9EAFgBMAGhCZEARhZSAdFICcLAGwstygBxHtAdmVaAvlYVosudQH11vCKjB4iVAGpEGtKwcSCDIPAJCoiGSCMoAzFJxmiwpulpxRizKAKzZUgpKsVJmZur6Wroy5UYW2TZ2GNg4zq7unnQA6k7efgwAggxE1EFiYXyCImIxyqoaRtmpWhZxunHyiioyyjLqM3HxMglxcdlGcfWhjY4ubh5evv4DQ1ROZH1UZLQAMrQEIyFjCKTaIqFhGZRldKZKQsLY5AoqGbZdRmLSJFjZXQw3JGGQXexNFq3Tx9MifAAKDG6D36g2G7FG4QmUVA0yOyUWGSyuXyG1iWxY6hYqLWUik2zMLHOtkuDmaNzaeAASrQAGIAVRItGpvSe9OC3HGkSmoPSKOyaOUkthUkqZgRsSyWk0ZkxOMMuhqeJlBOurTuACkKN4nABZAZkAAS4YA0t4AOL-Q1AlkSFTsmGczI5PIO+LHdTgi16GrKT11H1XeXqWBgYQQXjCKBEYQANwEnggIjArjbXAA1j3fdXa-XG822x2EI3W1wAMboZlBJOhJnGkFFT1CmQyWF5O0Le18q2GFFmM4Y1FaNFLfFVlqjhtNlvt-ieXA4LjNez8ABmX4AW3UYcHzrJ8J1fMBpz7Bcl3YFdAWZE1N2dFYqgMaEZFtPN0V2BJcl0SoMUxb0GjlFp0DnOcwGQQRn0nN88C7YQexnAch3vFxKOo2jxxfKc2NgyJlwZAE12BVkVHmZ0zE9cEzkIjJeUKM4khqeSLS0Q8VjvciuKomi6Igjs8A-L9gIwP9AIsvT1G4wy+IYqDBMXYT4NE5MkI3YwLRROTjBWVZTDzYxShSWFjgxXRXQMXTCX0nijP4xizO-Sz-xwICQIShz6Mg6DZyEkRl2UA1VyNCS01iDNwrSLkc2UxFKjKNRElkMtwSkIw4r9AB3dAIibVUv2SsBPDeD5vh1R46SoBDxNTGIxSMdR0ldY5sjiNF9GOPMsIhUw9DFXRjDLYUeurfrBqgYacFGzwehm54nBVAN6ACP4PPKlNkOW1a4nWk4tttKU4jzY4VpyLQZDRFZJX2axK1sq6jNu+77l1WanFJCkPvmirFukLr-sBzbttBkKd23YxdEPTF5l0C6WjnHAwFcpt43QADO27XtZ0HGz4vUFm2aMznuYK+dXOK9yysQ9dJIQIxofUGQLEMbZsiwqQtYdPIklkXEcjMXcjFWZQmZcEX2agcX3xwT80sXDKss44XWZtu3JaK4QRLlhbkOVnY1csGYZC1sVdePeJSlks2sR3JYljMS31BR8dbtDRc5wACwA9B+3HPBOmm2lnnxn6Nx3LXVsOU5MjiMFxRCrdosPHX0gw6UyKF9Ohq-LP+Fz-PC6bDGnuoV53k+H5Pv9gnkJ3GG-LMFZlYxYwqjzYUdhOBOurFHczCkVO+5ugfs7zgui5x2hKVLvU5q++XKuma9kW0PRLB1mYSz2lYhQpBzLuGY0lT4DVRhfIeV9R5QGVGqTU2pHpl31IyBeVd9qFjWOkTalhoqHAdEsXQQoAYWk6soWQFhwHXUzpfEeRcfh9B8NqcMDAoyxgTBXLyitLAlELDTCou4tj6GyA6c8BspQyBMKvLCBgU5I17hAjOUDh7XzHvGPooZtSqgoOqKgc80GV0VlhWmqsdwGAWHuIwe1VjqFOCRQi2w1Bq1TgSIuqUbJWUyoLP0bimze2lr7WWhjuFVRMciJeFiUjh2sceE4zodCR2OBQ0w3dZRCz8XAjxP4XY+OrJkgJcE2BMFKiEhWYTsjGFWtsaKW1YStUarEfBdiYQlFUPoGoahXGNCLhorRThaD6N+Fw8pMQqhbX4WrRuGJwoEL5IRHYhFsgxQ7micOTMGywDnCIFic43wQDwJQGg70Rmv0QFHQoFCMgr3FOefMVppQymEFwCAcBRhVjKWchAABaXQDpfmW0+YTWIJtdhSIlOCFYciHQ62RGiEsciZi01pqnYkQLkKqB0GUWQUi1BqFyMocG8RND7HPLuaGidSLpL9I+RykF0XeSxIKLSWlLzH2MFKHCfCtJdROuhM4qd7K8Tyh2BlPCmWrQtAsZZ7KG4hQmeFbYOtVhVHSNQyBd0nJgDFWE3cYLwRq0heUI8lzjg7C1teXcJRlmkNTtbMWXNtViXQYrcshZJFHV5VrP5x4DDOiyGbZZ0Mrk1HVconAg9VGwJ1WMw4EIA1FlBhQxpNSEnpB0NsLSyt5jdKwOOGNiApE600MYQwFoAbqxNSoctQpcSmFhqvChrjWatgLQgau+qIXxGNTha5WRthrASJ6NE3UFGOE2ds4Quz9ltrhNucEEUdYwnWCpCEXVj62jVlMqRFYe6OC4L+X8qBGxOs8qM6QK6VBYlWrTC02hwUxIrDYIAA */
  const machine = createMachine(
    {
      predictableActionArguments: true,
      tsTypes: {} as import("./player.machine.typegen").Typegen0,
      schema: {
        context: {} as {
          userId: number;
          gameMode?: GameMode;
          inviteeId?: number;
          invite?: {
            inviterId?: number;
            gameMode?: GameMode;
          };
          invitations: Map<number, GameMode>;
        },
        services: {} as {
          sendInvite: {
            data: void;
          };
          acceptInvite: {
            data: void;
          };
          gameStart: {
            data: void;
          };
          createGame: {
            data: void;
          };
          joinMatchmaking: {
            data: void;
          };
        },
        events: {} as
          | { type: "INVITE"; inviteeId: number; gameMode: GameMode }
          | { type: "NEW_INVITATION"; inviterId: number; gameMode: GameMode }
          | { type: "ACCEPT_INVITATION"; inviterId: number }
          | { type: "REFUSE_INVITATION"; inviterId: number }
          | { type: "CANCEL_INVITATION" }
          | { type: "INVITATION_ACCEPTED" }
          | { type: "INVITATION_REJECTED" }
          | { type: "INVITATION_CANCELED"; inviterId: number }
          | { type: "JOIN_MATCHMAKING"; gameMode: GameMode }
          | { type: "LEAVE_MATCHMAKING" }
          | { type: "GAME_FOUND" }
          | { type: "GAME_ENDED" }
          | { type: "CONNECT" }
          | { type: "DISCONNECT" },
      },
      id: "player",
      initial: "_",
      context: {
        userId,
        gameMode: undefined,
        inviteeId: undefined,
        invite: undefined,
        invitations: new Map(),
      },
      on: {
        DISCONNECT: {
          target: "disconnected",
        },
      },
      states: {
        _: {
          initial: "idle",
          states: {
            idle: {
              entry: [
                assign({
                  gameMode: undefined,
                  inviteeId: undefined,
                  invite: undefined,
                }),
              ],
              on: {
                INVITE: {
                  target: "sendingInvite",
                  actions: ["updateInvitee", "updateGameMode"],
                },
                NEW_INVITATION: {
                  actions: ["addInvite", "notifyInvite"],
                },
                INVITATION_CANCELED: {
                  actions: "removeInvite",
                },
                ACCEPT_INVITATION: {
                  target: "acceptingInvite",
                  actions: "selectInvite",
                },
                REFUSE_INVITATION: {
                  actions: ["refuseInvite", "notifyRefusal"],
                },
                JOIN_MATCHMAKING: {
                  target: "waitingForMatchmaking",
                  actions: "updateGameMode",
                },
              },
            },
            sendingInvite: {
              invoke: {
                src: "sendInvite",
                onDone: {
                  target: "waitingForInvitee",
                },
                onError: {
                  target: "idle",
                },
              },
            },
            acceptingInvite: {
              entry: "removeInvite",
              exit: choose([
                {
                  cond: (_, event) => event.type !== "DISCONNECT",
                  actions: assign({
                    invite: undefined,
                  }),
                },
              ]),
              invoke: {
                src: "acceptInvite",
                onDone: {
                  target: "playing",
                },
                onError: [
                  {
                    target: "waitingForMatchmaking",
                    cond: "wasInMatchmaking",
                  },
                  { target: "idle" },
                ],
              },
            },
            waitingForInvitee: {
              entry: ["refuseInviteAll", "notifyRefusalAll"],
              invoke: {
                src: (context) =>
                  new Promise<void>((resolve, reject) => {
                    if (context.inviteeId && context.gameMode) resolve();
                    else reject();
                  }),
                onError: {
                  target: "idle",
                },
              },
              on: {
                CANCEL_INVITATION: {
                  target: "idle",
                  actions: "cancelInvite",
                },
                INVITATION_REJECTED: {
                  target: "idle",
                  actions: (context) =>
                    socket.sendToUser(context.userId, "invitationRejected", {}),
                },
                INVITATION_ACCEPTED: {
                  target: "creatingGame",
                },
              },
            },
            creatingGame: {
              invoke: {
                src: "createGame",
                onDone: {
                  target: "playing",
                },
                onError: {
                  target: "idle",
                },
              },
            },
            waitingForMatchmaking: {
              invoke: {
                src: "joinMatchmaking",
                onDone: [
                  {
                    target: "playing",
                    cond: "isPlaying",
                  },
                ],
                onError: {
                  target: "idle",
                },
              },
              exit: "leaveMatchmaking",
              on: {
                NEW_INVITATION: {
                  actions: ["addInvite", "notifyInvite"],
                },
                INVITATION_CANCELED: {
                  actions: "removeInvite",
                },
                ACCEPT_INVITATION: {
                  target: "acceptingInvite",
                  actions: "selectInvite",
                },
                REFUSE_INVITATION: {
                  actions: ["refuseInvite", "notifyRefusal"],
                },
                LEAVE_MATCHMAKING: {
                  target: "idle",
                },
                GAME_FOUND: {
                  target: "playing",
                },
              },
            },
            playing: {
              entry: ["notifyRefusalAll", "refuseInviteAll"],
              exit: assign({ gameMode: undefined }),
              invoke: {
                src: "gameStart",
                onError: [
                  {
                    target: "waitingForMatchmaking",
                    cond: "wasInMatchmaking",
                  },
                  { target: "idle" },
                ],
              },
              on: {
                GAME_ENDED: {
                  target: "idle",
                },
              },
            },
            prev: {
              type: "history",
            },
          },
        },
        disconnected: {
          entry: (context) => {
            gameService.pauseGame(context.userId);
            gameService.removeFromMatchmaking(context.userId);
          },
          after: [
            {
              delay: 3000,
              target: "offline",
            },
          ],
          on: {
            CONNECT: {
              target: "_.prev",
            },
            INVITATION_REJECTED: {
              actions: assign({
                inviteeId: (context) => undefined,
                gameMode: (context) => undefined,
              }),
            },
          },
        },
        offline: {
          entry: [
            "cancelInvite",
            "notifyRefusalAll",
            "leaveMatchmaking",
            async (context) => {
              await gameService.forfeitGame(context.userId);
              gameService.removePlayer(context.userId);
            },
          ],
        },
      },
    },
    {
      guards: {
        wasInMatchmaking: (context) => !!context.gameMode && !context.inviteeId,
        isPlaying: (context) => !!gameService.getGame(context.userId),
      },
      services: {
        sendInvite: (
          context,
          event:
            | {
                type: "INVITE";
                inviteeId: number;
                gameMode: GameMode;
              }
            | { type: "CONNECT" }
        ) =>
          new Promise((resolve, reject) => {
            const { inviteeId, gameMode } = context;
            if (!inviteeId || !gameMode) {
              reject();
              return;
            }
            if (event.type === "CONNECT") {
              if (context.invitations.has(context.userId)) resolve();
              else reject();
            } else {
              const invitee = gameService.getPlayer(inviteeId);
              if (!invitee) {
                reject();
                return;
              }
              waitFor(
                invitee,
                (state) => {
                  if (state.context.invitations.has(context.userId)) {
                    return true;
                  }
                  return false;
                },
                { timeout: 1000 }
              )
                .then(() => resolve())
                .catch(() => reject());
              invitee.send({
                type: "NEW_INVITATION",
                gameMode,
                inviterId: context.userId,
              });
            }
          }),
        acceptInvite: (
          context,
          event:
            | {
                type: "ACCEPT_INVITATION";
                inviterId: number;
              }
            | { type: "CONNECT" }
        ) =>
          new Promise((resolve, reject) => {
            if (event.type === "CONNECT") {
              const gameId = gameService.getGame(context.userId);
              if (gameId) resolve();
              else reject();
            } else {
              if (context.invite) {
                const inviter = gameService.getPlayer(event.inviterId);
                if (!inviter) {
                  reject();
                  return;
                }
                waitFor(inviter, (state) => state.matches("_.playing"), {
                  timeout: 1000,
                })
                  .then(() => resolve())
                  .catch(() => {
                    inviter.send({ type: "INVITATION_REJECTED" });
                    reject();
                  });
                inviter.send({ type: "INVITATION_ACCEPTED" });
              } else reject();
            }
          }),
        gameStart: (context) =>
          new Promise((resolve, reject) => {
            const gameId = gameService.getGame(context.userId);
            if (gameId) {
              socket.sendToUser(context.userId, "gameStarting", { gameId });
              resolve();
            } else {
              reject();
            }
          }),
        createGame: (
          context,
          event:
            | {
                type: "INVITATION_ACCEPTED";
              }
            | { type: "CONNECT" }
        ) =>
          new Promise((resolve, reject) => {
            if (event.type === "CONNECT") {
              const gameId = gameService.getGame(context.userId);
              if (gameId) resolve();
              else reject();
            } else {
              const { gameMode, inviteeId } = context;
              if (!gameMode || !inviteeId) {
                reject();
                return;
              }
              gameService
                .createGame(gameMode, inviteeId, context.userId)
                .then(() => resolve())
                .catch(() => reject());
            }
          }),
        joinMatchmaking: (context) =>
          new Promise<void>((resolve, reject) => {
            const matchmakingRoom = gameService.getMatchmakingRoom(
              context.gameMode as GameMode
            );

            if (matchmakingRoom.has(context.userId)) {
              resolve();
              return;
            }

            if (matchmakingRoom.size === 1) {
              const player1 = gameService.getPlayer(
                matchmakingRoom.values().next().value
              );
              if (player1 && player1.getSnapshot().can("GAME_FOUND")) {
                gameService
                  .createGame(
                    context.gameMode as GameMode,
                    player1.getSnapshot().context.userId,
                    context.userId
                  )
                  .then(() => {
                    player1.send({ type: "GAME_FOUND" });
                    resolve();
                  })
                  .catch(() => {
                    reject();
                  });
              } else {
                if (player1) player1.send({ type: "LEAVE_MATCHMAKING" });
                matchmakingRoom.add(context.userId);
                resolve();
              }
            } else {
              matchmakingRoom.add(context.userId);
              resolve();
            }
          }),
      },
      actions: {
        updateGameMode: assign({
          gameMode: (_, event) => event.gameMode,
        }),
        updateInvitee: assign({
          inviteeId: (_, event) => event.inviteeId,
        }),
        addInvite: assign({
          invitations: (context, event) => {
            const invitations = new Map(context.invitations);
            invitations.set(event.inviterId, event.gameMode);
            return invitations;
          },
        }),
        notifyInvite: (context) => {
          socket.sendToUser(context.userId, "newInvitation", {
            inviterId: context.userId,
            gameMode: context.gameMode,
          });
        },
        cancelInvite: (context) => {
          if (context.inviteeId) {
            const invitee = gameService.getPlayer(context.inviteeId);
            if (invitee)
              invitee.send({
                type: "INVITATION_CANCELED",
                inviterId: context.userId,
              });
          }
        },
        selectInvite: assign({
          invite: (context, event) => ({
            inviterId: event.inviterId,
            gameMode: context.invitations.get(event.inviterId),
          }),
        }),
        removeInvite: assign({
          invitations: (context, event) => {
            context.invitations.delete(event.inviterId);
            return context.invitations;
          },
        }),
        refuseInvite: assign({
          invitations: (context, event) => {
            context.invitations.delete(event.inviterId);
            return context.invitations;
          },
        }),
        notifyRefusal: (_, event) => {
          const inviter = gameService.getPlayer(event.inviterId);
          if (inviter) inviter.send({ type: "INVITATION_REJECTED" });
        },
        refuseInviteAll: assign({
          invitations: () => new Map(),
        }),
        notifyRefusalAll: (context) => {
          for (const inviterId of context.invitations.keys()) {
            const inviter = gameService.getPlayer(inviterId);
            if (inviter) inviter.send({ type: "INVITATION_REJECTED" });
          }
        },
        leaveMatchmaking: (context) => {
          gameService.removeFromMatchmaking(context.userId);
        },
      },
    }
  );
  return interpret(machine).start();
};
