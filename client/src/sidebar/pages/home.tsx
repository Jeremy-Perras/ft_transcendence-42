import {
  QueryClient,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { useState } from "react";
import { ReactComponent as GamePadIcon } from "pixelarticons/svg/gamepad.svg";
import { ReactComponent as UserIcon } from "pixelarticons/svg/user.svg";
import { ReactComponent as UsersIcon } from "pixelarticons/svg/users.svg";
import { ReactComponent as AcceptIcon } from "pixelarticons/svg/check.svg";
import { ReactComponent as RefuseIcon } from "pixelarticons/svg/close.svg";
import { useLoaderData, useNavigate } from "react-router-dom";
import * as Avatar from "@radix-ui/react-avatar";
import {
  useAddFriendMutation,
  UserChatsAndFriendsQuery,
  useUserChatsAndFriendsQuery,
  useRefuseInvitationMutation,
} from "../../graphql/generated";
import CreateChannel, { CreateChannelBtn } from "../components/createChannel";
import { SearchBar, SearchResults } from "../components/search";
import {
  Header,
  HeaderCenterContent,
  HeaderLeftBtn,
} from "../components/header";
import { getDate } from "../utils/getDate";
import { FriendStatus } from "../../graphql/generated";

type Chat = {
  __typename: "User" | "Channel";
  name: string;
  avatar?: string | undefined;
  id: number;
  messages?: {
    __typename?: "DirectMessage" | "ChannelMessage" | undefined;
    author: { __typename?: "User" | undefined; id: number };
    content: string;
    sentAt: number;
    readAt?: number | null | undefined;
  }[];
  friendStatus?: FriendStatus | undefined | null;
};

const query = (): UseQueryOptions<
  UserChatsAndFriendsQuery,
  unknown,
  Chat[]
> => {
  return {
    queryKey: useUserChatsAndFriendsQuery.getKey({}),
    queryFn: useUserChatsAndFriendsQuery.fetcher({}),
    select: (data) => {
      const merge = [...data.user.friends, ...data.user.channels].sort(
        (a, b) => {
          const x = a.messages.sort((c, d) => {
            return c.sentAt - d.sentAt;
          })[a.messages.length - 1];
          const y = b.messages.sort((c, d) => {
            return c.sentAt - d.sentAt;
          })[b.messages.length - 1];
          if (!x) return 1;
          if (!y) return -1;
          return y.sentAt - x.sentAt;
        }
      );
      return [...data.user.pendingFriends, ...merge];
    },
  };
};

export const homeLoader = async (queryClient: QueryClient) => {
  return queryClient.fetchQuery(query());
};

const ChannelAndFriendBanner = ({
  chat: { __typename, name, avatar, id, messages },
}: {
  chat: Chat;
}) => {
  const navigate = useNavigate();

  const lastMessage = messages ? messages[messages.length - 1] : null;

  //TODO : new channel message
  let newChatMessage = false;
  messages?.forEach((message) => {
    if (message.author.id === id && message.readAt === null)
      newChatMessage = true;
  });
  return (
    <div
      onClick={() =>
        navigate(`/${__typename == "User" ? "chat" : "channel"}/${id}`)
      }
      className="flex justify-center transition-all hover:cursor-pointer  hover:bg-slate-100"
    >
      <div className="m-2 flex h-16 w-16 shrink-0 justify-center   text-white">
        {__typename == "User" ? (
          <Avatar.Root>
            <Avatar.Image
              className="h-16 w-16 border border-black object-cover"
              src={`/uploads/avatars/${avatar}`}
            />
            <Avatar.Fallback delayMs={0}>
              <UserIcon className="h-16 w-16 border border-black bg-slate-50 p-1 text-neutral-700" />
            </Avatar.Fallback>
          </Avatar.Root>
        ) : (
          <UsersIcon className="h-16 w-16 border border-black bg-slate-50 p-1 pt-2 text-neutral-700" />
        )}
      </div>
      <div className="flex grow flex-col justify-center px-2">
        <div className="flex justify-between">
          <span className="pb-px font-bold">{name}</span>
          {__typename == "User" ? (
            <span className="mt-1 text-xs text-slate-400">
              {lastMessage?.sentAt ? getDate(+lastMessage.sentAt) : ""}
            </span>
          ) : null}
        </div>
        <span
          className={`${
            newChatMessage
              ? "text-base font-bold text-black"
              : "text-sm text-slate-400"
          }  flex max-h-5 max-w-sm overflow-hidden text-clip `}
        >
          {lastMessage?.content}
        </span>
      </div>
    </div>
  );
};

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

const Invitation = ({
  userId,
  avatar,
  name,
}: {
  userId: number;
  avatar: string | undefined;
  name: string;
}) => {
  const queryClient = useQueryClient();

  const addFriend = useAddFriendMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(useUserChatsAndFriendsQuery.getKey());
    },
  });

  const refuse = useRefuseInvitationMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(useUserChatsAndFriendsQuery.getKey());
    },
  });

  return (
    <div className="my-px flex items-center justify-center border bg-slate-100">
      <div className="m-2 flex h-8 w-8 shrink-0  justify-center text-white">
        <Avatar.Root>
          <Avatar.Image
            className="h-8 w-8 border border-black object-cover"
            src={`/uploads/avatars/${avatar}`}
          />
          <Avatar.Fallback delayMs={0}>
            <UserIcon className="h-8 w-8 border border-black bg-slate-50 p-1 text-neutral-700" />
          </Avatar.Fallback>
        </Avatar.Root>
      </div>
      <div className="flex w-full ">
        <span className="basis-2/3 pl-4 pt-1 align-middle font-bold">{`Accept ${name}'s invitation ? `}</span>
        <div className="flex basis-1/3 justify-end">
          <AcceptIcon
            className=" w-8 border border-slate-300 bg-slate-200 hover:cursor-pointer hover:bg-slate-300"
            onClick={() => {
              addFriend.mutate({ userId });
            }}
          />
          <RefuseIcon
            className="mx-2 w-8 border border-slate-300 bg-slate-200 hover:cursor-pointer hover:bg-slate-300"
            onClick={() => {
              refuse.mutate({ userId });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const Home = () => {
  const initialData = useLoaderData() as Awaited<ReturnType<typeof homeLoader>>;
  const { data } = useQuery({ ...query(), initialData });
  const [searchInput, setSearchInput] = useState("");
  const [showChannelCreation, setShowChannelCreation] = useState(false);
  return (
    <div className="relative flex h-full flex-col">
      <Header className={showChannelCreation ? "pointer-events-none" : ""}>
        <>
          <HeaderLeftBtn>
            <CreateChannelBtn setShowChannelCreation={setShowChannelCreation} />
          </HeaderLeftBtn>
          <HeaderCenterContent>
            <SearchBar
              searchInput={searchInput}
              setSearchInput={setSearchInput}
            />
          </HeaderCenterContent>
        </>
      </Header>
      <div className="h-full overflow-y-auto">
        <CreateChannel
          showChannelCreation={showChannelCreation}
          setShowChannelCreation={setShowChannelCreation}
        />
        {searchInput ? (
          <SearchResults
            searchInput={searchInput}
            setSearchInput={setSearchInput}
          />
        ) : data?.length === 0 ? (
          <Empty />
        ) : (
          data?.map((chat, index) =>
            chat.__typename === "User" &&
            chat.friendStatus === "INVITATIONRECEIVED" ? (
              <Invitation
                userId={chat.id}
                avatar={chat.avatar}
                name={chat.name}
                key={index}
              />
            ) : (
              <ChannelAndFriendBanner key={index} chat={chat} />
            )
          )
        )}
      </div>
    </div>
  );
};
