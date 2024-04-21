import { z } from 'zod'

export const displayNameSchema = z
	.string()
	.trim()
	.max(64, 'must contain at most 64 characters')
