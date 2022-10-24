import LogoImage from "../assets/images/logo.svg";

const LogoLayout = ({ children }: { children: JSX.Element }) => {
  return (
    <div className="flex h-full w-full flex-col items-center bg-black">
      <img
        src={LogoImage}
        className="mt-5 w-4/5 sm:max-w-lg lg:max-w-xl 2xl:max-w-2xl"
        alt="Pong game logo"
      />
      {children}
    </div>
  );
};

export default LogoLayout;
