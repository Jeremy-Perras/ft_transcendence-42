import { GameMode } from "@prisma/client";
import { assign, createMachine, interpret, StateValue } from "xstate";
import { SocketGateway } from "../socket/socket.gateway";
import { GameService } from "./game.service";

export const playerService = (
  userId: number,
  gameService: GameService,
  socket: SocketGateway
) => {
  /** @xstate-layout N4IgpgJg5mDOIC5QAcA2BDAnmATgOgEsJUwBiASQDkA1cgFQFEBtABgF1EUB7WAgFwJcAdpxAAPRAHYAzAFY8ADgBMslkskAWAGyzlLaQBoQmREoCcCvFsmqWCyTIX7JAXxdG0WXIWJlKDAHUAfSpaOgBBOnIAeUpWDiQQZB5+QRFEiQQNBTM8aQ0WLQ1s6SKVBSMTBAVVPLNJAEYNWTMWSTsNBrcPDGx8IhJScIBhYYYABToQmnpImLj2UWTeAWFRTJl5ZVV1bV0lfUrEBpYWXN2NCy0lBuv1bqTe7wGyACUGADEAVQBlBmmwnNYvElilVulQJkNJJLCpTg1ZOUYa0tEcEDYNHg2gppDknHItDUHp4+j5BgApaJUIIAWUiwwAEnSANJUADiIMSy1SawyUjkijhux0ekMxn50jwugaSiKl10ly0xKe+FgYCEEAIQig5CEADd+GQIMIwIR9VwANamkneNUarU6-WGhBavVcADG6HB8U53BWaXWiAUWhYeGKWjMTWsShqtzRB0lkjhLE6Zi0t1c7keXlV6s12t1Br4ZFwOC4+E8fAAZuWALZ4G25+0Fp3Fl3mz3e9i+pJggN86rpvAwmyla4nMy4+OyBp4A6nQrZS41OTKnN4dDu91gZACFtFo0ms1uq0NlUbrc7veOg-tt2dtI+xZcvu8yHHFTyWTSGwz+wWZQKnFBATgaXILBlCMcTKXQ11JTdt13B1C0NUhS3LM8vRrHB60bC9EOvFC21dD0vUfbtnz9HkIXED9ZC-H96Iaf8FEAtF7EkOcChg6EQ00ODvAQq9kNbEscDLCsMGrOtMPgy8kP3Z0SIfYQfQaBIqPBQN0QFbY1E0EUEzRNNZ0kMwzEVaRpBjFNpAE-AAHd0FSbUPnLIiwDIYZwkoMYABkAVmKJgUo3t-TfWiECUbQ8gUDRcU6ej1HyDRjJnYd6gRGVeJDOyszwpyXKgNycA8shQiC+YgneckGGGRgABEe25LSB2irRYviuKEURGRinY+iwxhaQzBnYommhey8EK68SrKigZgiYLKCCEYxkmBgmtClr+3fKKYoShKeuS-rgIUWdshsfQWBnGwYS6fLzxmh0SppL13QAC1rdALQdUh-GCCqlvmZrXxozJbmixRANYsyRuaMUqhsC7mMkENzDTZQlUe9dntc8s3r4T7vt+7UhlGCYpiBoEFg0sLqO0hof045pTlkMycRGuLjIjKVCllDE0baDQprx4qCfer6fr+95vj+QLgZCumdoiiH00TMwlBUTXbmkOxUWAnR5BOBdU3TaxRec2aJaJqXSagUg-IYcJqH+Ok6EZFl2VB8LweOORcgcc7lAsKyLFSw2ZUUeK0assaChFnHSTF17JZJv62XCGl-g+aIvkoLblbBxmcSUPBmKZuRih11j2JsYduI0FReOFqaSQzrP-gYAvNp9hmB2Y-IwzTCzlCb1HZDRS4y5Oa47jafQZVkNwsyELgIDgJYVVBX3tIAWgNqoD6ml4d-7vadilPrGkKScA4jqpRtMhFWgOE4WnqKa7XzG9DTP1q9onCsp1To2gkyxkPqYcw5dMb4gKOzdMmYejriEgpX+xZ-67UikAyUCVQHRggcZJMih2Y4lOC3fiSdvAp3cqJMAmDVaICbjzMuWh0yIicCOBElsiqp1tunbUDC-YgXRngeo50n6tCbvUAaZcZDIyKIvCwSg269AdEI7Sb9QxAJuCmaezEgJVDivIQkk5WgWVkPFZoK8XBAA */
  const machine = createMachine(
    {
      predictableActionArguments: true,
      tsTypes: {} as import("./player.machine.typegen").Typegen0,
      schema: {
        context: {} as {
          userId: number;
          gameMode?: GameMode;
          inviteeId?: number;
          invitations: Map<number, GameMode>;
          history: StateValue[];
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
          | { type: "GAME_ENDED" },
      },
      id: "player",
      initial: "idle",
      context: {
        userId,
        gameMode: undefined,
        inviteeId: undefined,
        invitations: new Map(),
        history: [],
      },
      states: {
        idle: {
          entry: [
            "updateHistory",
            assign({
              gameMode: undefined,
              inviteeId: undefined,
            }),
          ],
          on: {
            INVITE: {
              target: "sendingInvite",
              actions: ["updateInvitee", "updateGameMode"],
            },
            NEW_INVITATION: {
              actions: "addInvite",
            },
            ACCEPT_INVITATION: {
              target: "acceptingInvite",
            },
            REFUSE_INVITATION: {
              actions: "refuseInvite",
            },
            JOIN_MATCHMAKING: {
              target: "waitingForMatchmaking",
              actions: "updateGameMode",
            },
          },
        },
        sendingInvite: {
          entry: "updateHistory",
          invoke: {
            src: "sendInvite",
            onDone: {
              target: "waitingForInvitee",
              actions: "refuseAllInvites",
            },
            onError: {
              target: "idle",
            },
          },
        },
        acceptingInvite: {
          entry: "updateHistory",
          invoke: {
            src: "acceptInvite",
            onDone: {
              target: "playing",
              actions: "refuseAllInvites",
            },
            onError: [
              { target: "waitingForMatchmaking", cond: "wasInMatchmaking" },
              { target: "idle" },
            ],
          },
        },
        waitingForInvitee: {
          entry: "updateHistory",
          on: {
            CANCEL_INVITATION: {
              target: "idle",
              actions: (context) => {
                if (context.inviteeId) {
                  const invitee = gameService.getPlayer(context.inviteeId);
                  if (invitee)
                    invitee.send({
                      type: "INVITATION_CANCELED",
                      inviterId: context.userId,
                    });
                }
              },
            },
            INVITATION_REJECTED: {
              target: "idle",
              actions: (context) =>
                socket.sendToUser(context.userId, "invitationRejected", {}), // TODO
            },
            INVITATION_ACCEPTED: {
              target: "playing",
            },
          },
        },
        waitingForMatchmaking: {
          entry: [
            "updateHistory",
            (context) => {
              gameService.joinMatchmakingRoom(
                context.userId,
                context.gameMode as GameMode
              );
            },
          ],
          exit: [
            "updateHistory",
            (context) => {
              gameService.leaveMatchmakingRoom(
                context.userId,
                context.gameMode as GameMode
              );
            },
          ],
          on: {
            NEW_INVITATION: {
              actions: "addInvite",
            },
            ACCEPT_INVITATION: {
              target: "acceptingInvite",
            },
            REFUSE_INVITATION: {
              actions: "refuseInvite",
            },
            LEAVE_MATCHMAKING: {
              target: "idle",
            },
            GAME_FOUND: {
              target: "playing",
              actions: "refuseAllInvites",
            },
          },
        },
        playing: {
          entry: "updateHistory",
          invoke: {
            src: "gameStart",
            onDone: {},
            onError: [
              { target: "waitingForMatchmaking", cond: "wasInMatchmaking" },
              { target: "idle" },
            ],
          },
          on: {
            GAME_ENDED: {
              target: "idle",
            },
          },
        },
      },
    },
    {
      guards: {
        wasInMatchmaking: (context) =>
          context.history.length >= 2 &&
          context.history[context.history.length - 2] ===
            "waitingForMatchmaking",
      },
      services: {
        sendInvite: (context, event) =>
          new Promise((resolve, reject) => {
            const invitee = gameService.getPlayer(event.inviteeId);
            if (!invitee) {
              reject();
              return;
            }
            const cb: Parameters<typeof invitee.onChange>[0] = (context) => {
              invitee.off(cb);
              if (context.invitations.has(context.userId)) resolve();
              else reject();
            };
            invitee.onChange(cb);
            invitee.send({
              type: "NEW_INVITATION",
              inviterId: context.userId,
              gameMode: event.gameMode,
            });
          }),
        acceptInvite: (context, event) =>
          new Promise((resolve, reject) => {
            const gameMode = context.invitations.get(event.inviterId);
            if (gameMode) {
              gameService
                .createGame(gameMode, event.inviterId, context.userId)
                .then(() => {
                  const inviter = gameService.getPlayer(event.inviterId);
                  if (!inviter) {
                    socket.sendToUser(event.inviterId, "error", {}); // TODO
                    reject();
                    return;
                  }
                  inviter.send({ type: "INVITATION_ACCEPTED" });
                  resolve();
                });
            } else reject();
          }),
        gameStart: (context) =>
          new Promise((resolve, reject) => {
            const gameId = gameService.getGame(context.userId);
            if (gameId) {
              socket.sendToUser(context.userId, "gameStarting", { gameId }); // TODO
              resolve();
            } else {
              reject();
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
        updateHistory: assign({
          history: (context, _, meta) => {
            if (meta.state?.changed) {
              context.history.push(meta.state.value);
            }
            return context.history;
          },
        }),
        addInvite: (context, event) => {
          assign({
            invitations: () => {
              context.invitations.set(event.inviterId, event.gameMode);
              return context.invitations;
            },
          });
          socket.sendToUser(context.userId, "newInvitation", {
            inviterId: context.userId,
            gameMode: context.gameMode,
          }); // TODO
        },
        refuseInvite: (context, event) => {
          assign({
            invitations: () => {
              context.invitations.delete(event.inviterId);
              return context.invitations;
            },
          });
          const inviter = gameService.getPlayer(event.inviterId);
          if (inviter) inviter.send({ type: "INVITATION_REJECTED" });
        },
        refuseAllInvites: (context) => {
          assign({
            invitations: () => new Set<number>(),
          });
          for (const inviterId of context.invitations.keys()) {
            const inviter = gameService.getPlayer(inviterId);
            if (inviter) inviter.send({ type: "INVITATION_REJECTED" });
          }
        },
      },
    }
  );
  return interpret(machine).start();
};
