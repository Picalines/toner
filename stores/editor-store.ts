import { createStore } from 'zustand/vanilla'

type EditorModal = 'updateInfo' | 'deleteComposition'

export type EditorState = {
	openedModal: EditorModal | null
}

export type EditorActions = {
	openModal: (modal: EditorModal) => void
	closeModal: () => void
}

export type EditorStore = EditorState & EditorActions

export function createEditorStore(initialState: EditorState) {
	return createStore<EditorStore>()(set => ({
		...initialState,

		openModal: modal => set({ openedModal: modal }),
		closeModal: () => set({ openedModal: null }),
	}))
}
