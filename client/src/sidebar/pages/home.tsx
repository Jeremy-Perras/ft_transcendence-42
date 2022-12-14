import { QueryClient, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useState } from "react";

import { ReactComponent as UserIcon } from "pixelarticons/svg/user.svg";
import { ReactComponent as UsersIcon } from "pixelarticons/svg/users.svg";
import { ReactComponent as AcceptIcon } from "pixelarticons/svg/check.svg";
import { ReactComponent as RefuseIcon } from "pixelarticons/svg/close.svg";
import { Navigate, useLoaderData, useNavigate } from "react-router-dom";
import * as Avatar from "@radix-ui/react-avatar";

import CreateChannel, { CreateChannelBtn } from "../components/createChannel";
import { SearchBar, SearchResults } from "../components/search";
import {
  Header,
  HeaderCenterContent,
  HeaderLeftBtn,
} from "../components/header";
import { getDate } from "../utils/getDate";

import { Empty } from "../components/Empty";
import { ReactComponent as GamePadIcon } from "pixelarticons/svg/gamepad.svg";
import { IsOnline } from "../components/isOnline";
import { graphql } from "../../../src/gql";
import request from "graphql-request";
import {
  ChatType,
  DiscussionsAndInvitationsQuery,
} from "../../../src/gql/graphql";

const DiscussionsAndInvitationsQueryDocument = graphql(`
  query DiscussionsAndInvitations($userId: Int) {
    user(id: $userId) {
      id
      chats {
        avatar
        hasUnreadMessages
        id
        lastMessageContent
        lastMessageDate
        name
        type
        status
      }
      pendingFriends {
        id
        avatar
        name
      }
    }
  }
`);

const query = (): UseQueryOptions<
  DiscussionsAndInvitationsQuery,
  unknown,
  DiscussionsAndInvitationsQuery
> => {
  return {
    queryKey: ["DiscussionsAndInvitations"],
    queryFn: async () =>
      request("/graphql", DiscussionsAndInvitationsQueryDocument, {
        userId: null,
      }),
  };
};

export const homeLoader = async (queryClient: QueryClient) => {
  return queryClient.fetchQuery(query());
};

const ChannelAndFriendBanner = ({
  chat,
}: {
  chat: DiscussionsAndInvitationsQuery["user"]["chats"][number];
}) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() =>
        navigate(
          `/${chat.type === ChatType.User ? "chat" : "channel"}/${chat.id}`
        )
      }
      className="flex justify-center transition-all hover:cursor-pointer  hover:bg-slate-100"
    >
      <div className="relative m-2 flex h-16 w-16 shrink-0 justify-center   text-white">
        {chat.type === ChatType.User && chat.status ? (
          <Avatar.Root>
            <Avatar.Image
              className="h-16 w-16 border border-black object-cover"
              src={`${chat.avatar}`}
            />
            <IsOnline userStatus={chat.status} />
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
          <span className="w-60 truncate pb-px font-bold">{chat.name}</span>
          <span className="mt-1 text-xs text-slate-400">
            {chat.lastMessageDate ? getDate(+chat.lastMessageDate) : ""}
          </span>
        </div>
        <span
          className={`${
            chat.hasUnreadMessages
              ? "text-base font-bold text-black"
              : "text-sm text-slate-400"
          }  flex max-h-5 max-w-sm overflow-hidden text-clip `}
        >
          {chat.lastMessageContent}
        </span>
      </div>
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
  // const addFriend = useAddFriendMutation();
  // const refuse = useRefuseInvitationMutation();

  return (
    <div className="my-px flex items-center justify-center border bg-slate-100">
      <div className="m-2 flex h-8 w-8 shrink-0  justify-center text-white">
        <Avatar.Root>
          <Avatar.Image
            className="h-8 w-8 border border-black object-cover"
            src={`${avatar}`}
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
            // onClick={() => {
            //   addFriend.mutate({ userId });
            // }}
          />
          <RefuseIcon
            className="mx-2 w-8 border border-slate-300 bg-slate-200 hover:cursor-pointer hover:bg-slate-300"
            // onClick={() => {
            //   refuse.mutate({ userId });
            // }}
          />
        </div>
      </div>
    </div>
  );
};

export const Home = () => {
  const [searchInput, setSearchInput] = useState("");
  const [showChannelCreation, setShowChannelCreation] = useState(false);

  const initialData = useLoaderData() as Awaited<ReturnType<typeof homeLoader>>;
  const { data: chatsAndInvitations } = useQuery({ ...query(), initialData });
  if (typeof chatsAndInvitations === "undefined")
    return <Navigate to={"/"} replace={true} />;

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
      <div className="flex h-full flex-col overflow-y-auto">
        <CreateChannel
          showChannelCreation={showChannelCreation}
          setShowChannelCreation={setShowChannelCreation}
        />
        {searchInput ? (
          <SearchResults
            searchInput={searchInput}
            setSearchInput={setSearchInput}
          />
        ) : (
          <>
            {chatsAndInvitations.user.pendingFriends.map((user, index) => (
              <Invitation
                key={index}
                userId={user.id}
                avatar={user.avatar}
                name={user.name}
              />
            ))}
            {chatsAndInvitations.user.chats.length === 0 ? (
              <Empty
                message="Add your friends to play with them!"
                Icon={GamePadIcon}
              />
            ) : (
              chatsAndInvitations.user.chats.map((chat, index) => (
                <ChannelAndFriendBanner key={index} chat={chat} />
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};
