import { ReactComponent as GamePadIcon } from "pixelarticons/svg/gamepad.svg";
import { ReactComponent as LoaderIcon } from "pixelarticons/svg/loader.svg";
export const Empty = ({ Message, Icon }: { Message: string; Icon: string }) => {
  return (
    <div className="flex h-full select-none flex-col items-center justify-center text-slate-200">
      {Icon === "GamePadIcon" ? (
        <GamePadIcon className="-mt-2 w-96" />
      ) : (
        <LoaderIcon className="-mt-2 w-96" />
      )}
      <span className="mt-10 px-20 text-center text-2xl">{`${Message}`}</span>
    </div>
  );
};
