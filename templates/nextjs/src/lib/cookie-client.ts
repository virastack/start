import Cookies from "js-cookie";

if (typeof window === "undefined") {
  throw new Error("cookie-client only works on the client");
}

export const cookie = {
  get: (key: string): string | null => Cookies.get(key) ?? null,
  set: (key: string, value: string, days = 365) =>
    Cookies.set(key, value, {
      expires: days,
      sameSite: "Lax",
      path: "/",
      secure: process.env.NODE_ENV === "production"
    }),
  remove: (key: string): void => Cookies.remove(key)
};
