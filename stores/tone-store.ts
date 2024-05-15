import type { BaseContext as BaseToneContext, ToneAudioNode } from 'tone'
import { createStore } from 'zustand/vanilla'

export type ToneNodeId = string

export type ToneState = {
	context: BaseToneContext
	isAudioAvailable: boolean

	nodes: Map<ToneNodeId, ToneAudioNode>
}

export type ToneActions = {
	resumeContext: () => Promise<void>

	getNodeById: (id: ToneNodeId) => ToneAudioNode | null
	addNode: (id: ToneNodeId, node: ToneAudioNode) => void
	connect: (
		source: [ToneNodeId, number],
		target: [ToneNodeId, number],
	) => (() => void) | null
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
			get().getNodeById(id)?.dispose()

			const nodes = new Map(get().nodes)
			nodes.set(id, node)

			set({ nodes })
		},

		connect: ([sourceId, sourceSocket], [targetId, targetSocket]) => {
			const { getNodeById } = get()
			const source = getNodeById(sourceId)
			const target = getNodeById(targetId)

			if (!source || !target) {
				return null
			}

			source.connect(target, sourceSocket, targetSocket)
			return () => source.disconnect(target, sourceSocket, targetSocket)
		},

		disposeNode: id => {
			const node = get().getNodeById(id)
			if (node === null) {
				return
			}

			if (node.name == 'Destination') {
				node.disconnect()
			} else {
				node.dispose()
			}

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
