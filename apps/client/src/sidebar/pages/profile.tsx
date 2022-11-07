import { useParams } from "react-router-dom";
import { useUserProfileQuery } from "../../graphql/generated";

//TODO : object destructuring
const DisplayUserProfile = () => {
  const params = useParams();
  if (typeof params.userId === "undefined") return <div></div>;
  const userId = +params.userId;
  const { isLoading, data, error, isFetching } = useUserProfileQuery({
    userId: userId,
  });
  if (isLoading) return <div>Loading ...</div>;

  if (isFetching) {
    return <div>Fetching</div>;
  }

  if (error) {
    return <div>Error</div>;
  }
  return (
    <div className="mt-4 flex w-full flex-col ">
      <div className="flex flex-col items-center justify-center p-2 ">
        <img
          src={data?.user.avatar}
          alt="Player avatar"
          className="h-24 rounded-full"
        />
        <div className="m-2 flex flex-col text-center">
          <div className="text-xl font-bold">{data?.user.name}</div>
          <div>Rank : {data?.user.rank}</div>
        </div>
      </div>

      <div className="mt-4 flex justify-evenly text-xl font-bold">
        <div className="w-24 rounded-xl  border-2 border-slate-200 bg-slate-100 p-2 text-center hover:border-slate-300 hover:bg-slate-200 ">
          Chat
        </div>
        <div className=" w-24 rounded-xl border-2  border-slate-200 bg-slate-100 p-2 text-center align-middle hover:border-slate-300 hover:bg-slate-200 ">
          {data?.user.blocked ? "Blocked" : "Block"}
        </div>
      </div>
      <div className="flex w-full flex-col  text-sm">
        <div className="mt-8 pb-2 text-center text-xl font-bold">
          MATCH HISTORY
        </div>
        {data?.user.games.map((game) => {
          const victory =
            (game.player1.id === data?.user.id &&
              game.player1score > game.player2score) ||
            (game.player2.id === data?.user.id &&
              game.player2score > game.player1score);
          return (
            <div
              className={`${
                victory ? "bg-green-300" : "bg-red-400 "
              } mt-px flex h-12 items-center px-2`}
            >
              <img
                className="h-10 w-10 rounded-full object-cover "
                src={game.player1.avatar}
                alt="Player 1 avatar"
              />
              <div className="ml-2 w-28 text-clip text-left">
                {game.player1.name}
              </div>
              <div className="text-lg font-bold">VS</div>
              <div className=" mr-2 flex w-28 justify-end text-clip">
                {game.player2.name}
              </div>
              <img
                className="h-10 w-10 rounded-full object-cover"
                src={game.player2.avatar}
                alt="Player 2 avatar"
              />
              <div className=" mx-2 w-20 border-x-2 border-white text-center font-bold">
                {victory ? <div>VICTORY</div> : <div>DEFEAT</div>}

                <div>
                  {game.player1score} - {game.player2score}
                </div>
              </div>
              <div className="self-center">{game.gamemode}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function Profile() {
  return <DisplayUserProfile />;
}
