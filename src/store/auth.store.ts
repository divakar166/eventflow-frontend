import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";

export interface Organization {
  name: string;
  slug: string;
  role: "admin" | "manager" | "viewer";
  domain: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
}

interface AuthState {
  user: User | null;
  organizations: Organization[];
  currentOrg: Organization | null;
  isAuthenticated: boolean;

  setAuth: (
    user: User,
    organizations: Organization[],
    accessToken: string,
    refreshToken: string,
  ) => void;
  setCurrentOrg: (org: Organization) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      organizations: [],
      currentOrg: null,
      isAuthenticated: false,

      setAuth: (user, organizations, accessToken, refreshToken) => {
        Cookies.set("access_token", accessToken, { expires: 1 });
        Cookies.set("refresh_token", refreshToken, { expires: 7 });
        set({ user, organizations, isAuthenticated: true });
      },

      setCurrentOrg: (org) => set({ currentOrg: org }),

      logout: () => {
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        set({
          user: null,
          organizations: [],
          currentOrg: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        organizations: state.organizations,
        currentOrg: state.currentOrg,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
