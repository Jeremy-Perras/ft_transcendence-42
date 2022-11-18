import { useLoaderData, useNavigate } from "react-router-dom";
import * as Avatar from "@radix-ui/react-avatar";
import { ReactComponent as UserIcon } from "pixelarticons/svg/user.svg";
import { ReactComponent as UsersIcon } from "pixelarticons/svg/users.svg";
import { ReactComponent as GamePadIcon } from "pixelarticons/svg/gamepad.svg";
import {
  HomepageUserQuery,
  useHomepageUserQuery,
  useUpdateSocketMutation,
} from "../../graphql/generated";
import { QueryClient, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { socket } from "../../main";
import { useState } from "react";

const query = (): UseQueryOptions<HomepageUserQuery, unknown, Homequery> => {
  return {
    queryKey: useHomepageUserQuery.getKey({}),
    queryFn: useHomepageUserQuery.fetcher({}),
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

type Chat = {
  __typename: "User" | "Channel";
  name: string;
  avatar?: string | undefined;
  id: number;
  messages: {
    __typename?: "DirectMessage" | "ChannelMessage" | undefined;
    author: { id: number };
    content: string;
    sentAt: number;
    readAt?: number | null | undefined;
    readBy?: { user: { id: number } }[];
  }[];
};

const Chat = ({
  currentUserId,
  chat,
}: {
  currentUserId: number;
  chat: Chat;
}) => {
  const navigate = useNavigate();
  const lastMessage = chat.messages[chat.messages.length - 1];

  const newChatMessage =
    chat.__typename === "User" &&
    chat.messages.length != 0 &&
    chat.messages.some((message) => {
      message.readAt === null && message.author.id === chat.id;
    });

  const newChannelMessage =
    chat.__typename === "Channel" &&
    chat.messages.length != 0 &&
    !(lastMessage?.author.id === currentUserId) &&
    (lastMessage?.readBy === null ||
      typeof lastMessage?.readBy === undefined ||
      !lastMessage?.readBy?.some((user) => {
        console.log(user.user.id);
        return user.user.id === currentUserId;
      }));

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
        {newChatMessage || newChannelMessage ? (
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

//TODO : button to disconnect
//TODO: issue : update only when window focused
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
          <Chat key={index} currentUserId={data.currentUser.id} chat={chat} />
        ))}
        {data?.chats.length === 0 ? <Empty /> : null}
      </>
    </>
  );
};

export default Home;
