import { QueryClient, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { ReactComponent as GamePadIcon } from "pixelarticons/svg/gamepad.svg";
import { ReactComponent as UserIcon } from "pixelarticons/svg/user.svg";
import { ReactComponent as UsersIcon } from "pixelarticons/svg/users.svg";
import { useLoaderData, useNavigate } from "react-router-dom";
import * as Avatar from "@radix-ui/react-avatar";
import {
  UserChatsAndFriendsQuery,
  useUserChatsAndFriendsQuery,
} from "../../graphql/generated";
import CreateChannel, { CreateChannelBtn } from "../components/createChannel";
import { SearchBar, SearchResults } from "../components/search";
import {
  Header,
  HeaderCenterContent,
  HeaderLeftBtn,
} from "../components/header";
import { getDate } from "../utils/getDate";
import { useUserProfileHeaderQuery } from "../../graphql/generated";

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
  friends?: { id: number }[];
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
      return [...data.user.friends, ...data.user.channels].sort((a, b) => {
        const x = a.messages.sort((c, d) => {
          return c.sentAt - d.sentAt;
        })[a.messages.length - 1];
        const y = b.messages.sort((c, d) => {
          return c.sentAt - d.sentAt;
        })[b.messages.length - 1];
        if (!x) return 1;
        if (!y) return -1;
        return y.sentAt - x.sentAt;
      });
    },
  };
};

export const homeLoader = async (queryClient: QueryClient) => {
  return queryClient.fetchQuery(query());
};

const Banner = ({ __typename, name, avatar, id, messages, friends }: Chat) => {
  const navigate = useNavigate();
  const lastMessage = messages[messages.length - 1];
  const myData = useUserProfileHeaderQuery(); //TODO: replace with auth-strore my Id
  console.log();
  const pendingAccept =
    __typename === "User" &&
    friends?.some((user) => user.id === myData.data?.user.id);
  return (
    <div
      onClick={() =>
        navigate(
          `/${
            __typename == "User" && !pendingAccept
              ? "chat"
              : __typename == "User"
              ? "profile"
              : "channel"
          }/${id}`
        )
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
          {!pendingAccept ? (
            <span className="mt-1 text-xs text-slate-400">
              {lastMessage?.sentAt ? getDate(+lastMessage.sentAt) : ""}
            </span>
          ) : null}
        </div>
        {pendingAccept ? (
          <span className="text-sm text-slate-300">Pending invitation...</span>
        ) : (
          <span className="flex max-h-5 max-w-sm overflow-hidden text-clip text-sm text-slate-400">
            {lastMessage?.content}
          </span>
        )}
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
          data?.map((chat, index) => <Banner key={index} {...chat} />)
        )}
      </div>
    </div>
  );
};
