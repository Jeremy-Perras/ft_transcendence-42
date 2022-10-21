import { ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { ChannelSchema } from "shared";

let queryClient = new QueryClient();

async function getChannel(url: string) {
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

const ChannelBanner = (channel: any) => {
  return (
    <Link to="/chat/test">
      <div className="m-2 w-full border-2 border-black text-sm">
        <div>Channel name: {channel.name}</div>
        <div>Type: {channel.type}</div>
        <div>Owner: {channel.owner.name}</div>
      </div>
    </Link>
  );
};

function ChannelListQuery({ url }: { url: string }) {
  const { isLoading, error, data, isFetching } = useQuery(["repoData"], () =>
    getChannel(url)
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
      <>
        {Object.values(data).map((channel: any) => {
          return <ChannelBanner key={channel.id} {...channel} />;
        })}
      </>
    );
  }
}

const displayMessages = (messages: any) => {
  return (
    <>
      {messages.map((message: any, index: number) => {
        return (
          <div key={index}>
            <div className="mt-5 flex w-auto flex-col border-2 bg-slate-100  ">
              <div className="text-end text-sm">{`${message.content}`}</div>
            </div>
            <div className=" w-auto align-text-bottom text-xs text-slate-500">{`Sent by ${message.author.name} at ${message.sentAt}`}</div>
          </div>
        );
      })}
    </>
  );
};

const UniqueChannelQuery = ({ url }: { url: string }) => {
  const { isLoading, error, data, isFetching } = useQuery(["repoData"], () =>
    getChannel(url)
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
    let channel = ChannelSchema.parse(data);
    return (
      <div className="flex w-full flex-col items-center justify-center border-2 border-slate-600">
        <div className=" w-full flex-col items-center justify-center border-2 border-black p-2  text-center text-sm">
          <div>Channel name: {channel.name}</div>

          <div>Type: {channel.type}</div>

          <div>Owner: {channel.owner.name}</div>
        </div>
        <div className="h-full w-full place-items-center">
          {displayMessages(channel.messages)}
        </div>
      </div>
    );
  }
};

export default function Channel() {
  const [test, setTest] = useState("");
  return (
    <QueryClientProvider client={queryClient}>
      <input type="text" onChange={(e) => setTest(e.target.value)} />
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
      <UniqueChannelQuery url="http://localhost:3000/api/channels/585" />
    </QueryClientProvider>
  );
}
