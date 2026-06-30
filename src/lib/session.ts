import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

export async function getCurrentSession() {
  return getServerSession(authOptions);
}

export async function requireSession() {
  const session = await getCurrentSession();
  if (!session?.user) {
    throw new Error("Não autenticado.");
  }
  return session;
}
