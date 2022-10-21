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

const ChannelBanner = (channel: ChannelSchema) => {
  return (
    <div className="m-10 border-2 border-black text-sm">
      <div>Channel Id : {channel.id}</div>
      <div>Channel name : {channel.name}</div>
      <div>Owner : {channel.owner.name}</div>
    </div>
  );
};

function ChannelQuery() {
  const { isLoading, error, data, isFetching } = useQuery(["repoData"], () =>
    getChannel("http://localhost:3000/api/channels?=2")
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
    let banners = new Array();
    for (let entry in data) {
      const channel = ChannelSchema.parse(data[entry]) as ChannelSchema;
      banners.push(channel);
    }
    return (
      <>
        {banners.map((channel) => {
          return <ChannelBanner key={channel.id} {...channel} />;
        })}
      </>
    );
  }
}

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
      <ChannelQuery />
    </QueryClientProvider>
  );
}
