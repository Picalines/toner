'use client'

import {
	type PropsWithChildren,
	createContext,
	useContext,
	useEffect,
	useRef,
} from 'react'
import * as Tone from 'tone'
import { useStore } from 'zustand'
import {
	type ToneStore,
	type ToneStoreApi,
	createToneStore,
} from '@/lib/stores/tone-store'

const ToneStoreContext = createContext<ToneStoreApi | null>(null)

export default function ToneStoreProvider({ children }: PropsWithChildren) {
	const toneStoreRef = useRef<ToneStoreApi>()

	if (!toneStoreRef.current) {
		toneStoreRef.current = createToneStore({
			context: Tone.getContext(),
			transport: Tone.getTransport(),
			isAudioAvailable: false,
			toneNodes: new Map(),
			toneConnections: new Map(),
			toneEvents: new Map(),
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

export function useToneStoreApi(): ToneStoreApi {
	const toneStoreApi = useContext(ToneStoreContext)

	if (!toneStoreApi) {
		throw new Error(
			`${useToneStoreApi.name} must be used within ${ToneStoreProvider.name}`,
		)
	}

	return toneStoreApi
}

export function useToneStore<T>(selector: (store: ToneStore) => T): T {
	return useStore(useToneStoreApi(), selector)
}
