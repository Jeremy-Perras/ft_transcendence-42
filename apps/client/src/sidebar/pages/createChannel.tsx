import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useCreateChanelMutation } from "../../graphql/generated";
import { useForm } from "react-hook-form";
import { ReactComponent as UsersIcon } from "pixelarticons/svg/users.svg";
import { ReactComponent as PrivateIcon } from "pixelarticons/svg/mail.svg";
import { ReactComponent as PasswordIcon } from "pixelarticons/svg/lock.svg";
import { ReactComponent as PublicIcon } from "pixelarticons/svg/lock-open.svg";

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
          ? ` bg-slate-200 text-xl font-bold text-black ${"hover:cursor-pointer hover:bg-slate-300"}`
          : ` bg-slate-50 text-lg text-slate-400 ${"hover:cursor-pointer hover:bg-slate-200"}`
      } flex h-24 basis-1/3 items-center justify-center border-y-2 border-l-2 border-slate-300 text-center`}
      onClick={() => {
        fn(!active);
        inactiveFn1(false);
        inactiveFn2(false);
      }}
    >
      {text === "Public" ? (
        <PublicIcon className="mx-2 mb-3 h-10 w-10" />
      ) : text === "Private" ? (
        <PrivateIcon className="mx-2 mb-2 h-10 w-10" />
      ) : (
        <PasswordIcon className="mx-2 mb-3 h-10 w-10" />
      )}
      <div>{text}</div>
    </div>
  );
};

export default function CreateChannel({
  show,
  fn,
}: {
  show: boolean;
  fn: React.Dispatch<React.SetStateAction<boolean>>;
}) {
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
    <div className="z-20 flex h-full w-full flex-col border-t-2 bg-slate-100 opacity-100 transition-all">
      <form
        className="flex h-full flex-col bg-slate-100"
        onSubmit={handleSubmit(() => {
          createChannelMutation.mutate({
            inviteOnly: privateMode,
            name: watch("Name"),
            password: passwordProtected ? watch("Password") : "",
          }),
            fn(!show);
        })}
      >
        <div className="flex flex-col bg-slate-100">
          <div className="mt-6 mb-4 self-center text-2xl text-slate-600">
            Create your own Channel !
          </div>
          <div className="flex w-full px-4">
            <UsersIcon className="mt-5 h-24 w-24 self-center text-slate-600" />

            <div className="mt-6 ml-8 flex w-full flex-col items-start text-xl ">
              <label
                className="text-center text-xl text-slate-400"
                htmlFor="name"
              >
                {" "}
                Channel name
              </label>
              <input
                className="mt-2 mb-4 h-8 w-64 px-1 text-xl"
                {...register("Name", {
                  required: true,
                  maxLength: 100,
                })}
                defaultValue=""
              />
            </div>
          </div>
        </div>

        <div className="flex justify-evenly border-r-2 border-slate-300 bg-slate-100">
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
            text="Password"
            active={passwordProtected}
            fn={setPasswordProtected}
            inactiveFn1={setPrivateMode}
            inactiveFn2={setPublicMode}
          />
        </div>

        <div className="h-32">
          {passwordProtected ? (
            <div className="flex flex-col justify-center text-center">
              <label className="mt-4 text-xl text-slate-400" htmlFor="Password">
                Enter password
              </label>
              <input
                {...register("Password", {
                  required: passwordProtected,
                  maxLength: 100,
                })}
                defaultValue=""
                className="my-4 h-10 w-64 self-center px-1 text-xl "
              />
            </div>
          ) : (
            <></>
          )}
        </div>
        <input
          className="mt-4 flex w-36 justify-center self-center border-2 border-slate-300 bg-slate-200 px-2 py-4 text-center text-2xl font-bold hover:cursor-pointer hover:bg-slate-300"
          type="submit"
        />
      </form>
    </div>
  );
}
