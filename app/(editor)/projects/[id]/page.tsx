import { and, eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { z } from 'zod'
import { authenticateOrRedirect } from '@/lib/auth'
import { compositionTable, database } from '@/lib/db'
import { DeepReadonly } from '@/lib/utils'

type Props = DeepReadonly<{
	params: {
		id: string
	}
}>

const paramsSchema = z.object({
	id: z.coerce.number().positive().finite().safe().int(),
})

export default async function EditorPage({ params }: Props) {
	const parsedParams = paramsSchema.safeParse(params)
	if (!parsedParams.success) {
		notFound()
	}

	const {
		data: { id: projectId },
	} = parsedParams

	const {
		user: { id: accountId },
	} = await authenticateOrRedirect('/sign-in')

	const compositionQuery = await database
		.select({ name: compositionTable.name })
		.from(compositionTable)
		.limit(1)
		.where(
			and(
				eq(compositionTable.authorId, accountId),
				eq(compositionTable.id, projectId),
			),
		)

	if (compositionQuery.length != 1) {
		notFound()
	}

	const [{ name }] = compositionQuery

	return <>{name}</>
}
