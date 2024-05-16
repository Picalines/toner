import { z } from 'zod'
import { assertUnreachable } from '@/lib/utils'
import { audioNodeSchemas } from './audio-node'

export type CompositionId = z.infer<(typeof compositionSchemas)['id']>

type AnyCompositionChange = z.infer<(typeof compositionSchemas)['change']>

export type CompositionChangeType = AnyCompositionChange['type']

export type CompositionChange<
	T extends CompositionChangeType = CompositionChangeType,
> = AnyCompositionChange & { type: T }

export type CompositionChangeSummary = z.infer<
	(typeof compositionSchemas)['changeSummary']
>

const {
	type: nodeType,
	nodeId,
	edgeId,
	socketId,
	label: nodeLabel,
	position,
	property,
	properties,
} = audioNodeSchemas

const compositionId = z.number().int()

const compositionName = z.string().trim().min(1)

const compositionDescription = z.string().trim()

export const compositionSchemas = {
	id: compositionId,
	name: compositionName,
	description: compositionDescription,

	change: z.discriminatedUnion('type', [
		z.object({ type: z.literal('save-changes') }).strict(),

		z.object({ type: z.literal('set-name'), name: compositionName }),

		z.object({
			type: z.literal('set-description'),
			description: compositionDescription,
		}),

		z.object({
			type: z.literal('node-add'),
			id: nodeId,
			position,
			nodeType,
			label: z.string(),
			properties,
		}),

		z.object({
			type: z.literal('node-remove'),
			id: nodeId,
		}),

		z.object({
			type: z.literal('node-rename'),
			id: nodeId,
			label: nodeLabel,
		}),

		z.object({
			type: z.literal('node-move'),
			id: nodeId,
			position,
		}),

		z.object({
			type: z.literal('node-set-property'),
			id: nodeId,
			property,
			value: z.number(),
		}),

		z.object({
			type: z.literal('edge-add'),
			id: edgeId,
			source: z.tuple([nodeId, socketId]),
			target: z.tuple([nodeId, socketId]),
		}),

		z.object({
			type: z.literal('edge-remove'),
			id: edgeId,
		}),
	]),

	changeSummary: z.object({
		id: compositionId,

		name: z.optional(compositionName),
		description: z.optional(compositionDescription),

		nodes: z.record(
			audioNodeSchemas.nodeId,
			z.discriminatedUnion('operation', [
				z.object({
					operation: z.literal('create'),
					type: audioNodeSchemas.type,
					label: audioNodeSchemas.label,
					position: z.tuple([z.number(), z.number()]),
					properties: audioNodeSchemas.properties,
				}),

				z.object({
					operation: z.literal('update'),
					label: audioNodeSchemas.label.optional(),
					position: z.tuple([z.number(), z.number()]).optional(),
					properties: audioNodeSchemas.properties.optional(),
				}),

				z.object({ operation: z.literal('remove') }),
			]),
		),

		edges: z.record(
			audioNodeSchemas.edgeId,
			z.discriminatedUnion('operation', [
				z.object({
					operation: z.literal('create'),
					source: z.tuple([
						audioNodeSchemas.nodeId,
						audioNodeSchemas.socketId,
					]),
					target: z.tuple([
						audioNodeSchemas.nodeId,
						audioNodeSchemas.socketId,
					]),
				}),

				z.object({ operation: z.literal('remove') }),
			]),
		),
	}),
}

export function applyCompositionChangeToSummary(
	summary: CompositionChangeSummary,
	change: CompositionChange,
) {
	switch (change.type) {
		case 'save-changes':
			return

		case 'set-name':
			summary.name = change.name
			return

		case 'set-description':
			summary.description = change.description
			return

		case 'node-add':
			summary.nodes[change.id] = {
				operation: 'create',
				type: change.nodeType,
				label: change.label,
				position: change.position,
				properties: change.properties,
			}
			return

		case 'node-remove':
			summary.nodes[change.id] = { operation: 'remove' }
			return

		case 'node-rename': {
			const prevOperation = summary.nodes[change.id]
			if (prevOperation && prevOperation.operation != 'remove') {
				prevOperation.label = change.label
			} else {
				summary.nodes[change.id] = {
					operation: 'update',
					label: change.label,
				}
			}
			return
		}

		case 'node-move': {
			const prevOperation = summary.nodes[change.id]
			if (prevOperation && prevOperation.operation != 'remove') {
				prevOperation.position = change.position
			} else {
				summary.nodes[change.id] = {
					operation: 'update',
					position: change.position,
				}
			}
			return
		}

		case 'node-set-property': {
			const prevOperation = summary.nodes[change.id]
			if (prevOperation && prevOperation.operation != 'remove') {
				prevOperation.properties = {
					...prevOperation.properties,
					[change.property]: change.value,
				}
			} else {
				summary.nodes[change.id] = {
					operation: 'update',
					properties: { [change.property]: change.value },
				}
			}
			return
		}

		case 'edge-add': {
			summary.edges[change.id] = {
				operation: 'create',
				source: change.source,
				target: change.target,
			}
			return
		}

		case 'edge-remove': {
			summary.edges[change.id] = { operation: 'remove' }
			return
		}

		default:
			assertUnreachable(change)
	}
}
