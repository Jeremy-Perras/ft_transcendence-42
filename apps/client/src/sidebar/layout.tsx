import { useContext, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useMediaQuery, useThrottledState } from "@react-hookz/web";
import { ReactComponent as ArrowLeftBoxIcon } from "pixelarticons/svg/arrow-left-box.svg";
import { ReactComponent as CloseIcon } from "pixelarticons/svg/close.svg";
import { ReactComponent as SearchIcon } from "pixelarticons/svg/search.svg";
import { ReactComponent as BackBurgerIcon } from "pixelarticons/svg/backburger.svg";
import { ReactComponent as MessagePlusIcon } from "pixelarticons/svg/message-plus.svg";
import { ReactComponent as UserIcon } from "pixelarticons/svg/user.svg";
import { ReactComponent as UsersIcon } from "pixelarticons/svg/users.svg";
import { SideBarContext } from "./context";
import { useSearchUsersChannelsQuery } from "../graphql/generated";
import * as Avatar from "@radix-ui/react-avatar";
import {
  useUserProfileHeaderQuery,
  useGetChannelHeaderQuery,
} from "../graphql/generated";

//TODO : skeleton loader while loading
// components h
// retry
// route loaders

export const SearchBar = ({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (value: string) => void;
}) => {
  const input = useRef<HTMLInputElement>(null);

  const resetSearch = () => {
    if (input.current) input.current.value = "";
    setSearch("");
  };

  return (
    <div className="relative grow border-r-2">
      <input
        type="text"
        ref={input}
        spellCheck={false}
        className="w-full py-1 px-2 text-lg focus:outline-none focus:ring-2 focus:ring-inset"
        placeholder="search"
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.code == "Escape" && search.length > 0) {
            e.preventDefault();
            e.stopPropagation();
            resetSearch();
          }
        }}
      />
      <div className="absolute inset-y-0 right-2 flex items-center">
        {search.length > 0 ? (
          <button onClick={resetSearch}>
            <CloseIcon className="h-6 text-slate-400" />
          </button>
        ) : (
          <SearchIcon className="h-6 text-slate-400" />
        )}
      </div>
    </div>
  );
};

const LeftButton = ({
  navigate,
  Icon,
}: {
  navigate: () => void;
  Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
}) => {
  return (
    <motion.button
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.8 }}
      transition={{ duration: 0.0 }}
      onClick={navigate}
      className="border-r-2 transition-colors duration-200 hover:text-slate-500"
    >
      <Icon className="h-9" />
    </motion.button>
  );
};

function CurrentUserProfileLink() {
  const { isLoading, data, error, isFetching } = useUserProfileHeaderQuery(
    {},
    {
      select({ user }) {
        const res: {
          id: number;
          name: string;
          avatar: string;
          rank: number;
        } = {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          rank: user.rank,
        };
        return res;
      },
    }
  );
  const navigate = useNavigate();
  return (
    <div
      className="flex w-10 justify-center border-r-2 transition-all hover:cursor-pointer hover:bg-slate-100"
      onClick={() => navigate(`/profile/me`)}
    >
      <img
        className="right-1 top-1 h-8 w-8 self-center rounded-full "
        src={data?.avatar}
        alt="Current user avatar"
      />
    </div>
  );
}

/******** MAIN HEADER COMPONENT ********/
function Header({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (value: string) => void;
}) {
  const location = useLocation();
  const home = location.pathname === "/";
  const navigate = useNavigate();
  const setShowSideBar = useContext(SideBarContext);
  const isSmallScreen = useMediaQuery("(max-width: 1536px)");
  // TODO : put this in corresponding component

  return (
    <div className="z-10 flex shadow-sm shadow-slate-400">
      <AnimatePresence initial={false} exitBeforeEnter>
        {home ? (
          <>
            <LeftButton
              navigate={() => navigate("/create-channel")}
              Icon={MessagePlusIcon}
              key={1}
            />
            <SearchBar search={search} setSearch={setSearch} key={2} />
          </>
        ) : (
          <>
            <LeftButton
              key={3}
              navigate={() => navigate("/")}
              Icon={ArrowLeftBoxIcon}
            />
            <div
              key={4}
              className="relative ml-8 flex grow border-r-2 text-center text-lg"
            >
              {location.pathname.substring(0, 6) === "/chat/" ? (
                <UserHeader userId={+location.pathname.substring(6)} />
              ) : location.pathname.substring(0, 9) === "/channel/" ? (
                <ChannelHeader
                  channelId={
                    +location.pathname.substring(9) //HERE IS THE ISSUE
                  }
                />
              ) : location.pathname === "/create-channel" ? (
                <div className="mt-1 w-full text-center font-bold">
                  New channel
                </div>
              ) : location.pathname.substring(0, 9) === "/settings" ? (
                <div className="mt-1 w-full text-center font-bold">
                  Settings
                </div>
              ) : location.pathname.substring(0, 11) === "/profile/me" ? (
                <div className="mt-1 w-full text-center font-bold">
                  My profile
                </div>
              ) : location.pathname.substring(0, 9) === "/profile/" ? (
                <div className="mt-1 w-full text-center font-bold">
                  User profile
                </div>
              ) : (
                <div>{location.pathname}</div>
              )}
            </div>
          </>
        )}
      </AnimatePresence>
      <CurrentUserProfileLink />
      {isSmallScreen ? (
        <button onClick={() => setShowSideBar && setShowSideBar(false)}>
          <BackBurgerIcon className="h-9 rotate-180 transition-colors duration-200 hover:text-slate-500" />
        </button>
      ) : null}
    </div>
  );
}

