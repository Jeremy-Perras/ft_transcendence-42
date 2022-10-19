import { createContext } from "react";

export const SideBarContext = createContext<React.Dispatch<
  React.SetStateAction<boolean>
> | null>(null);
