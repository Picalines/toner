'use client'

import { PropsWithChildren, createContext, useContext, useRef } from 'react'
import { useStore } from 'zustand'
import {
	AudioEdge,
	AudioNode,
	CompositionState,
	CompositionStore,
	CompositionStoreApi,
	createCompositionStore,
} from '@/stores/composition-store'

const CompositionStoreContext = createContext<CompositionStoreApi | null>(null)

type Props = PropsWithChildren<
	Readonly<
		Pick<CompositionState, 'id' | 'name' | 'description'> & {
			nodes: AudioNode[]
			edges: AudioEdge[]
		}
	>
>

export default function CompositionStoreProvider({
	children,
	nodes,
	edges,
	...compositionState
}: Props) {
	const storeRef = useRef<CompositionStoreApi>()

	if (!storeRef.current) {
		storeRef.current = createCompositionStore({
			...compositionState,
			changeHistory: [],
			nodes: new Map(nodes.map(node => [node.id, node])),
			edges: new Map(edges.map(edge => [edge.id, edge])),
			selectedNodeId: null,
			selectedEdgeId: null,
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
