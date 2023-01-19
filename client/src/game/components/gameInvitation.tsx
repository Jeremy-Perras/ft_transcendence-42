import { motion } from "framer-motion";
import { useState } from "react";
import { ReactComponent as AcceptIcon } from "pixelarticons/svg/check.svg";
import { ReactComponent as RefuseIcon } from "pixelarticons/svg/close.svg";
import { useAuthStore, useSocketStore } from "../../stores";
import { GameInvitation } from "../types/gameInvitation";
import { graphql } from "../../gql";
import request from "graphql-request";
import { useMutation } from "@tanstack/react-query";
import { GameMode } from "client/src/gql/graphql";

const AcceptInvitationMutationDocument = graphql(`
  mutation AcceptGameInvite($userId: Int!) {
    acceptGameInvite(userId: $userId)
  }
`);

const RefuseInvitationMutationDocument = graphql(`
  mutation RefuseGameInvite($userId: Int!) {
    refuseGameInvite(userId: $userId)
  }
`);

const Invitation = ({
  invitation,
  setInvitationList,
}: {
  invitation: GameInvitation;
  setInvitationList: React.Dispatch<React.SetStateAction<GameInvitation[]>>;
}) => {
  const acceptGameInvitation = useMutation(
    async ({ userId }: { userId: number }) =>
      request("/graphql", AcceptInvitationMutationDocument, {
        userId: userId,
      })
  );

  const refuseGameInvitation = useMutation(
    async ({ userId }: { userId: number }) =>
      request("/graphql", RefuseInvitationMutationDocument, {
        userId: userId,
      })
  );
  const [display, setDisplay] = useState(true);

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
            src={`/upload/avatar/${invitation.inviterId}`}
          />
          <span
            className={`shrink grow-0 truncate`}
          >{`${invitation.inviterName}`}</span>
          <span className="w-content">{` invites you to play ${invitation.gameMode} mode. Accept?`}</span>
        </span>

        <div className="flex basis-1/5 justify-end ">
          <AcceptIcon
            className="h-8 w-8 animate-none border border-slate-300 bg-slate-200 hover:cursor-pointer hover:bg-slate-300"
            onClick={() => {
              acceptGameInvitation.mutate({ userId: invitation.inviterId });
              setInvitationList([]);
            }}
          />
          <RefuseIcon
            className="mx-2 h-8 w-8 border border-slate-300 bg-slate-200 hover:cursor-pointer hover:bg-slate-300"
            onClick={() => {
              setInvitationList((list) =>
                list.filter((invite) => invite !== invitation)
              );

              refuseGameInvitation.mutate({ userId: invitation.inviterId });
            }}
          />
        </div>
      </motion.span>
    </div>
  ) : null;
};

export const GameInvitations = () => {
  const [invitationList, setInvitationList] = useState<GameInvitation[]>([]);
  const socket = useSocketStore().socket;
  const userId = useAuthStore().userId;
  if (!userId) return <></>;

  socket.on(
    "newInvitation",
    ({
      inviterId,
      gameMode,
      name,
    }: {
      inviterId: number;
      gameMode: GameMode;
      name: string;
    }) => {
      const newInvitation: GameInvitation = {
        inviterId: inviterId,
        inviteeId: userId,
        gameMode: gameMode,
        inviterName: name,
      };
      setInvitationList([newInvitation, ...invitationList]);
    }
  );

  socket.on("cancelInvitation", (gameInvitation: GameInvitation) => {
    setInvitationList((list) =>
      list.filter((invite) => invite !== gameInvitation)
    );
  });

  return (
    <>
      {invitationList.map((invitation, index) => (
        <Invitation
          key={index}
          invitation={invitation}
          setInvitationList={setInvitationList}
        />
      ))}
    </>
  );
};
