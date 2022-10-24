import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Avatar from "@radix-ui/react-avatar";
import { ReactComponent as UserIcon } from "pixelarticons/svg/user.svg";
import { ReactComponent as UsersIcon } from "pixelarticons/svg/users.svg";
import { ReactComponent as GamePadIcon } from "pixelarticons/svg/gamepad.svg";

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
  id: number;
  type: "friend" | "channel";
  name: string;
  lastMessage: {
    content: string | null;
    time: string | null;
  };
};

const initial: Chat[] = [
  {
    id: 1,
    type: "friend",
    name: "John Doe",
    lastMessage: {
      content: "Hello!",
      time: "12:00",
    },
  },
  {
    id: 2,
    type: "friend",
    name: "Jane Doe",
    lastMessage: {
      content: "hi!",
      time: "00:00",
    },
  },
  {
    id: 3,
    type: "channel",
    name: "General",
    lastMessage: {
      content: "test!",
      time: "00:11",
    },
  },
  {
    id: 4,
    type: "friend",
    name: "Test",
    lastMessage: {
      content: "",
      time: "",
    },
  },
];

const Chat = ({ id, type, name, lastMessage }: Chat) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() =>
        navigate(`/${type == "friend" ? "chat" : "channel"}/${id}`)
      }
      className="flex hover:cursor-pointer "
    >
      <div className="flex h-20 w-20 justify-center bg-black text-white">
        {type == "friend" ? (
          <Avatar.Root>
            <Avatar.Image
              className="h-20 w-20 object-cover "
              src={`https://i.pravatar.cc/300?img=${id}`}
            />
            <Avatar.Fallback delayMs={600}>
              <UserIcon className="w-4/5" />
            </Avatar.Fallback>
          </Avatar.Root>
        ) : (
          <UsersIcon className="mt-2 w-8/12" />
        )}
      </div>
      <div className="flex grow flex-col border-l-2 border-b-2 px-2 hover:bg-slate-100">
        <div className="flex justify-between">
          <span className="font-bold">{name}</span>
          <span className="text-xs text-slate-400">{lastMessage.time}</span>
        </div>
        <span className="text-sm text-slate-400">{lastMessage.content}</span>
      </div>
    </div>
  );
};

const Home = () => {
  const [chats] = useState<Chat[]>(initial);

  return (
    <>
      {chats.length === 0 ? (
        <Empty />
      ) : (
        chats.map((chat) => <Chat key={chat.id} {...chat} />)
      )}
    </>
  );
};

export default Home;
