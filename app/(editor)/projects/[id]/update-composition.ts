'use server'

import { and, eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { RedirectType, redirect } from 'next/navigation'
import { authenticateOrRedirect } from '@/lib/auth'
import { compositionTable, database, nodeEdgeTable, nodeTable } from '@/lib/db'
import { assertUnreachable, zodIs } from '@/lib/utils'
import {
	CompositionChangeSummary,
	compositionSchemas,
} from '@/schemas/composition'

export async function updateComposition(
	changeSummary: CompositionChangeSummary,
) {
	if (!zodIs(compositionSchemas.changeSummary, changeSummary)) {
		// TODO: error response
		return
	}

	const {
		user: { id: accountId },
	} = await authenticateOrRedirect('/sign-in')

	const { replaceUri } = await database.transaction(async tx => {
		let hadChanges = false

		const {
			id: compositionId,
			name,
			description,
			nodes,
			edges,
		} = changeSummary

		const { length: compCount } = await tx
			.select({ id: compositionTable.id })
			.from(compositionTable)
			.where(
				and(
					eq(compositionTable.id, compositionId),
					eq(compositionTable.authorId, accountId),
				),
			)

		if (compCount != 1) {
			return { replaceUri: '/account' }
		}

		if (name || description) {
			hadChanges = true

			await tx
				.update(compositionTable)
				.set({ name, description })
				.where(eq(compositionTable.id, compositionId))

			revalidatePath('/account')
		}

		for (const [nodeId, nodeUpdate] of Object.entries(nodes)) {
			hadChanges = true

			switch (nodeUpdate.operation) {
				case 'create': {
					const {
						type,
						label,
						position: [centerX, centerY],
						properties,
					} = nodeUpdate
					await tx.insert(nodeTable).values({
						id: nodeId,
						compositionId,
						type,
						label,
						centerX,
						centerY,
						properties,
					})
					continue
				}

				case 'update': {
					const {
						label: displayName,
						position: [centerX, centerY] = [],
						properties,
					} = nodeUpdate

					await tx
						.update(nodeTable)
						.set({
							label: displayName,
							centerX,
							centerY,
							properties: properties
								? sql`properties || ${properties}::jsonb`
								: undefined,
						})
						.where(
							and(
								eq(nodeTable.compositionId, compositionId),
								eq(nodeTable.id, nodeId),
							),
						)
					continue
				}

				case 'remove': {
					await tx
						.delete(nodeTable)
						.where(
							and(
								eq(nodeTable.compositionId, compositionId),
								eq(nodeTable.id, nodeId),
							),
						)
					continue
				}

				default:
					assertUnreachable(nodeUpdate)
			}
		}

		for (const [edgeId, edgeUpdate] of Object.entries(edges)) {
			hadChanges = true

			switch (edgeUpdate.operation) {
				case 'create': {
					const {
						source: [sourceId, sourceSocket],
						target: [targetId, targetSocket],
					} = edgeUpdate
					await tx.insert(nodeEdgeTable).values({
						id: edgeId,
						compositionId,
						sourceId,
						sourceSocket,
						targetId,
						targetSocket,
					})
					continue
				}

				case 'remove': {
					await tx
						.delete(nodeEdgeTable)
						.where(
							and(
								eq(nodeEdgeTable.compositionId, compositionId),
								eq(nodeEdgeTable.id, edgeId),
							),
						)
					continue
				}

				default:
					assertUnreachable(edgeUpdate)
			}
		}

		if (hadChanges) {
			revalidatePath(`/projects/${compositionId}`)
		}

		return { replaceUri: null }
	})

	if (replaceUri !== null) {
		redirect(replaceUri, RedirectType.replace)
	}
}
