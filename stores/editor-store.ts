import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type EditorDirtyState = 'clean' | 'waiting' | 'saving'

type EditorModal = 'composition-info' | 'composition-delete' | 'node-add'

type EditorPanelLayout = 'horizontal' | 'vertical'

export type EditorState = {
	dirtyState: EditorDirtyState
	openedModal: EditorModal | null
	panelLayout: EditorPanelLayout

	nodeCursor: [x: number, y: number]
}

export type EditorActions = {
	setDirtyState: (state: EditorDirtyState) => void

	openModal: (modal: EditorModal) => void
	closeModal: () => void

	setPanelLayout: (layout: EditorPanelLayout) => void

	setNodeCursor: (x: number, y: number) => void
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

				setNodeCursor: (x, y) => set({ nodeCursor: [x, y] }),
			}),
			{
				name: 'composition-editor',
				partialize: state =>
					({ panelLayout: state.panelLayout }) as EditorStore,
			},
		),
	)
}
