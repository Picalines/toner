import { Connection, EdgeChange, NodeChange } from '@xyflow/react'
import { CompositionStoreApi } from '@/stores/composition-store'
import { EditorStoreApi } from '@/stores/editor-store'
import { audioNodeDefinitions, audioNodeSchemas } from '../schemas/audio-node'
import { safeParseOr } from '../utils'

export function applyFlowNodeChanges(
	compositionStore: CompositionStoreApi,
	editorStore: EditorStoreApi,
	changes: NodeChange[],
) {
	const {
		getAudioNodeById,
		getMusicKeyById,
		moveAudioNode,
		removeAudioNode,
		removeMusicKey,
	} = compositionStore.getState()

	const {
		applyChange,
		selectAudioNodes,
		selectMusicKeys,
		selectInstrument,
		playbackInstrumentId,
	} = editorStore.getState()

	for (const change of changes) {
		switch (change.type) {
			case 'position': {
				const { id: nodeId, position } = change
				if (!position) {
					break
				}

				const { x, y } = position
				if (moveAudioNode(nodeId, [x, y])) {
					applyChange({
						type: 'node-update',
						id: nodeId,
						position: [x, y],
					})
				}
				break
			}

			case 'remove': {
				const { id: itemId } = change

				if (removeAudioNode(itemId)) {
					selectAudioNodes('remove', [itemId])
					applyChange({ type: 'node-remove', id: itemId })
					if (itemId === playbackInstrumentId) {
						selectInstrument(null)
					}
				}

				if (removeMusicKey(itemId)) {
					selectMusicKeys('remove', [itemId])
					applyChange({ type: 'music-key-remove', id: itemId })
				}

				break
			}

			case 'select': {
				const { id: itemId, selected } = change
				const { type: audioNodeType } = getAudioNodeById(itemId) ?? {}

				if (audioNodeType) {
					selectAudioNodes(selected ? 'add' : 'remove', [itemId])
					if (
						selected &&
						audioNodeDefinitions[audioNodeType].group ==
							'instrument'
					) {
						selectInstrument(itemId)
					}
				}

				if (getMusicKeyById(itemId)) {
					selectMusicKeys(selected ? 'add' : 'remove', [itemId])
				}
				break
			}
		}
	}
}

export function applyFlowEdgeChanges(
	compositionStore: CompositionStoreApi,
	editorStore: EditorStoreApi,
	changes: EdgeChange[],
) {
	const { getAudioEdgeById, removeAudioEdge } = compositionStore.getState()
	const { applyChange, selectAudioEdges: selectEdges } =
		editorStore.getState()

	for (const change of changes) {
		switch (change.type) {
			case 'remove': {
				const { id: edgeId } = change
				selectEdges('remove', [edgeId])
				if (removeAudioEdge(edgeId)) {
					applyChange({ type: 'edge-remove', id: edgeId })
				}
				break
			}

			case 'select': {
				const { id: edgeId, selected } = change
				if (getAudioEdgeById(edgeId)) {
					selectEdges(selected ? 'add' : 'remove', [edgeId])
				}
				break
			}
		}
	}
}

export function connectFlowNodes(
	compositionStore: CompositionStoreApi,
	editorStore: EditorStoreApi,
	connection: Connection,
) {
	const { connectAudioNodes } = compositionStore.getState()
	const { applyChange } = editorStore.getState()

	const { source, sourceHandle, target, targetHandle } = connection

	const sourceSocket = safeParseOr(
		audioNodeSchemas.socketId,
		parseInt(sourceHandle ?? '-1'),
		null,
	)
	const targetSocket = safeParseOr(
		audioNodeSchemas.socketId,
		parseInt(targetHandle ?? '-1'),
		null,
	)

	if (sourceSocket === null || targetSocket === null) {
		return
	}

	const newEdge = connectAudioNodes(
		[source, sourceSocket],
		[target, targetSocket],
	)

	if (!newEdge) {
		return
	}

	applyChange({
		type: 'edge-add',
		id: newEdge.id,
		source: [source, sourceSocket],
		target: [target, targetSocket],
	})
}
