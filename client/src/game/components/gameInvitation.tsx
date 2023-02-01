import { motion } from "framer-motion";
import { useState } from "react";
import { ReactComponent as AcceptIcon } from "pixelarticons/svg/check.svg";
import { ReactComponent as RefuseIcon } from "pixelarticons/svg/close.svg";
import { useAuthStore, useSocketStore } from "../../stores";
import { GameInvitation } from "../types/gameInvitation";
import { graphql } from "../../gql";
import { request } from "graphql-request";
import { useMutation } from "@tanstack/react-query";
import { GameMode } from "client/src/gql/graphql";
import queryClient from "../../query";

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
  setMessage,
  setDisplayError,
}: {
  invitation: GameInvitation;
  setInvitationList: React.Dispatch<React.SetStateAction<GameInvitation[]>>;
  setMessage: React.Dispatch<React.SetStateAction<string | undefined>>;
  setDisplayError: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const acceptGameInvitation = useMutation(
    async ({ userId }: { userId: number }) =>
      request("/graphql", AcceptInvitationMutationDocument, {
        userId: userId,
      })
  );
  const userId = useAuthStore().userId;
  const refuseGameInvitation = useMutation(
    async ({ userId }: { userId: number }) =>
      request("/graphql", RefuseInvitationMutationDocument, {
        userId: userId,
      }),
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (e: any) => {
        try {
          const message = e.response.errors[0].message;
          if (message) {
            setMessage(message);
          } else {
            setMessage("An error was unexpected please retry your action");
          }
        } catch {
          setMessage("An error was unexpected please retry your action");
        }
        queryClient.invalidateQueries(["Users", userId]);
        setDisplayError(true);
      },
    }
  );
  const [display, setDisplay] = useState(true);

  return display ? (
    <div className="absolute bottom-0 z-10 flex w-screen max-w-[100%] flex-wrap justify-center">
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
            className={`shrink grow-0 truncate text-xs sm:text-base`}
          >{`${invitation.inviterName}`}</span>
          <span className="truncate text-xs sm:text-base">{` invites you to play ${invitation.gameMode} mode. Accept?`}</span>
        </span>

        <div className="flex basis-1/5 justify-end ">
          <AcceptIcon
            className="h-6 w-6 animate-none border border-slate-300 bg-slate-200 hover:cursor-pointer hover:bg-slate-300 sm:h-8 sm:w-8"
            onClick={() => {
              acceptGameInvitation.mutate({ userId: invitation.inviterId });
              setInvitationList([]);
            }}
          />
          <RefuseIcon
            className="mx-2 h-6 w-6 border border-slate-300 bg-slate-200 hover:cursor-pointer hover:bg-slate-300 sm:h-8 sm:w-8"
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

export const GameInvitations = ({
  setMessage,
  setDisplayError,
}: {
  setMessage: React.Dispatch<React.SetStateAction<string | undefined>>;
  setDisplayError: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
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

  socket.on("cancelInvitation", ({ inviterId: inviterId }) => {
    setInvitationList((list) =>
      list.filter((invite) => invite.inviterId !== inviterId)
    );
  });

  return (
    <>
      {invitationList.map((invitation, index) => (
        <Invitation
          key={index}
          invitation={invitation}
          setInvitationList={setInvitationList}
          setMessage={setMessage}
          setDisplayError={setDisplayError}
        />
      ))}
    </>
  );
};
