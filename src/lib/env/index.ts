import { z } from 'zod'
import { loadEnvConfig } from '@next/env'

const envSchema = z.object({
	DB_HOST: z.string().min(1),
	DB_PORT: z.coerce.number(),
	DB_USER: z.string().min(1),
	DB_PASWORD: z.string().min(1),
	DB_DATABASE: z.string().min(1),
})

loadEnvConfig(process.cwd())
export const serverEnv = envSchema.parse(process.env)
