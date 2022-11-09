import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useCreateChanelMutation } from "../../graphql/generated";
import { useForm } from "react-hook-form";
import { ReactComponent as UsersIcon } from "pixelarticons/svg/users.svg";
import { useNavigate } from "react-router-dom";

export const ChannelTypeButton = ({
  text,
  active,
  fn,
  inactiveFn1,
  inactiveFn2,
}: {
  text: string;
  active: boolean;
  fn: React.Dispatch<React.SetStateAction<boolean>>;
  inactiveFn1: React.Dispatch<React.SetStateAction<boolean>>;
  inactiveFn2: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <div
      className={`${
        active
          ? `border-slate-300 bg-slate-200 text-xl font-bold text-black ${"hover:cursor-pointer hover:bg-slate-300"}`
          : `border-slate-200 bg-slate-50 text-lg text-slate-400 ${"hover:cursor-pointer hover:bg-slate-200"}`
      } flex h-32 w-32 items-center justify-center rounded-full border-2 text-center`}
      onClick={() => {
        fn(!active);
        inactiveFn1(false);
        inactiveFn2(false);
      }}
    >
      {text}
    </div>
  );
};

export default function CreateChannel() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { register, handleSubmit, watch } = useForm();
  const createChannelMutation = useCreateChanelMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(["InfoUsers", {}]);
    },
  });
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [publicMode, setPublicMode] = useState(true);
  const [privateMode, setPrivateMode] = useState(false);
  return (
    <div className="flex flex-col">
      <form
        className="flex flex-col"
        onSubmit={handleSubmit(() => {
          createChannelMutation.mutate({
            inviteOnly: privateMode,
            name: watch("Name"),
            password: passwordProtected ? watch("Password") : "",
          }),
            navigate("/");
        })}
      >
        <div className="flex flex-col bg-slate-100">
          <div className="my-4 self-center text-3xl text-slate-600">
            Create your own Channel !
          </div>
          <div className="my-4 flex h-32 w-32 justify-center self-center rounded-full  bg-black text-white">
            <UsersIcon className="mt-1 h-28 w-28 self-center" />
          </div>
          <div className="mt-4 mb-6 flex w-full flex-col items-center text-2xl ">
            <label className="text-2xl text-slate-400" htmlFor="name">
              {" "}
              Channel name{" "}
            </label>
            <input
              className="my-4 h-10 w-64 rounded-lg px-1 text-xl "
              {...register("Name", {
                required: true,
                maxLength: 100,
              })}
              defaultValue=""
            />
          </div>
        </div>
        <div className="my-20 flex justify-evenly">
          <ChannelTypeButton
            text="Public"
            active={!privateMode && !passwordProtected}
            fn={setPublicMode}
            inactiveFn1={setPrivateMode}
            inactiveFn2={setPasswordProtected}
          />
          <ChannelTypeButton
            text="Private"
            active={privateMode}
            fn={setPrivateMode}
            inactiveFn1={setPublicMode}
            inactiveFn2={setPasswordProtected}
          />
          <ChannelTypeButton
            text="Password protected"
            active={passwordProtected}
            fn={setPasswordProtected}
            inactiveFn1={setPrivateMode}
            inactiveFn2={setPublicMode}
          />
        </div>
        <div></div>
        <div className="h-32">
          {passwordProtected ? (
            <div className="flex flex-col justify-center text-center">
              <label className="text-2xl text-slate-400" htmlFor="Password">
                Enter password
              </label>
              <input
                {...register("Password", {
                  required: passwordProtected,
                  maxLength: 100,
                })}
                defaultValue=""
                className="my-2 h-10 w-64 self-center rounded-lg px-1 text-xl "
              />
            </div>
          ) : (
            <></>
          )}
        </div>
        <input
          className="mt-4 flex w-36 justify-center self-center rounded-2xl border-2 border-slate-300 bg-slate-200 px-2 py-4 text-center text-2xl font-bold hover:cursor-pointer hover:bg-slate-300"
          type="submit"
        />
      </form>
    </div>
  );
}
