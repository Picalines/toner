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

type FetchedAudioNode = {
	type: string
	displayName: string | null
	centerX: number
	centerY: number
	properties: Record<string, number>
	outputConnections: {
		receiverId: number
		outputSocket: number
		inputSocket: number
	}[]
}

export async function fetchAudioNodes(
	compositionId: number,
): Promise<Record<number, FetchedAudioNode>> {
	const { nodeRows, propertyRows } = await database.transaction(
		async tx => {
			const nodeRows = await tx
				.select({
					id: nodeTable.id,
					type: nodeTable.type,
					displayName: nodeTable.displayName,
					centerX: nodeTable.centerX,
					centerY: nodeTable.centerY,
					receiverId: nodeConnectionTable.receiverId,
					outputSocket: nodeConnectionTable.outputSocket,
					inputSocket: nodeConnectionTable.inputSocket,
				})
				.from(nodeTable)
				.leftJoin(
					nodeConnectionTable,
					eq(nodeTable.id, nodeConnectionTable.senderId),
				)
				.where(eq(nodeTable.compositionId, compositionId))

			const propertyRows = await tx
				.select({
					nodeId: nodePropertyTable.nodeId,
					name: nodePropertyTable.name,
					value: nodePropertyTable.value,
				})
				.from(nodePropertyTable)
				.innerJoin(
					nodeTable,
					eq(nodeTable.id, nodePropertyTable.nodeId),
				)
				.where(eq(nodeTable.compositionId, compositionId))

			return { nodeRows, propertyRows }
		},
		{ accessMode: 'read only' },
	)

	const properties = propertyRows.reduce(
		(props, { nodeId, name, value }) => {
			;(props[nodeId] ??= {})[name] = value
			return props
		},
		{} as Record<number, Record<string, number>>,
	)

	return nodeRows.reduce(
		(nodes, { id, ...nodeRow }) => {
			if (!(id in nodes)) {
				const { type, displayName, centerX, centerY } = nodeRow
				nodes[id] = {
					type,
					displayName,
					centerX,
					centerY,
					properties: properties[id] ?? [],
					outputConnections: [],
				}
			}

			if (nodeRow.receiverId !== null) {
				const { receiverId, outputSocket, inputSocket } = nodeRow
				nodes[id].outputConnections.push({
					receiverId,
					outputSocket: outputSocket!,
					inputSocket: inputSocket!,
				})
			}

			return nodes
		},
		{} as Record<number, FetchedAudioNode>,
	)
}
