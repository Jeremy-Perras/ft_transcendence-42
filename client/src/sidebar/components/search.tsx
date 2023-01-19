import { useRef } from "react";
import { ReactComponent as CloseIcon } from "pixelarticons/svg/close.svg";
import { ReactComponent as SearchIcon } from "pixelarticons/svg/search.svg";
import { ReactComponent as UserIcon } from "pixelarticons/svg/user.svg";
import { ReactComponent as UsersIcon } from "pixelarticons/svg/users.svg";
import { ReactComponent as ConnectionErrorIcon } from "pixelarticons/svg/downasaur.svg";
import { Navigate, useNavigate } from "react-router-dom";
import * as Avatar from "@radix-ui/react-avatar";

import { Empty } from "./Empty";
import { Highlight } from "./highlight";
import { useAuthStore } from "../../stores";
import { graphql } from "../../../src/gql";
import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";
import { SearchUsersAndChannelsQuery } from "../../../src/gql/graphql";

const SearchUsersAndChannelsQueryDocument = graphql(`
  query SearchUsersAndChannels($name: String!) {
    users(name: $name) {
      __typename
      id
      name
      status
    }
    channels(name: $name) {
      __typename
      name
      id
    }
  }
`);

export const SearchBar = ({
  searchInput,
  setSearchInput,
}: {
  searchInput: string;
  setSearchInput: (value: string) => void;
}) => {
  const input = useRef<HTMLInputElement>(null);

  const resetSearch = () => {
    if (input.current) input.current.value = "";
    setSearchInput("");
  };

  return (
    <>
      <input
        type="text"
        ref={input}
        spellCheck={false}
        className="w-full grow py-1 px-2 text-lg focus:outline-none focus:ring-2 focus:ring-inset"
        placeholder="search"
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.code == "Escape" && searchInput.length > 0) {
            e.preventDefault();
            e.stopPropagation();
            resetSearch();
          }
        }}
      />
      <div className="absolute inset-y-0 right-2 flex items-center">
        {searchInput.length > 0 ? (
          <CloseIcon
            onClick={resetSearch}
            className="h-6 cursor-pointer text-slate-400"
          />
        ) : (
          <SearchIcon className="h-6 text-slate-400" />
        )}
      </div>
    </>
  );
};

export const SearchResults = ({
  searchInput,
  setSearchInput,
}: {
  searchInput: string;
  setSearchInput: (value: string) => void;
}) => {
  const userId = useAuthStore((state) => state.userId);
  if (!userId) {
    return <Navigate to={"/"} replace={true} />;
  }

  const navigate = useNavigate();

  type ResultsType = (
    | Exclude<SearchUsersAndChannelsQuery["channels"][number], null>
    | Exclude<SearchUsersAndChannelsQuery["users"][number], null>
  )[];

  const { data: searchResults } = useQuery({
    queryKey: ["UsersAndChannels", searchInput],
    queryFn: async () =>
      request("/graphql", SearchUsersAndChannelsQueryDocument, {
        name: searchInput,
      }),
    select(data) {
      const { users, channels } = data;
      const results: (typeof users[number] | typeof channels[number])[] = [
        ...users,
        ...channels,
      ];
      return results.filter((u) => {
        if (u === null) return false;
        if (u.__typename === "User") return u.id !== userId;
        return true;
      }) as ResultsType;
    },
  });
  return (
    <>
      {typeof searchResults === "undefined" ? (
        <div className="relative flex h-full flex-col">
          <div className="flex h-full flex-col overflow-y-auto">
            <Empty message="Connection error" Icon={ConnectionErrorIcon} />
          </div>
        </div>
      ) : searchResults.length === 0 ? (
        <div className="relative flex h-full flex-col">
          <div className="flex h-full flex-col overflow-y-auto">
            <Empty message="No result for the research!" Icon={SearchIcon} />
          </div>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-slate-200">
          {searchResults.map((result) => (
            <li
              className="flex items-center p-2 even:bg-white hover:cursor-pointer hover:bg-blue-100"
              key={`${result?.id}_${result?.__typename}`}
              onClick={() => {
                navigate(
                  `${
                    result?.__typename === "Channel" ? "channel" : "profile"
                  }/${result?.id}`
                );
                setSearchInput("");
              }}
            >
              {result?.__typename === "User" ? (
                <Avatar.Root>
                  <Avatar.Image
                    className="h-10 w-10 border border-black object-cover"
                    src={`/upload/avatar/${result.id}`}
                  />
                  <Avatar.Fallback>
                    <UserIcon className="h-10 w-10" />
                  </Avatar.Fallback>
                </Avatar.Root>
              ) : (
                <UsersIcon className="h-10 w-10 border border-black p-1 pt-2" />
              )}
              <Highlight content={result?.name} searchInput={searchInput} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
};
