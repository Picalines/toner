'use server'

import { and, eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { RedirectType, redirect } from 'next/navigation'
import { authenticateOrRedirect } from '@/lib/auth'
import {
	audioEdgeTable,
	audioNodeTable,
	compositionTable,
	database,
	musicKeyTable,
	musicLayerTable,
} from '@/lib/db'
import { type EditorChangeSummary, editorSchemas } from '@/lib/schemas/editor'
import type { MusicLayerId } from '@/lib/schemas/music'
import { assertUnreachable, zodIs } from '@/lib/utils'

export async function updateComposition(changeSummary: EditorChangeSummary) {
	if (!zodIs(editorSchemas.changeSummary, changeSummary)) {
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
					await tx.insert(audioNodeTable).values({
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
						.update(audioNodeTable)
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
								eq(audioNodeTable.compositionId, compositionId),
								eq(audioNodeTable.id, nodeId),
							),
						)
					continue
				}

				case 'remove': {
					await tx
						.delete(audioNodeTable)
						.where(
							and(
								eq(audioNodeTable.compositionId, compositionId),
								eq(audioNodeTable.id, nodeId),
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
					await tx.insert(audioEdgeTable).values({
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
						.delete(audioEdgeTable)
						.where(
							and(
								eq(audioEdgeTable.compositionId, compositionId),
								eq(audioEdgeTable.id, edgeId),
							),
						)
					continue
				}

				default:
					assertUnreachable(edgeUpdate)
			}
		}

		const deletedLayers = new Set<MusicLayerId>()

		for (const [layerId, layerUpdate] of Object.entries(
			changeSummary.musicLayers,
		)) {
			hadChanges = true

			switch (layerUpdate.operation) {
				case 'create': {
					const { name } = layerUpdate
					await tx.insert(musicLayerTable).values({
						compositionId,
						id: layerId,
						name,
					})
					continue
				}

				case 'update': {
					const { name } = layerUpdate
					await tx
						.update(musicLayerTable)
						.set({ name })
						.where(
							and(
								eq(
									musicLayerTable.compositionId,
									compositionId,
								),
								eq(musicLayerTable.id, layerId),
							),
						)
					continue
				}

				case 'remove': {
					await tx
						.delete(musicLayerTable)
						.where(
							and(
								eq(
									musicLayerTable.compositionId,
									compositionId,
								),
								eq(musicLayerTable.id, layerId),
							),
						)
					deletedLayers.add(layerId)
					continue
				}

				default:
					assertUnreachable(layerUpdate)
			}
		}

		for (const [keyId, keyUpdate] of Object.entries(
			changeSummary.musicKeys,
		)) {
			switch (keyUpdate.operation) {
				case 'create': {
					const {
						layerId,
						instrumentId,
						note,
						time,
						duration,
						velocity,
					} = keyUpdate

					if (deletedLayers.has(layerId)) {
						continue
					}

					await tx.insert(musicKeyTable).values({
						compositionId,
						layerId,
						id: keyId,
						instrumentId,
						time,
						duration,
						velocity,
						note,
					})
					continue
				}

				case 'update': {
					const { instrumentId, note, time, duration, velocity } =
						keyUpdate
					await tx
						.update(musicKeyTable)
						.set({ instrumentId, note, time, duration, velocity })
						.where(
							and(
								eq(musicKeyTable.compositionId, compositionId),
								eq(musicKeyTable.id, keyId),
							),
						)
					continue
				}

				case 'remove': {
					await tx
						.delete(musicKeyTable)
						.where(
							and(
								eq(musicKeyTable.compositionId, compositionId),
								eq(musicKeyTable.id, keyId),
							),
						)
					continue
				}

				default:
					assertUnreachable(keyUpdate)
			}
		}

		if (hadChanges) {
			await tx
				.update(compositionTable)
				.set({ updatedAt: sql`now()` })
				.where(eq(compositionTable.id, compositionId))

			revalidatePath(`/projects/${compositionId}`)
		}

		return { replaceUri: null }
	})

	if (replaceUri !== null) {
		redirect(replaceUri, RedirectType.replace)
	}
}
