import { UserStatus } from "../../../src/gql/graphql";

export const IsOnline = ({ userStatus }: { userStatus: UserStatus }) => {
  return userStatus === UserStatus.Online ? (
    <span className="absolute top-0 left-0 flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full bg-green-400 opacity-75"></span>
    </span>
  ) : (
    <span className={`absolute top-0 left-0 flex h-2 w-2`}>
      <span className="absolute inline-flex h-full w-full bg-red-300 opacity-75"></span>
    </span>
  );
};
