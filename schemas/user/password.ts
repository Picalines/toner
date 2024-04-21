import { z } from 'zod'

export const passwordSchema = z
	.string()
	.min(6, 'must contain at least 6 characters')
	.max(100, 'must contain at most 255 characters')
