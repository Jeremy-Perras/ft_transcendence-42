import { Link } from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

const defaultQueryFn = async ({ queryKey }: { queryKey: any }) => {
  let string = "http://localhost:3000/api/";
  queryKey.map((Key: any) => (string = string + Key + "/"));
  console.log(string);
  const resp = await fetch(string);
  const data = await resp.json();
  if (!data) {
    throw new Response("", {
      status: 404,
      statusText: "Not Found",
    });
  }
  return data;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
    },
  },
});

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

async function getChat(id: string | undefined) {
  // const resp = await fetch(`http://localhost:3000/api/chat/${id}`);
  // const data = await resp.json();
  // return data ?? null;
}

const chatDetailQuery = (id: string | undefined) => ({
  queryKey: ["Channel", id],
  queryFn: async () => {
    const channel = getChat(id);
    if (!channel) {
      throw new Response("", {
        status: 404,
        statusText: "Not Found",
      });
    }
    return channel;
  },
});
export const chatLoader =
  (queryClient: QueryClient) =>
  async ({ params }: { params: any }) => {
    const query = chatDetailQuery(params.channelId);
    return (
      queryClient.getQueryData(query.queryKey) ??
      (await queryClient.fetchQuery(query))
    );
  };

const DirectConversation = ({ userId }: { userId: number }) => {
  // const queryClient = useQueryClient();

  // All you have to do now is pass a key!
  const { isLoading, data, error, isFetching } = useQuery([
    "messages",
    "user",
    `${userId}`,
  ]);

  // const { isLoading, error, data, isFetching } = useQuery(["repoData"], () =>
  //   getDirectMessages(`http://localhost:3000/api/messages/user/${userId}`)
  // );

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
