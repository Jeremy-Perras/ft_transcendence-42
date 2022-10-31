import { Avatar } from "@radix-ui/react-avatar";
import { Link, useParams } from "react-router-dom";
import { useDirectMessagesQuery } from "../../graphql/generated";

const DirectConversation = () => {
  const params = useParams();
  if (typeof params.userId === "undefined") return <div></div>;
  const userId = +params.userId;

  const { isLoading, data, error, isFetching } = useDirectMessagesQuery({
    userId: userId,
  });

  if (isLoading) return <div>Loading ...</div>;

  if (isFetching) {
    return <div>Fetching</div>;
  }

  if (error) {
    return <div>Error</div>;
  }
  const getDate = (time: number): Date => {
    return new Date(time);
  };
  return (
    <div className="mb-2 mt-2 flex w-full flex-col border-t-2 border-slate-600">
      <div className="flex p-2 text-center">
        <img className="flex h-12 w-12 rounded-full" src={data?.user.avatar} />
        <div className="ml-5 flex h-full self-center text-xl font-bold">
          {data?.user.name}
        </div>
      </div>
      <ul className="flex w-full flex-col overflow-auto">
        {data?.user.messages.map((message, index) => (
          <li key={index} className=" mx-2 mb-5 flex flex-col ">
            <div className="mb-2 flex justify-center text-center text-xs text-slate-300">
              {getDate(+message.sentAt)
                .toISOString()
                .substring(0, 10) +
                " at " +
                getDate(+message.sentAt)
                  .toISOString()
                  .substring(11, 16)}
            </div>
            <div
              className={`${
                message.author.id === userId ? "justify-start" : "justify-end"
              } flex flex-row`}
            >
              <img
                className={`${
                  message.author.id === userId ? "order-first" : "order-last"
                } m-1 mb-px h-6 w-6 basis-1 self-end rounded-full`}
                src={message.author.avatar}
              />
              <div>
                <div
                  className={`px-4 py-2 tracking-wide ${
                    message.author.id === userId
                      ? "rounded-md bg-slate-300 "
                      : "rounded-md bg-slate-200 "
                  }`}
                >
                  {message.content}
                </div>
              </div>
            </div>
            <div
              className={`${
                message.author.id === userId ? "justify-end" : "justify-start"
              } flex text-xs text-slate-300`}
            >
              {message.readAt != undefined ? "Seen" : ""}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function Chat() {
  return <DirectConversation />;
}
