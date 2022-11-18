import { Params, useLoaderData, useNavigate } from "react-router-dom";
import * as Avatar from "@radix-ui/react-avatar";
import { ReactComponent as UserIcon } from "pixelarticons/svg/user.svg";
import { ReactComponent as UsersIcon } from "pixelarticons/svg/users.svg";
import { ReactComponent as GamePadIcon } from "pixelarticons/svg/gamepad.svg";
import { ReactComponent as LoaderIcon } from "pixelarticons/svg/clock.svg";
import { ReactComponent as AlertIcon } from "pixelarticons/svg/alert.svg";
import {
  InfoUsersQuery,
  useInfoUsersQuery,
  useUpdateSocketMutation,
} from "../../graphql/generated";
import {
  QueryClient,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { socket } from "../../main";
import { useState } from "react";
import { myInfo } from "../layout";

const query = (): UseQueryOptions<InfoUsersQuery, unknown, Homequery> => {
  return {
    queryKey: useInfoUsersQuery.getKey({}),
    queryFn: useInfoUsersQuery.fetcher({}),
    select: (users) => ({
      currentUser: {
        id: users.user.id,
        name: users.user.name,
        avatar: users.user.avatar,
        rank: users.user.rank,
      },
      chats: [...users.user.friends, ...users.user.channels].sort((a, b) => {
        const x = a.messages.sort((c, d) => {
          return c.sentAt - d.sentAt;
        })[a.messages.length - 1];
        const y = b.messages.sort((c, d) => {
          return c.sentAt - d.sentAt;
        })[b.messages.length - 1];
        if (!x) return 1;
        if (!y) return -1;
        return y.sentAt - x.sentAt;
      }),
    }),
  };
};

export const home = (queryClient: QueryClient) => async () => {
  return queryClient.fetchQuery(query());
};
type Homequery = {
  currentUser: {
    id: number;
    name: string;
    avatar?: string;
    rank: number;
  };
  chats: Chat[];
};

export function getDate(time: number) {
  const date = new Date(time);
  return (
    date.toISOString().substring(0, 10) +
    " at " +
    date.toISOString().substring(11, 16)
  );
}
const Empty = () => {
  return (
    <div className="flex h-full select-none flex-col items-center justify-center text-slate-200">
      <GamePadIcon className="-mt-2 w-96" />
      <span className="-mt-10 px-20 text-center text-2xl">
        Add your friends to play with them!
      </span>
    </div>
  );
};

// const LoadingSkeleton = ({ w1, w2 }: { w1: string; w2: string }) => {
//   return (
//     <div className="flex animate-pulse justify-center transition-all ">
//       <div className="m-2 flex h-16 w-16 shrink-0 justify-center bg-slate-100 " />
//       <div className="flex w-full grow flex-col justify-evenly bg-slate-50 p-2">
//         <div className={`flex h-6 ${w1} bg-slate-100 `} />
//         <div className={`flex h-6 ${w2} bg-slate-100 `} />
//       </div>
//     </div>
//   );
// };

//DO NOT REMOVE : USE IN MAIN FILE WHEN LOADERS OK
const Loading = () => {
  return (
    <div className="flex h-full w-full animate-pulse flex-col items-center justify-center text-slate-200">
      <LoaderIcon className="w-80" />
      <div className="text-center text-4xl">Loading... </div>
    </div>
  );
};

export const Error = () => {
  return (
    <div className="flex h-full select-none flex-col items-center justify-center text-slate-200">
      <AlertIcon className="-mt-10 w-72" />
      <span className="mt-10 px-20 text-center text-4xl tracking-wide">
        Error while loading data
      </span>
    </div>
  );
};

type Chat = {
  __typename: "User" | "Channel";
  name: string;
  avatar?: string | undefined;
  id: number;
  messages: {
    __typename?: "DirectMessage" | "ChannelMessage" | undefined;
    content: string;
    sentAt: number;
  }[];
};

const Chat = ({ currentUser, chat }: { currentUser: number; chat: Chat }) => {
  const navigate = useNavigate();
  const lastMessage = chat.messages[chat.messages.length - 1];
  const [newMessage, setNewMessage] = useState(false);
  socket?.on("NewChannelMessage", (arg) => {
    // console.log("New message on channel" + arg);
    arg == chat.id && chat.__typename === "Channel"
      ? setNewMessage(true)
      : setNewMessage(false);
  });
  socket?.on("NewDirectMessage", (arg) => {
    console.log("New message to user " + arg[0] + " from " + arg[1]);
    chat.__typename === "User" && arg[1] == chat.id
      ? //change this with right back thing
        setNewMessage(true)
      : setNewMessage(false);
  });
  return (
    <div
      onClick={() =>
        navigate(
          `/${chat.__typename == "User" ? "chat" : "channel"}/${chat.id}`
        )
      }
      className="flex justify-center transition-all hover:cursor-pointer  hover:bg-slate-100"
    >
      <div className="relative m-2 flex h-16 w-16 shrink-0 justify-center   text-white">
        {chat.__typename == "User" ? (
          <Avatar.Root>
            <Avatar.Image
              className="h-16 w-16 border border-black object-cover"
              src={chat.avatar}
            />
            <Avatar.Fallback delayMs={0}>
              <UserIcon className="h-16 w-16 border border-black bg-slate-50 p-1 text-neutral-700" />
            </Avatar.Fallback>
          </Avatar.Root>
        ) : (
          <UsersIcon className="h-16 w-16 border border-black bg-slate-50 p-1 pt-2 text-neutral-700" />
        )}
        {newMessage ? (
          <span className="absolute top-0 right-0 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping bg-red-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 bg-red-500"></span>
          </span>
        ) : null}
      </div>
      <div className="flex grow flex-col justify-center px-2">
        <div className="flex justify-between">
          <span className="pb-px font-bold">{chat.name}</span>
          <span className="mt-1 text-xs text-slate-400">
            {lastMessage?.sentAt ? getDate(+lastMessage.sentAt) : ""}
          </span>
        </div>
        <span className="flex max-h-5 overflow-hidden text-clip text-sm text-slate-400">
          {lastMessage?.content}
        </span>
      </div>
    </div>
  );
};

const Home = () => {
  const initialData = useLoaderData() as Awaited<
    ReturnType<ReturnType<typeof home>>
  >;
  const tes = socket.id;
  const [test, setTest] = useState(false);
  const socketMutation = useUpdateSocketMutation({});
  if (socket.id && !test) {
    socketMutation.mutate({ socket: tes ? tes : "" });
    setTest(true);
  }
  const { data } = useQuery({ ...query(), initialData });

  return (
    <>
      <>
        {data?.chats.map((chat, index) => (
          <Chat key={index} currentUser={data?.currentUser.id} chat={chat} />
        ))}
        {data?.chats.length === 0 ? <Empty /> : null}
      </>
    </>
  );
};

export default Home;
