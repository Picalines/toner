'use server'

import { redirect } from 'next/navigation'
import { authenticateOrRedirect } from '@/lib/auth'
import { compositionTable, database } from '@/lib/db'

export async function createComposition() {
	const {
		user: { id: accountId },
	} = await authenticateOrRedirect('./sign-in')

	const compositionId = await database.transaction(async tx => {
		const inserted = await tx
			.insert(compositionTable)
			.values({ authorId: accountId, name: 'Untitled' })
			.returning({ compositionId: compositionTable.id })

		return inserted.length == 1 ? inserted[0].compositionId : null
	})

	if (compositionId === null) {
		// TODO: work out proper error handling
		throw new Error('failed to create composition')
	}

	redirect(`/projects/${compositionId}`)
}
