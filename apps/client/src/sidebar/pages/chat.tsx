import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetInfoUsersQuery,
  useSendDirectMessageMutation,
} from "../../graphql/generated";
import { getDate, Fetching, Loading, Error } from "./home";

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
        <img
          className={`${
            author.id === userId ? "order-first" : "order-last"
          } m-1 mb-px flex h-6 w-6 basis-1 self-end rounded-full`}
          src={author.avatar}
        />
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

const GetInfo = (Id: number) => {
  const { isLoading, data, error, isFetching } = useGetInfoUsersQuery(
    {
      userId: Id,
    },
    {
      select({ user }) {
        const res: {
          blocked: boolean;
          blocking: boolean;
        } = {
          blocked: user.blocked,
          blocking: user.blocking,
        };
        return res;
      },
    }
  );
  return data;
};

const DirectConversation = () => {
  const queryClient = useQueryClient();
  const params = useParams();
  if (typeof params.userId === "undefined") return <div></div>;
  const userId = +params.userId;
  const [content, setContent] = useState("");
  const infoSpeak = GetInfo(userId);
  const { isLoading, data, error, isFetching } = useDirectMessagesQuery(
    { userId: userId },
    {
      select({ user }) {
        const res: {
          messages: {
            content: string;
            sentAt: number;
            readAt?: number | null | undefined;
            author: User;
          }[];
          name: string;
          avatar: string;
        } = {
          messages: user.messages.sort((a, b) => a.sentAt - b.sentAt),
          name: user.name,
          avatar: user.avatar,
        };
        return res;
      },
    }
  );
  const messageMutation = useSendDirectMessageMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(["DirectMessages", { userId: userId }]);
    },
  });
  if (isLoading) return <Loading />;

  if (isFetching) {
    return <Fetching />;
  }

  if (error) {
    return <Error />;
  }

  return (
    <>
      <ul className="mt-4 mb-16 flex h-fit w-full flex-col pr-2 pl-px">
        {data?.messages.map((message, index) => (
          <DirectMessage key={index} userId={userId} {...message} />
        ))}
      </ul>
      <div className="absolute bottom-0 h-16 w-full border-t-2 bg-slate-50 p-2">
        <textarea
          rows={1}
          className="h-10 w-11/12 overflow-visible rounded-lg px-3 pt-2"
          onChange={(e) => setContent(e.target.value)}
          placeholder={`${
            infoSpeak?.blocking == true
              ? "You are blocked"
              : "Type your message here ..."
          }`}
          onKeyDown={(e) => {
            if (infoSpeak?.blocking == false) {
              if (e.code == "Enter" && !e.getModifierState("Shift")) {
                messageMutation.mutate({
                  message: content,
                  recipientId: userId,
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
            }
          }}
        />
      </div>
    </>
  );
};

export default function Chat() {
  return <DirectConversation />;
}
function useDirectMessagesQuery(
  arg0: { userId: number },
  arg1: {
    select({ user }: { user: any }): {
      messages: {
        content: string;
        sentAt: number;
        readAt?: number | null | undefined;
        author: User;
      }[];
      name: string;
      avatar: string;
    };
  }
): { isLoading: any; data: any; error: any; isFetching: any } {
  throw new Error("Function not implemented.");
}
