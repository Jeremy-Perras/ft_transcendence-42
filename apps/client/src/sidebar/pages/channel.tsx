import { ReactNode, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { ChannelSchema } from "@shared/schemas";
import { z } from "zod";

async function getChannel(id: string | undefined) {
  const resp = await fetch(`http://localhost:3000/api/channels/${id}`);
  const data = await resp.json();

  return data ?? null;
}

const channelDetailQuery = (id: string | undefined) => ({
  queryKey: ["Channel", id],
  queryFn: async () => {
    const channel = getChannel(id);
    if (!channel) {
      throw new Response("", {
        status: 404,
        statusText: "Not Found",
      });
    }
    return channel;
  },
});

export const channelLoader =
  (queryClient: QueryClient) =>
  async ({ params }: { params: any }) => {
    const query = channelDetailQuery(params.channelId);
    return (
      queryClient.getQueryData(query.queryKey) ??
      (await queryClient.fetchQuery(query))
    );
  };

const displayChannelMessages = (
  messages: z.infer<typeof ChannelSchema.shape.messages>
) => {
  return (
    <>
      {[...messages].map((message: any, index: number) => {
        return (
          <div key={index}>
            <div className="mt-5 ml-2 mr-2 flex w-auto flex-col border-2 bg-slate-100">
              <div className="text-end text-sm">{`${message.content}`}</div>
            </div>
            <div className="ml-2 mr-2 w-auto align-text-bottom text-xs text-slate-500">{`Sent by ${message.author.name} at ${message.sentAt}`}</div>
          </div>
        );
      })}
    </>
  );
};

// displays one channel with messages
const UniqueChannelQuery = () => {
  const params = useParams();
  // const [url, setUrl] = useState("http://localhost:3000/api/channels/");
  // setUrl(params?.channelId);
  // console.log(url);
  const { isLoading, isFetching, error, data } = useQuery(
    // channelDetailQuery(params?.channelId)
    ["api", "channels", `${params?.channelId}`]
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
    const channel = ChannelSchema.parse(data);
    return (
      <div className="mb-2 mt-2 flex w-full flex-col border-t-2 border-slate-600 p-2">
        <div className="w-full flex-col items-center justify-center border-2 border-black p-2 text-center text-sm">
          <div>Channel: {channel.name}</div>
          <div>Owner: {channel.owner.name}</div>
        </div>
        <div className="h-full w-full place-items-center">
          {displayChannelMessages(channel.messages)}
        </div>
      </div>
    );
  }
};

export default function Channel() {
  return (
    <>
      <h1 className="text-lg">channel</h1>
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
      {/* <ChannelListQuery url="http://localhost:3000/api/channels/" /> */}
      <UniqueChannelQuery />
    </>
  );
}