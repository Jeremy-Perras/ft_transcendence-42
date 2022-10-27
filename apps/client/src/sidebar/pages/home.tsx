import { useNavigate } from "react-router-dom";
import * as Avatar from "@radix-ui/react-avatar";
import { ReactComponent as UserIcon } from "pixelarticons/svg/user.svg";
import { ReactComponent as UsersIcon } from "pixelarticons/svg/users.svg";
import { ReactComponent as GamePadIcon } from "pixelarticons/svg/gamepad.svg";
import { useGetChatQuery } from "../../graphql/generated";

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
  type: string;
  name: string;
  lastMessageContent: string | null;
  lastMessageTime: string | null;
  // lastMessage: {
  //   content: string | null;
  //   time: string | null;
  // };
  // TODO : put content and time in 1 object - convert time to date
};

const Chat = ({
  id,
  type,
  name,
  lastMessageContent,
  lastMessageTime,
}: Chat) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/${type == "User" ? "chat" : "channel"}/${id}`)}
      className="flex  hover:cursor-pointer"
    >
      <div className="flex h-20 w-20 shrink-0 justify-center bg-black text-white">
        {type == "User" ? (
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
          <span className="text-xs text-slate-400">{`${lastMessageTime}`}</span>
        </div>
        <span className="flex max-h-10 overflow-hidden text-clip text-sm text-slate-400">
          {lastMessageContent}
        </span>
      </div>
    </div>
  );
};

const Home = () => {
  const { status, data, error, isFetching } = useGetChatQuery(
    {},
    {
      select(data) {
        const friends = data.user.friends;
        const channels = data.user.channels;
        const chat: (typeof friends[number] | typeof channels[number])[] = [
          ...friends,
          ...channels,
        ];
        return chat;
      },
    }
  );

  return (
    <>
      {data?.map((chat) => (
        <div key={chat.name}>
          <Chat
            id={chat.id}
            type={chat.typename}
            name={chat.name}
            lastMessageContent={
              chat.messages
                ? chat.messages[chat.messages.length - 1]?.content
                : null
            }
            lastMessageTime={
              chat.messages
                ? chat.messages[chat.messages.length - 1]?.sentAt
                : null
            }
          />
        </div>
      ))}
    </>
  );
};

export default Home;