/**************** USER HEADER ***************/
function UserHeader({ userId }: { userId: number }) {
  const { isLoading, data, error, isFetching } = useUserProfileHeaderQuery(
    { userId: userId },
    {
      select({ user }) {
        const res: {
          id: number;
          name: string;
          avatar: string;
          rank: number;
        } = {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          rank: user.rank,
        };
        return res;
      },
    }
  );
  const navigate = useNavigate();
  return (
    <div
      className="flex h-9 w-full items-center justify-center p-2 hover:cursor-pointer hover:bg-slate-100"
      onClick={() => navigate(`/profile/${userId}`)}
    >
      <img
        className="mb-px h-8 w-8 rounded-full"
        src={data?.avatar}
        alt="User avatar"
      />
      <span className="ml-2 mb-px h-full text-base font-bold">
        {data?.name}
      </span>
    </div>
  );
}

/**************** CHANNEL HEADER ***************/

function ChannelHeader({ channelId }: { channelId: number }) {
  const { isLoading, data, error, isFetching } = useGetChannelHeaderQuery(
    { channelId: channelId },
    {
      select({ channel }) {
        const res: {
          id: number;
          name: string;
          owner: { id: number; name: string; avatar: string };
          password: boolean;
          private: boolean;
        } = {
          id: channel.id,
          name: channel.name,
          owner: channel.owner,
          password: channel.passwordProtected,
          private: channel.private,
        };
        return res;
      },
    }
  );
  const navigate = useNavigate();

  return (
    <>
      <span
        className="w-full pt-1 text-center align-middle text-lg font-bold hover:cursor-pointer hover:bg-slate-100"
        onClick={() => navigate(`/settings/channel/${channelId}`)}
      >
        {data?.name}
      </span>
    </>
  );
}

/********* SEARCH ITEMS ********* */
const Highlight = ({
  content,
  search,
}: {
  content: string;
  search: string;
}) => {
  const index = content.toLowerCase().indexOf(search.toLowerCase());
  const before = content.slice(0, index);
  const match = content.slice(index, index + search.length);
  const after = content.slice(index + search.length);

  return (
    <span className="ml-2">
      <span>{before}</span>
      <span className="bg-amber-300">{match}</span>
      <span>{after}</span>
    </span>
  );
};

const SearchResult = ({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (value: string) => void;
}) => {
  const navigate = useNavigate();

  const { data } = useSearchUsersChannelsQuery(
    { name: search },
    {
      select(data) {
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
          key={`${result.id}_${result.__typename}`}
          onClick={() => {
            navigate(
              `${result.__typename === "Channel" ? "channel" : "profile"}/${
                result.id
              }`
            );

            setSearch("");
          }}
        >
          {result.__typename === "User" ? (
            <Avatar.Root>
              <Avatar.Image
                className="h-10 w-10 rounded-full object-cover "
                src={result.avatar}
              />
              <Avatar.Fallback>
                <UserIcon className="h-10 w-10" />
              </Avatar.Fallback>
            </Avatar.Root>
          ) : (
            <UsersIcon className="h-10 w-10" />
          )}
          <Highlight content={result.name} search={search} />
        </li>
      ))}
    </ul>
  );
};

export const SidebarLayout = () => {
  const [search, setSearch] = useThrottledState("", 500);
  return (
    <>
      <Header search={search} setSearch={setSearch} />
      <div className="h-full overflow-y-auto">
        {search.length === 0 ? (
          <Outlet />
        ) : (
          <SearchResult search={search} setSearch={setSearch} />
        )}
      </div>
    </>
  );
};
