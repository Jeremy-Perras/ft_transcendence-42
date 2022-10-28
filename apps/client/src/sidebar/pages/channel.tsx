import { useParams } from "react-router-dom";
import { useGetChannelQuery } from "../../graphql/generated";

export default function Channel() {
  const { channelId } = useParams();
  const getDate = (time: number): Date => {
    return new Date(time);
  };

  if (!channelId) return <div>no channel id</div>;

  const { isLoading, isFetching, error, data } = useGetChannelQuery({
    channelId: +channelId,
  });

  return (
    <div className="flex flex-col">
      <div className="mt-4 flex w-full flex-col items-center justify-center border-2 border-black p-2 text-center text-sm">
        <div>Channel id: {channelId}</div>
        <div>Channel: {data?.channel.name}</div>
        <div>Owner: {data?.channel.owner.name}</div>
      </div>
      <div className="flex h-full w-full flex-col ">
        {data?.channel.messages?.map((m, index) => (
          <div className=" m-2 border-2 bg-slate-100">
            <span key={index} className="text-left">
              {m.content}
            </span>
            <div>{m.sentAt ? getDate(+m.sentAt).toISOString() : ""}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
