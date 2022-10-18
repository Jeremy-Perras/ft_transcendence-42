import LogoImage from "../assets/images/logo.svg";
const Title = () => {
  return (
    <img
      src={LogoImage}
      className="w-sm mt-5 sm:max-w-lg lg:max-w-xl 2xl:max-w-2xl"
      alt="Pong game logo"
    />
  );
};

export default Title;
