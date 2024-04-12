import { z } from 'zod'

export const signInFormSchema = z.object({
	login: z
		.string()
		.min(5, 'must contain at least 5 characters')
		.max(32, 'must contain at most 32 characters')
		.regex(
			/^[a-z0-9_]+$/,
			'must consist of only lowercase a-z characters, digits or an underscore',
		),
	password: z
		.string()
		.min(6, 'must contain at least 6 characters')
		.max(100, 'must contain at most 255 characters'),
})

export type SignInFormData = z.infer<typeof signInFormSchema>