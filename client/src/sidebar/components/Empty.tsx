export const Empty = ({
  message,
  Icon,
}: {
  message: string;
  Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
}) => {
  return (
    <div className="flex h-full select-none flex-col items-center justify-center text-slate-200">
      <Icon className="-mt-2 w-96" />
      <span className="mt-10 px-20 text-center text-2xl">{`${message}`}</span>
    </div>
  );
};
