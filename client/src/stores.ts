import { Socket, io } from "socket.io-client";
import { create } from "zustand";

type SidebarStore = {
  isOpen: boolean;
  close: () => void;
  open: () => void;
  toggle: () => void;
};
const useSidebarStore = create<SidebarStore>((set) => ({
  isOpen: false,
  close: () => set({ isOpen: false }),
  open: () => set({ isOpen: true }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));

type SocketStore = {
  socket: Socket;
};
const useSocketStore = create<SocketStore>(() => ({
  socket: io({ transports: ["websocket"] }),
}));

type AuthStore = {
  userId: number | undefined;
  twoFAVerified: boolean | undefined;
  set2Fa: (verified: boolean) => void;
  login: (id: number) => void;
  logout: () => void;
  isLoggedIn: () => boolean;
};
const useAuthStore = create<AuthStore>((set, get) => ({
  userId: undefined,
  twoFAVerified: undefined,
  set2Fa: (verified) => {
    set({ twoFAVerified: verified });
  },
  login: (id: number) => {
    return set({ userId: id });
  },
  logout: () => {
    fetch("/auth/logout").then(() => {
      set({ userId: undefined, twoFAVerified: undefined });
    });
  },
  isLoggedIn: () => {
    return (
      get().userId !== undefined &&
      (get().twoFAVerified === undefined || get().twoFAVerified !== false)
    );
  },
}));

type InvitationStore = {
  invitationName?: string;
  invitationId?: number;
  createInvite: (name: string, id: number) => void;
  clearInvite: () => void;
};
const useInvitationStore = create<InvitationStore>((set) => ({
  invitationName: undefined,
  invitationId: undefined,
  createInvite: (name, id) =>
    set({
      invitationName: name,
      invitationId: id,
    }),
  clearInvite: () =>
    set({ invitationName: undefined, invitationId: undefined }),
}));

type GameStore = {
  gameId?: number;
  setGameId: (gameId: number | undefined) => void;
};
const useGameStore = create<GameStore>((set) => ({
  gameId: undefined,
  setGameId: (gameId) => set({ gameId }),
}));

type State =
  | "MatchmakingSelect"
  | "MatchmakingWait"
  | "InvitationSelect"
  | "InvitationWait"
  | "Idle"
  | "Playing";
type StateStore = {
  state: State;
  setState: (state: State) => void;
};
const useStateStore = create<StateStore>((set) => ({
  state: "Idle",
  setState: (state: State) => {
    set({ state });
  },
}));

export {
  useSidebarStore,
  useAuthStore,
  useSocketStore,
  useStateStore,
  useInvitationStore,
  useGameStore,
};
