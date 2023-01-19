import { Socket, io } from "socket.io-client";
import create from "zustand";

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

type InvitationStore = {
  invitationName?: string;
  invitationId?: number;
  invitationState?: "selecting" | "waiting";
  createInvite: (name: string, id: number) => void;
  sendInvite: () => void;
  clearInvite: () => void;
};
const useInvitationStore = create<InvitationStore>((set) => ({
  invitationName: undefined,
  invitationId: undefined,
  invitationState: undefined,
  createInvite: (name, id) =>
    set({
      invitationName: name,
      invitationId: id,
      invitationState: "selecting",
    }),
  sendInvite: () => set({ invitationState: "waiting" }),
  clearInvite: () =>
    set({ invitationName: undefined, invitationState: undefined }),
}));

type AuthStore = {
  userId: number | undefined;
  login: (id: number) => void;
  logout: () => void;
};
const useAuthStore = create<AuthStore>((set) => ({
  userId: undefined,
  login: (id: number) => {
    return set({ userId: id });
  },
  logout: () => {
    fetch("/auth/logout").then(() => {
      set({ userId: undefined });
    });
  },
}));

type State =
  | "MatchmakingState"
  | "PlayingState"
  | "WaitingForInviteeState"
  | undefined;
type StateStore = {
  state: State;
  setState: (state: State) => void;
};
const useStateStore = create<StateStore>((set) => ({
  state: undefined,
  setState: (state: State) => {
    set({ state });
  },
}));

export {
  useSidebarStore,
  useAuthStore,
  useSocketStore,
  useInvitationStore,
  useStateStore,
};
