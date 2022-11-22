import { QueryClient, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { ReactComponent as GamePadIcon } from "pixelarticons/svg/gamepad.svg";
import { ReactComponent as UserIcon } from "pixelarticons/svg/user.svg";
import { ReactComponent as UsersIcon } from "pixelarticons/svg/users.svg";
import { useLoaderData, useNavigate } from "react-router-dom";
import * as Avatar from "@radix-ui/react-avatar";
import * as Dialog from "@radix-ui/react-dialog";
import {
  UserChatsAndFriendsQuery,
  useUserChatsAndFriendsQuery,
} from "../../graphql/generated";
import CreateChannel, { CreateChannelBtn } from "../components/createChannel";
import { SearchBar, SearchResults } from "../components/search";
import { AnimatePresence, motion } from "framer-motion";
import {
  Header,
  HeaderCenterContent,
  HeaderLeftBtn,
} from "../components/header";

type Chat = {
  __typename: "User" | "Channel";
  name: string;
  avatar?: string | undefined;
  id: number;
  messages: {
    __typename?: "DirectMessage" | "ChannelMessage" | undefined;
    content: string;
    sentAt: number;
  }[];
};

const query = (): UseQueryOptions<
  UserChatsAndFriendsQuery,
  unknown,
  Chat[]
> => {
  return {
    queryKey: useUserChatsAndFriendsQuery.getKey({}),
    queryFn: useUserChatsAndFriendsQuery.fetcher({}),
    select: (data) => {
      return [...data.user.friends, ...data.user.channels].sort((a, b) => {
        const x = a.messages.sort((c, d) => {
          return c.sentAt - d.sentAt;
        })[a.messages.length - 1];
        const y = b.messages.sort((c, d) => {
          return c.sentAt - d.sentAt;
        })[b.messages.length - 1];
        if (!x) return 1;
        if (!y) return -1;
        return y.sentAt - x.sentAt;
      });
    },
  };
};

export const homeLoader = async (queryClient: QueryClient) => {
  return queryClient.fetchQuery(query());
};

const Chat = ({ __typename, name, avatar, id, messages }: Chat) => {
  const navigate = useNavigate();
  const lastMessage = messages[messages.length - 1];

  const getDate = (time: number) => {
    const date = new Date(time);
    return (
      date.toISOString().substring(0, 10) +
      " at " +
      date.toISOString().substring(11, 16)
    );
  };

  return (
    <div
      onClick={() =>
        navigate(`/${__typename == "User" ? "chat" : "channel"}/${id}`)
      }
      className="flex justify-center transition-all hover:cursor-pointer  hover:bg-slate-100"
    >
      <div className="m-2 flex h-16 w-16 shrink-0 justify-center   text-white">
        {__typename == "User" ? (
          <Avatar.Root>
            <Avatar.Image
              className="h-16 w-16 border border-black object-cover"
              src={`/uploads/avatars/${avatar}`}
            />
            <Avatar.Fallback delayMs={0}>
              <UserIcon className="h-16 w-16 border border-black bg-slate-50 p-1 text-neutral-700" />
            </Avatar.Fallback>
          </Avatar.Root>
        ) : (
          <UsersIcon className="h-16 w-16 border border-black bg-slate-50 p-1 pt-2 text-neutral-700" />
        )}
      </div>
      <div className="flex grow flex-col justify-center px-2">
        <div className="flex justify-between">
          <span className="pb-px font-bold">{name}</span>
          <span className="mt-1 text-xs text-slate-400">
            {lastMessage?.sentAt ? getDate(+lastMessage.sentAt) : ""}
          </span>
        </div>
        <span className="flex max-h-5 overflow-hidden text-clip text-sm text-slate-400">
          {lastMessage?.content}
        </span>
      </div>
    </div>
  );
};

const Empty = () => {
  return (
    <div className="flex h-full select-none flex-col items-center justify-center text-slate-200">
      <GamePadIcon className="-mt-2 w-96" />
      <span className="-mt-10 px-20 text-center text-2xl">
        Add your friends to play with them!
      </span>
    </div>
  );
};

export const Home = () => {
  const initialData = useLoaderData() as Awaited<ReturnType<typeof homeLoader>>;
  const { data } = useQuery({ ...query(), initialData });

  const [searchInput, setSearchInput] = useState("");
  const [showChannelCreation, setShowChannelCreation] = useState(false);

  return (
    <div className="relative flex h-full flex-col">
      <Header>
        <>
          <HeaderLeftBtn>
            <CreateChannelBtn setShowChannelCreation={setShowChannelCreation} />
          </HeaderLeftBtn>
          <HeaderCenterContent>
            <SearchBar
              searchInput={searchInput}
              setSearchInput={setSearchInput}
            />
          </HeaderCenterContent>
        </>
      </Header>
      <div className="h-full overflow-y-auto">
        <Dialog.Root open={showChannelCreation} modal={false}>
          <Dialog.Content
            forceMount
            onEscapeKeyDown={(e) => {
              e.preventDefault();
              setShowChannelCreation(false);
            }}
            onInteractOutside={(e) => {
              e.preventDefault();
              setShowChannelCreation(false);
            }}
          >
            <AnimatePresence>
              {showChannelCreation ? (
                <>
                  <div
                    onClick={() => setShowChannelCreation(false)}
                    className="absolute h-screen w-screen backdrop-blur"
                  ></div>
                  <motion.div
                    className="absolute bottom-0 w-full shadow-[10px_10px_15px_15px_rgba(0,0,0,0.2)]"
                    initial={{ y: "100%" }}
                    exit={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CreateChannel
                      setShowChannelCreation={setShowChannelCreation}
                    />
                  </motion.div>
                </>
              ) : null}
            </AnimatePresence>
          </Dialog.Content>
        </Dialog.Root>
        {searchInput ? (
          <SearchResults
            searchInput={searchInput}
            setSearchInput={setSearchInput}
          />
        ) : data?.length === 0 ? (
          <Empty />
        ) : (
          data?.map((chat, index) => <Chat key={index} {...chat} />)
        )}
      </div>
    </div>
  );
};
