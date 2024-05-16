'use client'

import { useEffect, useRef } from 'react'
import * as Tone from 'tone'
import { useStore } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { createToneNode } from '@/schemas/tone-node'
import { CompositionStore } from '@/stores/composition-store'
import { ToneStore } from '@/stores/tone-store'
import { useCompositionStoreApi } from '../providers/composition-store-provider'
import { useToneStore } from '../providers/tone-store-provider'

const changeHistorySelector = ({ changeHistory }: CompositionStore) =>
	changeHistory

const toneSelector = ({
	isAudioAvailable,
	getNodeById,
	addNode,
	connect,
	disposeNode,
	disposeAll,
}: ToneStore) => ({
	isAudioAvailable,
	getNodeById,
	addNode,
	connect,
	disposeNode,
	disposeAll,
})

export function useToneEditorWatcher() {
	const compositionStore = useCompositionStoreApi()
	const changeHistory = useStore(compositionStore, changeHistorySelector)

	const {
		isAudioAvailable,
		getNodeById,
		addNode,
		connect,
		disposeNode,
		disposeAll,
	} = useToneStore(useShallow(toneSelector))

	const toneSetters =
		useRef<
			WeakMap<Tone.ToneAudioNode, (prop: string, value: number) => void>
		>()

	const edgeDisconnects = useRef<Map<string, () => void>>()

	toneSetters.current ??= new WeakMap()
	edgeDisconnects.current ??= new Map()

	useEffect(() => {
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

			case 'node-set-property': {
				const node = getNodeById(change.id)
				if (node) {
					const setProperty = toneSetters.current!.get(node)
					setProperty?.(change.property, change.value)
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
	}, [changeHistory, getNodeById, addNode, connect, disposeNode])

	useEffect(() => {
		if (!isAudioAvailable) {
			return
		}

		const { nodes, edges } = compositionStore.getState()

		for (const [nodeId, node] of nodes) {
			const { toneNode, setProperty } = createToneNode(
				node.data.type,
				node.data.properties,
			)
			addNode(nodeId, toneNode)
			toneSetters.current!.set(toneNode, setProperty)
		}

		for (const [edgeId, edge] of edges) {
			const disconnect = connect(
				[edge.source, parseInt(edge.sourceHandle ?? '0')],
				[edge.target, parseInt(edge.targetHandle ?? '0')],
			)
			if (disconnect) {
				edgeDisconnects.current?.set(edgeId, disconnect)
			}
		}

		return () => {
			edgeDisconnects.current?.clear()
			disposeAll()
		}
	}, [isAudioAvailable, compositionStore, addNode, connect, disposeAll])
}
