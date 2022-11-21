import { useRef } from "react";
import { ReactComponent as CloseIcon } from "pixelarticons/svg/close.svg";
import { ReactComponent as SearchIcon } from "pixelarticons/svg/search.svg";
import { ReactComponent as UserIcon } from "pixelarticons/svg/user.svg";
import { ReactComponent as UsersIcon } from "pixelarticons/svg/users.svg";
import { useNavigate } from "react-router-dom";
import * as Avatar from "@radix-ui/react-avatar";
import { useSearchUsersAndChannelsQuery } from "../../graphql/generated";

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
    <div className="relative flex w-full grow ">
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
    </div>
  );
};

const Highlight = ({
  content,
  searchInput,
}: {
  content: string | undefined;
  searchInput: string;
}) => {
  if (typeof content === "undefined") return <></>;
  const index = content.toLowerCase().indexOf(searchInput.toLowerCase());
  const before = content.slice(0, index);
  const match = content.slice(index, index + searchInput.length);
  const after = content.slice(index + searchInput.length);

  return (
    <span className="ml-2">
      <span>{before}</span>
      <span className="bg-amber-300">{match}</span>
      <span>{after}</span>
    </span>
  );
};

// TODO: handle no results
export const SearchResults = ({
  searchInput,
  setSearchInput,
}: {
  searchInput: string;
  setSearchInput: (value: string) => void;
}) => {
  const navigate = useNavigate();

  const { data } = useSearchUsersAndChannelsQuery(
    { name: searchInput },
    {
      select(data) {
        // TODO: filter out self
        const { users, channels } = data;
        const results: (typeof users[number] | typeof channels[number])[] = [
          ...users,
          ...channels,
        ];
        return results;
      },
    }
  );
  return (
    <ul className="flex flex-col divide-y divide-slate-200">
      {data?.map((result) => (
        <li
          className="flex items-center p-2 even:bg-white hover:cursor-pointer hover:bg-blue-100"
          key={`${result?.id}_${result?.__typename}`}
          onClick={() => {
            navigate(
              `${result?.__typename === "Channel" ? "channel" : "profile"}/${
                result?.id
              }`
            );
            setSearchInput("");
          }}
        >
          {result?.__typename === "User" ? (
            <Avatar.Root>
              <Avatar.Image
                className="h-10 w-10 border border-black object-cover"
                src={result.avatar}
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
  );
};
