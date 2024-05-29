import { EditorChange, EditorChangeSummary } from '../schemas/editor'
import { assertUnreachable } from '../utils'

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
