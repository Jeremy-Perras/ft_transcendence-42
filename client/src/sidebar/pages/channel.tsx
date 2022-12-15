import { useEffect, useRef, useState } from "react";
import {
  LoaderFunctionArgs,
  Navigate,
  useLoaderData,
  useNavigate,
  useParams,
} from "react-router-dom";

import { ReactComponent as ForbiddenIcon } from "pixelarticons/svg/close-box.svg";
import { ReactComponent as EmptyChatIcon } from "pixelarticons/svg/message-plus.svg";
import { ReactComponent as PasswordIcon } from "pixelarticons/svg/lock.svg";
import { ReactComponent as JoinIcon } from "pixelarticons/svg/users.svg";
import { useForm } from "react-hook-form";
import BannedIcon from "/src/assets/images/Banned.svg";
import {
  QueryClient,
  useMutation,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  Header,
  HeaderCenterContent,
  HeaderLeftBtn,
  HeaderNavigateBack,
} from "../components/header";
import { User } from "../types/user";
import { getDate } from "../utils/getDate";
import { useAuthStore, useErrorStore, useSidebarStore } from "../../stores";
import { ChannelUserRole } from "../types/channelUserRole";
import { ChannelUserStatus } from "../types/channelUserStatus";
import { graphql } from "../../gql";
import { ChannelDiscussionQuery } from "../../gql/graphql";
import request from "graphql-request";
import queryClient from "../../query";

type Channel = {
  name: string;
  messages: ChannelDiscussionQuery["channel"]["messages"];
  owner: { id: number; name: string; avatar: string };
  adminIds: { id: number }[];
  memberIds: { id: number }[];
  banned: {
    __typename?: "RestrictedMember" | undefined;
    id: number;
  }[];
  muted: { __typename?: "RestrictedMember" | undefined; id: number }[];
  isPasswordProtected: boolean;
  isPrivate: boolean;
};

const ChannelDiscussionQueryDocument = graphql(`
  query ChannelDiscussion($channelId: Int!) {
    channel(id: $channelId) {
      name
      private
      passwordProtected
      owner {
        id
        name
        avatar
      }
      members {
        id
      }
      admins {
        id
      }
      messages {
        content
        sentAt
        author {
          id
          name
          avatar
          status
        }
        readBy {
          id
          name
          avatar
          status
        }
      }
      banned {
        user {
          id
        }
        endAt
      }
      muted {
        user {
          id
        }
        endAt
      }
    }
  }
`);

const query = (
  channelId: number
): UseQueryOptions<
  ChannelDiscussionQuery,
  unknown,
  ChannelDiscussionQuery["channel"]
> => {
  return {
    queryKey: ["ChannelDiscussion", channelId],
    queryFn: async () =>
      request("/graphql", ChannelDiscussionQueryDocument, {
        channelId: channelId,
      }),
    select: (data) => data.channel,
  };
};

export const channelLoader = async (
  queryClient: QueryClient,
  { params }: LoaderFunctionArgs
) => {
  if (params.channelId) {
    const channelId = +params.channelId;
    return queryClient.fetchQuery(query(channelId));
  }
};

const JoinChannelMutationDocument = graphql(`
  mutation JoinChannel($channelId: Int!, $password: String) {
    joinChannel(channelId: $channelId, password: $password)
  }
`);

const SendChannelMessageMutationDocument = graphql(`
  mutation SendChannelMessage($message: String!, $channelId: Int!) {
    sendChannelMessage(message: $message, channelId: $channelId)
  }
`);

const JoinPublicChannel = ({ channelId }: { channelId: number }) => {
  const joinChannel = useMutation(
    async ({ channelId }: { channelId: number }) =>
      request("/graphql", JoinChannelMutationDocument, {
        channelId: channelId,
        password: undefined, //null?
      }),
    {
      onError: () => {
        const pushError = useErrorStore((state) => state.pushError);
        pushError("Error : join channel failed");
      },
      onSuccess: () =>
        queryClient.invalidateQueries(["ChannelDiscussion", channelId]),
    }
  );
  return (
    <div className="flex h-full w-full flex-col items-center justify-center pb-60">
      <JoinIcon className="w-100 text-slate-100" />
      <div className="text-2xl text-slate-300">This Channel is public.</div>
      <span
        onClick={() => joinChannel.mutate({ channelId: +channelId })}
        className="mt-5 flex h-24 w-24 flex-col items-center justify-center border-2 border-slate-200 bg-slate-100 p-2 text-xl text-slate-800 hover:cursor-pointer hover:bg-slate-200"
      >
        Join ?
      </span>
    </div>
  );
};

const AccessForbidden = ({ owner }: { owner: Channel["owner"] }) => {
  const navigate = useNavigate();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center overflow-auto pb-60">
      <ForbiddenIcon className="w-100 text-slate-100" />
      <span className="text-2xl text-slate-300">This Channel is private.</span>
      <div
        onClick={() => navigate(`/profile/${owner.id}`)}
        className="mt-5 flex flex-col items-center justify-center border-2 border-slate-200 bg-slate-100 p-2 text-xl text-slate-800 hover:cursor-pointer hover:bg-slate-200"
      >
        <span>Ask access to </span>
        <img
          src={`${owner.avatar}`}
          alt={`${owner.name}'s avatar`}
          className="my-2 h-10 w-10 border border-black"
        />
        <span>{owner.name} !</span>
      </div>
    </div>
  );
};

