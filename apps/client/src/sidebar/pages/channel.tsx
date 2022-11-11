import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useCreateChannelMessageReadMutation,
  useInfoChannelQuery,
  useSendChannelMessageMutation,
} from "../../graphql/generated";
import { User } from "./chat";
import { getDate, Error, Loading, Fetching } from "./home";
import { ReactComponent as EmptyChatIcon } from "pixelarticons/svg/message-plus.svg";

const ReadBy = ({ users }: { users: User[] }) => {
  const navigate = useNavigate();
  return (
    <div className="ml-24 flex h-6 w-full items-end justify-start">
      <div className="mb-px mr-1 w-full text-end text-xs text-slate-300 ">
        {users.length !== 0 ? "Seen by" : ""}
      </div>
      {users.map(({ id, name, avatar }, index) => {
        const [showName, setShowName] = useState(false);
        return (
          <div
            className="relative flex h-full w-8 flex-col flex-wrap justify-center"
            key={index}
          >
            <img
              className="m-px h-4 w-4 self-center border border-black transition-all hover:h-5 hover:w-5 hover:cursor-pointer"
              key={index}
              src={avatar}
              alt="User avatar"
              onClick={() => navigate(`/profile/${id}`)}
              onMouseOver={() => setShowName(true)}
              onMouseOut={() => setShowName(false)}
            ></img>
            <div
              className={`${
                showName ? "opacity-100" : "opacity-0 "
              } absolute top-5 right-0 my-1 w-24 grow truncate text-right text-xs text-slate-300 transition-all duration-100`}
            >
              {name}
            </div>
          </div>
        );
      })}
    </div>
  );
};

type ChannelMessage = {
  id: number;
  author: User;
  readBy: {
    __typename?: "ChannelMessageRead" | undefined;
    user: User;
  }[];
  content: string;
  sentAt: number;
};

const ChannelMessage = ({
  id,
  author,
  readBy,
  content,
  sentAt,
}: ChannelMessage) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="mt-6 text-center text-xs text-slate-300">
        {getDate(+sentAt)}
      </div>
      <div className="flex w-full">
        <div className="flex w-9 shrink-0 justify-center">
          <div className="flex self-end">
            <img
              className="h-6 w-6 border border-black transition-all hover:h-7 hover:w-7 hover:cursor-pointer"
              src={author.avatar}
              alt="Message author avatar"
              onClick={() => navigate(`/profile/${author.id}`)}
            />
          </div>
        </div>
        <div className="flex flex-col">
          <div className="text-left text-xs tracking-wide text-slate-400">
            <span>{author.name} </span>
          </div>
          <div className="rounded-md bg-slate-200 px-4 py-2 text-left tracking-wide">
            {content}
          </div>
        </div>
      </div>
      <div className="flex">
        <ReadBy
          users={readBy.map((Users) => {
            return Users.user;
          })}
        />
      </div>
    </>
  );
};

// const GetInfo = (Id: number) => {
//   const { isLoading, data, error, isFetching } = useInfoUsersQuery(
//     {
//       userId: Id,
//     },
//     {
//       select({ user }) {
//         const res: {
//           blocked: boolean;
//           blocking: boolean;
//         } = {
//           blocked: user.blocked,
//           blocking: user.blocking,
//         };
//         return res;
//       },
//     }
//   );
//   return data;
// };

export default function Channel() {
  const { channelId } = useParams();
  const queryClient = useQueryClient();

  if (!channelId) return <div>no channel id</div>;
  const { isLoading, isFetching, error, data } = useInfoChannelQuery(
    { channelId: +channelId, userId: null },
    {
      select({ channel, user }) {
        const res: {
          userId: number;
          name: string;
          messages: ChannelMessage[];
          owner: { id: number; name: string };
          banned: {
            __typename?: "RestrictedMember" | undefined;
            id: number;
          }[];
          muted: { __typename?: "RestrictedMember" | undefined; id: number }[];
        } = {
          userId: user.id,
          name: channel.name,
          messages: channel.messages,
          owner: { id: channel.owner.id, name: channel.owner.name },
          banned: channel.banned,
          muted: channel.banned,
        };
        return res;
      },
    }
  );
  console.log(data);
  // const infoSpeak = GetInfo(userId);
  const messageMutation = useSendChannelMessageMutation({
    onSuccess: () => {
      queryClient.invalidateQueries([]);
    },
  });
  const createChannelMessageRead = useCreateChannelMessageReadMutation({
    onSuccess: () => {
      queryClient.invalidateQueries([]);
    },
  });
  const [content, setContent] = useState("");
  const endMessages = useRef(null);
  // const b = endMessages.current as unknown as HTMLElement;
  // useEffect(() => {
  //   b?.scrollIntoView({
  //     behavior: "smooth",
  //   });
  // }, [data?.messages]);

  const banned = data?.banned.some((u) => u.id === data.userId);
  const muted = data?.muted.some((u) => u.id === data.userId);
  if (isLoading) {
    return <Loading />;
  }
  if (isFetching) {
    return <Fetching />;
  }
  if (error) {
    return <Error />;
  } else {
    return (
      <div
        onClick={() => {
          data?.messages.forEach((message) => {
            message.readBy
              ? ""
              : createChannelMessageRead.mutate({
                  messageId: message.id,
                  userId: data.userId,
                });
          });
        }}
        className="flex h-full flex-col"
      >
        <div className="mt-px flex w-full grow flex-col overflow-auto pr-2 pl-px">
          {data?.messages.length === 0 ? (
            <div className="mb-48 flex h-full flex-col items-center justify-center text-center text-slate-300">
              <EmptyChatIcon className="w-96 text-slate-200" />
              Seems a little bit too silent here... Send the first message !
            </div>
          ) : (
            <></>
          )}
          {data?.messages?.map((message, index) => (
            <ChannelMessage key={index} {...message} />
          ))}
          <div ref={endMessages} />
        </div>
        <div className="flex h-16 w-full border-t-2 bg-slate-50 p-2">
          <textarea
            disabled={banned == true || muted === true}
            rows={1}
            className="h-10 w-11/12 resize-none overflow-visible rounded-lg px-3 pt-2"
            onChange={(e) => setContent(e.target.value)}
            placeholder={`${
              banned === true
                ? "Your are banned"
                : muted === true
                ? "You are muted"
                : "Type your message here ..."
            }`}
            onKeyDown={(e) => {
              if (e.code == "Enter" && !e.getModifierState("Shift")) {
                messageMutation.mutate({
                  message: content,
                  recipientId: +channelId,
                });
                e.currentTarget.value = "";
                e.preventDefault();
                setContent("");
              } else {
                if (e.code == "Enter" && !e.getModifierState("Shift")) {
                  e.currentTarget.value = "";
                  e.preventDefault();
                  setContent("");
                }
              }
            }}
          />
        </div>
      </div>
    );
  }
}
