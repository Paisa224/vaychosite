import { config } from 'dotenv'
import { z } from 'zod'

config()

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    FRONTEND_ORIGIN: z.string().default('http://localhost:5173'),
    LEAD_STORAGE_MODE: z.enum(['memory', 'prisma']).default('memory'),
    LEAD_NOTIFICATION_PROVIDER: z.enum(['none', 'formsubmit']).default('formsubmit'),
    LEAD_NOTIFICATION_EMAIL: z.string().email().default('manuel_navarro50@hotmail.com'),
    DATABASE_URL: z.string().optional(),
  })
  .refine(
    (values) =>
      values.LEAD_STORAGE_MODE === 'memory' ||
      (values.DATABASE_URL !== undefined && values.DATABASE_URL.length > 0),
    {
      message: 'DATABASE_URL is required when LEAD_STORAGE_MODE=prisma',
      path: ['DATABASE_URL'],
    },
  )

const envResult = envSchema.safeParse(process.env)

if (!envResult.success) {
  throw new Error(`Invalid environment configuration: ${envResult.error.message}`)
}

export const env = envResult.data
