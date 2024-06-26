'use client'

import { useEffect } from 'react'
import { useCompositionStoreApi } from '@/components/providers/composition-store-provider'
import { useToneStoreApi } from '@/components/providers/tone-store-provider'
import type { ToneStore } from '../stores/tone-store'
import { createToneNode } from './create-node'
import { musicKeyToToneEvent } from './music-key-to-event'

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

				for (const [musicKeyId, musicKey] of musicKeys) {
					const event = musicKeyToToneEvent(musicKey, toneStore)
					addToneEvent(event, musicKeyId)
				}
			}),
		[compositionStore, toneStore],
	)
}
