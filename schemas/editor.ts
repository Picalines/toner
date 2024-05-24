import { z } from 'zod'
import { assertUnreachable } from '@/lib/utils'
import { audioNodeSchemas } from './audio-node'
import { compositionSchemas as composition } from './composition'
import { musicSchemas } from './music'

type AnyEditorChange = z.infer<(typeof editorSchemas)['change']>

export type EditorChangeType = AnyEditorChange['type']

export type EditorChange<T extends EditorChangeType = EditorChangeType> =
	AnyEditorChange & { type: T }

export type EditorChangeSummary = z.infer<
	(typeof editorSchemas)['changeSummary']
>

const { key: keySchemas, layer: layerSchemas } = musicSchemas

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
			id: layerSchemas.id,
			name: layerSchemas.name,
		}),

		z.object({
			type: z.literal('music-layer-update'),
			id: layerSchemas.id,
			name: layerSchemas.name.optional(),
		}),

		z.object({
			type: z.literal('music-layer-remove'),
			id: layerSchemas.id,
		}),

		z.object({
			type: z.literal('music-key-add'),
			id: keySchemas.id,
			layerId: layerSchemas.id,
			instrumentId: nodeId,
			note: musicSchemas.note,
			time: keySchemas.time,
			duration: keySchemas.duration,
			velocity: keySchemas.velocity,
		}),

		z.object({
			type: z.literal('music-key-update'),
			id: keySchemas.id,
			instrumentId: nodeId.optional(),
			note: musicSchemas.note.optional(),
			time: keySchemas.time.optional(),
			duration: keySchemas.duration.optional(),
			velocity: keySchemas.velocity.optional(),
		}),

		z.object({
			type: z.literal('music-key-remove'),
			id: keySchemas.id,
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
			musicSchemas.layer.id,
			z.discriminatedUnion('operation', [
				z.object({
					operation: z.literal('create'),
					name: musicSchemas.layer.name,
				}),

				z.object({
					operation: z.literal('update'),
					name: musicSchemas.layer.name.optional(),
				}),

				z.object({ operation: z.literal('remove') }),
			]),
		),

		musicKeys: z.record(
			musicSchemas.key.id,
			z.discriminatedUnion('operation', [
				z.object({
					operation: z.literal('create'),
					layerId: layerSchemas.id,
					instrumentId: nodeId,
					note: musicSchemas.note,
					time: keySchemas.time,
					duration: keySchemas.duration,
					velocity: keySchemas.velocity,
				}),

				z.object({
					operation: z.literal('update'),
					instrumentId: nodeId.optional(),
					note: musicSchemas.note.optional(),
					time: keySchemas.time.optional(),
					duration: keySchemas.duration.optional(),
					velocity: keySchemas.velocity.optional(),
				}),

				z.object({ operation: z.literal('remove') }),
			]),
		),
	}),
}

export function applyEditorChangeToSummary(
	summary: EditorChangeSummary,
	change: EditorChange,
) {
	switch (change.type) {
		case 'save-changes':
			return

		case 'update': {
			summary.name = change.name ?? summary.name
			summary.description = change.description ?? summary.description
			return
		}

		case 'node-add': {
			summary.nodes[change.id] = {
				operation: 'create',
				type: change.nodeType,
				label: change.label,
				position: change.position,
				properties: change.properties,
			}
			return
		}

		case 'node-remove': {
			summary.nodes[change.id] = { operation: 'remove' }
			return
		}

		case 'node-update': {
			let operation = summary.nodes[change.id]
			if (!operation || operation.operation == 'remove') {
				operation = summary.nodes[change.id] = { operation: 'update' }
			}

			operation.label = change.label ?? operation.label
			operation.position = change.position ?? operation.position
			operation.properties = Object.assign(
				operation.properties ?? {},
				change.properties,
			)
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

		case 'music-layer-add': {
			summary.musicLayers[change.id] = {
				operation: 'create',
				name: change.name,
			}
			return
		}

		case 'music-layer-update': {
			let operation = summary.musicLayers[change.id]
			if (!operation || operation.operation == 'remove') {
				operation = summary.musicLayers[change.id] = {
					operation: 'update',
				}
			}

			operation.name = change.name ?? operation.name
			return
		}

		case 'music-layer-remove': {
			summary.musicLayers[change.id] = { operation: 'remove' }
			return
		}

		case 'music-key-add': {
			summary.musicKeys[change.id] = {
				operation: 'create',
				layerId: change.layerId,
				instrumentId: change.instrumentId,
				note: change.note,
				time: change.time,
				duration: change.duration,
				velocity: change.velocity,
			}
			return
		}

		case 'music-key-update': {
			let operation = summary.musicKeys[change.id]
			if (!operation || operation.operation == 'remove') {
				operation = summary.musicKeys[change.id] = {
					operation: 'update',
				}
			}

			operation.instrumentId =
				change.instrumentId ?? operation.instrumentId
			operation.note = change.note ?? operation.note
			operation.time = change.time ?? operation.time
			operation.duration = change.duration ?? operation.duration
			operation.velocity = change.velocity ?? operation.velocity
			return
		}

		case 'music-key-remove': {
			summary.musicKeys[change.id] = { operation: 'remove' }
			return
		}

		default:
			assertUnreachable(change)
	}
}
