'use server'

import { and, eq, sql } from 'drizzle-orm'
import { RedirectType, redirect } from 'next/navigation'
import { authenticateOrRedirect } from '@/lib/auth'
import {
	compositionTable,
	database,
	nodeConnectionTable,
	nodeTable,
} from '@/lib/db'
import { assertUnreachable } from '@/lib/utils'
import { CompositionUpdateRequest, compositionUpdateSchema } from './schemas'

export async function updateComposition(
	updateRequest: CompositionUpdateRequest,
) {
	if (!compositionUpdateSchema.safeParse(updateRequest).success) {
		// TODO: error response
		return
	}

	const {
		user: { id: accountId },
	} = await authenticateOrRedirect('/sign-in')

	const { replaceUri } = await database.transaction(async tx => {
		const {
			id: compositionId,
			name,
			description,
			nodes,
			edges,
		} = updateRequest

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
			await tx
				.update(compositionTable)
				.set({ name, description })
				.where(eq(compositionTable.id, compositionId))
		}

		for (const [nodeId, nodeUpdate] of Object.entries(nodes)) {
			switch (nodeUpdate.operation) {
				case 'create': {
					const {
						type,
						label: displayName,
						position: [centerX, centerY],
						properties,
					} = nodeUpdate
					await tx.insert(nodeTable).values({
						id: nodeId,
						compositionId,
						type,
						displayName,
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
							displayName,
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
			switch (edgeUpdate.operation) {
				case 'create': {
					const {
						source: [senderId, outputSocket],
						target: [receiverId, inputSocket],
					} = edgeUpdate
					await tx.insert(nodeConnectionTable).values({
						id: edgeId,
						compositionId,
						senderId,
						outputSocket,
						receiverId,
						inputSocket,
					})
					continue
				}

				case 'remove': {
					await tx
						.delete(nodeConnectionTable)
						.where(
							and(
								eq(
									nodeConnectionTable.compositionId,
									compositionId,
								),
								eq(nodeConnectionTable.id, edgeId),
							),
						)
					continue
				}

				default:
					assertUnreachable(edgeUpdate)
			}
		}

		return { replaceUri: null }
	})

	if (replaceUri !== null) {
		redirect(replaceUri, RedirectType.replace)
	}
}
