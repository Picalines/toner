import { StoreApi, create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { AudioNodeId } from '@/schemas/audio-node'
import { MusicLayerId } from '@/schemas/music'

export type EditorDirtyState = 'clean' | 'waiting' | 'saving'

export type EditorModal = 'composition-info' | 'composition-delete' | 'node-add'

export type EditorPanelLayout = 'horizontal' | 'vertical'

export type EditorState = {
	dirtyState: EditorDirtyState
	openedModal: EditorModal | null
	panelLayout: EditorPanelLayout

	nodeCursor: [x: number, y: number]
	selectedInstrumentId: AudioNodeId | null
	selectedMusicLayerId: MusicLayerId
}

export type EditorActions = {
	setDirtyState: (state: EditorDirtyState) => void

	openModal: (modal: EditorModal) => void
	closeModal: () => void

	setPanelLayout: (layout: EditorPanelLayout) => void

	setNodeCursor: (x: number, y: number) => void
}

export type EditorStore = EditorState & EditorActions

export type EditorStoreApi = ReturnType<typeof createEditorStore>

export function createEditorStore(initialState: EditorState) {
	const initStore = (
		set: StoreApi<EditorStore>['setState'],
	): EditorStore => ({
		...initialState,

		setDirtyState: dirtyState => set({ dirtyState }),

		openModal: modal => set({ openedModal: modal }),
		closeModal: () => set({ openedModal: null }),

		setPanelLayout: layout => set({ panelLayout: layout }),

		setNodeCursor: (x, y) => set({ nodeCursor: [x, y] }),
	})

	return create(
		persist(subscribeWithSelector(initStore), {
			name: 'composition-editor',
			partialize: state =>
				({ panelLayout: state.panelLayout }) as EditorStore,
		}),
	)
}
