import { useEffect, useRef } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { applyEditorChangeToSummary } from '@/lib/editor/apply-to-summary'
import { EditorChangeSummary } from '@/lib/schemas/editor'
import { EditorStore } from '@/lib/stores'
import {
	useCompositionStoreApi,
	useEditorStoreApi,
} from '@/components/providers'

const changeSelector = ({ changeHistory }: EditorStore) => changeHistory

const dirtyStateSelector = ({ dirtyState }: EditorStore) => dirtyState

const preventDefault = (event: Event) => event.preventDefault()

type Props = {
	submitDelay: number
	onCompositionUpdate?: (changeSummary: EditorChangeSummary) => Promise<void>
}

export function useCompositionChangeWatcher({
	submitDelay,
	onCompositionUpdate,
}: Props) {
	const compositionStore = useCompositionStoreApi()
	const editorStore = useEditorStoreApi()

	const changeSummaryRef = useRef<EditorChangeSummary>({
		id: compositionStore.getState().id,
		nodes: {},
		edges: {},
		musicLayers: {},
		musicKeys: {},
	})

	const submitChanges = useDebouncedCallback(async () => {
		const { changeHistory, saveChanges, setDirtyState } =
			editorStore.getState()

		const lastChange = changeHistory[changeHistory.length - 1]
		if (lastChange.type == 'save-changes') {
			return
		}

		setDirtyState('saving')
		saveChanges()
		await onCompositionUpdate?.(changeSummaryRef.current)
		setDirtyState('clean')

		const summary = changeSummaryRef.current
		summary.nodes = {}
		summary.edges = {}
		summary.musicLayers = {}
		summary.musicKeys = {}
	}, submitDelay)

	useEffect(() => {
		const unsubscribeChange = editorStore.subscribe(
			changeSelector,
			changeHistory => {
				if (!changeHistory.length) {
					return
				}

				const { setDirtyState } = editorStore.getState()

				const summary = changeSummaryRef.current
				summary.id = compositionStore.getState().id

				const lastChange = changeHistory[changeHistory.length - 1]
				applyEditorChangeToSummary(summary, lastChange)

				if (lastChange.type != 'save-changes') {
					setDirtyState('waiting')
				}

				void submitChanges()
			},
		)

		const unsubscribeDirty = editorStore.subscribe(
			dirtyStateSelector,
			dirtyState => {
				// NOTICE: doesn't block nextjs navigation, need to persist unsaved
				// changes in localStorage... and fix conflicts i guess
				if (dirtyState == 'clean') {
					window.removeEventListener('beforeunload', preventDefault)
				} else {
					window.addEventListener('beforeunload', preventDefault)
				}
			},
		)

		return () => {
			unsubscribeChange()
			unsubscribeDirty()
		}
	}, [compositionStore, editorStore, submitChanges])
}
