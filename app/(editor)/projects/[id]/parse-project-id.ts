import { notFound } from 'next/navigation'
import { z } from 'zod'

const paramsSchema = z.object({
	id: z.coerce.number().positive().finite().safe().int(),
})

export function parseProjectId(params: Readonly<{ id: string }>): number {
	const parsedParams = paramsSchema.safeParse(params)
	if (!parsedParams.success) {
		notFound()
	}

	return parsedParams.data.id
}
