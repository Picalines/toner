import { loadEnvConfig } from '@next/env'
import { envSchema } from './envSchema'

loadEnvConfig(process.cwd())
export const serverEnv = envSchema.parse(process.env)
