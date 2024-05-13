'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { notFound } from 'next/navigation'
import { z } from 'zod'
import { authenticateOrRedirect } from '@/lib/auth'
import {
	compositionTable,
	database,
	nodeConnectionTable,
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
}

type FetchedAudioTree = {
	nodes: Record<string, FetchedAudioNode>
	connections: [output: [string, number], input: [string, number]][]
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
					displayName: nodeTable.displayName,
					centerX: nodeTable.centerX,
					centerY: nodeTable.centerY,
					properties: nodeTable.properties,
					receiverId: nodeConnectionTable.receiverId,
					outputSocket: nodeConnectionTable.outputSocket,
					inputSocket: nodeConnectionTable.inputSocket,
				})
				.from(nodeTable)
				.leftJoin(
					nodeConnectionTable,
					and(
						eq(nodeConnectionTable.compositionId, compositionId),
						eq(nodeTable.id, nodeConnectionTable.senderId),
					),
				)
				.where(eq(nodeTable.compositionId, compositionId))

			return { nodeRows }
		},
		{ accessMode: 'read only' },
	)

	const nodes: FetchedAudioTree['nodes'] = {}
	const connections: FetchedAudioTree['connections'] = []

	for (const { id, ...nodeRow } of nodeRows) {
		if (!validateNodeProperties(nodeRow.properties)) {
			continue
		}

		if (!(id in nodes)) {
			const { type, displayName, centerX, centerY, properties } = nodeRow
			nodes[id] = { type, displayName, centerX, centerY, properties }
		}

		if (nodeRow.receiverId !== null) {
			const { receiverId, outputSocket, inputSocket } = nodeRow
			connections.push([
				[id, outputSocket!],
				[receiverId, inputSocket!],
			])
		}
	}

	return { nodes, connections }
}

const nodePropertiesSchema = z.record(z.string(), z.number())

function validateNodeProperties(
	properties: unknown,
): properties is Record<string, number> {
	return nodePropertiesSchema.safeParse(properties).success
}
