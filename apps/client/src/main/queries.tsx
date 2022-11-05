import {
  useInfoUsersQuery,
  useUpdateGameJoiningPlayerQuery,
} from "../graphql/generated";

export function getInfoUserId() {
  const { isLoading, data, error, isFetching } = useInfoUsersQuery(
    {},
    {
      select({ user }) {
        const res: {
          currentUser: {
            id: number;
            name: string;
            avatar?: string;
            rank: number;
          };
        } = {
          currentUser: {
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            rank: user.rank,
          },
        };
        return res;
      },
    }
  );
  return data;
}
export function UpdateGameJoiningPlayer(id: number) {
  const { isLoading, data, error, isFetching } =
    useUpdateGameJoiningPlayerQuery({ updateGameId: id });
}
