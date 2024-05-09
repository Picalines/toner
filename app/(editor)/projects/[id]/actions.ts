'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { notFound } from 'next/navigation'
import { authenticateOrRedirect } from '@/lib/auth'
import {
	compositionTable,
	database,
	nodeConnectionTable,
	nodePropertyTable,
	nodeTable,
} from '@/lib/db'
import { CompositionInfo } from './schemas'

export async function fetchComposition(compositionId: number) {
	const {
		user: { id: accountId },
	} = await authenticateOrRedirect('/sign-in')

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
}

export async function updateCompositionInfo(
	compositionId: number,
	{ name, description }: CompositionInfo,
) {
	const {
		user: { id: accountId },
	} = await authenticateOrRedirect('/sign-in')

	await database.transaction(async tx => {
		await tx
			.update(compositionTable)
			.set({ name, description })
			.where(
				and(
					eq(compositionTable.id, compositionId),
					eq(compositionTable.authorId, accountId),
				),
			)
	})

	revalidatePath('/account')
}
