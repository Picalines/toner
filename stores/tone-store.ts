import type { BaseContext as BaseToneContext, ToneAudioNode } from 'tone'
import { createStore } from 'zustand/vanilla'

export type ToneState = {
	context: BaseToneContext
	isAudioAvailable: boolean

	nodes: ToneAudioNode[]
}

export type ToneActions = {
	resumeContext: () => Promise<void>

	addNode: (node: ToneAudioNode) => void
	disposeNode: (node: ToneAudioNode) => void
	disposeAll: () => void
}

export type ToneStore = ToneState & ToneActions

export function createToneStore(initialState: ToneState) {
	return createStore<ToneStore>()((set, get) => ({
		...initialState,

		resumeContext: async () => {
			await get().context.resume()
			set({ isAudioAvailable: true })
		},

		addNode: node => {
			if (node.name == 'Destination') {
				return
			}

			set({ nodes: [...get().nodes, node] })
		},

		disposeNode: node => {
			node.dispose()
			set({ nodes: get().nodes.filter(n => n !== node) })
		},

		disposeAll: () => {
			for (const node of get().nodes) {
				node.dispose()
			}

			set({ nodes: [] })
		},
	}))
}
