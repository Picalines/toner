import { StoreApi, create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { mergeEditorChange } from '@/lib/editor/merge-change'
import { AudioEdgeId, AudioNodeId } from '@/schemas/audio-node'
import { EditorChange } from '@/schemas/editor'
import { MusicLayerId } from '@/schemas/music'

export type EditorDirtyState = 'clean' | 'waiting' | 'saving'

export type EditorModal = 'composition-info' | 'composition-delete' | 'node-add'

export type EditorPanelLayout = 'horizontal' | 'vertical'

type SelectionOperation = 'add' | 'remove' | 'replace'

export type EditorState = {
	dirtyState: EditorDirtyState
	openedModal: EditorModal | null
	panelLayout: EditorPanelLayout

	nodeCursor: [x: number, y: number]
	timelineScroll: number

	nodeSelection: AudioNodeId[]
	edgeSelection: AudioEdgeId[]
	selectedMusicLayerId: MusicLayerId | null

	playbackInstrumentId: AudioNodeId | null

	changeHistory: EditorChange[]
}

export type EditorActions = {
	setDirtyState: (state: EditorDirtyState) => void

	openModal: (modal: EditorModal) => void
	closeModal: () => void

	setPanelLayout: (layout: EditorPanelLayout) => void

	setNodeCursor: (x: number, y: number) => void
	scrollTimeline: (dx: number) => void

	selectNodes: (operation: SelectionOperation, ids: AudioNodeId[]) => void
	selectEdges: (operation: SelectionOperation, ids: AudioEdgeId[]) => void
	selectMusicLayer: (id: MusicLayerId) => void

	selectInstrument: (id: AudioNodeId | null) => void

	applyChange: (change: EditorChange) => void
	saveChanges: () => void
}

export type EditorStore = EditorState & EditorActions

export type EditorStoreApi = ReturnType<typeof createEditorStore>

export function createEditorStore(initialState: EditorState) {
	const initStore = (
		set: StoreApi<EditorStore>['setState'],
		get: StoreApi<EditorStore>['getState'],
	): EditorStore => ({
		...initialState,

		setDirtyState: dirtyState => set({ dirtyState }),

		openModal: modal => set({ openedModal: modal }),
		closeModal: () => set({ openedModal: null }),

		setPanelLayout: layout => set({ panelLayout: layout }),

		setNodeCursor: (x, y) => set({ nodeCursor: [x, y] }),
		scrollTimeline: dx =>
			set({ timelineScroll: Math.max(0, get().timelineScroll + dx) }),

		selectNodes: (operation, ids) => {
			const { nodeSelection: oldSelection } = get()
			const newSelection = applySelection(operation, oldSelection, ids)
			if (newSelection != oldSelection) {
				set({ nodeSelection: newSelection })
			}
		},

		selectEdges: (operation, ids) => {
			const { edgeSelection: oldSelection } = get()
			const newSelection = applySelection(operation, oldSelection, ids)
			if (newSelection != oldSelection) {
				set({ edgeSelection: newSelection })
			}
		},

		selectInstrument: id => set({ playbackInstrumentId: id }),
		selectMusicLayer: id => set({ selectedMusicLayerId: id }),

		applyChange: change =>
			set({
				changeHistory: mergeEditorChange(get().changeHistory, change),
			}),

		saveChanges: () => get().applyChange({ type: 'save-changes' }),
	})

	return create(
		persist(subscribeWithSelector(initStore), {
			name: 'composition-editor',
			partialize: state =>
				({ panelLayout: state.panelLayout }) as EditorStore,
		}),
	)
}

function applySelection<T>(
	operation: SelectionOperation,
	currentSelection: T[],
	newSelection: T[],
): T[] {
	if (operation == 'replace') {
		return [...new Set(newSelection)]
	}

	if (!newSelection.length) {
		return currentSelection
	}

	const selected = new Set<T>(currentSelection)

	if (operation == 'add') {
		newSelection.forEach(item => selected.add(item))
	} else if (operation == 'remove') {
		newSelection.forEach(item => selected.delete(item))
	}

	return [...selected]
}
