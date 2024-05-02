import { z } from 'zod'

export const compositionInfoSchema = z.object({
	name: z.string().trim().min(1),
	description: z.string().trim(),
})

export type CompositionInfo = z.infer<typeof compositionInfoSchema>
