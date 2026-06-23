export const AUTH_COOKIE = "auth-session";
export const AUTH_TOKEN = "authenticated";

const CREDENTIALS = {
  username: "chrono",
  password: "ACE2026!",
};

export function validateCredentials(username: string, password: string): boolean {
  return username === CREDENTIALS.username && password === CREDENTIALS.password;
}