type PasswordFormData = {
  password?: string;
};

const AccessProtected = ({ channelId }: { channelId: number }) => {
  const [showPwdError, setShowPwdError] = useState(false);
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<PasswordFormData>();

  const joinChannel = useMutation(
    async ({
      channelId,
      password,
    }: {
      channelId: number;
      password: string | undefined;
    }) =>
      request("/graphql", JoinChannelMutationDocument, {
        channelId: channelId,
        password: password,
      }),
    {
      onError: () => {
        setShowPwdError(true);
      },
      onSuccess: () =>
        queryClient.invalidateQueries(["ChannelDiscussion", channelId]),
    }
  );

  return (
    <div className="flex h-full w-full shrink flex-col items-center justify-center overflow-auto pb-20">
      <PasswordIcon className="h-80 w-80 text-slate-100" />
      <span className="mt-20 h-16 text-2xl text-slate-300">
        Access to this channel is protected.
      </span>
      <div className="flex w-full flex-col items-center justify-center">
        <form
          onSubmit={handleSubmit((data) => {
            joinChannel.mutate({
              channelId: channelId,
              password: data.password,
            });
          })}
          className="flex flex-col"
        >
          <div className="flex w-full px-4">
            <div className="flex flex-col justify-center text-center">
              <label className="mt-4 text-xl text-slate-400" htmlFor="Password">
                Enter password
              </label>
              <input
                {...register("password", {
                  maxLength: 100,
                  required: true,
                })}
                type="Password"
                autoComplete="off"
                defaultValue=""
                className="mt-4 h-10 w-64 self-center px-1 text-xl "
              />
            </div>
          </div>
          <span className="flex h-8 items-center justify-center text-center text-base">
            {errors.password ? (
              <p className=" text-red-300 before:content-['⚠']">
                Password cannot be empty
              </p>
            ) : showPwdError ? (
              <p className=" text-red-300 before:content-['⚠']">
                Wrong password
              </p>
            ) : null}
          </span>
          <input
            className="mt-4 flex justify-center self-center border-2 border-slate-300 bg-slate-200 px-6 py-3 text-center text-xl font-bold hover:cursor-pointer hover:bg-slate-300"
            type="submit"
          />
        </form>
      </div>
    </div>
  );
};

const MessageInput = ({
  channelId,
  status,
}: {
  channelId: number;
  status: ChannelUserStatus;
}) => {
  const [content, setContent] = useState("");

  const sendChannelMessage = useMutation(
    async ({ message, channelId }: { message: string; channelId: number }) =>
      request("/graphql", SendChannelMessageMutationDocument, {
        message: message,
        channelId: channelId,
      }),
    {
      onError: () => {
        const pushError = useErrorStore((state) => state.pushError);
        pushError("Error : send channel message failed");
      },
      onSuccess: () =>
        queryClient.invalidateQueries(["ChannelDiscussion", channelId]),
    }
  );

  const cannotSendMessage =
    status === ChannelUserStatus.BANNED || status === ChannelUserStatus.MUTED;

  return (
    <div className="flex w-full bg-white px-[2px]">
      <textarea
        autoFocus={true}
        disabled={cannotSendMessage}
        rows={2}
        className={`${
          cannotSendMessage ? "hover:cursor-not-allowed" : ""
        }  w-full resize-none border-x-2 border-b-8 border-white px-2 pt-4 pb-2 `}
        onChange={(e) => setContent(e.target.value)}
        placeholder={`${
          status === ChannelUserStatus.BANNED
            ? "You are banned"
            : status === ChannelUserStatus.MUTED
            ? "You are muted"
            : "Type your message here ..."
        }`}
        onKeyDown={(e) => {
          if (!cannotSendMessage) {
            if (e.code == "Enter" && !e.getModifierState("Shift")) {
              sendChannelMessage.mutate({
                message: content,
                channelId: channelId,
              });
              e.currentTarget.value = "";
              e.preventDefault();
              setContent("");
            }
          }
        }}
      />
    </div>
  );
};

const ReadBy = ({ users }: { users: User[] }) => {
  const navigate = useNavigate();
  const [hoverUser, setHoverUser] = useState("");

  return (
    <div className="relative flex h-6 w-full shrink-0 flex-row flex-wrap items-center justify-end ">
      <span className="mb-px mr-1 text-end text-xs text-slate-300 ">
        {users.length > 20 ? `Seen by ${users.length} users` : "Seen by"}
      </span>
      <ul className="flex items-center">
        {users.slice(0, 20).map(({ id, name, avatar }, index) => {
          return (
            <li
              className="flex h-5 w-5 shrink-0 grow-0 items-center justify-center"
              key={index}
            >
              <img
                className="h-4 w-4 border border-black transition-all hover:h-5 hover:w-5 hover:cursor-pointer"
                src={`${avatar}`}
                alt={`${name}'s avatar`}
                onMouseEnter={() => setHoverUser(name)}
                onMouseLeave={() => setHoverUser("")}
                onClick={() => navigate(`/profile/${id}`)}
              />
            </li>
          );
        })}
      </ul>
      {hoverUser ? (
        <span className="absolute top-5 right-0 my-1 w-24 grow truncate text-right text-xs text-slate-300 opacity-0 transition-all duration-100 group-hover:opacity-100">
          {hoverUser}
        </span>
      ) : null}
    </div>
  );
};

