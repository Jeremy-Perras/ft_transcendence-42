import { Link, useParams } from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";

const DirectConversation = () => {
  const params = useParams();
  const { isLoading, isFetching, error, data } = useQuery([
    "messages",
    "user",
    params?.userId,
  ]);

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
      <div className="mb-2 mt-2 flex w-full flex-col border-t-2 border-slate-600">
        <div className="p-2 text-center">
          Conversation with user {params?.userId}
        </div>
        {data.map((message: any, index: number) => {
          return (
            <div key={index}>
              <div className="mt-5 ml-2 mr-2 flex w-auto flex-col border-2 bg-slate-100">
                <div className="text-end text-sm">{`${message.content}`}</div>
              </div>
              <div className="ml-2 mr-2 w-auto align-text-bottom text-xs text-slate-500">{`Sent by ${message.author.name} at ${message.sentAt}`}</div>
            </div>
          );
        })}
      </div>
    );
  }
};

export default function Chat() {
  return (
    <div>
      <h1 className="text-lg">chat</h1>
      <ul>
        <li>
          <Link to="/">list</Link>
        </li>
        <li>
          <Link to="/channel/test">channel</Link>
        </li>
        <li>
          <Link to="/chat/test">chat</Link>
        </li>
        <li>
          <Link to="/profile/user">profile</Link>
        </li>
      </ul>
      <DirectConversation />
    </div>
  );
}
