'use client'

import { PropsWithChildren, useCallback, useEffect, useRef } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { useShallow } from 'zustand/react/shallow'
import { useCompositionStore } from '@/components/providers/composition-store-provider'
import { useEditorStore } from '@/components/providers/editor-store-provider'
import { CompositionStore } from '@/stores/composition-store'
import { EditorStore } from '@/stores/editor-store'
import {
	CompositionUpdateRequest,
	mergeCompositionChangeToRequest,
} from './schemas'
import { updateComposition } from './update-composition'

const watchSelector = ({
	id,
	changeHistory,
	saveChanges,
}: CompositionStore) => ({
	id,
	changeHistory,
	saveChanges,
})

const editorSelector = ({ dirtyState, setDirtyState }: EditorStore) => ({
	dirtyState,
	setDirtyState,
})

const beforeUnloadAlertHandler = (event: BeforeUnloadEvent) => {
	event.preventDefault()
}

export default function ChangeWatcher({ children }: PropsWithChildren) {
	const {
		id: compositionId,
		changeHistory,
		saveChanges,
	} = useCompositionStore(useShallow(watchSelector))

	const { dirtyState, setDirtyState } = useEditorStore(
		useShallow(editorSelector),
	)

	const updateRequestRef = useRef<CompositionUpdateRequest>({
		id: compositionId,
		nodes: {},
		edges: {},
	})

	const addChangesToRequest = useCallback(() => {
		const request = updateRequestRef.current
		const lastChange = changeHistory[changeHistory.length - 1] // TODO: watch for multiple last changes
		mergeCompositionChangeToRequest(request, lastChange)

		if (lastChange.type != 'save-changes') {
			setDirtyState('waiting')
		}
	}, [changeHistory, setDirtyState])

	const submitChanges = useDebouncedCallback(async () => {
		const lastChange = changeHistory[changeHistory.length - 1]
		if (lastChange.type == 'save-changes') {
			return
		}

		setDirtyState('saving')
		saveChanges()
		await updateComposition(updateRequestRef.current)
		setDirtyState('clean')

		const request = updateRequestRef.current
		request.nodes = {}
		request.edges = {}
	}, 1500)

	useEffect(() => {
		if (!changeHistory.length) {
			return
		}

		addChangesToRequest()
		void submitChanges()
	}, [changeHistory, addChangesToRequest, submitChanges])

	useEffect(() => {
		if (dirtyState == 'clean') {
			return
		}

		// NOTICE: doesn't block nextjs navigation, need to persist unsaved
		// changes in localStorage... and fix conflicts i guess
		window.addEventListener('beforeunload', beforeUnloadAlertHandler)
		return () =>
			window.removeEventListener('beforeunload', beforeUnloadAlertHandler)
	}, [dirtyState])

	return <>{children}</>
}
