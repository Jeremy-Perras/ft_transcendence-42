import { Link } from "react-router-dom";
import { useGetChannelsMessagesQuery } from "../../graphql/generated";

export default function Channel({ n }: { n: string }) {
  const { isLoading, data, error, isFetching } = useGetChannelsMessagesQuery({
    name: n,
  });
  return (
    <>
      {data?.channels.map((c, index) => (
        <div key={index} className="flex h-full w-full flex-col ">
          {c.messages?.map((m, index) => (
            <span key={index} className=" m-2  text-left">
              {m.content}
            </span>
          ))}
        </div>
      ))}
    </>
  );
}
