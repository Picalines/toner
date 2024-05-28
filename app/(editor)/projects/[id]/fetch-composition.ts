'use server'

import { and, eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import {
	compositionTable,
	database,
	audioEdgeTable as edgeEdgeTable,
	musicKeyTable,
	musicLayerTable,
	audioNodeTable as nodeTable,
} from '@/lib/db'
import { AudioNodeId, audioNodeSchemas } from '@/lib/schemas/audio-node'
import { MusicLayerId } from '@/lib/schemas/music'
import { zodIs } from '@/lib/utils'

type FetchedAudioNode = {
	type: string
	label: string | null
	centerX: number
	centerY: number
	properties: Record<string, number>
}

type FetchedAudioEdge = {
	source: [AudioNodeId, number]
	target: [AudioNodeId, number]
}

type FetchedMusicLayer = {
	name: string
}

type FetchedMusicKey = {
	layerId: MusicLayerId
	instrumentId: AudioNodeId
	time: number
	note: number
	duration: number
	velocity: number
}

type FetchedComposition = {
	name: string
	description: string
	audioNodes: Record<string, FetchedAudioNode>
	audioEdges: Record<string, FetchedAudioEdge>
	musicLayers: Record<string, FetchedMusicLayer>
	musicKeys: Record<string, FetchedMusicKey>
}

export async function fetchComposition(
	compositionId: number,
): Promise<FetchedComposition> {
	const transactionResult = await database.transaction(
		async tx => {
			const compositionQuery = await database
				.select({
					id: compositionTable.id,
					name: compositionTable.name,
					description: compositionTable.description,
				})
				.from(compositionTable)
				.limit(1)
				.where(and(eq(compositionTable.id, compositionId)))

			if (compositionQuery.length != 1) {
				return { error: 'notFound' } as const
			}

			const audioNodeRows = await tx
				.select({
					id: nodeTable.id,
					type: nodeTable.type,
					label: nodeTable.label,
					centerX: nodeTable.centerX,
					centerY: nodeTable.centerY,
					properties: nodeTable.properties,
					edgeId: edgeEdgeTable.id,
					targetId: edgeEdgeTable.targetId,
					sourceSocket: edgeEdgeTable.sourceSocket,
					targetSocket: edgeEdgeTable.targetSocket,
				})
				.from(nodeTable)
				.leftJoin(
					edgeEdgeTable,
					and(
						eq(edgeEdgeTable.compositionId, compositionId),
						eq(nodeTable.id, edgeEdgeTable.sourceId),
					),
				)
				.where(eq(nodeTable.compositionId, compositionId))

			const musicLayerRows = await tx
				.select({
					id: musicLayerTable.id,
					name: musicLayerTable.name,
				})
				.from(musicLayerTable)
				.where(eq(musicLayerTable.compositionId, compositionId))

			const musicKeyRows = await tx
				.select({
					id: musicKeyTable.id,
					layerId: musicKeyTable.layerId,
					instrumentId: musicKeyTable.instrumentId,
					time: musicKeyTable.time,
					note: musicKeyTable.note,
					duration: musicKeyTable.duration,
					velocity: musicKeyTable.velocity,
				})
				.from(musicKeyTable)
				.where(eq(musicKeyTable.compositionId, compositionId))

			const [{ name, description }] = compositionQuery

			return {
				name,
				description,
				audioNodeRows,
				musicLayerRows,
				musicKeyRows,
			}
		},
		{ accessMode: 'read only' },
	)

	if (transactionResult.error == 'notFound') {
		notFound()
	}

	const { name, description, audioNodeRows, musicLayerRows, musicKeyRows } =
		transactionResult

	const audioNodes: FetchedComposition['audioNodes'] = {}
	const audioEdges: FetchedComposition['audioEdges'] = {}
	const musicKeys: FetchedComposition['musicKeys'] = {}
	const musicLayers: FetchedComposition['musicLayers'] = {}

	for (const { id, ...audioNodeRow } of audioNodeRows) {
		if (!(id in audioNodes)) {
			const { properties } = audioNodeRow
			if (!zodIs(audioNodeSchemas.properties, properties)) {
				continue
			}
			audioNodes[id] = { ...audioNodeRow, properties }
		}

		if (audioNodeRow.targetId !== null) {
			const { edgeId, targetId, sourceSocket, targetSocket } =
				audioNodeRow

			audioEdges[edgeId!] = {
				source: [id, sourceSocket!],
				target: [targetId, targetSocket!],
			}
		}
	}

	for (const { id, ...musicLayerRow } of musicLayerRows) {
		musicLayers[id] = musicLayerRow
	}

	for (const { id, ...musicKeyRow } of musicKeyRows) {
		musicKeys[id] = musicKeyRow
	}

	return { name, description, audioNodes, audioEdges, musicKeys, musicLayers }
}
