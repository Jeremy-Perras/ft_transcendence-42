import { useEffect, useRef, useState } from "react";
import {
  LoaderFunctionArgs,
  useLoaderData,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ChannelDiscussionQuery,
  useChannelDiscussionQuery,
  useCreateChannelMessageReadMutation,
  useJoinChannelMutation,
  useSendChannelMessageMutation,
} from "../../graphql/generated";

import { ReactComponent as ForbiddenIcon } from "pixelarticons/svg/close-box.svg";
import { ReactComponent as EmptyChatIcon } from "pixelarticons/svg/message-plus.svg";
import { ReactComponent as PasswordIcon } from "pixelarticons/svg/lock.svg";
import { ReactComponent as JoinIcon } from "pixelarticons/svg/users.svg";
import { useForm } from "react-hook-form";
import BannedIcon from "/src/assets/images/Banned.svg";
import {
  QueryClient,
  useQuery,
  useQueryClient,
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

type formData = {
  password?: string;
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

type ChannelDisplayMessage = {
  userId: number;
  channelId: number;
  id: number;
  author: User;
  readBy: {
    __typename?: "ChannelMessageRead" | undefined;
    user: User;
  }[];
  content: string;
  sentAt: number;
};

type ChannelQuery = {
  userId: number;
  name: string;
  messages: ChannelMessage[];
  owner: { id: number; name: string; avatar: string };
  adminIds: { id: number }[];
  memberIds: { id: number }[];
  banned: {
    __typename?: "RestrictedMember" | undefined;
    id: number;
  }[];
  muted: { __typename?: "RestrictedMember" | undefined; id: number }[];
  password: boolean;
  private: boolean;
};

const query = (
  channelId: number
): UseQueryOptions<ChannelDiscussionQuery, unknown, ChannelQuery> => {
  return {
    queryKey: useChannelDiscussionQuery.getKey({
      channelId: channelId,
      userId: null,
    }),
    queryFn: useChannelDiscussionQuery.fetcher({
      channelId: channelId,
      userId: null,
    }),
    select: (channels) => ({
      userId: channels.user.id,
      name: channels.channel.name,
      messages: channels.channel.messages,
      owner: {
        id: channels.channel.owner.id,
        name: channels.channel.owner.name,
        avatar: channels.channel.owner.avatar,
      },
      adminIds: channels.channel.admins,
      memberIds: channels.channel.members,
      banned: channels.channel.banned,
      muted: channels.channel.banned,
      password: channels.channel.passwordProtected,
      private: channels.channel.private,
    }),
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

const Banned = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center pb-60">
      <img src={BannedIcon} className="w-96 text-slate-100 opacity-30" />
      <div className="mt-10 text-3xl text-neutral-300">You are banned.</div>
    </div>
  );
};

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
              src={`/uploads/avatars/${avatar}`}
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

const ChannelMessage = ({
  author,
  readBy,
  content,
  sentAt,
  userId,
  channelId,
  id,
}: ChannelDisplayMessage) => {
  const navigate = useNavigate();
  // TODO : update read messages does not work
  const queryClient = useQueryClient();
  const createChannelMessageRead = useCreateChannelMessageReadMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(
        useChannelDiscussionQuery.getKey({ channelId: +channelId })
      );
    },
  });
  useEffect(() => {
    if (readBy.some((users) => users.user.id === userId) === false) {
      console.log("test");
      createChannelMessageRead.mutate({
        messageId: id,
      });
    }
  }, []);

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
              src={`/uploads/avatars/${author.avatar}`}
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

