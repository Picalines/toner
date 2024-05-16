import type { BaseContext as BaseToneContext, ToneAudioNode } from 'tone'
import { StoreApi, create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

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

export type ToneStoreApi = ReturnType<typeof createToneStore>

export function createToneStore(initialState: ToneState) {
	const initStore = (
		set: StoreApi<ToneStore>['setState'],
		get: StoreApi<ToneStore>['getState'],
	): ToneStore => ({
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
				if (node.name != 'Destination') {
					node.dispose()
				}
			}

			set({ nodes: new Map() })
		},
	})

	return create(subscribeWithSelector(initStore))
}
