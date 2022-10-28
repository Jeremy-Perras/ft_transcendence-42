import { useNavigate } from "react-router-dom";
import * as Avatar from "@radix-ui/react-avatar";
import { ReactComponent as UserIcon } from "pixelarticons/svg/user.svg";
import { ReactComponent as UsersIcon } from "pixelarticons/svg/users.svg";
import { ReactComponent as GamePadIcon } from "pixelarticons/svg/gamepad.svg";
import { useGetInfoUsersQuery } from "../../graphql/generated";

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
};

const Chat = ({
  id,
  type,
  name,
  lastMessageContent,
  lastMessageTime,
}: Chat) => {
  const navigate = useNavigate();
  const getDate = (time: number): Date => {
    return new Date(time);
  };
  const date = lastMessageTime ? getDate(+lastMessageTime).toISOString() : "";
  return (
    <div
      onClick={() =>
        navigate(`/${type == "friend" ? "chat" : "channel"}/${id}`)
      }
      className="flex hover:cursor-pointer"
    >
      <div className="flex h-20 w-20 shrink-0 justify-center bg-black text-white">
        {type == "User" ? (
          <Avatar.Root>
            <Avatar.Image
              className="h-20 w-20 object-cover "
              src={`https://i.pravatar.cc/300?img=${id}`}
            />
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
            {date.substring(0, 10)} - {date.substring(11, 16)}
          </span>
        </div>
        <span className="flex max-h-10 overflow-hidden text-clip text-sm text-slate-400">
          {lastMessageContent}
        </span>
      </div>
    </div>
  );
};

const Home = () => {
  const { isLoading, data, error, isFetching } = useGetInfoUsersQuery();
  const navigate = useNavigate();
  if (isLoading) return <div>Loading ...</div>;
  if (isFetching) {
    return <div>Fetching</div>;
  }
  if (error) {
    return <div>Error</div>;
  } else {
    return (
      <div>
        <div
          className="flex flex-row items-center  border-4 border-double  border-slate-300 p-2 hover:cursor-pointer hover:bg-slate-100"
          onClick={() => navigate(`/profile/${data?.user.id}`)}
        >
          <img
            src={data?.user.avatar}
            alt="Player avatar"
            className="border-2 border-solid  border-slate-300"
          />
          <div className="m-2 flex flex-col">
            <div className="text-xl font-bold">{data?.user.name}</div>
            <div>Rank : {data?.user.rank}</div>
          </div>
        </div>
        {data?.user.friends.map((friend, index) => (
          <div key={index}>
            <Chat
              id={friend.id}
              type="User"
              name={friend.name}
              lastMessageContent={
                friend.messages
                  ? friend.messages[friend.messages.length - 1]?.content
                  : ""
              }
              lastMessageTime={
                friend.messages
                  ? friend.messages[friend.messages.length - 1]?.sentAt
                  : ""
              }
            />
          </div>
        ))}
        {data?.user.channels.map((channel, index) => (
          <div key={index}>
            <Chat
              id={channel.id}
              type="Channel"
              name={channel.name}
              lastMessageContent={
                channel.messages
                  ? channel.messages[channel.messages.length - 1]?.content
                  : ""
              }
              lastMessageTime={
                channel.messages
                  ? channel.messages[channel.messages.length - 1]?.sentAt
                  : ""
              }
            />
          </div>
        ))}
      </div>
    );
  }
};

export default Home;
