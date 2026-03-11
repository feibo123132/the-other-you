import { create } from "zustand";
import { buildUrl, getApiBase } from "@/services/apiBase";
import { AUTH_CAN_GENERATE_KEY, AUTH_EMAIL_KEY, AUTH_TOKEN_KEY, readStorage } from "@/store/authStorage";

async function parseErrorMessage(resp: Response, fallback: string) {
  try {
    const data = await resp.json();
    return data?.message || data?.error || fallback;
  } catch {
    return fallback;
  }
}

interface AuthState {
  currentUser: string | null;
  authToken: string | null;
  canGenerate: boolean;
  isLoading: boolean;
  error: string | null;
  sendCode: (email: string) => Promise<boolean>;
  loginWithCode: (email: string, code: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: readStorage(AUTH_EMAIL_KEY),
  authToken: readStorage(AUTH_TOKEN_KEY),
  canGenerate: readStorage(AUTH_CAN_GENERATE_KEY) === "1",
  isLoading: false,
  error: null,
  sendCode: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      const apiBase = await getApiBase();
      const resp = await fetch(buildUrl(apiBase, "/auth/send-code"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!resp.ok) {
        const message = await parseErrorMessage(resp, "发送验证码失败，请稍后重试");
        set({ isLoading: false, error: message });
        return false;
      }

      set({ isLoading: false, error: null });
      return true;
    } catch {
      set({ isLoading: false, error: "发送验证码失败，请检查网络或稍后重试" });
      return false;
    }
  },
  loginWithCode: async (email: string, code: string) => {
    set({ isLoading: true, error: null });
    try {
      const apiBase = await getApiBase();
      const resp = await fetch(buildUrl(apiBase, "/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      if (!resp.ok) {
        const message = await parseErrorMessage(resp, "登录失败，请稍后重试");
        set({ isLoading: false, error: message });
        throw new Error(message);
      }

      const data = await resp.json();
      const token = typeof data?.token === "string" ? data.token : "";
      const canGenerate = Boolean(data?.allowGenerate);

      localStorage.setItem(AUTH_EMAIL_KEY, email);
      if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
      localStorage.setItem(AUTH_CAN_GENERATE_KEY, canGenerate ? "1" : "0");
      set({
        currentUser: email,
        authToken: token || null,
        canGenerate,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      if (!((err as Error)?.message)) {
        set({ isLoading: false, error: "登录失败，请检查网络或稍后重试" });
      }
      throw err;
    }
  },
  logout: () => {
    localStorage.removeItem(AUTH_EMAIL_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_CAN_GENERATE_KEY);
    set({ currentUser: null, authToken: null, canGenerate: false, error: null });
  },
}));
