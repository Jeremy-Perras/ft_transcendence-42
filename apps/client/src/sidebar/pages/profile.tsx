import {
  QueryClient,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { Params, useLoaderData, useParams } from "react-router-dom";
import {
  useUserProfileQuery,
  UserProfileQuery,
  useBlockSomeoneMutation,
  useUnblockingUserMutation,
  useUpdateFriendMutation,
  useUpdateUnFriendMutation,
} from "../../graphql/generated";
import Rank1Icon from "/src/assets/images/Rank1.svg";
import Rank2Icon from "/src/assets/images/Rank2.svg";
import Rank3Icon from "/src/assets/images/Rank3.svg";
import Rank4Icon from "/src/assets/images/Rank4.svg";
import Rank5Icon from "/src/assets/images/Rank5.svg";
import { ReactComponent as UserIcon } from "pixelarticons/svg/user.svg";
import { ReactComponent as AddFriendIcon } from "pixelarticons/svg/user.svg";
import { ReactComponent as PlayIcon } from "pixelarticons/svg/gamepad.svg";

export const RankIcon = (rank: number) => {
  return rank <= 10
    ? Rank1Icon
    : rank <= 20
    ? Rank2Icon
    : rank <= 30
    ? Rank3Icon
    : rank <= 40
    ? Rank4Icon
    : Rank5Icon;
};
const query = (
  userId: number
): UseQueryOptions<UserProfileQuery, unknown, UserProfileQuery> => {
  return {
    queryKey: useUserProfileQuery.getKey({ userId }),
    queryFn: useUserProfileQuery.fetcher({ userId }),
  };
};

export const loader =
  (queryClient: QueryClient) =>
  async ({ params }: { params: Params<"userId"> }) => {
    if (params.userId) {
      const userId = +params.userId;
      return queryClient.fetchQuery(query(userId));
    }
  };

const DisplayAddAsFriend = ({
  data,
  userId,
}: {
  data: UserProfileQuery;
  userId: number;
}) => {
  const queryClient = useQueryClient();
  const askFriend = useUpdateFriendMutation({
    onSuccess: () => {
      queryClient.invalidateQueries([]);
    },
  });

  return (
    <div className="flex w-full flex-col  justify-center ">
      <div className="flex items-center justify-start ">
        {typeof data?.user.avatar !== undefined && data?.user.avatar !== "" ? (
          <img
            src={data?.user.avatar}
            alt="Player avatar"
            className="my-2 ml-2 mr-4 h-28 w-28 border border-black"
          />
        ) : (
          <UserIcon className="my-2 ml-2 mr-4 h-28 w-28 border border-black text-neutral-700" />
        )}
        <img
          src={RankIcon(data?.user.rank)}
          className="-translate-x-8 -translate-y-8"
        />
        <div className="my-4 flex flex-col text-left">
          <div className="text-xl font-bold">{data?.user.name}</div>

          <div>Statistics : TODO </div>
        </div>
      </div>
      <div className="mt-24 w-48 self-center text-center text-xl text-slate-300">
        {data?.user.name} is not your friend !
      </div>
      <span
        onClick={() => {
          askFriend.mutate({ updateFriendId: userId });
        }}
        className="my-8 flex h-24 w-24 items-center justify-center self-center border-2 border-slate-300 bg-slate-200 p-2 text-center text-xl  font-bold transition-all  hover:cursor-pointer hover:bg-slate-300"
      >
        Add as Friend
      </span>
      <AddFriendIcon className="w-96 self-center text-slate-100 " />
    </div>
  );
};

//TODO : object destructuring
const DisplayUserProfile = ({
  data,
  userId,
}: {
  data: UserProfileQuery;
  userId: number;
}) => {
  const queryClient = useQueryClient();
  const unFriend = useUpdateUnFriendMutation({
    onSuccess: () => {
      queryClient.invalidateQueries([]);
    },
  });
  const blockMutation = useBlockSomeoneMutation({
    onSuccess: () => {
      queryClient.invalidateQueries([]);
    },
  });
  const unblockMutation = useUnblockingUserMutation({
    onSuccess: () => {
      queryClient.invalidateQueries([]);
    },
  });

  return (
    <div className="flex h-full w-full flex-col ">
      <div className="flex items-center justify-start ">
        {typeof data?.user.avatar !== undefined && data?.user.avatar !== "" ? (
          <img
            src={data?.user.avatar}
            alt="Player avatar"
            className="my-2 ml-2 mr-4 h-28 w-28 border border-black"
          />
        ) : (
          <UserIcon className="my-2 ml-2 mr-4 h-28 w-28 border border-black text-neutral-700" />
        )}
        <img
          src={RankIcon(data?.user.rank)}
          className="-translate-x-8 -translate-y-8"
        />
        <div className="my-4 flex flex-col text-left">
          <div className="text-xl font-bold">{data?.user.name}</div>

          <div>Statistics : TODO </div>
        </div>
      </div>

      <div className="flex w-full grow flex-col overflow-auto text-sm">
        <div className="mt-8 pb-2 text-center text-xl font-bold">
          MATCH HISTORY
        </div>
        {data.user.games.length === 0 ? (
          <div className="flex flex-col">
            <div className="mt-20 text-center text-2xl text-slate-300">
              {" "}
              {data.user.name} didn't play yet !
            </div>
            <PlayIcon className="text-slate-100" />
          </div>
        ) : (
          <></>
        )}
        {data?.user.games.map((game, index) => {
          const victory =
            (game.player1.id === data?.user.id &&
              game.player1score > game.player2score) ||
            (game.player2.id === data?.user.id &&
              game.player2score > game.player1score);
          return (
            <div
              key={index}
              className={`${
                victory ? "bg-red-300" : "bg-red-400 "
              } mt-px flex h-12 items-center px-2`}
            >
              <img
                className="h-10 w-10 border border-black object-cover"
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
                className="h-10 w-10 border border-black object-cover"
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
      <div className="flex h-24 bg-slate-100 text-xl font-bold">
        <div
          onClick={() => {
            alert("Launch Game invitation");
          }}
          className="flex  basis-1/3 items-center justify-center border-2 border-slate-300 bg-slate-200 text-center transition-all hover:cursor-pointer hover:bg-slate-300"
        >
          Play !
        </div>
        <div
          onClick={() => {
            unFriend.mutate({ updateUnFriendId: userId });
          }}
          className="flex basis-1/3 items-center justify-center border-y-2 border-slate-300 bg-slate-200 text-center transition-all hover:cursor-pointer hover:bg-slate-300"
        >
          Unfriend
        </div>
        <div
          onClick={() => {
            data?.user.blocked
              ? unblockMutation.mutate({ unblockingUserId: userId })
              : blockMutation.mutate({ blockingUserId: userId });
          }}
          className="flex basis-1/3 items-center justify-center border-2 border-slate-300 bg-slate-200  text-center transition-all  hover:cursor-pointer hover:bg-slate-300"
        >
          {data?.user.blocked ? "Unblock" : "Block"}
        </div>
      </div>
    </div>
  );
};

const MyData = () => {
  const { data } = useUserProfileQuery();
  return data;
};

export default function Profile() {
  const params = useParams();
  if (typeof params.userId === "undefined") return <div></div>;
  const userId = +params.userId;
  const initialData = useLoaderData() as Awaited<
    ReturnType<ReturnType<typeof loader>>
  >;
  const { data } = useQuery({ ...query(userId), initialData });
  const myData = MyData();
  return myData?.user.friends.some((friend) => friend.id == userId) ? (
    <DisplayUserProfile data={data} userId={userId} />
  ) : (
    <DisplayAddAsFriend data={data} userId={userId} />
  );
}
