import { useForm } from "react-hook-form";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useEffect, useRef, useState } from "react";
import { ReactComponent as CloseIcon } from "pixelarticons/svg/close.svg";
import qrcode from "qrcode";
import { Buffer } from "buffer";
import { graphql } from "../../../src/gql";
import { useMutation } from "@tanstack/react-query";
import request from "graphql-request";
import queryClient from "../../query";

window.Buffer = Buffer;
const otplibModule = import("@otplib/preset-browser");

const EnableTwoFAMutationDocument = graphql(`
  mutation enable2Fa($secret: String!) {
    enable2Fa(secret: $secret)
  }
`);
const DisableTwoFAMutationDocument = graphql(`
  mutation disable2Fa($token: String!) {
    disable2Fa(token: $token)
  }
`);

type EnableFormInputs = {
  code: string;
};
const EnableTwoFA = () => {
  const secret = useRef("");
  const [open, setOpen] = useState(false);
  const [qrcodeImg, setQrcodeImg] = useState<string | null>(null);

  useEffect(() => {
    otplibModule.then((otp) => {
      secret.current = otp.authenticator.generateSecret();
      const otpauth = otp.authenticator.keyuri(
        "pong",
        "ft_transcendence",
        secret.current
      );
      qrcode.toDataURL(otpauth, (err, imageUrl) => {
        if (!err) setQrcodeImg(imageUrl);
      });
    });
  }, []);

  const {
    register,
    formState: { errors },
    handleSubmit,
    setError,
  } = useForm<EnableFormInputs>();

  const enable2Fa = useMutation(
    async ({ secret }: { secret: string }) =>
      request("/graphql", EnableTwoFAMutationDocument, {
        secret: secret,
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["UserProfile"]);
        setOpen(false);
      },
    }
  );

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button className="mt-1 w-fit cursor-pointer border border-black bg-green-100 px-2 py-1 hover:bg-green-200">
          Enable 2FA
        </button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-20 bg-black/50" />
        <DialogPrimitive.Content
          className={
            "fixed top-[50%] left-[50%] z-50 flex w-[95vw] max-w-md -translate-x-[50%] -translate-y-[50%] flex-col bg-white p-4  md:w-full"
          }
        >
          <DialogPrimitive.Title className=" text-gray-900 ">
            Enable 2-Factor Authentication
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-2 text-gray-700 ">
            Scan the QR code below with the
            <a
              className="text-blue-500"
              href="https://googleauthenticator.net/"
              target={"_blank"}
            >
              {" "}
              Google Authenticator{" "}
            </a>
            app.
          </DialogPrimitive.Description>
          {qrcodeImg ? (
            <img src={qrcodeImg} alt="" />
          ) : (
            <p>Generating QR Code...</p>
          )}
          <form
            className="mt-2 space-y-2"
            onSubmit={handleSubmit((data) => {
              otplibModule.then((otp) => {
                const isValid = otp.authenticator.check(
                  data.code,
                  secret.current
                );
                if (isValid) {
                  enable2Fa.mutate({ secret: secret.current });
                } else {
                  setError("code", {
                    type: "custom",
                    message: "This code is invalid",
                  });
                }
              });
            })}
          >
            <fieldset>
              <label htmlFor="code" className="text-gray-700 ">
                Enter the code provided by the app
              </label>
              <input
                id="code"
                type="text"
                className={"mt-1 block w-full   text-gray-700"}
                {...register("code", {
                  required: true,
                  pattern: /[0-9]{6}/,
                })}
              />
              <span className="text-sm text-red-500">
                {errors.code
                  ? errors.code.message || "You must input a valid code"
                  : null}
              </span>
            </fieldset>
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                className={
                  "border-2 border-slate-200 bg-slate-100 px-2 py-1 hover:bg-slate-200"
                }
              >
                Verify Code
              </button>
            </div>
          </form>

          <DialogPrimitive.Close
            className={
              "absolute top-1 right-1 inline-flex w-8 items-center justify-center rounded-full p-1"
            }
          >
            <CloseIcon />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

type DisableFormInputs = {
  token: string;
};
const DisableTwoFA = () => {
  const [open, setOpen] = useState(false);

  const {
    register,
    formState: { errors },
    handleSubmit,
    setError,
  } = useForm<DisableFormInputs>();

  const disable2Fa = useMutation(
    async ({ token }: { token: string }) =>
      request("/graphql", DisableTwoFAMutationDocument, {
        token,
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["UserProfile"]);
        setOpen(false);
      },
      onError: (_) => {
        setError("token", {
          type: "custom",
          message: "This code is invalid",
        });
      },
    }
  );

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button className="mt-1 w-fit cursor-pointer border border-black bg-red-100 px-2 py-1 hover:bg-red-200">
          Disable 2FA
        </button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-20 bg-black/50" />
        <DialogPrimitive.Content
          className={
            "fixed top-[50%] left-[50%] z-50 flex w-[95vw] max-w-md -translate-x-[50%] -translate-y-[50%] flex-col bg-white p-4  md:w-full"
          }
        >
          <DialogPrimitive.Title className=" text-gray-900 ">
            Disable 2-Factor Authentication
          </DialogPrimitive.Title>
          <form
            className="mt-2 space-y-2"
            onSubmit={handleSubmit((data) => {
              disable2Fa.mutate({ token: data.token });
            })}
          >
            <fieldset>
              <label htmlFor="token" className="text-gray-700 ">
                Enter the code provided by the app
              </label>
              <input
                id="token"
                type="text"
                className={"mt-1 block w-full   text-gray-700"}
                {...register("token", {
                  required: true,
                  pattern: /[0-9]{6}/,
                })}
              />
              <span className="text-sm text-red-500">
                {errors.token
                  ? errors.token.message || "You must input a valid code"
                  : null}
              </span>
            </fieldset>
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                className={
                  "border-2 border-slate-200 bg-slate-100 px-2 py-1 hover:bg-slate-200"
                }
              >
                Disable
              </button>
            </div>
          </form>

          <DialogPrimitive.Close
            className={
              "absolute top-1 right-1 inline-flex w-8 items-center justify-center rounded-full p-1"
            }
          >
            <CloseIcon />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export const TwoFABtn = ({ enabled }: { enabled: boolean }) => {
  return <>{enabled ? <DisableTwoFA /> : <EnableTwoFA />}</>;
};
