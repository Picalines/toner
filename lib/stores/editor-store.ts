import { z } from 'zod'
import { type StoreApi, create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { mergeEditorChange } from '@/lib/editor'
import type { AudioEdgeId, AudioNodeId } from '@/lib/schemas/audio-node'
import type { EditorChange } from '@/lib/schemas/editor'
import type { MusicKeyId, MusicLayerId } from '@/lib/schemas/music'
import { clampLeft, safeParseOr } from '../utils'

export type EditorDirtyState = 'clean' | 'waiting' | 'saving'

export type EditorModal = 'composition-info' | 'composition-delete' | 'node-add'

export type EditorPanelLayout = 'horizontal' | 'vertical'

export type MusicKeyPreview = { time: number; note: number; duration: number }

export type EditorPlaybackState = 'idle' | 'initializing' | 'playing' | 'paused'

type SelectionOperation = 'add' | 'remove' | 'replace'

export const MIN_TIMELINE_NOTE_WIDTH = 16
export const MAX_TIMELINE_NOTE_WIDTH = 1000

export type EditorState = {
	dirtyState: EditorDirtyState
	openedModal: EditorModal | null
	panelLayout: EditorPanelLayout

	nodeCursor: [x: number, y: number]
	musicKeyPreview: MusicKeyPreview | null
	timeStep: number
	timelineNoteWidth: number
	timelineScroll: number
	noteLineHeight: number

	audioNodeSelection: Set<AudioNodeId>
	audioEdgeSelection: Set<AudioEdgeId>
	musicKeySelection: Set<MusicKeyId>
	selectedMusicLayerId: MusicLayerId | null

	playbackInstrumentId: AudioNodeId | null
	playbackState: EditorPlaybackState

	changeHistory: EditorChange[]
}

export type EditorActions = {
	setDirtyState: (state: EditorDirtyState) => void

	openModal: (modal: EditorModal) => void
	closeModal: () => void

	setPanelLayout: (layout: EditorPanelLayout) => void

	setNodeCursor: (x: number, y: number) => void
	setMusicKeyPreview: (preview: MusicKeyPreview | null) => void
	setTimeStep: (timeStep: number) => void
	zoomTimeline: (factor: number) => void
	scrollTimeline: (dx: number) => void
	setNoteLineHeight: (height: number) => void

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

	setPlaybackState: (playbackState: EditorPlaybackState) => void
}

export type EditorStore = EditorState & EditorActions

export type EditorStoreApi = ReturnType<typeof createEditorStore>

export function createEditorStore(initialState: EditorState) {
	const timeStepSchema = z.number().int().min(1)

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
		setTimeStep: timeStep =>
			set({
				timeStep: safeParseOr(timeStepSchema, timeStep, get().timeStep),
			}),
		zoomTimeline: factor => {
			// TODO: zoom relative to mouse position
			const { timelineNoteWidth, timelineScroll } = get()
			set({
				timelineNoteWidth: clampLeft(
					timelineNoteWidth * factor,
					MIN_TIMELINE_NOTE_WIDTH,
					MAX_TIMELINE_NOTE_WIDTH,
				),
				timelineScroll: timelineScroll * factor,
			})
		},
		scrollTimeline: dx =>
			set({ timelineScroll: Math.max(0, get().timelineScroll + dx) }),
		setNoteLineHeight: height =>
			set({ noteLineHeight: Math.max(1, height) }),

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

				// TODO: pressing delete to remove keys also deletes nodes
				get().selectAudioNodes('replace', [])
			}
		},

		selectInstrument: id => set({ playbackInstrumentId: id }),

		applyChange: change =>
			set({
				changeHistory: mergeEditorChange(get().changeHistory, change),
			}),

		saveChanges: () => get().applyChange({ type: 'save-changes' }),

		setPlaybackState: playbackState => set({ playbackState }),
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
