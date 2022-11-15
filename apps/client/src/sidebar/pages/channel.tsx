import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  usePasswordQuery,
  useCreateChannelMessageReadMutation,
  useInfoChannelQuery,
  useSendChannelMessageMutation,
} from "../../graphql/generated";
import { User } from "./chat";
import { getDate, Error, Loading, Fetching } from "./home";
import { ReactComponent as ForbiddenIcon } from "pixelarticons/svg/close-box.svg";
import { ReactComponent as EmptyChatIcon } from "pixelarticons/svg/message-plus.svg";
import { ReactComponent as PasswordIcon } from "pixelarticons/svg/lock.svg";
import { HeaderPortal } from "../layout";
import { useForm } from "react-hook-form";

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

const GetPassWord = ({ passwordId }: { passwordId: number }) => {
  const { data } = usePasswordQuery({
    passwordId: passwordId,
  });
  return data;
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

//TODO : Enter pw only at 1st connection to channel => set in back
const AccessProtected = ({
  channelId,
  ownerId,
  ownerName,
  ownerAvatar,
  setAuth,
}: {
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
              ? setAuth(true)
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
                The password do not match
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
        } = {
          userId: user.id,
          name: channel.name,
          messages: channel.messages,
          owner: {
            id: channel.owner.id,
            name: channel.owner.name,
            avatar: channel.owner.avatar,
          },
          adminIds: channel.admins,
          memberIds: channel.members,
          banned: channel.banned,
          muted: channel.banned,
          password: channel.passwordProtected,
          private: channel.private,
        };
        return res;
      },
    }
  );

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

  // GetPassWord({ password: "wer", passwordId: 5 });
  const banned = data?.banned.some((u) => u.id === data.userId);
  const muted = data?.muted.some((u) => u.id === data.userId);
  const [auth, setAuth] = useState(false);

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
      <>
        <HeaderPortal
          container={document.getElementById("header") as HTMLElement}
          text={data?.name}
          link={`/settings/channel/${channelId}`}
          icon=""
        />
        {data?.private &&
        !data.adminIds.some((admin) => admin.id === data.userId) &&
        !data.memberIds.some((member) => member.id === data.userId) ? (
          <AccessForbidden
            ownerId={data?.owner.id}
            ownerAvatar={data.owner.avatar}
            ownerName={data.owner.name}
          />
        ) : data?.password && !auth ? (
          <AccessProtected
            channelId={+channelId}
            ownerId={data?.owner.id}
            ownerAvatar={data.owner.avatar}
            ownerName={data.owner.name}
            setAuth={setAuth}
          />
        ) : (
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
            className="flex h-full flex-col bg-slate-100"
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
                disabled={banned || muted}
                rows={1}
                className={`${
                  banned || muted ? "hover:cursor-not-allowed" : ""
                } h-10 w-11/12 resize-none overflow-visible rounded-lg px-3 pt-2`}
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
        )}
      </>
    );
  }
}
