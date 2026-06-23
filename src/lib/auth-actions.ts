"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { validateCredentials, AUTH_COOKIE, AUTH_TOKEN } from "./auth";

export async function loginAction(
  _prevState: { error: boolean },
  formData: FormData
) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const nextRaw = formData.get("next");

  if (!validateCredentials(username, password)) {
    return { error: true };
  }

  // Only allow same-origin relative paths — block open-redirect via "//host" or "/\".
  const next =
    typeof nextRaw === "string" &&
    nextRaw.startsWith("/") &&
    !nextRaw.startsWith("//") &&
    !nextRaw.startsWith("/\\")
      ? nextRaw
      : "/";

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, AUTH_TOKEN, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  redirect(next);
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
  redirect("/login");
}
