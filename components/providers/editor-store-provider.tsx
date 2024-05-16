'use client'

import { PropsWithChildren, createContext, useContext, useRef } from 'react'
import { useStore } from 'zustand'
import {
	EditorState,
	EditorStore,
	EditorStoreApi,
	createEditorStore,
} from '@/stores/editor-store'

const EditorStoreContext = createContext<EditorStoreApi | null>(null)

type Props = PropsWithChildren<
	Readonly<{
		initialState: EditorState
	}>
>

export default function EditorStoreProvider({ initialState, children }: Props) {
	const storeRef = useRef<EditorStoreApi>()

	if (!storeRef.current) {
		storeRef.current = createEditorStore(initialState)
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
			`${useEditorStore.name} must be used within ${EditorStoreProvider.name}`,
		)
	}

	return editorStoreApi
}

export function useEditorStore<T>(selector: (store: EditorStore) => T): T {
	return useStore(useEditorStoreApi(), selector)
}
