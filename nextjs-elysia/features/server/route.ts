import { prisma } from "@/lib/prisma";
import Elysia from "elysia";
import { z } from "zod";

export const something = new Elysia({ prefix: '/something' })
    .post('/something', async (ctx) => {
        // logic here
    })