import React, { ReactElement, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { GameRouter } from "./game/router";
import SideBar from "./sidebar/sidebar";
import queryClient from "./query";
import { useAuthStore, useSocketStore } from "./stores";
import "./index.css";
import { ReactComponent as LogOutIcon } from "pixelarticons/svg/logout.svg";
import { useMediaQuery } from "@react-hookz/web";
import LogoImage from "./assets/images/logo.svg";
import { useForm } from "react-hook-form";

type ValidateFormInput = {
  code: string;
};

type NewAccountFormInput = {
  name: string;
};

const AuthLayout = ({ children }: { children: ReactElement }) => {
  const isSmall = useMediaQuery("(max-height : 1000px)");
  return (
    <>
      <img
        src={LogoImage}
        className={`pointer-events-none mt-5 w-4/5 select-none sm:max-w-lg lg:max-w-xl 2xl:max-w-2xl ${
          isSmall ? "mx-auto" : "absolute left-1/2 -translate-x-1/2"
        }`}
        alt="Pong game logo"
      />
      <div className=" flex h-full select-none items-center justify-center">
        {children}
      </div>
    </>
  );
};

let init = false;
const App = () => {
  const [connectionStatus, setConnectionStatus] = useState<
    "CONNECTED" | "2FA" | "ACCOUNT_CREATION" | "OTHER_DEVICE" | "DISCONNECTED"
  >("DISCONNECTED");
  const { login, set2Fa, userId, twoFAVerified } = useAuthStore();
  const isLoggedIn = useAuthStore().isLoggedIn();
  const socket = useSocketStore().socket;
  const [sessionFetched, setSessionFetched] = useState(false);

  useEffect(() => {
    if (!init) {
      init = true;
      fetch("/auth/session").then(async (res) => {
        if (res.status === 200) {
          const data = await res.json();
          if (data && "id" in data && typeof data.id === "number") {
            login(data.id);
            if (data.twoFactorVerified !== undefined) {
              set2Fa(data.twoFactorVerified);
            }
          }
        }
        setSessionFetched(true);
      });
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      if (!socket.connected) socket.connect();
      socket.emit("getstatus", (response: { status: string }) => {
        if (response.status === "You are already connected on another device") {
          setConnectionStatus("OTHER_DEVICE");
        }
        if (response.status === "ok") {
          if (twoFAVerified === true || twoFAVerified === undefined) {
            setConnectionStatus("CONNECTED");
          } else if (twoFAVerified === false) {
            setConnectionStatus("2FA");
          }
        }
      });

      socket.on("invalidateDirectMessageCache", (targetId: number) => {
        queryClient.invalidateQueries(["DirectMessages"]);
        queryClient.invalidateQueries(["DirectMessages", targetId]);
        queryClient.invalidateQueries(["NewMessages"]);
        queryClient.invalidateQueries(["DiscussionsAndInvitations"]);
        queryClient.invalidateQueries(["DiscussionsAndInvitations", targetId]);
      });

      socket.on("invalidateChannelMessageCache", (targetId: number) => {
        queryClient.invalidateQueries(["ChannelDiscussion", targetId]);
        queryClient.invalidateQueries(["DiscussionsAndInvitations"]);
        queryClient.invalidateQueries(["NewMessages"]);
      });
    } else if (userId && twoFAVerified === false) {
      setConnectionStatus("2FA");
    } else {
      setConnectionStatus("DISCONNECTED");
    }
  }, [isLoggedIn, userId, twoFAVerified]);

  const validateForm = useForm<ValidateFormInput>();

  const newAccountForm = useForm<NewAccountFormInput>();

  useEffect(() => {
    if (isLoggedIn) {
      if (window.location.pathname === "/signup") window.location.assign("/");
    } else {
      const search = new URLSearchParams(window.location.search);
      if (
        !(
          window.location.pathname === "/" ||
          (window.location.pathname === "/signup" && !!search.get("id"))
        )
      ) {
        if (sessionFetched) window.location.assign("/");
      }
      if (window.location.pathname === "/signup" && !!search.get("id")) {
        setConnectionStatus("ACCOUNT_CREATION");
      }
    }
  }, [isLoggedIn, connectionStatus, sessionFetched]);

  return (
    <div className="relative flex h-screen w-screen overflow-hidden">
      <QueryClientProvider client={queryClient}>
        <>
          <div className="crt relative flex h-full w-full shrink grow select-none flex-col   bg-[#002a2a] p-10 font-display text-gray-200 sm:w-[calc(theme(width.full)-theme(width.128))]">
            {connectionStatus === "DISCONNECTED" ? (
              <AuthLayout>
                <a
                  href={`https://api.intra.42.fr/oauth/authorize?client_id=${
                    import.meta.env.PUBLIC_OAUTH42_CLIENT_ID
                  }&redirect_uri=${encodeURIComponent(
                    import.meta.env.PUBLIC_OAUTH42_CALLBACK_URL
                  )}&response_type=code&scope=public`}
                  className="animate-pulse cursor-pointer text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
                >
                  Click To Login
                </a>
              </AuthLayout>
            ) : null}
            {connectionStatus === "OTHER_DEVICE" ? (
              <AuthLayout>
                <>
                  <span className="animate-none text-center text-2xl">
                    You are already connected on another device!
                  </span>
                  <LogOutIcon
                    onClick={() => {
                      useAuthStore.getState().logout();
                      socket.disconnect();
                      setConnectionStatus("DISCONNECTED");
                    }}
                    className="absolute top-2 right-2 h-8 rotate-180 cursor-pointer bg-red-600 text-black hover:bg-red-500"
                  />
                </>
              </AuthLayout>
            ) : null}
            {connectionStatus === "2FA" ? (
              <AuthLayout>
                <>
                  <div className="flex flex-col items-center">
                    <h2 className="mb-8 block text-center text-4xl">
                      Two-Factor Authentication
                    </h2>
                    <form
                      onSubmit={validateForm.handleSubmit((data) => {
                        fetch("/auth/verify-otp", {
                          method: "POST",
                          body: JSON.stringify({
                            token: data.code,
                          }),
                          headers: { "Content-Type": "application/json" },
                        }).then((data) => {
                          if (data.ok) {
                            set2Fa(true);
                          } else {
                            validateForm.setError("code", {
                              type: "custom",
                              message: "This code is invalid",
                            });
                          }
                        });
                      })}
                      className="flex w-fit flex-col items-center font-content"
                    >
                      <fieldset>
                        <label htmlFor="code" className="animate-none text-xl">
                          Enter the code provided by the app
                        </label>
                        <input
                          id="code"
                          type="text"
                          className={
                            "mt-1 block w-full animate-none text-gray-700"
                          }
                          {...validateForm.register("code", {
                            required: true,
                            pattern: /[0-9]{6}/,
                          })}
                        />
                        <span className="animate-none text-sm text-red-500">
                          {validateForm.formState.errors.code
                            ? validateForm.formState.errors.code.message ||
                              "You must input a valid code"
                            : null}
                        </span>
                      </fieldset>
                      <div className="mt-4 flex justify-end">
                        <button
                          type="submit"
                          className={
                            "animate-none border-2 border-slate-200 bg-slate-100 px-2 py-1 text-gray-700 hover:bg-slate-200"
                          }
                        >
                          Verify Code
                        </button>
                      </div>
                    </form>
                  </div>
                  <LogOutIcon
                    onClick={() => {
                      useAuthStore.getState().logout();
                      socket.disconnect();
                      setConnectionStatus("DISCONNECTED");
                    }}
                    className="absolute top-2 right-2 h-8 rotate-180 cursor-pointer bg-red-600 text-black hover:bg-red-500"
                  />
                </>
              </AuthLayout>
            ) : null}
            {connectionStatus === "CONNECTED" ? <GameRouter /> : null}
            {connectionStatus === "ACCOUNT_CREATION" ? (
              <AuthLayout>
                <div className="flex flex-col items-center">
                  <h2 className="mb-8 block text-center text-4xl">
                    Create new account
                  </h2>
                  <img />
                  <form
                    onSubmit={newAccountForm.handleSubmit((data) => {
                      const id = new URLSearchParams(
                        window.location.search
                      ).get("id");
                      if (id) {
                        fetch("/auth/signup", {
                          method: "POST",
                          body: JSON.stringify({
                            name: data.name,
                            id: +id,
                          }),
                          headers: { "Content-Type": "application/json" },
                        }).then((data) => {
                          if (data.ok) {
                            window.location.assign(
                              `https://api.intra.42.fr/oauth/authorize?client_id=${
                                import.meta.env.PUBLIC_OAUTH42_CLIENT_ID
                              }&redirect_uri=${encodeURIComponent(
                                import.meta.env.PUBLIC_OAUTH42_CALLBACK_URL
                              )}&response_type=code&scope=public`
                            );
                          } else {
                            data
                              .json()
                              .then((err) => {
                                newAccountForm.setError("name", {
                                  message: err.message,
                                });
                              })
                              .catch(() => {
                                newAccountForm.setError("name", {
                                  message: "Error creating account, try again!",
                                });
                              });
                          }
                        });
                      }
                    })}
                    className="flex w-fit flex-col items-center font-content"
                  >
                    <fieldset>
                      <label htmlFor="name" className="animate-none text-xl">
                        Enter your unique name
                      </label>
                      <input
                        id="name"
                        type="text"
                        className={
                          "mt-1 block w-full animate-none text-gray-700"
                        }
                        {...newAccountForm.register("name", {
                          required: true,
                          maxLength: 50,
                        })}
                      />
                      <span className="animate-none text-sm text-red-500">
                        {newAccountForm.formState.errors.name
                          ? newAccountForm.formState.errors.name.message ||
                            "You must input a valid name"
                          : null}
                      </span>
                    </fieldset>
                    <div className="mt-4 flex justify-end">
                      <button
                        type="submit"
                        className={
                          "animate-none border-2 border-slate-200 bg-slate-100 px-2 py-1 text-gray-700 hover:bg-slate-200"
                        }
                      >
                        Create your account
                      </button>
                    </div>
                  </form>
                </div>
              </AuthLayout>
            ) : null}
          </div>
          {connectionStatus === "CONNECTED" ? <SideBar /> : null}
        </>
      </QueryClientProvider>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
