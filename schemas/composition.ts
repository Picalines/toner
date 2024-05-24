import { z } from 'zod'

export type CompositionId = z.infer<(typeof compositionSchemas)['id']>

const compositionId = z.number().int()

const compositionName = z.string().trim().min(1)

const compositionDescription = z.string().trim()

export const compositionSchemas = {
	id: compositionId,
	name: compositionName,
	description: compositionDescription,
}
