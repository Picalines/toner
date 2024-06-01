import type { BaseContext as BaseToneContext, ToneAudioNode } from 'tone'
import { StoreApi, create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export type ToneNodeId = string

export type ToneState = {
	context: BaseToneContext
	isAudioAvailable: boolean

	toneNodes: Map<ToneNodeId, ToneAudioNode>
}

export type ToneActions = {
	resumeContext: () => Promise<void>

	getToneNodeById: (id: ToneNodeId) => ToneAudioNode | null
	addNode: (id: ToneNodeId, node: ToneAudioNode) => void
	connect: (
		source: [ToneNodeId, number],
		target: [ToneNodeId, number],
	) => boolean
	disconnect: (
		source: [ToneNodeId, number],
		target: [ToneNodeId, number],
	) => boolean
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

		getToneNodeById: id => get().toneNodes.get(id) ?? null,

		addNode: (id, node) => {
			get().getToneNodeById(id)?.dispose()

			const nodes = new Map(get().toneNodes)
			nodes.set(id, node)

			set({ toneNodes: nodes })
		},

		connect: ([sourceId, sourceSocket], [targetId, targetSocket]) => {
			const { getToneNodeById: getNodeById } = get()
			const source = getNodeById(sourceId)
			const target = getNodeById(targetId)
			if (!source || !target) {
				return false
			}

			source.connect(target, sourceSocket, targetSocket)
			return true
		},

		disconnect: ([sourceId, sourceSocket], [targetId, targetSocket]) => {
			const { getToneNodeById: getNodeById } = get()
			const source = getNodeById(sourceId)
			const target = getNodeById(targetId)
			if (!source || !target) {
				return false
			}

			source.disconnect(target, sourceSocket, targetSocket)
			return true
		},

		disposeNode: id => {
			const node = get().getToneNodeById(id)
			if (node === null) {
				return
			}

			if (node.name == 'Destination') {
				node.disconnect()
			} else {
				node.dispose()
			}

			const nodes = new Map(get().toneNodes)
			nodes.delete(id)

			set({ toneNodes: nodes })
		},

		disposeAll: () => {
			for (const node of get().toneNodes.values()) {
				if (node.name != 'Destination') {
					node.dispose()
				}
			}

			set({ toneNodes: new Map() })
		},
	})

	return create(subscribeWithSelector(initStore))
}
