import { motion } from "framer-motion";
import { graphql } from "../../../src/gql";
import { useState } from "react";
import { ReactComponent as AcceptIcon } from "pixelarticons/svg/check.svg";
import { ReactComponent as RefuseIcon } from "pixelarticons/svg/close.svg";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import request from "graphql-request";
import { io } from "socket.io-client";

const GameInvitationQueryDocument = graphql(`
  query GameInvitation($gameId: Int!) {
    game(id: $gameId) {
      gameMode
      players {
        player1 {
          id
          name
        }
      }
    }
  }
`);

const LaunchGameMutationDocument = graphql(`
  mutation LaunchGame($gameId: Int!) {
    launchGame(gameId: $gameId)
  }
`);

const RefuseGameInvitationMutationDocument = graphql(`
  mutation RefuseGameInvitation($gameId: Int!) {
    deleteGame(gameId: $gameId)
  }
`);

export const GameInvitation = () => {
  const [display, setDisplay] = useState(false);
  const [gameId, setGameId] = useState(-1);
  const navigate = useNavigate();
  const socket = io();

  socket.on("gameInvitation", (targetId: number) => {
    setDisplay(true);
    setGameId(targetId);
  });

  const { data: gameInvitation } = useQuery({
    queryKey: ["GameInvitation"],
    queryFn: async () =>
      gameId != -1
        ? request("/graphql", GameInvitationQueryDocument, {
            gameId: gameId,
          })
        : null,
  }); //TODO : find better way to do this

  const launchGame = useMutation(
    async ({ gameId }: { gameId: number }) =>
      request("/graphql", LaunchGameMutationDocument, {
        gameId: gameId,
      }),
    {
      onSuccess: () => {
        navigate(`/game/${gameInvitation.id}`);
      },
    }
  );

  const refuseGameInvitation = useMutation(
    async ({ gameId }: { gameId: number }) =>
      request("/graphql", RefuseGameInvitationMutationDocument, {
        gameId: gameId,
      }),
    {}
  );

  return display ? (
    <motion.span
      onClick={() => setDisplay(false)}
      transition={{
        duration: 0.1,
        ease: "linear",
        repeatType: "reverse",
        repeat: 1,
        repeatDelay: 2.8,
      }}
      initial={{ y: 128 }}
      animate={{ y: 0 }}
      className={`${
        display ? "" : "hidden"
      } absolute bottom-0 z-10 flex h-32 w-96 border-b border-slate-200 bg-slate-100 text-center align-middle transition-all`}
    >
      <span>{`${gameInvitation.players.player1.name} invites you to play ${gameInvitation.gameMode} mode. Accept?`}</span>
      <div className="flex basis-1/5 justify-end">
        <AcceptIcon
          className="w-8 border border-slate-300 bg-slate-200 hover:cursor-pointer hover:bg-slate-300"
          onClick={() => {
            launchGame.mutate({ gameId: gameInvitation.id });
            setDisplay(false);
            setGameId(-1);
          }}
        />
        <RefuseIcon
          className="mx-2 w-8 border border-slate-300 bg-slate-200 hover:cursor-pointer hover:bg-slate-300"
          onClick={() => {
            refuseGameInvitation.mutate({ gameId: gameInvitation.id });
            setDisplay(false);
            setGameId(-1);
            // send refuse invitation notification from back
          }}
        />
      </div>
    </motion.span>
  ) : null;
};
