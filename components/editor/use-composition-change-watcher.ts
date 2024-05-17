import { useEffect, useRef } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { shallow } from 'zustand/shallow'
import {
	CompositionChangeSummary,
	applyCompositionChangeToSummary,
} from '@/schemas/composition'
import { useCompositionStoreApi } from '@/components/providers/composition-store-provider'
import { useEditorStoreApi } from '@/components/providers/editor-store-provider'
import { CompositionStore } from '@/stores/composition-store'
import { EditorStore } from '@/stores/editor-store'

const compSelector = ({ id, changeHistory }: CompositionStore) => ({
	id,
	changeHistory,
})

const editorSelector = ({ dirtyState, setDirtyState }: EditorStore) => ({
	dirtyState,
	setDirtyState,
})

const preventDefault = (event: Event) => event.preventDefault()

type Props = {
	submitDelay: number
	onCompositionUpdate?: (
		changeSummary: CompositionChangeSummary,
	) => Promise<void>
}

export function useCompositionChangeWatcher({
	submitDelay,
	onCompositionUpdate,
}: Props) {
	const compositionStore = useCompositionStoreApi()
	const editorStore = useEditorStoreApi()

	const updateRequestRef = useRef<CompositionChangeSummary>({
		id: compositionStore.getState().id,
		nodes: {},
		edges: {},
		musicLayers: {},
		musicKeys: {},
	})

	const submitChanges = useDebouncedCallback(async () => {
		const { changeHistory } = compositionStore.getState()

		const lastChange = changeHistory[changeHistory.length - 1]
		if (lastChange.type == 'save-changes') {
			return
		}

		const { setDirtyState } = editorStore.getState()
		const { saveChanges } = compositionStore.getState()

		setDirtyState('saving')
		saveChanges()
		await onCompositionUpdate?.(updateRequestRef.current)
		setDirtyState('clean')

		const request = updateRequestRef.current
		request.nodes = {}
		request.edges = {}
	}, submitDelay)

	useEffect(() => {
		const unsubscribeComp = compositionStore.subscribe(
			compSelector,
			({ id: compositionId, changeHistory }) => {
				if (!changeHistory.length) {
					return
				}

				const { setDirtyState } = editorStore.getState()

				const request = updateRequestRef.current
				request.id = compositionId

				const lastChange = changeHistory[changeHistory.length - 1]
				applyCompositionChangeToSummary(request, lastChange)

				if (lastChange.type != 'save-changes') {
					setDirtyState('waiting')
				}

				void submitChanges()
			},
			{ equalityFn: shallow },
		)

		const unsubscribeEditor = editorStore.subscribe(
			editorSelector,
			({ dirtyState }) => {
				// NOTICE: doesn't block nextjs navigation, need to persist unsaved
				// changes in localStorage... and fix conflicts i guess
				if (dirtyState == 'clean') {
					window.removeEventListener('beforeunload', preventDefault)
				} else {
					window.addEventListener('beforeunload', preventDefault)
				}
			},
			{ equalityFn: shallow },
		)

		return () => {
			unsubscribeComp()
			unsubscribeEditor()
		}
	}, [compositionStore, editorStore, submitChanges])
}
