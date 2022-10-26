import { Link, useNavigate } from "react-router-dom";
import * as Avatar from "@radix-ui/react-avatar";
import { ReactComponent as UserIcon } from "pixelarticons/svg/user.svg";
import { ReactComponent as UsersIcon } from "pixelarticons/svg/users.svg";
import { ReactComponent as GamePadIcon } from "pixelarticons/svg/gamepad.svg";
import { useGetChatQuery, useGetInfoUsersQuery } from "../../graphql/generated";

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
  const { isLoading, data, error, isFetching } = useGetInfoUsersQuery();

  if (isLoading) return <div>Loading ...</div>;
  if (isFetching) {
    console.warn("Fetching");
    return <div>Fetching</div>;
  }
  if (error) {
    console.log("Error");
    return <div>Error</div>;
  } else {
    return (
      <>
        <div className="justify-items-center">
          <span>
            {data?.user.name} - Rank : {data?.user.rank}
          </span>
          <img src={data?.user.avatar} alt="Picture player" />
          <span className="w-full text-left">Friends : </span>
          {data?.user.friends.map((friend, index) => (
            <div key={index}>
              {friend.name} - Rank : {friend.rank}
            </div>
          ))}
          <span className="w-full text-left">Channels :</span>
          {data?.user.channels.map((chat) => (
            <div key={chat.name}>
              <Link to={`${"/channel/" + chat.name}`}>
                {chat.typename === "Channel" ? chat.name : ""}
              </Link>
            </div>
          ))}
        </div>
      </>
    );
  }
};

export default Home;
