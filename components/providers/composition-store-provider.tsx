'use client'

import { PropsWithChildren, createContext, useContext, useRef } from 'react'
import { StoreApi, useStore } from 'zustand'
import {
	AudioEdge,
	AudioNode,
	CompositionState,
	CompositionStore,
	createCompositionStore,
} from '@/stores/composition-store'

const CompositionStoreContext =
	createContext<StoreApi<CompositionStore> | null>(null)

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
	const storeRef = useRef<StoreApi<CompositionStore>>()

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

export function useCompositionStore<T>(
	selector: (store: CompositionStore) => T,
): T {
	const editorStoreContext = useContext(CompositionStoreContext)

	if (!editorStoreContext) {
		throw new Error(
			`${useCompositionStore.name} must be used within ${CompositionStoreProvider.name}`,
		)
	}

	return useStore(editorStoreContext, selector)
}
