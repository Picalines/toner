import { z } from 'zod'
import { audioNodeSchemas } from './audio-node'
import { compositionSchemas as composition } from './composition'
import { musicSchemas } from './music'

type AnyEditorChange = z.infer<(typeof editorSchemas)['change']>

export type EditorChangeType = AnyEditorChange['type']

export type EditorChange<T extends EditorChangeType = EditorChangeType> =
	T extends EditorChangeType ? AnyEditorChange & { type: T } : never

export type EditorChangeSummary = z.infer<
	(typeof editorSchemas)['changeSummary']
>

const { layerId, layerName, keyId, keyTime, keyDuration, keyVelocity } =
	musicSchemas

const {
	type: nodeType,
	nodeId,
	edgeId,
	socketId,
	label: nodeLabel,
	position: nodePosition,
	properties: nodeProperties,
} = audioNodeSchemas

export const MAX_HISTORY_LENGTH = 100

export const editorSchemas = {
	change: z.discriminatedUnion('type', [
		z.object({ type: z.literal('save-changes') }).strict(),

		z.object({
			type: z.literal('update'),
			name: composition.name.optional(),
			description: composition.description.optional(),
		}),

		z.object({
			type: z.literal('node-add'),
			id: nodeId,
			position: nodePosition,
			nodeType,
			label: nodeLabel,
			properties: nodeProperties,
		}),

		z.object({
			type: z.literal('node-remove'),
			id: nodeId,
		}),

		z.object({
			type: z.literal('node-update'),
			id: nodeId,
			label: nodeLabel.optional(),
			position: nodePosition.optional(),
			properties: z.optional(nodeProperties),
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

		z.object({
			type: z.literal('music-layer-add'),
			id: layerId,
			name: layerName,
		}),

		z.object({
			type: z.literal('music-layer-update'),
			id: layerId,
			name: layerName.optional(),
		}),

		z.object({
			type: z.literal('music-layer-remove'),
			id: layerId,
		}),

		z.object({
			type: z.literal('music-key-add'),
			id: keyId,
			layerId: layerId,
			instrumentId: nodeId,
			note: musicSchemas.note,
			time: keyTime,
			duration: keyDuration,
			velocity: keyVelocity,
		}),

		z.object({
			type: z.literal('music-key-update'),
			id: keyId,
			instrumentId: nodeId.optional(),
			note: musicSchemas.note.optional(),
			time: keyTime.optional(),
			duration: keyDuration.optional(),
			velocity: keyVelocity.optional(),
		}),

		z.object({
			type: z.literal('music-key-remove'),
			id: keyId,
		}),
	]),

	changeSummary: z.object({
		id: composition.id,

		name: z.optional(composition.name),
		description: z.optional(composition.description),

		nodes: z.record(
			audioNodeSchemas.nodeId,
			z.discriminatedUnion('operation', [
				z.object({
					operation: z.literal('create'),
					type: audioNodeSchemas.type,
					label: audioNodeSchemas.label,
					position: audioNodeSchemas.position,
					properties: audioNodeSchemas.properties,
				}),

				z.object({
					operation: z.literal('update'),
					label: audioNodeSchemas.label.optional(),
					position: audioNodeSchemas.position.optional(),
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

		musicLayers: z.record(
			layerId,
			z.discriminatedUnion('operation', [
				z.object({
					operation: z.literal('create'),
					name: layerName,
				}),

				z.object({
					operation: z.literal('update'),
					name: layerName.optional(),
				}),

				z.object({ operation: z.literal('remove') }),
			]),
		),

		musicKeys: z.record(
			keyId,
			z.discriminatedUnion('operation', [
				z.object({
					operation: z.literal('create'),
					layerId: layerId,
					instrumentId: nodeId,
					note: musicSchemas.note,
					time: keyTime,
					duration: keyDuration,
					velocity: keyVelocity,
				}),

				z.object({
					operation: z.literal('update'),
					instrumentId: nodeId.optional(),
					note: musicSchemas.note.optional(),
					time: keyTime.optional(),
					duration: keyDuration.optional(),
					velocity: keyVelocity.optional(),
				}),

				z.object({ operation: z.literal('remove') }),
			]),
		),
	}),
}