const Message = ({
  author,
  readBy,
  content,
  sentAt,
}: ChannelDiscussionQuery["channel"]["messages"][number]) => {
  const navigate = useNavigate();
  return (
    <li className="flex flex-col">
      <span className="left-0 mt-6 text-center text-xs text-slate-300">
        {getDate(+sentAt)}
      </span>
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
          {content ? (
            <span className="rounded-md bg-slate-200 px-4 py-2 text-left tracking-wide">
              {content}
            </span>
          ) : (
            <span className="rounded-md bg-red-200 px-4 py-2 text-left italic tracking-wide">
              You must unblock this user to see their messages
            </span>
          )}
        </div>
      </div>
      {readBy.length > 0 && <ReadBy users={readBy} />}
    </li>
  );
};

const Messages = ({
  channelId,
  status,
  messages,
}: {
  channelId: number;
  status: ChannelUserStatus;
  messages: ChannelDiscussionQuery["channel"]["messages"] | undefined;
}) => {
  const sidebarIsOpen = useSidebarStore((state) => state.isOpen);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    sidebarIsOpen &&
      messagesEndRef?.current?.scrollIntoView({ behavior: "auto" });
  }, [messages, messagesEndRef]);

  return (
    <>
      <div className="mt-px flex w-full grow flex-col overflow-auto pb-2 pr-2 pl-px">
        {messages?.length === 0 ? (
          <div className="mb-48 flex h-full flex-col items-center justify-center text-center text-slate-300">
            <EmptyChatIcon className="w-96 text-slate-200" />
            Seems a little bit too silent here... Send the first message !
          </div>
        ) : null}
        <ul>
          {messages?.map((message, index) => {
            return <Message key={index} {...message} />;
          })}
        </ul>
        <div ref={messagesEndRef} />
      </div>
      <MessageInput status={status} channelId={channelId} />
    </>
  );
};

export default function Channel() {
  const navigate = useNavigate();
  const params = useParams();

  const userId = useAuthStore((state) => state.userId);
  if (!userId) {
    return <Navigate to={"/"} replace={true} />;
  }

  if (typeof params.channelId === "undefined")
    return <Navigate to={"/"} replace={true} />;
  const channelId = +params.channelId;
  const initialData = useLoaderData() as Awaited<
    ReturnType<typeof channelLoader>
  >;
  const { data: channel } = useQuery({
    ...query(channelId),
    initialData,
  });
  if (typeof channel === "undefined")
    return <Navigate to={"/"} replace={true} />;

  const role =
    channel.owner.id === userId
      ? ChannelUserRole.OWNER
      : channel.admins.some((admin) => admin.id === userId)
      ? ChannelUserRole.ADMIN
      : channel.members.some((member) => member.id === userId)
      ? ChannelUserRole.MEMBER
      : ChannelUserRole.NON_MEMBER;

  const status = channel.banned.some((banned) => banned.user.id === userId)
    ? ChannelUserStatus.BANNED
    : channel.muted.some((muted) => muted.user.id === userId)
    ? ChannelUserStatus.MUTED
    : ChannelUserStatus.OK;

  return (
    <>
      <Header>
        <>
          <HeaderLeftBtn>
            <HeaderNavigateBack />
          </HeaderLeftBtn>
          <HeaderCenterContent>
            <div
              className={`flex h-full items-center justify-center ${
                status !== ChannelUserStatus.BANNED
                  ? "hover:cursor-pointer"
                  : ""
              }`}
              onClick={() =>
                status !== ChannelUserStatus.BANNED &&
                navigate(`/settings/channel/${channelId}`)
              }
            >
              <span className="select-none truncate">{channel.name}</span>
            </div>
          </HeaderCenterContent>
        </>
      </Header>
      {status === ChannelUserStatus.BANNED ? (
        <div className="flex h-full w-full flex-col items-center justify-center overflow-auto pb-60">
          <img src={BannedIcon} className="w-96 text-slate-100 opacity-30" />
          <span className="mt-10 text-3xl text-neutral-300">
            You are banned.
          </span>
        </div>
      ) : role === ChannelUserRole.NON_MEMBER ? (
        channel.private ? (
          <AccessForbidden owner={channel.owner} />
        ) : channel.passwordProtected ? (
          <AccessProtected channelId={channelId} />
        ) : (
          <JoinPublicChannel channelId={channelId} />
        )
      ) : (
        <Messages
          channelId={channelId}
          status={status}
          messages={channel.messages}
        />
      )}
    </>
  );
}
