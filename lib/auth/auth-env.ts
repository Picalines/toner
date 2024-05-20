import { z } from 'zod'

const authEnvSchema = z.object({
	AUTH_SECURE_COOKIES: z
		.union([z.literal('true'), z.literal('false')])
		.default(process.env.NODE_ENV === 'production' ? 'true' : 'false')
		.transform(value => value == 'true'),
})

export function getAuthEnvironment(): z.infer<typeof authEnvSchema> {
	return authEnvSchema.parse(process.env)
}
