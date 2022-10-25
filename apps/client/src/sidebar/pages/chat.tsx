import { Link, useParams } from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";

//TODO: put globalQueryFn in another file
export const globalQueryFn = (
  url: string,
  key: string,
  id: string | undefined
) => ({
  queryKey: [key, id],
  queryFn: async () => {
    const resp = await fetch(`${url}/${id}`);
    const data = await resp.json();
    return data;
  },
});

export const directMessagesLoader =
  (queryClient: QueryClient) =>
  async ({ params }: { params: any }) => {
    const query = globalQueryFn(
      "http://localhost:3000/api/messages/user",
      "direct_messages",
      params.userId
    );
    return (
      queryClient.getQueryData(query.queryKey) ??
      (await queryClient.fetchQuery(query))
    );
  };

const DirectConversation = () => {
  const params = useParams();
  const { isLoading, isFetching, error, data } = useQuery(
    globalQueryFn(
      "http://localhost:3000/api/messages/user",
      "direct_messages",
      params?.userId
    )
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
        <div className="p-2 text-center">
          Conversation with user {params?.userId}
        </div>
        {Object.values(data).map((message: any, index: number) => {
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
