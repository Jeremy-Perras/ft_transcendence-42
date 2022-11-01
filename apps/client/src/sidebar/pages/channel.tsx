/* eslint-disable prettier/prettier */
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetChannelQuery } from "../../graphql/generated";
import { User } from "./chat";
const ReadBy = ({ users }: { users: User[] }) => {
  const navigate = useNavigate();

  return (
    <div className="ml-24 flex h-6 w-full items-end justify-start">
      <div className="mb-px mr-1 w-full text-end text-xs text-slate-300 ">
        Seen by
      </div>
      {users.map((user, index) => {
        const [showName, setShowName] = useState(false);
        return (
          <div
            className="relative flex h-full w-8 flex-col justify-center"
            key={index}
          >
            <img
              className="m-px h-4 w-4 self-center rounded-full transition-all hover:h-5 hover:w-5"
              key={index}
              src={user.avatar}
              onClick={() => navigate(`/profile/${user.id}`)}
              onMouseOver={() => setShowName(true)}
              onMouseOut={() => setShowName(false)}
            ></img>
            <div
              className={`${
                showName ? "opacity-100" : "opacity-0 "
              }  absolute top-5 right-0 my-1 w-24 grow text-ellipsis text-right text-xs text-slate-300 transition-all duration-100`}
            >
              {user.name}
            </div>
          </div>
        );
      })}
    </div>
  );
};
type ChannelMessage = {
  author: User;
  readBy: {
    __typename?: "ChannelMessageRead" | undefined;
    user: User;
  }[];
  content: string;
  sentAt: number;
};

const ChannelMessage = ({
  author,
  readBy,
  content,
  sentAt,
}: {
  author: User;
  readBy: {
    __typename?: "ChannelMessageRead" | undefined;
    user: User;
  }[];
  content: string;
  sentAt: number;
}) => {
  const navigate = useNavigate();
  const getDate = (time: number): Date => {
    return new Date(time);
  };
  return (
    <>
      <div className="mt-6 text-center text-xs text-slate-300">
        {sentAt
          ? getDate(+sentAt)
              .toISOString()
              .substring(0, 10) +
            " - " +
            getDate(+sentAt)
              .toISOString()
              .substring(11, 16)
          : ""}
      </div>
      <div className="flex w-full">
        <div className="flex w-9 shrink-0 justify-center">
          <div className="flex self-end">
            <img
              className="h-6 w-6 rounded-full transition-all hover:h-7 hover:w-7"
              src={author.avatar}
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

export default function Channel() {
  const { channelId } = useParams();

  if (!channelId) return <div>no channel id</div>;

  const { isLoading, isFetching, error, data } = useGetChannelQuery(
    {
      channelId: +channelId,
    },
    {
      select({ channel }) {
        const res: {
          name: string;
          messages: ChannelMessage[];
          owner: { id: number; name: string };
        } = {
          name: channel.name,
          messages: channel.messages,
          owner: { id: channel.owner.id, name: channel.owner.name },
        };
        return res;
      },
    }
  );
  if (isLoading) {
    return <div>Loading ...</div>;
  }
  if (isFetching) {
    return <div>Fetching</div>;
  }
  if (error) {
    return <div>Error</div>;
  } else {
    return (
      <div className="flex flex-col">
        <div className="mt-4 flex w-full flex-col items-center justify-center border-2 border-black p-2 text-center text-sm">
          <div>Channel: {data?.name}</div>
          <div>Owner: {data?.owner.name}</div>
        </div>
        <div className="flex h-full w-full flex-col pr-2 pl-px">
          {data?.messages?.map((message, index) => (
            <ChannelMessage key={index} {...message} />
          ))}
        </div>
      </div>
    );
  }
}
