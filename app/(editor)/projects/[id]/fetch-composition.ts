import { and, eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { compositionTable, database } from '@/lib/db'

export const fetchComposition = cache(
	async (accountId: number, compositionId: number) => {
		const compositionQuery = await database
			.select({
				id: compositionTable.id,
				name: compositionTable.name,
				description: compositionTable.description,
			})
			.from(compositionTable)
			.limit(1)
			.where(
				and(
					eq(compositionTable.authorId, accountId),
					eq(compositionTable.id, compositionId),
				),
			)

		if (compositionQuery.length != 1) {
			notFound()
		}

		return compositionQuery[0]
	},
)
