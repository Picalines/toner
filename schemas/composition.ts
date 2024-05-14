import { z } from 'zod'
import { audioNodeSchemas } from './nodes'

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

const compositionName = z.string().trim().min(1)

const compositionDescription = z.string().trim()

export const compositionSchemas = {
	id: z.number().int(),
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
}

export type CompositionId = z.infer<(typeof compositionSchemas)['id']>

export type CompositionChange = z.infer<(typeof compositionSchemas)['change']>
