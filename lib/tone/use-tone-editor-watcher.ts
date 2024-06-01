'use client'

import { useEffect } from 'react'
import { createToneNode, setToneNodeProperty } from '@/lib/tone'
import {
	useCompositionStoreApi,
	useEditorStoreApi,
	useToneStoreApi,
} from '@/components/providers'

export function useToneEditorWatcher() {
	const compositionStore = useCompositionStoreApi()
	const editorStore = useEditorStoreApi()
	const toneStore = useToneStoreApi()

	useEffect(
		() =>
			editorStore.subscribe(
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
							addToneNode(toneNode, change.id)
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
							const { id: edgeId, source, target } = change
							connect(source, target, edgeId)
							break
						}

						case 'edge-remove': {
							disconnect(change.id)
							break
						}
					}
				},
			),
		[compositionStore, editorStore, toneStore],
	)
}
