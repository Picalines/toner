'use client'

import {
	type PropsWithChildren,
	createContext,
	useContext,
	useRef,
} from 'react'
import { useStore } from 'zustand'
import type { AudioEdge, AudioNode } from '@/lib/schemas/audio-node'
import type { MusicKey, MusicLayer } from '@/lib/schemas/music'
import {
	type CompositionState,
	type CompositionStore,
	type CompositionStoreApi,
	createCompositionStore,
} from '@/lib/stores/composition-store'

const CompositionStoreContext = createContext<CompositionStoreApi | null>(null)

type Props = PropsWithChildren<
	Readonly<
		Pick<CompositionState, 'id' | 'name' | 'description'> & {
			audioNodes: AudioNode[]
			audioEdges: AudioEdge[]
			musicLayers: MusicLayer[]
			musicKeys: MusicKey[]
		}
	>
>

export default function CompositionStoreProvider({
	children,
	audioNodes,
	audioEdges,
	musicLayers,
	musicKeys,
	...compositionState
}: Props) {
	const storeRef = useRef<CompositionStoreApi>()

	if (!storeRef.current) {
		storeRef.current = createCompositionStore({
			...compositionState,
			audioNodes: new Map(audioNodes.map(node => [node.id, node])),
			audioEdges: new Map(audioEdges.map(edge => [edge.id, edge])),
			musicLayers: new Map(musicLayers.map(layer => [layer.id, layer])),
			musicKeys: new Map(musicKeys.map(key => [key.id, key])),
		})
	}

	return (
		<CompositionStoreContext.Provider value={storeRef.current}>
			{children}
		</CompositionStoreContext.Provider>
	)
}

export function useCompositionStoreApi(): CompositionStoreApi {
	const editorStoreApi = useContext(CompositionStoreContext)

	if (!editorStoreApi) {
		throw new Error(
			`${useCompositionStoreApi.name} must be used within ${CompositionStoreProvider.name}`,
		)
	}

	return editorStoreApi
}

export function useCompositionStore<T>(
	selector: (store: CompositionStore) => T,
): T {
	return useStore(useCompositionStoreApi(), selector)
}
