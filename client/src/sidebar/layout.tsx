import { useRef, useState } from "react";
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
import * as Avatar from "@radix-ui/react-avatar";
import {
  useUsersAndChannelsSearchQuery,
  useUserHeaderQuery,
  useMyIdQuery,
} from "../graphql/generated";

import { useSidebarStore } from "../stores";
import CreateChannel from "./pages/createChannel";
import ReactDOM from "react-dom";
import React from "react";
import { Error } from "./pages/home";

//TODO : skeleton loader while loading
// retry
// route loaders

export function HeaderPortal({
  container,
  text,
  link,
  icon,
}: {
  container: HTMLElement;
  text: string | undefined;
  link: string;
  icon: string;
}) {
  const navigate = useNavigate();
  return ReactDOM.createPortal(
    <div
      className={`${
        link != "" ? "hover:cursor-pointer" : ""
      } flex grow text-center`}
    >
      <div
        className="flex w-full grow items-center justify-center text-center"
        onClick={() => navigate(link)}
      >
        <div>{text}</div>
        {icon !== "" ? <img src={icon} className="mx-2 w-7" /> : <></>}
      </div>
    </div>,
    container
  );
}

const SearchBar = ({
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
    <div className="relative flex w-full grow ">
      <input
        type="text"
        ref={input}
        spellCheck={false}
        className="w-full grow py-1 px-2 text-lg focus:outline-none focus:ring-2 focus:ring-inset"
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
  showBottomElement,
  showChannelCreation,
  setFn,
}: {
  navigate: () => void;
  Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  showBottomElement: boolean;
  showChannelCreation: boolean;
  setFn: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <motion.button
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.8 }}
      transition={{ duration: 0.0 }}
      onClick={showBottomElement ? () => setFn(!showChannelCreation) : navigate}
      className="border-r-2 transition-colors duration-200 hover:text-slate-500"
    >
      <Icon className="h-9" />
    </motion.button>
  );
};

const CurrentUserProfile = ({
  link,
  avatar,
}: {
  link: string;
  avatar: string | undefined;
}) => {
  const navigate = useNavigate();
  return (
    <div
      className="flex w-10 shrink-0 grow-0 justify-center  border-x-2 transition-all hover:cursor-pointer hover:bg-slate-100"
      onClick={() => navigate(link)}
    >
      <img
        className="top-1 right-1 h-8 w-8 shrink-0 self-center border border-black"
        src={avatar}
        alt="Current user avatar"
      />
    </div>
  );
};

/******** MAIN HEADER COMPONENT ********/
function Header({
  search,
  setSearch,
  showChannelCreation,
  setFn,
}: {
  search: string;
  setSearch: (value: string) => void;
  showChannelCreation: boolean;
  setFn: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const location = useLocation();
  const home = location.pathname === "/";
  const navigate = useNavigate();
  const closeSidebar = useSidebarStore((state) => state.close);
  const isSmallScreen = useMediaQuery("(max-width: 1536px)");
  const { isLoading, data, error, isFetching } = useUserHeaderQuery(
    {},
    {
      select({ user }) {
        const res: {
          id: number;
          avatar: string;
        } = {
          id: user.id,
          avatar: user.avatar,
        };
        return res;
      },
    }
  );
  if (isLoading)
    return <div className="text-center text-base text-slate-200">Loading</div>;
  if (isFetching)
    <div className="text-center text-base text-slate-200">Fetching</div>;
  if (error) return <Error />;
  return (
    <div className="z-10 flex w-full shadow-sm shadow-slate-400">
      <AnimatePresence initial={false} exitBeforeEnter>
        {home ? (
          <>
            <LeftButton
              navigate={() => setFn(!showChannelCreation)}
              showBottomElement={true}
              setFn={setFn}
              showChannelCreation={showChannelCreation}
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
              setFn={() => {
                return null;
              }}
              showChannelCreation={false}
              showBottomElement={false}
              Icon={ArrowLeftBoxIcon}
            />
          </>
        )}
        <div key={4} id="header" className="flex grow" />
        <CurrentUserProfile
          avatar={data?.avatar}
          link={`/profile/${data?.id}`}
          key={5}
        />
      </AnimatePresence>
      {isSmallScreen ? (
        <button onClick={closeSidebar}>
          <BackBurgerIcon className="h-9 rotate-180 transition-colors duration-200 hover:text-slate-500" />
        </button>
      ) : null}
    </div>
  );
}

/********* SEARCH ITEMS ********* */
const Highlight = ({
  content,
  search,
}: {
  content: string | undefined;
  search: string;
}) => {
  if (typeof content === "undefined") return <></>;
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

//TODO : remove when auth id ok
const myInfo = () => {
  const { data } = useMyIdQuery(
    { userId: null },
    {
      select({ user }) {
        const res: { id: number } = { id: user.id };
        return res;
      },
    }
  );
  return data;
};

const SearchResult = ({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (value: string) => void;
}) => {
  const navigate = useNavigate();

  const { data } = useUsersAndChannelsSearchQuery(
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
  const infoUser = myInfo();
  return (
    <ul className="flex flex-col divide-y divide-slate-200">
      {data?.map((result) => (
        <li
          className="flex items-center p-2 even:bg-white hover:cursor-pointer hover:bg-blue-100"
          key={`${result?.id}_${result?.__typename}`}
          onClick={() => {
            navigate(
              `${result?.__typename === "Channel" ? "channel" : "profile"}/${
                result?.__typename === "Channel"
                  ? result.id
                  : result?.id === infoUser?.id
                  ? "me"
                  : result?.id
              }`
            );

            setSearch("");
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
          <Highlight content={result?.name} search={search} />
        </li>
      ))}
    </ul>
  );
};

export const SidebarLayout = () => {
  const [search, setSearch] = useThrottledState("", 500);
  const [showChannelCreation, setShowChannelCreation] = useState(false);
  const location = useLocation();

  return (
    <div className="relative flex h-full flex-col">
      <div
        className={`${
          showChannelCreation ? "blur-sm" : ""
        } flex h-full flex-col transition-all delay-200 duration-200`}
      >
        <Header
          search={search}
          setSearch={setSearch}
          showChannelCreation={showChannelCreation}
          setFn={setShowChannelCreation}
        />
        <div className="h-full overflow-y-auto">
          {search.length === 0 ? (
            <Outlet />
          ) : (
            <SearchResult search={search} setSearch={setSearch} />
          )}
        </div>
      </div>
      {location.pathname === "/" ? (
        <div
          className={`${
            !showChannelCreation ? "translate-y-full" : ""
          } absolute top-0 flex h-full w-full flex-col justify-end transition-all duration-700`}
        >
          <div
            className="flex h-full grow bg-opacity-0 transition-all duration-700"
            onClick={() => setShowChannelCreation(false)}
          ></div>
          <div className="flex h-full shadow-[10px_10px_15px_15px_rgba(0,0,0,0.2)]">
            <CreateChannel
              show={showChannelCreation}
              setShow={setShowChannelCreation}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};
