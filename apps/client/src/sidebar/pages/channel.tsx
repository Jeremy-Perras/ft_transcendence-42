import { ReactNode, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { ChannelSchema } from "@shared/schemas";
import { z } from "zod";
import { globalQueryFn } from "../sidebar";

// export const channelLoader =
//   (queryClient: QueryClient) =>
//   async ({ params }: { params: any }) => {
//     const query = globalQueryFn(
//       "http://localhost:3000/api/channels",
//       "channel",
//       params.channelId
//     );
//     return (
//       queryClient.getQueryData(query.queryKey) ??
//       (await queryClient.fetchQuery(query))
//     );
//   };

// const ChannelBanner = (channel: any) => {
//   const params = useParams();
//   const { data }: { data: any } = useQuery(
//     channelDetailQuery(params?.channelId)
//   );

//   return (
//     <Link to="/chat/test">
//       <div className="m-2 w-full border-2 border-black bg-slate-300 text-sm">
//         <div>Channel name: {channel.name}</div>
//         <div>Type: {channel.type}</div>
//         <div>Owner: {channel.owner.name}</div>
//       </div>
//     </Link>
//   );
// };

// // displays list of all channels or channels from search
// function ChannelListQuery({ url }: { url: string }) {
//   const { isLoading, error, data, isFetching } = useQuery(["repoData"], () =>
//     getChannel(url)
//   );

//   if (isLoading) return <div>Loading ...</div>;
//   if (isFetching) {
//     console.warn("Fetching");
//     return <div>Fetching</div>;
//   }
//   if (error) {
//     console.log("Error");
//     return <div>Error</div>;
//   } else {
//     return (
//       <>
//         {Object.values(data).map((channel: any) => {
//           return <ChannelBanner key={channel.id} {...channel} />;
//         })}
//       </>
//     );
//   }
// }

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
  const { isLoading, isFetching, error, data } = useQuery([
    "channels",
    params?.channelId,
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
