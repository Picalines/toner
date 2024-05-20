import { z } from 'zod'

const databaseEnvSchema = z.object({
	DB_HOST: z.string().min(1),
	DB_PORT: z.coerce.number(),
	DB_USER: z.string().min(1),
	DB_PASSWORD: z.string().min(1),
	DB_DATABASE: z.string().min(1),
})

export function shouldConnectToDatabase() {
	return !('IGNORE_DB' in process.env)
}

export function getDatabaseEnvironment(): z.infer<typeof databaseEnvSchema> {
	return databaseEnvSchema.parse(process.env)
}
