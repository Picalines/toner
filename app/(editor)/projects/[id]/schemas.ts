import { z } from 'zod'
import { assertUnreachable } from '@/lib/utils'
import { audioNodeSchemas } from '@/schemas/audio-node'
import { CompositionChange, compositionSchemas } from '@/schemas/composition'

export const compositionUpdateSchema = z.object({
	id: compositionSchemas.id,

	name: z.optional(compositionSchemas.name),
	description: z.optional(compositionSchemas.description),

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
})

export type CompositionUpdateRequest = z.infer<typeof compositionUpdateSchema>

export function mergeCompositionChangeToRequest(
	request: CompositionUpdateRequest,
	change: CompositionChange,
) {
	switch (change.type) {
		case 'save-changes':
			return

		case 'set-name':
			request.name = change.name
			return

		case 'set-description':
			request.description = change.description
			return

		case 'node-add':
			request.nodes[change.id] = {
				operation: 'create',
				type: change.nodeType,
				label: change.label,
				position: change.position,
				properties: change.properties,
			}
			return

		case 'node-remove':
			request.nodes[change.id] = { operation: 'remove' }
			return

		case 'node-rename': {
			const prevOperation = request.nodes[change.id]
			if (prevOperation && prevOperation.operation != 'remove') {
				prevOperation.label = change.label
			} else {
				request.nodes[change.id] = {
					operation: 'update',
					label: change.label,
				}
			}
			return
		}

		case 'node-move': {
			const prevOperation = request.nodes[change.id]
			if (prevOperation && prevOperation.operation != 'remove') {
				prevOperation.position = change.position
			} else {
				request.nodes[change.id] = {
					operation: 'update',
					position: change.position,
				}
			}
			return
		}

		case 'node-set-property': {
			const prevOperation = request.nodes[change.id]
			if (prevOperation && prevOperation.operation != 'remove') {
				prevOperation.properties = {
					...prevOperation.properties,
					[change.property]: change.value,
				}
			} else {
				request.nodes[change.id] = {
					operation: 'update',
					properties: { [change.property]: change.value },
				}
			}
			return
		}

		case 'edge-add': {
			request.edges[change.id] = {
				operation: 'create',
				source: change.source,
				target: change.target,
			}
			return
		}

		case 'edge-remove': {
			request.edges[change.id] = { operation: 'remove' }
			return
		}

		default:
			assertUnreachable(change)
	}
}
