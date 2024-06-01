'use client'

import { useEffect, useRef } from 'react'
import * as Tone from 'tone'
import { createToneNode } from '@/lib/tone'
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

	const toneSetters =
		useRef<
			WeakMap<Tone.ToneAudioNode, (prop: string, value: number) => void>
		>()

	const edgeDisconnects = useRef<Map<string, () => void>>()

	toneSetters.current ??= new WeakMap()
	edgeDisconnects.current ??= new Map()

	useEffect(() => {
		const editorUnsubscribe = editorStore.subscribe(
			editor => editor.changeHistory,
			changeHistory => {
				const { getNodeById, addNode, connect, disposeNode } =
					toneStore.getState()

				const change = changeHistory[changeHistory.length - 1]

				switch (change?.type) {
					case 'node-add': {
						const { toneNode, setProperty } = createToneNode(
							change.nodeType,
							change.properties,
						)
						addNode(change.id, toneNode)
						toneSetters.current!.set(toneNode, setProperty)
						break
					}

					case 'node-remove': {
						disposeNode(change.id)
						break
					}

					case 'node-update': {
						const node = getNodeById(change.id)
						const setProperty = node
							? toneSetters.current!.get(node)
							: null

						if (node && change.properties && setProperty) {
							for (const [property, value] of Object.entries(
								change.properties,
							)) {
								setProperty(property, value)
							}
						}
						break
					}

					case 'edge-add': {
						const { source, target } = change
						const disconnect = connect(source, target)
						if (disconnect) {
							edgeDisconnects.current?.set(change.id, disconnect)
						}
						break
					}

					case 'edge-remove': {
						edgeDisconnects.current?.get(change.id)?.()
						edgeDisconnects.current?.delete(change.id)
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

				const { audioNodes: nodes, audioEdges: edges } =
					compositionStore.getState()

				for (const [nodeId, node] of nodes) {
					const { toneNode, setProperty } = createToneNode(
						node.type,
						node.properties,
					)
					addNode(nodeId, toneNode)
					toneSetters.current!.set(toneNode, setProperty)
				}

				for (const [edgeId, edge] of edges) {
					const disconnect = connect(
						[edge.source, edge.sourceSocket],
						[edge.target, edge.targetSocket],
					)
					if (disconnect) {
						edgeDisconnects.current?.set(edgeId, disconnect)
					}
				}
			},
		)

		return () => {
			editorUnsubscribe()
			toneUnsubscribe()

			edgeDisconnects.current?.clear()
			toneStore.getState().disposeAll()
		}
	}, [compositionStore, editorStore, toneStore])
}
