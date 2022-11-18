import { useEffect, useRef, useState } from "react";
import {
  Params,
  useLoaderData,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  usePasswordQuery,
  useCreateChannelMessageReadMutation,
  useInfoChannelQuery,
  useSendChannelMessageMutation,
  InfoChannelQuery,
} from "../../graphql/generated";
import { User } from "./chat";
import { getDate } from "./home";
import { ReactComponent as ForbiddenIcon } from "pixelarticons/svg/close-box.svg";
import { ReactComponent as EmptyChatIcon } from "pixelarticons/svg/message-plus.svg";
import { ReactComponent as PasswordIcon } from "pixelarticons/svg/lock.svg";
import { HeaderPortal } from "../layout";
import { useForm } from "react-hook-form";
import BannedIcon from "/src/assets/images/Banned.svg";
import { socket } from "../../main";

import queryClient from "../../query";
import { QueryClient, useQuery, UseQueryOptions } from "@tanstack/react-query";

const query = (
  channelId: number
): UseQueryOptions<InfoChannelQuery, unknown, ChannelQuery> => {
  return {
    queryKey: useInfoChannelQuery.getKey({
      channelId: +channelId,
      userId: null,
    }),
    queryFn: useInfoChannelQuery.fetcher({
      channelId: +channelId,
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

export const channel =
  (queryClient: QueryClient) =>
  async ({ params }: { params: Params<"userId"> }) => {
    if (params.userId) {
      const userId = +params.userId;
      return queryClient.fetchQuery(query(userId));
    }
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

const Banned = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center pb-60">
      <img src={BannedIcon} className="w-96 text-slate-100 opacity-30" />
      <div className="mt-10 text-3xl text-neutral-300">You are banned.</div>
    </div>
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
          src={ownerAvatar}
          alt="Owner avatar"
          className="my-2 h-10 w-10 border border-black"
        />
        <div>{`${ownerName} !`}</div>
      </div>
    </div>
  );
};

//TODO : change
const GetPassword = ({ passwordId }: { passwordId: number }) => {
  const { data } = usePasswordQuery({
    passwordId: passwordId,
  });
  return data;
};

const AccessProtected = ({
  userId,
  channelId,
  ownerId,
  ownerName,
  ownerAvatar,
  setAuth,
}: {
  userId: number;
  channelId: number;
  ownerId: number;
  ownerName: string;
  ownerAvatar: string;
  setAuth: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm();
  const pass = GetPassword({ passwordId: +channelId });
  const navigate = useNavigate();
  return (
    <div className="flex h-full w-full flex-col items-center justify-center pb-60">
      <PasswordIcon className="w-100 text-slate-100" />
      <div className="text-2xl text-slate-300">
        Access to this channel is protected.
      </div>
      <div className="flex w-full flex-col items-center justify-center">
        <form
          onSubmit={handleSubmit(() => {
            pass?.password === watch("Password")
              ? (setAuth(true),
                (document.cookie = `userId=${userId}, channelId=${channelId}`))
              : setAuth(false);
          })}
          className="flex flex-col"
        >
          <div className="flex w-full px-4">
            <div className="flex flex-col justify-center text-center">
              <label className="mt-4 text-xl text-slate-400" htmlFor="Password">
                Enter password
              </label>
              <input
                {...register("Password", {
                  maxLength: 100,
                  required: true,
                  validate: (value) => value === pass?.password,
                })}
                type="Password"
                autoComplete="off"
                defaultValue=""
                className="my-4 h-10 w-64 self-center px-1 text-xl "
              />
            </div>
          </div>
          <span className="flex items-center justify-center text-center">
            {errors.Password && (
              <p className=" text-red-300 before:content-['⚠']">
                Wrong password
              </p>
            )}
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
          src={ownerAvatar}
          alt="Owner avatar"
          className="my-2 h-10 w-10 border border-black"
        />
        <div>{`${ownerName} !`}</div>
      </div>
    </div>
  );
};

const ChannelMessageTextArea = ({
  muted,
  channelId,
}: {
  muted: boolean;
  channelId: number;
}) => {
  const messageMutation = useSendChannelMessageMutation({
    onSuccess: () => {
      queryClient.invalidateQueries([]);
    },
  });
  const [content, setContent] = useState("");
  return (
    <div className="flex h-16 w-full border-t-2 bg-slate-50 p-2">
      <textarea
        disabled={muted}
        rows={1}
        className={`${
          muted ? "hover:cursor-not-allowed" : ""
        } h-10 w-11/12 resize-none overflow-visible rounded-lg px-3 pt-2`}
        onChange={(e) => setContent(e.target.value)}
        placeholder={`${
          muted === true ? "You are muted" : "Type your message here ..."
        }`}
        onKeyDown={(e) => {
          if (e.code == "Enter" && !e.getModifierState("Shift")) {
            socket?.emit("newChannelMessageSent", channelId);
            messageMutation.mutate({
              message: content,
              recipientId: channelId,
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
  );
};

const ChannelMessage = ({
  message,
  currentUserId,
}: {
  message: ChannelMessage;
  currentUserId: number;
}) => {
  const navigate = useNavigate();
  return (
    <>
      <div className="mt-6 text-center text-xs text-slate-300">
        {getDate(+message.sentAt)}
      </div>
      <div className="flex w-full">
        <div className="flex w-9 shrink-0 justify-center">
          <div className="flex self-end">
            <img
              className="h-6 w-6 border border-black transition-all hover:h-7 hover:w-7 hover:cursor-pointer"
              src={message.author.avatar}
              alt="Message author avatar"
              onClick={() => navigate(`/profile/${message.author.id}`)}
            />
          </div>
        </div>
        <div className="flex flex-col">
          <div className="text-left text-xs tracking-wide text-slate-400">
            <span>{message.author.name} </span>
          </div>
          <div className="rounded-md bg-slate-200 px-4 py-2 text-left tracking-wide">
            {message.content}
          </div>
        </div>
      </div>
      <div className="flex">
        <ReadBy
          users={message.readBy.map((Users) => {
            return Users.user;
          })}
        />
      </div>
    </>
  );
};

const ChannelMessagesDisplay = ({
  data,
  channelId,
}: {
  data: ChannelQuery;
  channelId: number;
}) => {
  useEffect(() => {
    scrollToBottom();
  }, [data?.messages]);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView();
  };
  const createChannelMessageRead = useCreateChannelMessageReadMutation({
    onSuccess: () => {
      queryClient.invalidateQueries([]);
    },
  });
  //TO DO : does not work - infinite loop
  // data.messages.forEach((message) => console.log(message.readBy));
  // useEffect(() => {
  //   data.messages.forEach((message) => {
  //     if (
  //       !message.readBy.some((message) => {
  //         message.user.id === data.userId;
  //       })
  //     ) {
  //       createChannelMessageRead.mutate({
  //         userId: data.userId,
  //         messageId: message.id,
  //       });
  //     } else null;
  //   }),
  //     [data.messages.length];
  // });
  return (
    <div className="flex h-full flex-col bg-slate-100">
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
          <ChannelMessage
            key={index}
            message={message}
            currentUserId={data.userId}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <ChannelMessageTextArea
        muted={data?.muted?.some((u) => u.id === data.userId)}
        channelId={channelId}
      />
    </div>
  );
};

export default function Channel() {
  const { channelId } = useParams();
  if (!channelId) return <div>no channel id</div>;
  const initialData = useLoaderData() as Awaited<
    ReturnType<ReturnType<typeof channel>>
  >;
  const { data } = useQuery({ ...query(+channelId), initialData });
  const banned = data?.banned.some((u) => u.id === data.userId);
  const [auth, setAuth] = useState(false);
  const cookies = document.cookie;
  return (
    <>
      <HeaderPortal
        container={document.getElementById("header") as HTMLElement}
        text={data?.name}
        link={
          banned ||
          (data?.password && !auth) ||
          (data?.private &&
            !data.adminIds.some((admin) => admin.id === data.userId) &&
            !data.memberIds.some((member) => member.id === data.userId))
            ? ""
            : `/settings/channel/${channelId}`
        }
        icon=""
      />
      {banned ? (
        <Banned />
      ) : data?.private &&
        !data.adminIds.some((admin) => admin.id === data.userId) &&
        !data.memberIds.some((member) => member.id === data.userId) ? (
        <AccessForbidden
          ownerId={data?.owner.id}
          ownerAvatar={data.owner.avatar}
          ownerName={data.owner.name}
        />
      ) : data?.password &&
        !auth &&
        !cookies.includes(`userId=${data?.userId}, channelId=${channelId}`) ? (
        <AccessProtected
          userId={data.userId}
          channelId={+channelId}
          ownerId={data?.owner.id}
          ownerAvatar={data.owner.avatar}
          ownerName={data.owner.name}
          setAuth={setAuth}
        />
      ) : typeof data === "undefined" ? (
        <></>
      ) : (
        <ChannelMessagesDisplay data={data} channelId={+channelId} />
      )}
    </>
  );
}
