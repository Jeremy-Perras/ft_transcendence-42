import { useForm, UseFormRegister } from "react-hook-form";
import { ReactComponent as UsersIcon } from "pixelarticons/svg/users.svg";
import { ReactComponent as PrivateIcon } from "pixelarticons/svg/mail.svg";
import { ReactComponent as PasswordIcon } from "pixelarticons/svg/lock.svg";
import { ReactComponent as PublicIcon } from "pixelarticons/svg/lock-open.svg";
import { ReactComponent as MessagePlusIcon } from "pixelarticons/svg/message-plus.svg";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { request } from "graphql-request";
import { graphql } from "../../gql/gql";
import queryClient from "../../query";

type formData = {
  name: string;
  password?: string;
  type: "Private" | "Password" | "Public";
};

export const CreateChannelBtn = ({
  setShowChannelCreation,
}: {
  setShowChannelCreation: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <MessagePlusIcon
      className="h-9 cursor-pointer transition-colors duration-200 hover:text-slate-500"
      onClick={() => {
        setShowChannelCreation((prev) => !prev);
      }}
    />
  );
};

const CreateChannelMutationDocument = graphql(`
  mutation CreateChannel(
    $inviteOnly: Boolean!
    $password: String
    $name: String!
  ) {
    createChannel(inviteOnly: $inviteOnly, password: $password, name: $name)
  }
`);

const ChannelModeButton = ({
  text,
  reg,
  checked,
}: {
  text: string;
  reg: UseFormRegister<formData>;
  checked?: boolean;
}) => {
  return (
    <div className="flex h-24 basis-1/3 items-center justify-center border-2 bg-slate-50 text-center  text-lg text-slate-400 first:border-r-0 last:border-l-0 hover:cursor-pointer">
      <input
        type="radio"
        className="peer appearance-none "
        id={text}
        value={text}
        {...reg("type", {
          required: true,
        })}
        defaultChecked={checked}
      />
      <label
        htmlFor={text}
        className="flex h-full w-full flex-col items-center justify-center peer-checked:bg-slate-200 peer-checked:text-xl peer-checked:font-bold peer-checked:text-black peer-focus:z-10 peer-focus:ring"
      >
        {text === "Public" ? (
          <PublicIcon className="mx-2 mb-3 h-10 w-10" />
        ) : text === "Private" ? (
          <PrivateIcon className="mx-2 mb-2 h-10 w-10" />
        ) : (
          <PasswordIcon className="mx-2 mb-3 h-10 w-10" />
        )}
        {text}
      </label>
    </div>
  );
};

export default function CreateChannel({
  showChannelCreation,
  setShowChannelCreation,
}: {
  showChannelCreation: boolean;
  setShowChannelCreation: (showChannelCreation: boolean) => void;
}) {
  const {
    register,
    handleSubmit,
    setFocus,
    watch,
    formState: { errors },
  } = useForm<formData>();

  const createChannelMutation = useMutation(
    async ({
      inviteOnly,
      name,
      password,
    }: {
      inviteOnly: boolean;
      name: string;
      password: string | undefined | null;
    }) =>
      request("/graphql", CreateChannelMutationDocument, {
        inviteOnly: inviteOnly,
        name: name,
        password: password,
      }),
    {
      onSuccess: () =>
        queryClient.invalidateQueries(["DiscussionsAndInvitations"]),
    }
  );

  return (
    <Dialog.Root open={showChannelCreation} modal={false}>
      <Dialog.Content
        forceMount
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          setShowChannelCreation(false);
        }}
      >
        <AnimatePresence>
          {showChannelCreation ? (
            <>
              <div
                key="modal"
                onClick={() => setShowChannelCreation(false)}
                className="absolute z-10 h-screen w-screen backdrop-blur"
              ></div>
              <motion.div
                key="content"
                className="absolute bottom-0 z-10 w-full bg-slate-100 shadow-[10px_10px_15px_15px_rgba(0,0,0,0.2)]"
                initial={{ y: "100%" }}
                exit={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.2 }}
                onAnimationComplete={(definition) => {
                  const val = definition as { y: number | string };
                  val.y === 0 && setFocus("name");
                }}
              >
                <div className="flex h-full w-full flex-col pb-8 opacity-100 transition-all">
                  <form
                    className="flex h-full flex-col"
                    onSubmit={handleSubmit((data) => {
                      createChannelMutation.mutate({
                        inviteOnly: data.type === "Private",
                        name: data.name,
                        password: data.password,
                      });
                      setShowChannelCreation(false);
                    })}
                  >
                    <div className="flex flex-col">
                      <div className="mt-6 mb-2 self-center text-2xl text-slate-600">
                        Create your own Channel !
                      </div>
                      <div className="flex w-full px-4">
                        <UsersIcon className="mt-3 h-24 w-24 self-center text-slate-600" />
                        <div className="mt-4 ml-8 flex w-full flex-col items-start text-xl ">
                          <label
                            className="text-center text-xl text-slate-400"
                            htmlFor="name"
                          >
                            Channel name
                          </label>
                          <div className="mt-2 mb-4 flex h-8 w-64 flex-col">
                            <input
                              className={`${
                                errors.name ? "ring-1 ring-red-500" : ""
                              } px-1 text-xl`}
                              {...register("name", {
                                required: true,
                                maxLength: 100,
                              })}
                              defaultValue=""
                              autoComplete="off"
                            />
                            {errors.name && (
                              <span
                                className="text-center text-sm text-red-600"
                                role="alert"
                              >
                                You must set a name for a channel
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <fieldset
                      role="radiogroup"
                      className="flex justify-evenly px-4"
                    >
                      <ChannelModeButton
                        text="Public"
                        reg={register}
                        checked={true}
                      />
                      <ChannelModeButton text="Private" reg={register} />
                      <ChannelModeButton text="Password" reg={register} />
                    </fieldset>

                    <div className="h-32">
                      {watch("type") === "Password" ? (
                        <div className="flex flex-col justify-center text-center">
                          <label
                            className="mt-4 text-xl text-slate-400"
                            htmlFor="password"
                          >
                            Enter password
                          </label>
                          <input
                            {...register("password", {
                              required: true,
                              maxLength: 100,
                            })}
                            type="password"
                            autoComplete="off"
                            defaultValue=""
                            className={`${
                              errors.password ? "ring-1 ring-red-500" : ""
                            } my-2 h-10 w-64 self-center px-1 text-xl`}
                          />
                          {errors.password && (
                            <span
                              className="text-center text-sm text-red-600"
                              role="alert"
                            >
                              You must set a password
                            </span>
                          )}
                        </div>
                      ) : null}
                    </div>
                    <input
                      className="flex w-36 justify-center self-center border-2 border-slate-300 bg-slate-200 px-2 py-4 text-center text-2xl font-bold hover:cursor-pointer hover:bg-slate-300"
                      type="submit"
                      value="Create"
                    />
                  </form>
                </div>
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>
      </Dialog.Content>
    </Dialog.Root>
  );
}
