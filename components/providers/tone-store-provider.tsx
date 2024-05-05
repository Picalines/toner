'use client'

import {
	PropsWithChildren,
	createContext,
	useContext,
	useEffect,
	useRef,
} from 'react'
import { StoreApi, useStore } from 'zustand'
import { ToneState, ToneStore, createToneStore } from '@/stores/tone-store'

const ToneStoreContext = createContext<StoreApi<ToneStore> | null>(null)

type Props = PropsWithChildren<
	Readonly<{
		initialState: ToneState
	}>
>

export default function ToneStoreProvider({ initialState, children }: Props) {
	const storeRef = useRef<StoreApi<ToneStore>>()

	if (!storeRef.current) {
		storeRef.current = createToneStore(initialState)
	}

	useEffect(() => {
		return () => {
			storeRef.current?.getState().disposeAll()
		}
	}, [])

	return (
		<ToneStoreContext.Provider value={storeRef.current}>
			{children}
		</ToneStoreContext.Provider>
	)
}

export function useToneStore<T>(selector: (store: ToneStore) => T): T {
	const toneStoreContext = useContext(ToneStoreContext)

	if (!toneStoreContext) {
		throw new Error(
			`${useToneStore.name} must be used within ${ToneStoreProvider.name}`,
		)
	}

	return useStore(toneStoreContext, selector)
}
