import { z } from 'zod'

export const userSchemas = {
	login: z
		.string()
		.trim()
		.min(5, 'must contain at least 5 characters')
		.max(32, 'must contain at most 32 characters')
		.regex(
			/^[a-z0-9_]+$/,
			'must consist of only lowercase a-z characters, digits or an underscore',
		),

	displayName: z
		.string()
		.trim()
		.max(64, 'must contain at most 64 characters'),

	password: z
		.string()
		.trim()
		.min(6, 'must contain at least 6 characters')
		.max(100, 'must contain at most 255 characters'),
}
