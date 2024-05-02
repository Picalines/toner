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
	Readonly<{
		initialState: CompositionState
	}>
>

export default function CompositionStoreProvider({
	initialState,
	children,
}: Props) {
	const storeRef = useRef<StoreApi<CompositionStore>>()

	if (!storeRef.current) {
		storeRef.current = createCompositionStore(initialState)
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
