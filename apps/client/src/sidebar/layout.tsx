import { useContext, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useMediaQuery, useThrottledState } from "@react-hookz/web";
import { ReactComponent as ArrowLeftBoxIcon } from "pixelarticons/svg/arrow-left-box.svg";
import { ReactComponent as CloseIcon } from "pixelarticons/svg/close.svg";
import { ReactComponent as SearchIcon } from "pixelarticons/svg/search.svg";
import { ReactComponent as BackBurgerIcon } from "pixelarticons/svg/backburger.svg";
import { ReactComponent as MessagePlusIcon } from "pixelarticons/svg/message-plus.svg";
import { ReactComponent as UserIcon } from "pixelarticons/svg/user.svg";
import { SideBarContext } from "./context";
import { useSearchUsersChannelsQuery } from "../graphql/generated";
import * as Avatar from "@radix-ui/react-avatar";

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
              navigate={() => navigate(-1)}
              Icon={ArrowLeftBoxIcon}
            />
            <div
              key={4}
              className="relative grow border-r-2 text-center text-lg"
            >
              {location.pathname}
            </div>
          </>
        )}
      </AnimatePresence>
      {isSmallScreen ? (
        <button onClick={() => setShowSideBar && setShowSideBar(false)}>
          <BackBurgerIcon className="h-9 rotate-180 transition-colors duration-200 hover:text-slate-500" />
        </button>
      ) : null}
    </div>
  );
}

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
                className="h-10 w-10 object-cover "
                src={result.avatar}
              />
              <Avatar.Fallback>
                <UserIcon className="h-10 w-10" />
              </Avatar.Fallback>
            </Avatar.Root>
          ) : (
            <div className="h-10 w-10 bg-black"></div>
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
