import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetChannelQuery } from "../../graphql/generated";

const ReadingBy = ({ name }: { name: string[] }) => {
  return (
    <>
      {name.map((Users, index) => (
        <div key={index}>
          <img className="rounded-full" key={index} src={Users}></img>
        </div>
      ))}
    </>
  );
};
export default function Channel() {
  const { channelId } = useParams();
  const [readedBy, setReadedBy] = useState(0);
  const getDate = (time: number): Date => {
    return new Date(time);
  };
  if (!channelId) return <div>no channel id</div>;

  const { isLoading, isFetching, error, data } = useGetChannelQuery({
    channelId: +channelId,
  });
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
          <div>Channel id: {channelId}</div>
          <div>Channel: {data?.channel.name}</div>
          <div>Owner: {data?.channel.owner.name}</div>
        </div>
        <div className="flex h-full w-full flex-col">
          {data?.channel.messages?.map((m, index) => (
            <div
              key={index}
              className=" m-2 border-2 bg-slate-100"
              onMouseOver={() => setReadedBy(m.id)}
              onMouseOut={() => setReadedBy(0)}
            >
              <div className="mb-1 text-left">
                <span>{m.author.name} </span>
                <span className="text-xs">
                  {m.sentAt
                    ? getDate(+m.sentAt)
                        .toISOString()
                        .substring(0, 10) +
                      " - " +
                      getDate(+m.sentAt)
                        .toISOString()
                        .substring(11, 16)
                    : ""}
                </span>
              </div>
              <span key={index}>{m.content}</span>
              <div
                className={`${
                  readedBy === m.id ? "mt-1  flex flex-row text-xs" : "hidden"
                }`}
              >
                {
                  <ReadingBy
                    name={m.readBy.map((Users) => {
                      return Users.user.avatar;
                    })}
                  />
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
