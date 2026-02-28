import { Elysia, t } from 'elysia'
import { something } from "@/features/server/route";

const app = new Elysia({ prefix: '/api' })
    .use(something)

export const GET = app.fetch
export const POST = app.fetch

export type AppType = typeof app