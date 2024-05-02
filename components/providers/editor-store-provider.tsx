'use client'

import { PropsWithChildren, createContext, useContext, useRef } from 'react'
import { StoreApi, useStore } from 'zustand'
import {
	EditorState,
	EditorStore,
	createEditorStore,
} from '@/stores/editor-store'

const EditorStoreContext = createContext<StoreApi<EditorStore> | null>(null)

type Props = PropsWithChildren<
	Readonly<{
		initialState: EditorState
	}>
>

export default function EditorStoreProvider({ initialState, children }: Props) {
	const storeRef = useRef<StoreApi<EditorStore>>()

	if (!storeRef.current) {
		storeRef.current = createEditorStore(initialState)
	}

	return (
		<EditorStoreContext.Provider value={storeRef.current}>
			{children}
		</EditorStoreContext.Provider>
	)
}

export function useEditorStore<T>(selector: (store: EditorStore) => T): T {
	const editorStoreContext = useContext(EditorStoreContext)

	if (!editorStoreContext) {
		throw new Error(
			`${useEditorStore.name} must be used within ${EditorStoreProvider.name}`,
		)
	}

	return useStore(editorStoreContext, selector)
}
