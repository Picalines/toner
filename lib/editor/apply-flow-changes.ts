import type { Connection, EdgeChange, NodeChange } from '@xyflow/react'
import { audioNodeDefinitions, audioNodeSchemas } from '../schemas/audio-node'
import { MAX_MUSIC_NOTE } from '../schemas/music'
import type { CompositionStoreApi } from '../stores/composition-store'
import type { EditorStoreApi } from '../stores/editor-store'
import { safeParseOr, step } from '../utils'

export function applyFlowNodeChanges(
	compositionStore: CompositionStoreApi,
	editorStore: EditorStoreApi,
	changes: NodeChange[],
) {
	const {
		getAudioNodeById,
		getMusicKeyById,
		moveAudioNode,
		moveMusicKey,
		removeAudioNode,
		removeMusicKey,
	} = compositionStore.getState()

	const {
		timelineNoteWidth,
		noteLineHeight,
		playbackInstrumentId,
		timeStep,
		applyChange,
		selectAudioNodes,
		selectMusicKeys,
		selectInstrument,
	} = editorStore.getState()

	for (const change of changes) {
		switch (change.type) {
			case 'position': {
				const { id: itemId, position } = change
				if (!position) {
					break
				}

				const { x, y } = position
				if (moveAudioNode(itemId, [x, y])) {
					applyChange({
						type: 'node-update',
						id: itemId,
						position: [x, y],
					})
				}

				if (getMusicKeyById(itemId)) {
					const semiquaverWidth = timelineNoteWidth / 16

					const time = step(Math.floor(x / semiquaverWidth), timeStep)
					const note = MAX_MUSIC_NOTE - Math.floor(y / noteLineHeight)

					if (moveMusicKey(itemId, time, note)) {
						applyChange({
							type: 'music-key-update',
							id: itemId,
							time,
							note,
						})
					}
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
