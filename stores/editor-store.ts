import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type EditorDirtyState = 'clean' | 'waiting' | 'saving'

type EditorModal = 'updateInfo' | 'deleteComposition'

type EditorPanelLayout = 'horizontal' | 'vertical'

export type EditorState = {
	dirtyState: EditorDirtyState
	openedModal: EditorModal | null
	panelLayout: EditorPanelLayout
}

export type EditorActions = {
	setDirtyState: (state: EditorDirtyState) => void

	openModal: (modal: EditorModal) => void
	closeModal: () => void

	setPanelLayout: (layout: EditorPanelLayout) => void
}

export type EditorStore = EditorState & EditorActions

export function createEditorStore(initialState: EditorState) {
	return create(
		persist<EditorStore>(
			set => ({
				...initialState,

				setDirtyState: dirtyState => {
					set({ dirtyState })
				},

				openModal: modal => set({ openedModal: modal }),
				closeModal: () => set({ openedModal: null }),

				setPanelLayout: layout => set({ panelLayout: layout }),
			}),
			{
				name: 'composition-editor',
				partialize: state =>
					({ panelLayout: state.panelLayout }) as EditorStore,
			},
		),
	)
}
