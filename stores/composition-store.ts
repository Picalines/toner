import { produce } from 'immer'
import { createStore } from 'zustand/vanilla'

export type CompositionState = {
	id: number
	name: string
	description: string
}

export type CompositionActions = {
	updateInfo: (info: Readonly<{ name: string; description: string }>) => void
}

export type CompositionStore = CompositionState & CompositionActions

export function createCompositionStore(initialState: CompositionState) {
	return createStore<CompositionStore>()(set => ({
		...initialState,
		updateInfo: ({ name, description }) =>
			set(
				produce<CompositionState>(state => {
					state.name = name
					state.description = description
				}),
			),
	}))
}
