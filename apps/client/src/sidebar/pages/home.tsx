/* eslint-disable prettier/prettier */
import { useNavigate } from "react-router-dom";
import * as Avatar from "@radix-ui/react-avatar";
import { ReactComponent as UserIcon } from "pixelarticons/svg/user.svg";
import { ReactComponent as UsersIcon } from "pixelarticons/svg/users.svg";
import { ReactComponent as GamePadIcon } from "pixelarticons/svg/gamepad.svg";
import { ReactComponent as LoaderIcon } from "pixelarticons/svg/loader.svg";
import { ReactComponent as AlertIcon } from "pixelarticons/svg/alert.svg";

import {
  useCreateChanelMutation,
  useGetInfoUsersQuery,
} from "../../graphql/generated";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

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

//TODO : animate loader image
export const Loading = () => {
  return (
    <div className="flex h-full select-none flex-col items-center justify-center text-slate-200">
      <LoaderIcon className="-mt-10 w-32" />
      <span className="mt-5 px-20 text-center text-4xl tracking-wide">
        Loading...
      </span>
    </div>
  );
};

export const Fetching = () => {
  return (
    <div className="flex h-full select-none flex-col items-center justify-center text-slate-200">
      <LoaderIcon className="-mt-10 w-32" />
      <span className="mt-5 px-20 text-center text-4xl tracking-wide">
        Fetching...
      </span>
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

const Chat = ({ __typename, name, avatar, id, messages }: Chat) => {
  const navigate = useNavigate();

  const lastMessage = messages[messages.length - 1];

  return (
    <div
      onClick={() =>
        navigate(`/${__typename == "User" ? "chat" : "channel"}/${id}`)
      }
      className="flex hover:cursor-pointer"
    >
      <div className="flex h-20 w-20 shrink-0 justify-center bg-black text-white">
        {__typename == "User" ? (
          <Avatar.Root>
            <Avatar.Image className="h-20 w-20 object-cover " src={avatar} />
            <Avatar.Fallback delayMs={0}>
              <UserIcon className="h-20 w-20" />
            </Avatar.Fallback>
          </Avatar.Root>
        ) : (
          <UsersIcon className="mt-2 h-20 w-20" />
        )}
      </div>
      <div className="flex grow flex-col border-l-2 border-b-2 px-2 hover:bg-slate-100">
        <div className="flex justify-between">
          <span className="font-bold">{name}</span>
          <span className="text-xs text-slate-400">
            {lastMessage?.sentAt ? getDate(+lastMessage.sentAt) : ""}
          </span>
        </div>
        <span className="flex max-h-10 overflow-hidden text-clip text-sm text-slate-400">
          {lastMessage?.content}
        </span>
      </div>
    </div>
  );
};

const Home = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(false);
  const { register, handleSubmit, watch } = useForm();
  const { isLoading, data, error, isFetching } = useGetInfoUsersQuery(
    {},
    {
      select({ user }) {
        const res: {
          currentUser: {
            id: number;
            name: string;
            avatar?: string;
            rank: number;
          };
          chats: Chat[];
        } = {
          currentUser: {
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            rank: user.rank,
          },
          chats: [...user.friends, ...user.channels].sort((a, b) => {
            const x = a.messages[a.messages.length - 1];
            const y = b.messages[b.messages.length - 1];
            if (!x) return 1;
            if (!y) return -1;
            return y.sentAt - x.sentAt;
          }),
        };
        return res;
      },
    }
  );
  const navigate = useNavigate();
  const createChannelMutation = useCreateChanelMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(["getInfoUsers"]);
    },
  });

  if (isLoading) return <Loading />;
  if (isFetching) {
    return <Fetching />;
  }
  if (error) {
    return <Error />;
  } else {
    return (
      <>
        <div
          className="flex flex-row items-center  border-4 border-double  border-slate-300 p-2 hover:cursor-pointer hover:bg-slate-100"
          onClick={() => navigate(`/profile/${data?.currentUser.id}`)}
        >
          <img
            src={data?.currentUser.avatar}
            alt="Player avatar"
            className="h-24 rounded-full border-2 border-solid  border-slate-300"
          />
          <div className="m-2 flex flex-col">
            <div className="text-xl font-bold">{data?.currentUser.name}</div>
            <div>Rank : {data?.currentUser.rank}</div>
          </div>
        </div>

        {data?.chats.map((chat, index) => (
          <Chat key={index} {...chat} />
        ))}
        {data?.chats.length === 0 ? <Empty /> : null}
        <button
          onClick={() => setForm(!form)}
          className="h-10 w-10 bg-black  "
        />
        <form
          onSubmit={handleSubmit(() =>
            createChannelMutation.mutate({
              inviteOnly: watch("inviteOnly"),
              name: watch("Name"),
              password: watch("Password") ? watch("Password") : "",
            })
          )}
        >
          <div>
            <label htmlFor="inviteOnly"> Private ? </label>
            <input {...register("inviteOnly")} type="checkbox" />
          </div>
          <div>
            <label htmlFor="name"> Name </label>
            <input
              {...register("Name", { required: true, maxLength: 20 })}
              defaultValue="Name"
            />
          </div>
          <div>
            <label htmlFor="Password"> Password </label>
            <input {...register("Password")} defaultValue="" />
          </div>

          <input type="submit" />
        </form>
      </>
    );
  }
};

export default Home;
