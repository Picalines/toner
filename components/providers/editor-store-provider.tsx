'use client'

import {
	type PropsWithChildren,
	createContext,
	useContext,
	useRef,
} from 'react'
import { useStore } from 'zustand'
import {
	type AudioEdgeId,
	type AudioNode,
	type AudioNodeId,
	audioNodeDefinitions,
} from '@/lib/schemas/audio-node'
import type { MusicKeyId, MusicLayerId } from '@/lib/schemas/music'
import {
	type EditorPanelLayout,
	type EditorStore,
	type EditorStoreApi,
	type MusicKeyPreview,
	createEditorStore,
} from '@/lib/stores/editor-store'
import { takeFirst } from '@/lib/utils'
import { useCompositionStoreApi } from './composition-store-provider'

const EditorStoreContext = createContext<EditorStoreApi | null>(null)

type Props = PropsWithChildren<
	Readonly<{
		panelLayout?: EditorPanelLayout
		nodeCursor?: [x: number, y: number]
		musicKeyPreview?: MusicKeyPreview | null
		timelineScroll?: number
		nodeSelection?: AudioNodeId[]
		edgeSelection?: AudioEdgeId[]
		musicKeySelection?: MusicKeyId[]
		selectedInstrumentId?: AudioNodeId | null
		selectedMusicLayerId?: MusicLayerId | null
	}>
>

export default function EditorStoreProvider({
	children,
	panelLayout = 'horizontal',
	nodeCursor = [0, 0],
	musicKeyPreview = null,
	timelineScroll = 0,
	selectedInstrumentId,
	selectedMusicLayerId,
	nodeSelection = [],
	edgeSelection = [],
	musicKeySelection = [],
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
			nodeCursor,
			musicKeyPreview,
			timeStep: 4,
			timelineNoteWidth: 120,
			timelineScroll,
			noteLineHeight: 24,
			audioNodeSelection: new Set(nodeSelection),
			audioEdgeSelection: new Set(edgeSelection),
			musicKeySelection: new Set(musicKeySelection),
			playbackInstrumentId: selectedInstrumentId,
			playbackState: 'idle',
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
		const { id: nodeId, type: nodeType } = node
		if (audioNodeDefinitions[nodeType].group == 'instrument') {
			return nodeId
		}
	}

	return null
}
