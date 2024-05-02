'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { authenticateOrRedirect } from '@/lib/auth'
import { compositionTable, database } from '@/lib/db'
import { CompositionInfo } from './schemas'

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
