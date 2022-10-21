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
    <div className="m-2 w-full border-2 border-black text-sm">
      <div>Channel name: {channel.name}</div>
      <div>Type: {channel.type}</div>
      <div>Owner: {channel.owner.name}</div>
    </div>
  );
};

function ChannelListQuery() {
  const { isLoading, error, data, isFetching } = useQuery(["repoData"], () =>
    getChannel("http://localhost:3000/api/channels?q=5")
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
        {Object.values(data).map((channel: ChannelSchema) => {
          return <ChannelBanner key={channel.id} {...channel} />;
        })}
      </>
    );
  }
}

const displayMessages = (messages: any) => {
  return (
    <div>
      {messages.map((message: any) => {
        return (
          <div className=" m-5 w-full border-2 bg-slate-100 p-2">
            <div className="text-sm">{`${message.content}`}</div>
            <div className="text-xs text-slate-500">{`Sent by ${message.author.name} at ${message.sentAt}`}</div>
          </div>
        );
      })}
    </div>
  );
};

const UniqueChannelQuery = () => {
  const { isLoading, error, data, isFetching } = useQuery(["repoData"], () =>
    getChannel("http://localhost:3000/api/channels/onechannel")
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
    console.log(data as ChannelSchema);
    const channel = ChannelSchema.parse(data);
    return (
      <div className="m-2 flex w-full flex-col border-2 border-slate-600">
        <div className=" m-2 w-full flex-col border-2 border-black text-sm">
          <div>Channel name: {channel.name}</div>
          <div>Type: {channel.type}</div>
          <div>Owner: {channel.owner.name}</div>
        </div>
        <div>{displayMessages(channel.messages)}</div>
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
      <UniqueChannelQuery />
      {/* <ChannelListQuery /> */}
    </QueryClientProvider>
  );
}
