import { motion } from "framer-motion";
import { graphql } from "../../../src/gql";
import { useState } from "react";
import { ReactComponent as AcceptIcon } from "pixelarticons/svg/check.svg";
import { ReactComponent as RefuseIcon } from "pixelarticons/svg/close.svg";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import request from "graphql-request";
import { io } from "socket.io-client";

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

const Invitation = ({ invitation }: { invitation: GameInvitation }) => {
  const navigate = useNavigate();
  const [display, setDisplay] = useState(true);

  // const launchGame = useMutation(
  //   async ({ gameId }: { gameId: number }) =>
  //     request("/graphql", LaunchGameMutationDocument, {
  //       gameId: gameId,
  //     }),
  //   {
  //     onSuccess: () => {
  //       navigate(`/game/${gameId}`);
  //     },
  //   }
  // );

  const launchGame = useMutation(
    async ({ gameId }: { gameId: number }) =>
      request("/graphql", LaunchGameMutationDocument, {
        gameId: gameId,
      }),
    {
      onSuccess: () => {
        navigate(`/game/${invitation.gameId}`);
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
            src={`http://localhost:5173/upload/avatar/${invitation.userIds[0]}`}
          />
          <span
            className={`shrink grow-0 truncate`}
          >{`${invitation.userName}`}</span>
          <span className="w-content">{` invites you to play ${invitation.gameMode} mode. Accept?`}</span>
        </span>

        <div className="flex basis-1/5 justify-end ">
          <AcceptIcon
            className="h-8 w-8 animate-none border border-slate-300 bg-slate-200 hover:cursor-pointer hover:bg-slate-300"
            onClick={() => {
              launchGame.mutate({ gameId: invitation.gameId });
              setDisplay(false);
            }}
          />
          <RefuseIcon
            className="mx-2 h-8 w-8 border border-slate-300 bg-slate-200 hover:cursor-pointer hover:bg-slate-300"
            onClick={() => {
              refuseGameInvitation.mutate({ gameId: invitation.gameId });
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
  const firstInvitation: GameInvitation[] = [];
  const [invitationList, setInvitationList] = useState(firstInvitation);

  // const socket = io();

  // socket.on("launchInvitation", (targetId: GameInvitation) => {
  //   const newInvitation: GameInvitation = {
  //     userIds: targetId.userIds,
  //     gameMode: targetId.gameMode,
  //     gameId: targetId.gameId,
  //     userName: targetId.userName,
  //   };
  //   setInvitationList([newInvitation, ...invitationList]);
  // });

  return (
    <>
      {invitationList.map((invitation, index) => (
        <Invitation key={index} invitation={invitation} />
      ))}
    </>
  );
};
