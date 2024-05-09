'use client'

import {
	PropsWithChildren,
	createContext,
	useContext,
	useEffect,
	useRef,
} from 'react'
import * as Tone from 'tone'
import { StoreApi, useStore } from 'zustand'
import { ToneStore, createToneStore } from '@/stores/tone-store'

const ToneStoreContext = createContext<StoreApi<ToneStore> | null>(null)

export default function ToneStoreProvider({ children }: PropsWithChildren) {
	const toneStoreRef = useRef<StoreApi<ToneStore>>()

	if (!toneStoreRef.current) {
		toneStoreRef.current = createToneStore({
			context: Tone.getContext(),
			isAudioAvailable: false,
			nodes: [],
		})
	}

	useEffect(() => {
		return () => {
			toneStoreRef.current?.getState().disposeAll()
		}
	}, [])

	return (
		<ToneStoreContext.Provider value={toneStoreRef.current}>
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
