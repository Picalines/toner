import { EdgeChange, NodeChange } from '@xyflow/react'
import { AudioEdgeId, AudioNodeId } from '@/schemas/audio-node'
import { EditorChange } from '@/schemas/editor'
import { AudioEdge, AudioNode } from '@/stores/composition-store'

export function nodeChangeToEditor(
	change: NodeChange<AudioNode>,
	getNodeById: (id: AudioNodeId) => AudioNode | null,
): EditorChange | null {
	switch (change.type) {
		case 'add': {
			const node = change.item
			if (node.type != 'audio' || getNodeById(node.id) !== null) {
				break
			}

			return {
				type: 'node-add',
				id: node.id,
				label: node.data.label,
				nodeType: node.data.type,
				position: [node.position.x, node.position.y],
				properties: { ...node.data.properties },
			}
		}

		case 'remove': {
			if (!getNodeById(change.id)) {
				break
			}

			return {
				type: 'node-remove',
				id: change.id,
			}
		}

		case 'position': {
			if (!change.position || change.dragging) {
				break
			}

			const { x, y } = change.position
			return {
				type: 'node-update',
				id: change.id,
				position: [x, y],
			}
		}
	}

	return null
}

export function edgeChangeToEditor(
	change: EdgeChange<AudioEdge>,
	getNodeById: (id: AudioNodeId) => AudioNode | null,
	getEdgeById: (id: AudioEdgeId) => AudioEdge | null,
): EditorChange | null {
	switch (change.type) {
		case 'add': {
			const {
				item: { id, source, target, sourceHandle, targetHandle },
			} = change

			if (
				getEdgeById(id) ||
				!getNodeById(source) ||
				!getNodeById(target)
			) {
				break
			}

			return {
				type: 'edge-add',
				id,
				source: [source, parseInt(sourceHandle ?? '0')],
				target: [target, parseInt(targetHandle ?? '0')],
			}
		}

		case 'remove': {
			const { id } = change

			if (!getEdgeById(id)) {
				break
			}

			return { type: 'edge-remove', id }
		}
	}

	return null
}
