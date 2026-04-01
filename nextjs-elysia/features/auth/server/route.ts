import Elysia, { t } from "elysia";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export const auth = new Elysia()
  .post(
    "/register",
    async (ctx) => {
      const { name, email, password } = ctx.body;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        ctx.set.status = 409;
        return { error: "Email already registered" };
      }

      const hashed = await hashPassword(password);
      const user = await prisma.user.create({
        data: { name, email, password: hashed },
      });

      return { user: { id: user.id, name: user.name, email: user.email } };
    },
    {
      body: t.Object({
        name: t.String({ minLength: 2 }),
        email: t.String(),
        password: t.String({ minLength: 8 }),
      }),
    }
  );
