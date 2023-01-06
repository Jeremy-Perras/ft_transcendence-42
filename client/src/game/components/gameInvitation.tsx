import { motion } from "framer-motion";
import { graphql } from "../../../src/gql";
import { useState } from "react";
import { ReactComponent as AcceptIcon } from "pixelarticons/svg/check.svg";
import { ReactComponent as RefuseIcon } from "pixelarticons/svg/close.svg";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import request from "graphql-request";
import { io } from "socket.io-client";

import { useMediaQuery } from "@react-hookz/web";

import { GameInvitationQuery } from "client/src/gql/graphql";

// const GameInvitationQueryDocument = graphql(`
//   query GameInvitation($gameId: Int!) {
//     game(id: $gameId) {
//       gameMode
//       players {
//         player1 {
//           id
//           name
//         }
//       }
//     }
//   }
// `);

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

const Invitation = () => {
  const navigate = useNavigate();
  const [display, setDisplay] = useState(true);

  //   const launchGame = useMutation(
  //     async ({ gameId }: { gameId: number }) =>
  //       request("/graphql", LaunchGameMutationDocument, {
  //         gameId: gameId,
  //       }),
  //     {
  //       onSuccess: () => {
  //         navigate(`/game/${gameId}`);
  //       },
  //     }
  //   );

  const launchGame = useMutation(
    async ({ gameId }: { gameId: number }) =>
      request("/graphql", LaunchGameMutationDocument, {
        gameId: gameId,
      }),
    {
      onSuccess: () => {
        // navigate(`/game/${gameId?.game.}`);
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
    <div className="absolute bottom-0 z-10 flex w-screen justify-center">
      <motion.span
        onClick={() => setDisplay(false)}
        transition={{
          duration: 0.1,
          ease: "linear",
        }}
        initial={{ y: 128 }}
        animate={{ y: 0 }}
        className={`flex h-12 max-w-[100%] shrink grow-0 select-none items-center justify-center border-b border-slate-200 bg-slate-100 text-center align-middle font-content text-slate-600 shadow-[0_0px_10px_8px_rgba(0,0,0,0.5)] transition-all `}
      >
        <span className="mx-4 flex max-w-[80%] shrink grow-0 items-center whitespace-nowrap text-base tracking-wide">
          <img
            className="mx-2 h-8 w-8 shrink-0 border border-black"
            src={`http://localhost:5173/upload/avatar/1`}
          />
          {/* put userId */}
          <span
            className={`shrink grow-0 truncate`}
          >{`Begrthiojrohijtroihtjrtiohjrthiojrthjreb `}</span>
          <span className="w-content">{` invites you to play classic mode. Accept?`}</span>
        </span>
        {/* <span>{`${gameInvitation.players.player1.name} invites you to play ${gameInvitation.gameMode} mode. Accept?`}</span> */}
        <div className="flex basis-1/5 justify-end ">
          <AcceptIcon
            className="h-8 w-8 animate-none border border-slate-300 bg-slate-200 hover:cursor-pointer hover:bg-slate-300"
            onClick={() => {
              // launchGame.mutate({ gameId: gameInvitation.id });
              setDisplay(false);
            }}
          />
          <RefuseIcon
            className="mx-2 h-8 w-8 border border-slate-300 bg-slate-200 hover:cursor-pointer hover:bg-slate-300"
            onClick={() => {
              // refuseGameInvitation.mutate({ gameId: gameInvitation.id });
              setDisplay(false);
              // send refuse invitation notification from back
            }}
          />
        </div>
      </motion.span>
    </div>
  ) : null;
};

type GameInvitation = {
  userIds: [number, number]; //en 1er : inviter
  gameMode: string;
  gameId: number;
  userName: string;
};

export const GameInvitations = () => {
  let invitationList: GameInvitation[] = [
    { gameId: 1, userIds: [1, 2], userName: "Bloublou", gameMode: "Classic" },
  ];

  const socket = io();

  socket.on("launchInvitation", (targetId: GameInvitation) => {
    const newInvitation: GameInvitation = {
      userIds: targetId.userIds,
      gameMode: targetId.gameMode,
      gameId: targetId.gameId,
      userName: targetId.userName,
    };
    invitationList = [newInvitation, ...invitationList];
  });

  return (
    <>
      {invitationList.map((invite, index) => (
        <Invitation key={index} />
      ))}
    </>
  );
};
