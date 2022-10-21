import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";

// function useGetChannel(url: string) {
//   const [data, setData] = useState(null);

//     useEffect(() => {
//       (async () => {
//         try {
//           const response = await fetch(url);
//           if (response.status === 200) {
//             const json = await response.json();
//             const channel = ChannelSchema.parse(json);
//             console.log(channel)
//           } else
//             throw Error("Not 200!!")
//         } catch (error) {
//           console.log(error);
//         }
//       })();
//     }, [url]);
//   }

const queryClient = new QueryClient();

function Example() {
  const { isLoading, error, data } = useQuery(["repoData"], () =>
    fetch("http://localhost:3000/api/channels/1").then((res) => res.json())
  );
  console.log(data);
  // if (isLoading) console.log("Loading...");

  // if (error) console.log("An error has occurred: ");
  return <div></div>;
  // return (
  //   <div>
  //     <h1>{data.name}</h1>
  //     <p>{data.id}</p>
  //     <strong>👀 {data.admins}</strong> <strong>✨ {data.members}</strong>{" "}
  //     <strong>🍴 {data.messages}</strong>
  //   </div>
  // );
}

export default function Channel() {
  const [test, setTest] = useState("");
  // const url = "http://localhost:3000/api/channels/1";
  // const results = useGetChannel(url);
  // var teste = Example();
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Example />
      </QueryClientProvider>
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
      <div className="text-white"></div>
    </>
  );
}
