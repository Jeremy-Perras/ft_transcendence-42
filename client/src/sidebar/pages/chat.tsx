import { useEffect, useRef, useState } from "react";
import {
  Params,
  useLoaderData,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ChatQuery,
  useChatQuery,
  useSendDirectMessageMutation,
} from "../../graphql/generated";
import { getDate } from "./home";
import { ReactComponent as EmptyChatIcon } from "pixelarticons/svg/message-plus.svg";
import { HeaderPortal } from "../layout";
import { RankIcon } from "./profile";
import queryClient from "../../query";
import { QueryClient, useQuery, UseQueryOptions } from "@tanstack/react-query";

const query = (
  userId: number
): UseQueryOptions<ChatQuery, unknown, Chatquery> => {
  return {
    queryKey: useChatQuery.getKey({ userId }),
    queryFn: useChatQuery.fetcher({ userId }),
    select: (data) => ({
      messages: data.user.messages.sort((a, b) => a.sentAt - b.sentAt),
      name: data.user.name,
      avatar: data.user.avatar,
      rank: data.user.rank,
      blocked: data.user.blocked,
      blocking: data.user.blocking,
    }),
  };
};

export const chat =
  (queryClient: QueryClient) =>
  async ({ params }: { params: Params<"userId"> }) => {
    if (params.userId) {
      const userId = +params.userId;
      return queryClient.fetchQuery(query(userId));
    }
  };

type Chatquery = {
  messages: {
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

export type User = {
  __typename?: "User" | undefined;
  id: number;
  name: string;
  avatar: string;
};

type DirectMessage = {
  userId: number;
  content: string;
  sentAt: number;
  readAt?: number | null | undefined;
  author: User;
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
      <div className="mb-2 text-center text-xs text-slate-300">
        {getDate(+sentAt)}
      </div>
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
            src={author.avatar}
            alt="Message author avatar"
            onClick={() => navigate(`/profile/${author.id}`)}
          />
        </div>
        <div>
          <div
            className={`px-4 py-2 tracking-wide ${
              author.id === userId
                ? "rounded-md bg-slate-300"
                : "rounded-md bg-slate-200"
            }`}
          >
            {content}
          </div>
        </div>
      </div>
      <div
        className={`${
          author.id === userId ? "justify-end" : "justify-start"
        } flex text-xs text-slate-300`}
      >
        {readAt != undefined ? "Seen" : ""}
      </div>
    </li>
  );
};

export default function Chat() {
  const params = useParams();
  if (typeof params.userId === "undefined") return <div>No user Id</div>;
  const userId = +params.userId;

  const [content, setContent] = useState("");
  const initialData = useLoaderData() as Awaited<
    ReturnType<ReturnType<typeof chat>>
  >;
  const { data } = useQuery({ ...query(userId), initialData });

  const messageMutation = useSendDirectMessageMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(["InfoDirectMessages", { userId: userId }]);
    },
  });

  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [data?.messages]);

  return (
    <div className="flex h-full flex-col">
      <HeaderPortal
        container={document.getElementById("header") as HTMLElement}
        text={data?.name}
        link={`/profile/${userId}`}
        icon={typeof data?.rank !== "undefined" ? RankIcon(data?.rank) : ""}
      />
      <ul className="mt-4 flex h-fit w-full grow flex-col overflow-auto pr-2 pl-px ">
        {data?.messages.length === 0 ? (
          <div className="mb-48 flex h-full flex-col items-center justify-center text-center">
            <EmptyChatIcon className="w-96 text-slate-200" />
            Seems a little bit too silent here... Send the first message !
          </div>
        ) : (
          <></>
        )}
        {data?.messages.map((message, index) => (
          <DirectMessage key={index} userId={userId} {...message} />
        ))}
        <div ref={messagesEndRef} />
      </ul>

      <div className="flex h-16 w-full border-t-2 bg-slate-50 p-2">
        <textarea
          disabled={data?.blocking == true || data?.blocked === true}
          rows={1}
          className={`${
            data?.blocking == true || data?.blocked === true
              ? "hover:cursor-not-allowed"
              : ""
          } h-10 w-11/12 resize-none overflow-visible rounded-lg px-3 pt-2`}
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
                messageMutation.mutate({
                  message: content,
                  userId: userId,
                });
                e.currentTarget.value = "";
                e.preventDefault();
                setContent("");
              }
            } else {
              if (e.code == "Enter" && !e.getModifierState("Shift")) {
                e.currentTarget.value = "";
                e.preventDefault();
                setContent("");
              }
              // JP : what is this for ?
              //TODO : test removing this
            }
          }}
        />
      </div>
    </div>
  );
}
