import { StoreApi, create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { mergeEditorChange } from '@/lib/editor'
import { AudioEdgeId, AudioNodeId } from '@/lib/schemas/audio-node'
import { EditorChange } from '@/lib/schemas/editor'
import { MusicKeyId, MusicLayerId } from '@/lib/schemas/music'

export type EditorDirtyState = 'clean' | 'waiting' | 'saving'

export type EditorModal = 'composition-info' | 'composition-delete' | 'node-add'

export type EditorPanelLayout = 'horizontal' | 'vertical'

type SelectionOperation = 'add' | 'remove' | 'replace'

export type EditorState = {
	dirtyState: EditorDirtyState
	openedModal: EditorModal | null
	panelLayout: EditorPanelLayout

	nodeCursor: [x: number, y: number]
	musicKeyPreview: [time: number, note: number, duration: number] | null
	timelineScroll: number

	audioNodeSelection: Set<AudioNodeId>
	audioEdgeSelection: Set<AudioEdgeId>
	musicKeySelection: Set<MusicKeyId>
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
	setMusicKeyPreview: (
		preview: [time: number, note: number, duration: number] | null,
	) => void
	scrollTimeline: (dx: number) => void

	selectAudioNodes: (
		operation: SelectionOperation,
		ids: AudioNodeId[],
	) => void
	selectAudioEdges: (
		operation: SelectionOperation,
		ids: AudioEdgeId[],
	) => void
	selectMusicLayer: (id: MusicLayerId) => void
	selectMusicKeys: (operation: SelectionOperation, ids: MusicKeyId[]) => void

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
		setMusicKeyPreview: preview => set({ musicKeyPreview: preview }),
		scrollTimeline: dx =>
			set({ timelineScroll: Math.max(0, get().timelineScroll + dx) }),

		selectAudioNodes: (operation, ids) => {
			const { audioNodeSelection: oldSelection } = get()
			const newSelection = applySelection(operation, oldSelection, ids)
			if (newSelection != oldSelection) {
				set({ audioNodeSelection: newSelection })
			}
		},

		selectAudioEdges: (operation, ids) => {
			const { audioEdgeSelection: oldSelection } = get()
			const newSelection = applySelection(operation, oldSelection, ids)
			if (newSelection != oldSelection) {
				set({ audioEdgeSelection: newSelection })
			}
		},

		selectMusicLayer: id => {
			if (get().selectedMusicLayerId != id) {
				set({ selectedMusicLayerId: id, musicKeySelection: new Set() })
			}
		},

		selectMusicKeys: (operation, ids) => {
			const { musicKeySelection: oldSelection } = get()
			const newSelection = applySelection(operation, oldSelection, ids)
			if (newSelection != oldSelection) {
				set({ musicKeySelection: newSelection })
			}
		},

		selectInstrument: id => set({ playbackInstrumentId: id }),

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
	currentSelection: Set<T>,
	newSelection: T[],
): Set<T> {
	if (operation == 'replace') {
		return new Set(newSelection)
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

	return selected
}
