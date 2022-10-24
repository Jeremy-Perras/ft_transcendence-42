import { Link } from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { MessageSchema } from "@shared/schemas";

let queryClient = new QueryClient();

async function getDirectMessages(url: string) {
  try {
    const response = await fetch(url);
    if (response.status === 200) {
      const json = await response.json();
      return json;
    } else throw Error("Not 200!!");
  } catch (error) {
    console.log(error);
  }
}

const DirectConversation = ({ userId }: { userId: number }) => {
  const { isLoading, error, data, isFetching } = useQuery(["repoData"], () =>
    getDirectMessages(`http://localhost:3000/api/messages/user/${userId}`)
  );

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
        <div className="p-2 text-center">Conversation with user {userId}</div>
        {Object.values(data).map((message: any, index: number) => {
          let messages = MessageSchema.parse(message);
          return (
            <div key={index}>
              <div className="mt-5 ml-2 mr-2 flex w-auto flex-col border-2 bg-slate-100">
                <div className="text-end text-sm">{`${messages.content}`}</div>
              </div>
              <div className="ml-2 mr-2 w-auto align-text-bottom text-xs text-slate-500">{`Sent by ${messages.author.name} at ${messages.sentAt}`}</div>
            </div>
          );
        })}
      </div>
    );
  }
};

export default function Chat() {
  return (
    <QueryClientProvider client={queryClient}>
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
      <DirectConversation userId={123} />
    </QueryClientProvider>
  );
}
