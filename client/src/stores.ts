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
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
};
const useAuthStore = create<AuthStore>((set) => ({
  isLoggedIn: false,
  login: () => {
    return set({ isLoggedIn: true });
  },
  logout: () => {
    fetch("/auth/logout").then(() => {
      set({ isLoggedIn: false });
    });
  },
}));

export { useSidebarStore, useAuthStore };
