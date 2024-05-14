'use server'

import { and, eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { authenticateOrRedirect } from '@/lib/auth'
import { compositionTable, database, nodeEdgeTable, nodeTable } from '@/lib/db'
import { zodIs } from '@/lib/utils'
import { AudioNodeId, audioNodeSchemas } from '@/schemas/nodes'

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

type FetchedAudioNode = {
	type: string
	label: string | null
	centerX: number
	centerY: number
	properties: Record<string, number>
}

type FetchedAudioTree = {
	nodes: Record<string, FetchedAudioNode>
	edges: {
		id: string
		source: [AudioNodeId, number]
		target: [AudioNodeId, number]
	}[]
}

export async function fetchAudioTree(
	compositionId: number,
): Promise<FetchedAudioTree> {
	const { nodeRows } = await database.transaction(
		async tx => {
			const nodeRows = await tx
				.select({
					id: nodeTable.id,
					type: nodeTable.type,
					label: nodeTable.label,
					centerX: nodeTable.centerX,
					centerY: nodeTable.centerY,
					properties: nodeTable.properties,
					edgeId: nodeEdgeTable.id,
					targetId: nodeEdgeTable.targetId,
					sourceSocket: nodeEdgeTable.sourceSocket,
					targetSocket: nodeEdgeTable.targetSocket,
				})
				.from(nodeTable)
				.leftJoin(
					nodeEdgeTable,
					and(
						eq(nodeEdgeTable.compositionId, compositionId),
						eq(nodeTable.id, nodeEdgeTable.sourceId),
					),
				)
				.where(eq(nodeTable.compositionId, compositionId))

			return { nodeRows }
		},
		{ accessMode: 'read only' },
	)

	const nodes: FetchedAudioTree['nodes'] = {}
	const edges: FetchedAudioTree['edges'] = []

	for (const { id, ...nodeRow } of nodeRows) {
		const { properties } = nodeRow
		if (!zodIs(audioNodeSchemas.properties, properties)) {
			continue
		}

		if (!(id in nodes)) {
			const { type, label, centerX, centerY } = nodeRow
			nodes[id] = { type, label, centerX, centerY, properties }
		}

		if (nodeRow.targetId !== null) {
			const { edgeId, targetId, sourceSocket, targetSocket } = nodeRow
			edges.push({
				id: edgeId!,
				source: [id, sourceSocket!],
				target: [targetId, targetSocket!],
			})
		}
	}

	return { nodes, edges }
}
