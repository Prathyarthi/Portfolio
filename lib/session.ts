import { getToken } from "next-auth/jwt";

export async function getSession(request: Request) {
  const token = await getToken({
    req: request as any,
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (!token?.id || typeof token.id !== "string") return null;
  return {
    userId: token.id,
    name: token.name as string | undefined,
    email: token.email as string | undefined,
  };
}
