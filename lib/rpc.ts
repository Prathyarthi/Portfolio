import { treaty } from '@elysiajs/eden'
import type { AppType } from '../app/api/[...slugs]/route'

export const client = treaty<AppType>('localhost:3000').api