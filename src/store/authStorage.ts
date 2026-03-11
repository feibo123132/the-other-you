export const AUTH_EMAIL_KEY = "THE_OTHER_YOU_AUTH_EMAIL";
export const AUTH_TOKEN_KEY = "THE_OTHER_YOU_AUTH_TOKEN";
export const AUTH_CAN_GENERATE_KEY = "THE_OTHER_YOU_CAN_GENERATE";

export const readStorage = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

