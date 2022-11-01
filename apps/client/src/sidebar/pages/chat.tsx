import { Content } from "@radix-ui/react-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useDirectMessagesQuery,
  useSendDirectMessageMutation,
} from "../../graphql/generated";
import { getDate } from "./home";

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
      <div className="flex">
        <img
          className={`${
            author.id === userId ? "order-first " : "order-last "
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

const DirectConversation = () => {
  const queryClient = useQueryClient();
  const params = useParams();
  if (typeof params.userId === "undefined") return <div></div>;
  const userId = +params.userId;
  const navigate = useNavigate();
  const [content, setContent] = useState("");
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
          messages: user.messages,
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
  if (isLoading) return <div>Loading ...</div>;

  if (isFetching) {
    return <div>Fetching</div>;
  }

  if (error) {
    return <div>Error</div>;
  }
  console.log(content);
  return (
    <div className="mb-2 mt-2 flex w-full flex-col border-t-2 border-slate-600">
      <div
        className="flex p-2 text-center hover:cursor-pointer hover:bg-slate-100"
        onClick={() => navigate(`/profile/${userId}`)}
      >
        <img className="flex h-12 w-12 rounded-full" src={data?.avatar} />
        <div className="ml-5 flex h-full self-center text-xl font-bold">
          {data?.name}
        </div>
      </div>
      <ul className="flex w-full flex-col overflow-auto">
        {data?.messages.map((message, index) => (
          <DirectMessage key={index} userId={userId} {...message} />
        ))}
      </ul>
      <textarea
        rows={1}
        className=" w-full rounded-xl bg-gray-300 py-5 px-3"
        onChange={(e) => setContent(e.target.value)}
        placeholder="type your message here..."
        onKeyDown={(e) => {
          if (e.code == "Enter" && !e.getModifierState("Shift")) {
            messageMutation.mutate({
              message: content,
              recipientId: userId,
            });

            e.currentTarget.value = "";
            e.preventDefault();
            setContent("");
          }
        }}
      />
    </div>
  );
};

export default function Chat() {
  return <DirectConversation />;
}
