'use client'

import { useEffect, useRef } from 'react'
import { AudioEdgeId, AudioNodeId } from '@/lib/schemas/audio-node'
import { createToneNode, setToneNodeProperty } from '@/lib/tone'
import { useCompositionStoreApi } from '../providers/composition-store-provider'
import { useEditorStoreApi } from '../providers/editor-store-provider'
import { useToneStoreApi } from '../providers/tone-store-provider'

// TODO: separate this thing in to parts:
//  - one that creates initial nodes from compositionStore
//  - second one that applies changes coming from editorStore

export function useToneEditorWatcher() {
	const compositionStore = useCompositionStoreApi()
	const editorStore = useEditorStoreApi()
	const toneStore = useToneStoreApi()

	const edges =
		useRef<
			Map<
				AudioEdgeId,
				{ source: [AudioNodeId, number]; target: [AudioNodeId, number] }
			>
		>()

	edges.current ??= new Map()

	useEffect(() => {
		const editorUnsubscribe = editorStore.subscribe(
			editor => editor.changeHistory,
			changeHistory => {
				const { getAudioNodeById } = compositionStore.getState()
				const {
					getToneNodeById: getToneNodeById,
					addNode: addToneNode,
					connect,
					disconnect,
					disposeNode,
				} = toneStore.getState()

				const change = changeHistory[changeHistory.length - 1]

				switch (change?.type) {
					case 'node-add': {
						const toneNode = createToneNode(
							change.nodeType,
							change.properties,
						)
						addToneNode(change.id, toneNode)
						break
					}

					case 'node-remove': {
						disposeNode(change.id)
						break
					}

					case 'node-update': {
						const toneNode = getToneNodeById(change.id)
						const audioNode = getAudioNodeById(change.id)

						if (toneNode && audioNode && change.properties) {
							for (const [property, value] of Object.entries(
								change.properties,
							)) {
								setToneNodeProperty(
									audioNode.type,
									toneNode,
									// @ts-expect-error Object.entries is not typed
									property,
									value,
								)
							}
						}
						break
					}

					case 'edge-add': {
						const { source, target } = change
						connect(source, target)
						edges.current!.set(change.id, {
							source,
							target,
						})
						break
					}

					case 'edge-remove': {
						const edge = edges.current!.get(change.id)
						if (edge) {
							disconnect(edge.source, edge.target)
						}
						break
					}
				}
			},
		)

		const toneUnsubscribe = toneStore.subscribe(
			tone => tone.isAudioAvailable,
			isAudioAvailable => {
				if (!isAudioAvailable) {
					return
				}

				const { addNode, connect } = toneStore.getState()

				const { audioNodes: nodes, audioEdges } =
					compositionStore.getState()

				for (const [nodeId, node] of nodes) {
					const toneNode = createToneNode(node.type, node.properties)
					addNode(nodeId, toneNode)
				}

				for (const [edgeId, edge] of audioEdges) {
					const source: [string, number] = [
						edge.source,
						edge.sourceSocket,
					]
					const target: [string, number] = [
						edge.target,
						edge.targetSocket,
					]
					connect(source, target)
					edges.current!.set(edgeId, { source, target })
				}
			},
		)

		return () => {
			editorUnsubscribe()
			toneUnsubscribe()

			edges.current?.clear()
		}
	}, [compositionStore, editorStore, toneStore])
}
