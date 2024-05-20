import { z } from 'zod'

const authEnvSchema = z.object({
	AUTH_SECURE_COOKIES: z
		.boolean()
		.default(process.env.NODE_ENV === 'production'),
})

export function getAuthEnvironment(): z.infer<typeof authEnvSchema> {
	return authEnvSchema.parse(process.env)
}
