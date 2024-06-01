'use client'

import { useEffect } from 'react'
import { createToneNode, setToneNodeProperty } from '@/lib/tone'
import { useCompositionStoreApi } from '@/components/providers/composition-store-provider'
import { useEditorStoreApi } from '@/components/providers/editor-store-provider'
import { useToneStoreApi } from '@/components/providers/tone-store-provider'
import { musicKeyToToneEvent } from './music-key-to-event'

export function useToneEditorWatcher() {
	const compositionStore = useCompositionStoreApi()
	const editorStore = useEditorStoreApi()
	const toneStore = useToneStoreApi()

	useEffect(
		() =>
			editorStore.subscribe(
				editor => editor.changeHistory,
				changeHistory => {
					const { getAudioNodeById, getMusicKeyById } =
						compositionStore.getState()
					const {
						addToneNode,
						getToneNodeById,
						addToneEvent,
						connect,
						disconnect,
						disposeNode,
						disposeEvent,
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

						case 'music-key-add': {
							const { id: musicKeyId } = change
							const event = musicKeyToToneEvent(change, toneStore)
							addToneEvent(event, musicKeyId)
							break
						}

						case 'music-key-update': {
							const { id: musicKeyId } = change
							disposeEvent(musicKeyId)

							const musicKey = getMusicKeyById(musicKeyId)
							if (musicKey) {
								const event = musicKeyToToneEvent(
									musicKey,
									toneStore,
								)
								addToneEvent(event, musicKeyId)
							}
							break
						}

						case 'music-key-remove': {
							const { id: musicKeyId } = change
							disposeEvent(musicKeyId)
							break
						}
					}
				},
			),
		[compositionStore, editorStore, toneStore],
	)
}
