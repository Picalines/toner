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
	Readonly<
		Omit<EditorState, 'dirtyState' | 'openedModal' | 'nodeCursor'> & {
			nodeCursorX?: number
			nodeCursorY?: number
		}
	>
>

export default function EditorStoreProvider({
	children,
	nodeCursorX = 0,
	nodeCursorY = 0,
	...initialState
}: Props) {
	const storeRef = useRef<EditorStoreApi>()

	if (!storeRef.current) {
		storeRef.current = createEditorStore({
			...initialState,
			dirtyState: 'clean',
			openedModal: null,
			nodeCursor: [nodeCursorX, nodeCursorY],
		})
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
			`${useEditorStoreApi.name} must be used within ${EditorStoreProvider.name}`,
		)
	}

	return editorStoreApi
}

export function useEditorStore<T>(selector: (store: EditorStore) => T): T {
	return useStore(useEditorStoreApi(), selector)
}
