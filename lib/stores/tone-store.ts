import { nanoid } from 'nanoid'
import type {
	BaseContext as BaseToneContext,
	ToneAudioNode,
	ToneEvent,
} from 'tone'
import type { TransportClass as ToneTransport } from 'tone/build/esm/core/clock/Transport'
import { type StoreApi, create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export type ToneNodeId = string

export type ToneConnectionId = string

export type ToneEventId = string

type ToneConnection = {
	id: ToneConnectionId
	source: [ToneNodeId, number]
	target: [ToneNodeId, number]
}

export type ToneState = {
	context: BaseToneContext
	transport: ToneTransport
	isAudioAvailable: boolean

	toneNodes: Map<ToneNodeId, ToneAudioNode>
	toneConnections: Map<ToneConnectionId, ToneConnection>
	toneEvents: Map<ToneEventId, ToneEvent>
}

export type ToneActions = {
	resumeContext: () => Promise<void>

	getToneNodeById: (id: ToneNodeId) => ToneAudioNode | null
	getToneConnectionById: (id: ToneNodeId) => Readonly<ToneConnection> | null
	getToneEventById: (id: ToneEventId) => ToneEvent | null

	addToneNode: (node: ToneAudioNode, id?: ToneNodeId) => ToneNodeId | null

	connect: (
		source: [ToneNodeId, number],
		target: [ToneNodeId, number],
		id?: ToneConnectionId,
	) => ToneConnectionId | null
	disconnect: (id: ToneConnectionId) => boolean

	addToneEvent: (event: ToneEvent, id?: string) => ToneEventId | null

	disposeNode: (id: ToneNodeId) => void
	disposeEvent: (id: ToneEventId) => void
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

		getToneConnectionById: id => get().toneConnections.get(id) ?? null,

		getToneEventById: id => get().toneEvents.get(id) ?? null,

		addToneNode: (node, id) => {
			const { getToneNodeById } = get()
			id ??= nanoid()

			if (getToneNodeById(id)) {
				return null
			}

			const toneNodes = new Map(get().toneNodes)
			toneNodes.set(id, node)

			set({ toneNodes })
			return id
		},

		connect: ([sourceId, sourceSocket], [targetId, targetSocket], id) => {
			const { getToneNodeById, getToneConnectionById } = get()
			const source = getToneNodeById(sourceId)
			const target = getToneNodeById(targetId)
			if (!source || !target) {
				return null
			}

			id ??= nanoid()
			if (getToneConnectionById(id)) {
				return null
			}

			source.connect(target, sourceSocket, targetSocket)

			const toneConnections = new Map(get().toneConnections)
			toneConnections.set(id, {
				id,
				source: [sourceId, sourceSocket],
				target: [targetId, targetSocket],
			})

			set({ toneConnections })
			return id
		},

		disconnect: id => {
			const { getToneConnectionById, getToneNodeById } = get()
			const connection = getToneConnectionById(id)
			if (!connection) {
				return false
			}

			const {
				source: [sourceId, sourceSocket],
				target: [targetId, targetSocket],
			} = connection

			const source = getToneNodeById(sourceId)
			const target = getToneNodeById(targetId)
			if (source && target) {
				source.disconnect(target, sourceSocket, targetSocket)
			}

			const toneConnections = new Map(get().toneConnections)
			toneConnections.delete(id)
			set({ toneConnections })
			return true
		},

		addToneEvent: (event, id) => {
			const { getToneEventById } = get()
			id ??= nanoid()
			if (getToneEventById(id)) {
				return null
			}

			const toneEvents = new Map(get().toneEvents)
			toneEvents.set(id, event)
			set({ toneEvents })

			return id
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

			const toneNodes = new Map(get().toneNodes)
			const toneConnections = new Map(get().toneConnections)
			toneNodes.delete(id)

			for (const oldConnection of get().toneConnections) {
				const [
					connectionId,
					{
						source: [sourceId],
						target: [targetId],
					},
				] = oldConnection

				if (sourceId === id || targetId === id) {
					toneConnections.delete(connectionId)
				}
			}

			set({ toneNodes, toneConnections })
		},

		disposeEvent: id => {
			const { getToneEventById } = get()
			const event = getToneEventById(id)
			if (!event) {
				return
			}

			event.dispose()

			const toneEvents = new Map(get().toneEvents)
			toneEvents.delete(id)
			set({ toneEvents })
		},

		disposeAll: () => {
			for (const node of get().toneNodes.values()) {
				if (node.name != 'Destination') {
					node.dispose()
				}
			}

			for (const event of get().toneEvents.values()) {
				event.dispose()
			}

			set({
				toneNodes: new Map(),
				toneConnections: new Map(),
				toneEvents: new Map(),
			})
		},
	})

	return create(subscribeWithSelector(initStore))
}
