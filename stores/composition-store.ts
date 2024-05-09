import { produce } from 'immer'
import { createStore } from 'zustand/vanilla'

type ConnectionTarget = [nodeId: string, socket: number]

export type CompositionState = {
	id: number
	name: string
	description: string
	audioTree: {
		nodes: Record<string, AudioNodeState>
		connections: [sender: ConnectionTarget, receiver: ConnectionTarget][]
	}
}

export type AudioNodeState = {
	type: string
	displayName: string | null
	centerX: number
	centerY: number
	properties: Record<string, number>
}

export type CompositionActions = {
	updateInfo: (info: Readonly<{ name: string; description: string }>) => void

	addNode: (id: string, node: AudioNodeState) => void
	removeNode: (id: string) => void
	connectNode: (sender: ConnectionTarget, receiver: ConnectionTarget) => void
	disconnectNode: (sender: ConnectionTarget) => void

	setNodeProperty: (nodeId: string, property: string, value: number) => void
}

export type CompositionStore = CompositionState & CompositionActions

export function createCompositionStore(initialState: CompositionState) {
	// TODO: validate initialState

	return createStore<CompositionStore>()(set => ({
		...initialState,

		updateInfo: ({ name, description }) => set({ name, description }),

		addNode: (id, node) =>
			set(
				produce<CompositionState>(state => {
					state.audioTree.nodes[id] = node
				}),
			),

		removeNode: idToRemove =>
			set(
				produce<CompositionState>(state => {
					delete state.audioTree.nodes[idToRemove]
					state.audioTree.connections =
						state.audioTree.connections.filter(
							([[senderId], [receiverId]]) =>
								senderId == idToRemove ||
								receiverId == idToRemove,
						)
				}),
			),

		connectNode: (sender, receiver) =>
			set(
				produce<CompositionState>(state => {
					state.audioTree.connections.push([sender, receiver])
				}),
			),

		disconnectNode: ([senderId, senderSocket]) =>
			set(
				produce<CompositionState>(state => {
					const index = state.audioTree.connections.findIndex(
						([[id, socket]]) =>
							id == senderId && socket == senderSocket,
					)

					if (index >= 0) {
						state.audioTree.connections.splice(index, 1)
					}
				}),
			),

		setNodeProperty: (nodeId, property, value) =>
			set(
				produce<CompositionState>(state => {
					state.audioTree.nodes[nodeId].properties[property] = value
				}),
			),
	}))
}
