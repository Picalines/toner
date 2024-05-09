import {
	Connection,
	type Edge,
	type EdgeChange,
	type Node,
	type NodeChange,
	addEdge,
	applyEdgeChanges,
	applyNodeChanges,
} from '@xyflow/react'
import { createStore } from 'zustand/vanilla'

export type AudioNode = Node<{
	label: string
	properties: Record<string, number>
}>

export type AudioEdge = Edge<{}>

export type CompositionState = {
	id: number
	name: string
	description: string

	nodes: AudioNode[]
	edges: AudioEdge[]
}

export type CompositionActions = {
	updateInfo: (info: Readonly<{ name: string; description: string }>) => void

	applyNodeChanges: (changes: NodeChange<AudioNode>[]) => void
	applyEdgeChanges: (changes: EdgeChange<AudioEdge>[]) => void
	connect: (connection: Connection) => void
}

export type CompositionStore = CompositionState & CompositionActions

export function createCompositionStore(initialState: CompositionState) {
	// TODO: validate initialState

	return createStore<CompositionStore>()((set, get) => ({
		...initialState,

		updateInfo: ({ name, description }) => set({ name, description }),

		applyNodeChanges: changes =>
			set({ nodes: applyNodeChanges(changes, get().nodes) }),

		applyEdgeChanges: changes =>
			set({ edges: applyEdgeChanges(changes, get().edges) }),

		connect: connection => set({ edges: addEdge(connection, get().edges) }),
	}))
}
