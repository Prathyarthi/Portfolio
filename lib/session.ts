import { getToken } from "next-auth/jwt";

export async function getSession(request: Request) {
  const token = await getToken({
    req: request as any,
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (!token) return null;
  return {
    userId: token.id as string,
    name: token.name as string | undefined,
    email: token.email as string | undefined,
  };
}
