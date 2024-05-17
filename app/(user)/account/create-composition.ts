'use server'

import { nanoid } from 'nanoid'
import { redirect } from 'next/navigation'
import { authenticateOrRedirect } from '@/lib/auth'
import {
	audioEdgeTable,
	audioNodeTable,
	compositionTable,
	database,
	musicLayerTable,
} from '@/lib/db'

export async function createComposition() {
	const {
		user: { id: accountId },
	} = await authenticateOrRedirect('./sign-in')

	const compositionId = await database.transaction(async tx => {
		const inserted = await tx
			.insert(compositionTable)
			.values({ authorId: accountId, name: 'Untitled' })
			.returning({ compositionId: compositionTable.id })

		if (inserted.length != 1) {
			return null
		}

		const [{ compositionId }] = inserted

		const synthId = nanoid()
		const outputId = nanoid()

		await tx.insert(audioNodeTable).values([
			{
				compositionId,
				id: synthId,
				type: 'synth',
				label: 'Synth',
			},
			{
				compositionId,
				id: outputId,
				type: 'output',
				label: 'Output',
				centerX: 150,
				properties: { volume: -5 },
			},
		])

		await tx.insert(audioEdgeTable).values({
			compositionId,
			id: nanoid(),
			sourceId: synthId,
			targetId: outputId,
		})

		await tx.insert(musicLayerTable).values({
			compositionId,
			id: nanoid(),
			name: 'main',
		})

		return compositionId
	})

	if (compositionId === null) {
		// TODO: work out proper error handling
		throw new Error('failed to create composition')
	}

	redirect(`/projects/${compositionId}`)
}
