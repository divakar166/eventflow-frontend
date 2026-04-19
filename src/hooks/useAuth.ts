import { useMutation } from "@tanstack/react-query";
import { publicApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";

const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || "localhost";
const APP_PORT = process.env.NEXT_PUBLIC_APP_PORT || "3000";

export function useLogin() {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const { data } = await publicApi.post("/api/v1/auth/login/", credentials);
      return data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.organizations, data.access, data.refresh);
      // If only one org, redirect directly — otherwise let user pick
      if (data.organizations.length === 1) {
        const org = data.organizations[0];
        window.location.href = `http://${org.slug}.${BASE_DOMAIN}:${APP_PORT}/dashboard`;
      } else {
        router.push("/select-org");
      }
    },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();

  return () => {
    logout();
    window.location.href = `http://${BASE_DOMAIN}:${APP_PORT}/login`;
  };
}
