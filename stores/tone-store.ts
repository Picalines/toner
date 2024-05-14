import type { BaseContext as BaseToneContext, ToneAudioNode } from 'tone'
import { createStore } from 'zustand/vanilla'

export type ToneState = {
	context: BaseToneContext
	isAudioAvailable: boolean

	nodes: Map<string, ToneAudioNode>
}

export type ToneActions = {
	resumeContext: () => Promise<void>

	getNodeById: (id: string) => ToneAudioNode | null
	addNode: (id: string, node: ToneAudioNode) => void
	disposeNode: (id: string) => void

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

		getNodeById: id => get().nodes.get(id) ?? null,

		addNode: (id, node) => {
			if (node.name == 'Destination') {
				return
			}

			get().getNodeById(id)?.dispose()

			const nodes = new Map(get().nodes)
			nodes.set(id, node)

			set({ nodes })
		},

		disposeNode: id => {
			const node = get().getNodeById(id)
			if (node === null) {
				return
			}

			node.dispose()

			const nodes = new Map(get().nodes)
			nodes.delete(id)

			set({ nodes })
		},

		disposeAll: () => {
			for (const node of get().nodes.values()) {
				node.dispose()
			}

			set({ nodes: new Map() })
		},
	}))
}
