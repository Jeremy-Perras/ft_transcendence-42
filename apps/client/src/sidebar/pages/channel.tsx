import { Link, useParams } from "react-router-dom";
import { useGetChannelQuery } from "../../graphql/generated";

// const displayChannelMessages = (
//   messages: z.infer<typeof ChannelSchema.shape.messages>
// ) => {
//   return (
//     <>
//       {[...messages].map((message: any, index: number) => {
//         return (
//           <div key={index}>
//             <div className="mt-5 ml-2 mr-2 flex w-auto flex-col border-2 bg-slate-100">
//               <div className="text-end text-sm">{`${message.content}`}</div>
//             </div>
//             <div className="ml-2 mr-2 w-auto align-text-bottom text-xs text-slate-500">{`Sent by ${message.author.name} at ${message.sentAt}`}</div>
//           </div>
//         );
//       })}
//     </>
//   );
// };

// displays one channel with messages
const UniqueChannelQuery = () => {
  const params = useParams();
  //TODO: get id as int from params

  // const { isLoading, isFetching, error, data } = useGetChannelQuery(
  //   params?.channelId,
  //   {}
  // );
  // console.log(data);

  return (
    <div className="mb-2 mt-2 flex w-full flex-col border-t-2 border-slate-600 p-2">
      <div className="w-full flex-col items-center justify-center border-2 border-black p-2 text-center text-sm">
        <div>Channel id: {params.channelId}</div>
        {/* <div>Channel: {channel.name}</div>
          <div>Owner: {channel.owner.name}</div> */}
      </div>
      <div className="h-full w-full place-items-center">
        {/* {displayChannelMessages(channel.messages)} */}
      </div>
    </div>
  );
  // }
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
      <UniqueChannelQuery />
    </>
  );
}
