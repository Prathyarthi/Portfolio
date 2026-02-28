import {prisma} from "@repo/db/client"
import Elysia from "elysia";
import { z } from "zod";

export const something = new Elysia({ prefix: '/something' })
    .post('/something', async (ctx) => {
       //TODO
    })