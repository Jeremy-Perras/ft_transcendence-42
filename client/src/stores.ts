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

export { useSidebarStore, useAuthStore };
