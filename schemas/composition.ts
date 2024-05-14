import { z } from 'zod'

export const compositionSchemas = {
	name: z.string().trim().min(1),
	description: z.string().trim(),
}
