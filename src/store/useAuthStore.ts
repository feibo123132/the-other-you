import { create } from "zustand";

const AUTH_EMAIL_KEY = "THE_OTHER_YOU_AUTH_EMAIL";
const AUTH_CODE_KEY = "THE_OTHER_YOU_AUTH_CODE";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const readStoredEmail = () => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(AUTH_EMAIL_KEY);
  } catch {
    return null;
  }
};

interface AuthState {
  currentUser: string | null;
  isLoading: boolean;
  error: string | null;
  sendCode: (email: string) => Promise<boolean>;
  loginWithCode: (email: string, code: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: readStoredEmail(),
  isLoading: false,
  error: null,
  sendCode: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      await wait(500);
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      localStorage.setItem(AUTH_CODE_KEY, code);
      if (import.meta.env.DEV) {
        // For local testing, developers can read the generated code in console.
        console.info("[MockAuth] verification code:", code);
      }
      set({ isLoading: false, error: null });
      return true;
    } catch {
      set({ isLoading: false, error: "发送验证码失败，请稍后重试" });
      return false;
    }
  },
  loginWithCode: async (email: string, code: string) => {
    set({ isLoading: true, error: null });
    await wait(400);

    const savedCode = localStorage.getItem(AUTH_CODE_KEY);
    const isValidFormat = /^[0-9]{6}$/.test(code);
    const isMatched = savedCode ? savedCode === code : true;

    if (!isValidFormat || !isMatched) {
      set({ isLoading: false, error: "验证码不正确，请重试" });
      throw new Error("invalid code");
    }

    localStorage.setItem(AUTH_EMAIL_KEY, email);
    localStorage.removeItem(AUTH_CODE_KEY);
    set({ currentUser: email, isLoading: false, error: null });
  },
  logout: () => {
    localStorage.removeItem(AUTH_EMAIL_KEY);
    localStorage.removeItem(AUTH_CODE_KEY);
    set({ currentUser: null, error: null });
  },
}));