const AccessForbidden = ({
  ownerId,
  ownerName,
  ownerAvatar,
}: {
  ownerId: number;
  ownerName: string;
  ownerAvatar: string;
}) => {
  const navigate = useNavigate();
  return (
    <div className="flex h-full w-full flex-col items-center justify-center pb-60">
      <ForbiddenIcon className="w-100 text-slate-100" />
      <div className="text-2xl text-slate-300">This Channel is private.</div>
      <div
        onClick={() => navigate(`/profile/${ownerId}`)}
        className="mt-5 flex flex-col items-center justify-center border-2 border-slate-200 bg-slate-100 p-2 text-xl text-slate-800 hover:cursor-pointer hover:bg-slate-200"
      >
        <div>Ask access to </div>
        <img
          src={`/uploads/avatars/${ownerAvatar}`}
          alt="Owner avatar"
          className="my-2 h-10 w-10 border border-black"
        />
        <div>{`${ownerName} !`}</div>
      </div>
    </div>
  );
};

const AccessProtected = ({
  channelId,
  ownerId,
  ownerName,
  ownerAvatar,
}: {
  channelId: number;
  ownerId: number;
  ownerName: string;
  ownerAvatar: string;
}) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<formData>();

  const [showPwdError, setShowPwdError] = useState(false);
  const queryClient = useQueryClient();
  const joinChannel = useJoinChannelMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(
        useChannelDiscussionQuery.getKey({ channelId: channelId })
      );
    },
    onError: () => setShowPwdError(true),
  });

  const navigate = useNavigate();
  return (
    <div className="flex h-full w-full flex-col items-center justify-center pb-60">
      <PasswordIcon className="w-100 text-slate-100" />
      <div className="text-2xl text-slate-300">
        Access to this channel is protected.
      </div>
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
      <div className="mt-10 text-lg text-slate-700">Forgot password?</div>
      <div
        onClick={() => navigate(`/profile/${ownerId}`)}
        className="mt-2 flex flex-col items-center justify-center border-2 border-slate-200 bg-slate-100 p-2 text-lg text-slate-800 hover:cursor-pointer hover:bg-slate-200"
      >
        <div>Ask to</div>
        <img
          src={`/uploads/avatars/${ownerAvatar}`}
          alt="Owner avatar"
          className="my-2 h-10 w-10 border border-black"
        />
        <div>{`${ownerName} !`}</div>
      </div>
    </div>
  );
};

