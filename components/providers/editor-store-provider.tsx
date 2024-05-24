'use client'

import { PropsWithChildren, createContext, useContext, useRef } from 'react'
import { useStore } from 'zustand'
import { takeFirst } from '@/lib/utils'
import {
	AudioEdgeId,
	AudioNodeId,
	audioNodeDefinitions,
} from '@/schemas/audio-node'
import { MusicLayerId } from '@/schemas/music'
import { AudioNode } from '@/stores/composition-store'
import {
	EditorPanelLayout,
	EditorStore,
	EditorStoreApi,
	createEditorStore,
} from '@/stores/editor-store'
import { useCompositionStoreApi } from './composition-store-provider'

const EditorStoreContext = createContext<EditorStoreApi | null>(null)

type Props = PropsWithChildren<
	Readonly<{
		panelLayout?: EditorPanelLayout
		nodeCursorX?: number
		nodeCursorY?: number
		nodeSelection?: AudioNodeId[]
		edgeSelection?: AudioEdgeId[]
		selectedInstrumentId?: AudioNodeId | null
		selectedMusicLayerId?: MusicLayerId | null
	}>
>

export default function EditorStoreProvider({
	children,
	panelLayout = 'horizontal',
	nodeCursorX = 0,
	nodeCursorY = 0,
	selectedInstrumentId,
	selectedMusicLayerId,
	nodeSelection = [],
	edgeSelection = [],
}: Props) {
	const compositionStore = useCompositionStoreApi()

	const storeRef = useRef<EditorStoreApi>()

	if (!storeRef.current) {
		const { audioNodes: audioNodes, musicLayers } =
			compositionStore.getState()

		if (selectedInstrumentId === undefined) {
			selectedInstrumentId = findAnyInstrumentNodeId(audioNodes)
		}

		if (selectedMusicLayerId === undefined) {
			selectedMusicLayerId = takeFirst(musicLayers.keys())
		}

		storeRef.current = createEditorStore({
			panelLayout,
			dirtyState: 'clean',
			openedModal: null,
			nodeCursor: [nodeCursorX, nodeCursorY],
			nodeSelection,
			edgeSelection,
			playbackInstrumentId: selectedInstrumentId,
			selectedMusicLayerId,
			changeHistory: [],
		})
	}

	return (
		<EditorStoreContext.Provider value={storeRef.current}>
			{children}
		</EditorStoreContext.Provider>
	)
}

export function useEditorStoreApi(): EditorStoreApi {
	const editorStoreApi = useContext(EditorStoreContext)

	if (!editorStoreApi) {
		throw new Error(
			`${useEditorStoreApi.name} must be used within ${EditorStoreProvider.name}`,
		)
	}

	return editorStoreApi
}

export function useEditorStore<T>(selector: (store: EditorStore) => T): T {
	return useStore(useEditorStoreApi(), selector)
}

function findAnyInstrumentNodeId(
	audioNodes: Map<AudioNodeId, AudioNode>,
): AudioNodeId | null {
	for (const node of audioNodes.values()) {
		const {
			id: nodeId,
			data: { type: nodeType },
		} = node

		if (audioNodeDefinitions[nodeType].group == 'instrument') {
			return nodeId
		}
	}

	return null
}
