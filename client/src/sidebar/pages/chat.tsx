import {
  QueryClient,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  LoaderFunctionArgs,
  useLoaderData,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  DirectMessagesQuery,
  useDirectMessagesQuery,
  useSendDirectMessageMutation,
} from "../../graphql/generated";
import { User } from "../types/user";
import { getDate } from "../utils/getDate";
import { useQuery } from "@tanstack/react-query";
import { ReactComponent as EmptyChatIcon } from "pixelarticons/svg/message-plus.svg";
import { HeaderNavigateBack } from "../components/header";
import {
  Header,
  HeaderCenterContent,
  HeaderLeftBtn,
} from "../components/header";
import { RankIcon } from "../utils/rankIcon";

type ChatQuery = {
  messages: {
    id: number;
    content: string;
    sentAt: number;
    readAt?: number | null | undefined;
    author: User;
  }[];
  name: string;
  avatar: string;
  rank: number;
  blocked: boolean;
  blocking: boolean;
};

type DirectMessage = {
  userId: number;
  id: number;
  content: string;
  sentAt: number;
  readAt?: number | null | undefined;
  author: User;
};

const query = (
  userId: number
): UseQueryOptions<DirectMessagesQuery, unknown, ChatQuery> => {
  return {
    queryKey: useDirectMessagesQuery.getKey({ userId }),
    queryFn: useDirectMessagesQuery.fetcher({ userId }),
    select: (user) => ({
      messages: user.user.messages.sort((a, b) => a.sentAt - b.sentAt),
      name: user.user.name,
      avatar: user.user.avatar,
      rank: user.user.rank,
      blocked: user.user.blocked,
      blocking: user.user.blocking,
    }),
  };
};

export const chatLoader = async (
  queryClient: QueryClient,
  { params }: LoaderFunctionArgs
) => {
  if (params.userId) {
    const userId = +params.userId;
    return queryClient.fetchQuery(query(userId));
  }
};

const DirectMessage = ({
  userId,
  content,
  sentAt,
  readAt,
  author,
}: DirectMessage) => {
  const navigate = useNavigate();

  return (
    <li className="mx-2 mb-5 flex flex-col ">
      <span className="mb-2 text-center text-xs text-slate-300">
        {getDate(+sentAt)}
      </span>
      <div
        className={`${
          author.id === userId ? "justify-start" : "justify-end"
        } flex`}
      >
        <div
          className={`${
            author.id === userId ? "order-first mr-1" : "order-last ml-1"
          } flex h-full w-7 shrink-0 items-end justify-center`}
        >
          <img
            className="flex h-6 w-6 border border-black hover:h-7 hover:w-7 hover:cursor-pointer"
            src={`/uploads/avatars/${author.avatar}`}
            alt="Message author avatar"
            onClick={() => navigate(`/profile/${author.id}`)}
          />
        </div>
        <span
          className={`max-w-sm break-words px-4 py-2 tracking-wide ${
            author.id === userId
              ? "rounded-md bg-slate-300"
              : "rounded-md bg-slate-200"
          }`}
        >
          {content}
        </span>
      </div>
      <span className="mr-9 flex justify-end text-xs text-slate-300">
        {readAt != undefined && author.id !== userId ? "Seen" : ""}
      </span>
    </li>
  );
};

export default function Chat() {
  const queryClient = useQueryClient();

  const params = useParams();
  if (typeof params.userId === "undefined") return <div></div>; // TODO: 404
  const userId = +params.userId;

  const navigate = useNavigate();

  const [content, setContent] = useState("");

  const initialData = useLoaderData() as Awaited<ReturnType<typeof chatLoader>>;
  const { data } = useQuery({ ...query(userId), initialData });

  const sendMessageMutation = useSendDirectMessageMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(useDirectMessagesQuery.getKey({ userId }));
    },
  });

  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: "auto" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [data?.messages]);

  return (
    <div className="0 flex h-full flex-col">
      <Header>
        <>
          <HeaderLeftBtn>
            <HeaderNavigateBack />
          </HeaderLeftBtn>
          <HeaderCenterContent>
            <div
              className="flex h-full items-center justify-center hover:cursor-pointer hover:bg-slate-100"
              onClick={() => {
                navigate(`/profile/${params.userId}`);
              }}
            >
              <div className="relative mr-4 h-8 w-8 shrink-0">
                <img
                  className="h-8 w-8 border border-black"
                  src={`/uploads/avatars/${data?.avatar}`}
                />
                <img
                  className="absolute -top-1 -right-2 h-4"
                  src={RankIcon(data?.rank)}
                />
              </div>
              <span className="select-none truncate ">{data?.name}</span>
            </div>
          </HeaderCenterContent>
        </>
      </Header>
      <ul className="mt-4 flex h-fit w-full grow flex-col overflow-auto pr-2 pl-px ">
        {data?.messages.length === 0 ? (
          <div className="mb-48 flex h-full flex-col items-center justify-center text-center text-slate-300">
            <EmptyChatIcon className="w-96 text-slate-200" />
            Seems a little bit too silent here... Send the first message !
          </div>
        ) : null}

        {data?.messages.map((message, index) => {
          return <DirectMessage key={index} userId={userId} {...message} />;
        })}
        <div ref={messagesEndRef} />
      </ul>

      <div className="flex w-full bg-white px-[2px]">
        <textarea
          autoFocus={true}
          disabled={data?.blocking == true || data?.blocked === true}
          rows={2}
          className={`${
            data?.blocking == true || data?.blocked === true
              ? "hover:cursor-not-allowed"
              : ""
          }  w-full resize-none border-x-2 border-b-8 border-white px-2 pt-4 pb-2 `}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`${
            data?.blocked === true
              ? "This user is blocked"
              : data?.blocking === true
              ? "You are blocked by this user"
              : "Type your message here ..."
          }`}
          onKeyDown={(e) => {
            if (data?.blocking === false && data?.blocked === false) {
              if (e.code == "Enter" && !e.getModifierState("Shift")) {
                sendMessageMutation.mutate({
                  message: content,
                  userId: userId,
                });
                e.currentTarget.value = "";
                e.preventDefault();
                setContent("");
              }
            }
          }}
        />
      </div>
    </div>
  );
}