const SendMessageElement = ({
  banned,
  muted,
  channelId,
}: {
  banned: boolean | undefined;
  muted: boolean | undefined;
  channelId: number;
}) => {
  const [content, setContent] = useState("");

  const queryClient = useQueryClient();
  const messageMutation = useSendChannelMessageMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(
        useChannelDiscussionQuery.getKey({
          channelId: +channelId,
        })
      );
    },
  });

  return (
    <div className="flex w-full bg-white px-[2px]">
      <textarea
        autoFocus={true}
        disabled={banned || muted}
        rows={2}
        className={`${
          banned || muted ? "hover:cursor-not-allowed" : ""
        }  w-full resize-none border-x-2 border-b-8 border-white px-2 pt-4 pb-2 `}
        onChange={(e) => setContent(e.target.value)}
        placeholder={`${
          banned
            ? "You are banned"
            : muted
            ? "You are muted"
            : "Type your message here ..."
        }`}
        onKeyDown={(e) => {
          if (banned === false && muted === false) {
            if (e.code == "Enter" && !e.getModifierState("Shift")) {
              messageMutation.mutate({
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

const DisplayMessage = ({
  messages,
  channelId,
  muted,
  banned,
  userId,
}: {
  messages: ChannelMessage[] | undefined;
  channelId: number;
  muted: boolean | undefined;
  banned: boolean | undefined;
  userId: number;
}) => {
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  return (
    <>
      <div className="mt-px flex w-full grow flex-col overflow-auto pr-2 pl-px">
        {messages?.length === 0 ? (
          <div className="mb-48 flex h-full flex-col items-center justify-center text-center text-slate-300">
            <EmptyChatIcon className="w-96 text-slate-200" />
            Seems a little bit too silent here... Send the first message !
          </div>
        ) : (
          <></>
        )}
        {messages?.map((message, index) => (
          <ChannelMessage
            key={index}
            userId={userId}
            channelId={channelId}
            {...message}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <SendMessageElement
        channelId={+channelId}
        muted={muted}
        banned={banned}
      />
    </>
  );
};

const JoinPublicChannel = ({ channelId }: { channelId: number }) => {
  const queryClient = useQueryClient();
  const joinChannel = useJoinChannelMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(
        useChannelDiscussionQuery.getKey({ channelId: +channelId })
      );
    },
  });

  return (
    <div className="flex h-full w-full flex-col items-center justify-center pb-60">
      <JoinIcon className="w-100 text-slate-100" />
      <div className="text-2xl text-slate-300">This Channel is public.</div>
      <div
        onClick={() => joinChannel.mutate({ channelId: +channelId })}
        className="mt-5 flex h-24 w-24 flex-col items-center justify-center border-2 border-slate-200 bg-slate-100 p-2 text-xl text-slate-800 hover:cursor-pointer hover:bg-slate-200"
      >
        <div>Join ? </div>
      </div>
    </div>
  );
};

export default function Channel() {
  const params = useParams();

  if (typeof params.channelId === "undefined") return <div>No channel Id</div>;
  const channelId = +params.channelId;

  const initialData = useLoaderData() as Awaited<
    ReturnType<typeof channelLoader>
  >;
  const { data } = useQuery({
    ...query(+channelId),
    initialData,
  });
  if (typeof data === "undefined") return <div>Error</div>;

  const navigate = useNavigate();

  const banned = data?.banned.some((u) => u.id === data.userId);
  const muted = data?.muted.some((u) => u.id === data.userId);

  const settingsLinkAuthorized =
    data?.owner.id === data?.userId ||
    data?.adminIds.some((admin) => admin.id === data.userId) ||
    data?.memberIds.some((member) => member.id === data.userId);

  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [data?.messages]);
  return (
    <>
      <Header>
        <>
          <HeaderLeftBtn>
            <HeaderNavigateBack />
          </HeaderLeftBtn>
          <HeaderCenterContent>
            <div
              className={`${
                settingsLinkAuthorized ? "hover:cursor-pointer" : ""
              } flex h-full items-center justify-center`}
              onClick={() =>
                navigate(
                  `${
                    settingsLinkAuthorized
                      ? `/settings/channel/${channelId}`
                      : ""
                  }`
                )
              }
            >
              <div>{data?.name}</div>
            </div>
          </HeaderCenterContent>
        </>
      </Header>
      {banned ? (
        <Banned />
      ) : data?.private ? (
        !data.adminIds.some((admin) => admin.id === data.userId) &&
        !data.memberIds.some((member) => member.id === data.userId) &&
        !(data.owner.id === data.userId) ? (
          <AccessForbidden
            ownerId={data?.owner.id}
            ownerAvatar={data.owner.avatar}
            ownerName={data.owner.name}
          />
        ) : (
          <DisplayMessage
            banned={banned}
            channelId={+channelId}
            messages={data?.messages}
            muted={muted}
            userId={data.userId}
          />
        )
      ) : data.password ? (
        !data.adminIds.some((admin) => admin.id === data.userId) &&
        !data.memberIds.some((member) => member.id === data.userId) &&
        !(data.owner.id === data.userId) ? (
          <AccessProtected
            channelId={+channelId}
            ownerId={data?.owner.id}
            ownerAvatar={data.owner.avatar}
            ownerName={data.owner.name}
          />
        ) : (
          <DisplayMessage
            banned={banned}
            channelId={+channelId}
            messages={data?.messages}
            muted={muted}
            userId={data.userId}
          />
        )
      ) : !data.adminIds.some((admin) => admin.id === data.userId) &&
        !data.memberIds.some((member) => member.id === data.userId) &&
        !(data.owner.id === data.userId) ? (
        <JoinPublicChannel channelId={channelId} />
      ) : (
        <DisplayMessage
          banned={banned}
          channelId={+channelId}
          messages={data?.messages}
          muted={muted}
          userId={data.userId}
        />
      )}
    </>
  );
}
