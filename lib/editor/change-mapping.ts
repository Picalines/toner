import { EdgeChange, NodeChange } from '@xyflow/react'
import {
	AudioEdge,
	AudioEdgeId,
	AudioNode,
	AudioNodeId,
} from '@/lib/schemas/audio-node'
import { EditorChange } from '@/lib/schemas/editor'
import {
	AudioFlowEdge,
	AudioFlowNode,
} from '@/components/editor/audio-node-flow'

export function nodeChangeToEditor(
	change: NodeChange<AudioFlowNode>,
	getNodeById: (id: AudioNodeId) => AudioNode | null,
): EditorChange | null {
	switch (change.type) {
		// NOTE: we don't handle 'add' because it's never called.
		// TODO: figure out why, i guess

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
	change: EdgeChange<AudioFlowEdge>,
	getEdgeById: (id: AudioEdgeId) => AudioEdge | null,
): EditorChange | null {
	switch (change.type) {
		// NOTE: 'add' is never called

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
