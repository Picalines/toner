import { z } from 'zod'

export const loginSchema = z
	.string()
	.min(5, 'must contain at least 5 characters')
	.max(32, 'must contain at most 32 characters')
	.regex(
		/^[a-z0-9_]+$/,
		'must consist of only lowercase a-z characters, digits or an underscore',
	)
