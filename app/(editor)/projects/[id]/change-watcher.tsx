'use client'

import { PropsWithChildren, useCallback, useEffect, useRef } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { useShallow } from 'zustand/react/shallow'
import { useCompositionStore } from '@/components/providers/composition-store-provider'
import { CompositionStore } from '@/stores/composition-store'
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

export default function ChangeWatcher({ children }: PropsWithChildren) {
	const {
		id: compositionId,
		changeHistory,
		saveChanges,
	} = useCompositionStore(useShallow(watchSelector))

	const updateRequestRef = useRef<CompositionUpdateRequest>({
		id: compositionId,
		nodes: {},
		edges: {},
	})

	const addChangesToRequest = useCallback(() => {
		const request = updateRequestRef.current
		const lastChange = changeHistory[changeHistory.length - 1] // TODO: watch for multiple last changes
		mergeCompositionChangeToRequest(request, lastChange)
	}, [changeHistory])

	const submitChanges = useDebouncedCallback(async () => {
		const lastChange = changeHistory[changeHistory.length - 1]
		if (lastChange.type == 'save-changes') {
			return
		}

		saveChanges()
		await updateComposition(updateRequestRef.current)

		const request = updateRequestRef.current
		request.nodes = {}
		request.edges = {}
	}, 3000)

	useEffect(() => {
		if (!changeHistory.length) {
			return
		}

		addChangesToRequest()
		void submitChanges()
	}, [changeHistory, addChangesToRequest, submitChanges])

	return <>{children}</>
}
