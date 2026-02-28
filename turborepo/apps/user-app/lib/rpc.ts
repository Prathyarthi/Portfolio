import { treaty } from '@elysiajs/eden'
import type { AppType } from '../app/api/[...slugs]/route'

export const client: any = treaty<AppType>('localhost:3000').api