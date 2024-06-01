'use client'

import { useEffect } from 'react'
import { useCompositionStoreApi } from '@/components/providers/composition-store-provider'
import { useToneStoreApi } from '@/components/providers/tone-store-provider'
import { ToneStore } from '../stores'
import { createToneNode } from './create-node'

const audioInitSelector = ({ isAudioAvailable }: ToneStore) => isAudioAvailable

export function useToneCompositionInitializer() {
	const compositionStore = useCompositionStoreApi()
	const toneStore = useToneStoreApi()

	useEffect(
		() =>
			toneStore.subscribe(audioInitSelector, isAudioAvailable => {
				if (!isAudioAvailable) {
					return
				}

				const { addToneNode, connect, addToneEvent } =
					toneStore.getState()
				const { audioNodes, audioEdges, musicKeys } =
					compositionStore.getState()

				for (const [nodeId, node] of audioNodes) {
					const toneNode = createToneNode(node.type, node.properties)
					addToneNode(toneNode, nodeId)
				}

				for (const [edgeId, edge] of audioEdges) {
					connect(
						[edge.source, edge.sourceSocket],
						[edge.target, edge.targetSocket],
						edgeId,
					)
				}
			}),
		[compositionStore, toneStore],
	)
}
