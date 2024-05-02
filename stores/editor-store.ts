import { createStore } from 'zustand/vanilla'

type EditorModal = 'updateInfo' | 'deleteComposition'

type EditorPanelLayout = 'horizontal' | 'vertical'

export type EditorState = {
	openedModal: EditorModal | null
	panelLayout: EditorPanelLayout
}

export type EditorActions = {
	openModal: (modal: EditorModal) => void
	closeModal: () => void

	setPanelLayout: (layout: EditorPanelLayout) => void
}

export type EditorStore = EditorState & EditorActions

export function createEditorStore(initialState: EditorState) {
	return createStore<EditorStore>()(set => ({
		...initialState,

		openModal: modal => set({ openedModal: modal }),
		closeModal: () => set({ openedModal: null }),

		setPanelLayout: layout => set({ panelLayout: layout }),
	}))
}
