'use client'

import { PropsWithChildren, createContext, useContext, useRef } from 'react'
import { StoreApi, useStore } from 'zustand'
import {
	CompositionState,
	CompositionStore,
	createCompositionStore,
} from '@/stores/composition-store'

const CompositionStoreContext =
	createContext<StoreApi<CompositionStore> | null>(null)

type Props = PropsWithChildren<
	Readonly<
		Pick<
			CompositionState,
			'id' | 'name' | 'description' | 'nodes' | 'edges'
		>
	>
>

export default function CompositionStoreProvider({
	children,
	...compositionState
}: Props) {
	const storeRef = useRef<StoreApi<CompositionStore>>()

	if (!storeRef.current) {
		storeRef.current = createCompositionStore({
			...compositionState,
			lastSelectedNode: null,
			lastSelectedEdge: null,
			lastSelectedInstrument: null,
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
