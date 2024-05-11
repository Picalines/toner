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
import { AudioNodeType, audioNodeSchemas } from '@/schemas/nodes'

export type AudioNode = Node<{
	type: AudioNodeType
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

	lastSelectedNode: AudioNode | null
	lastSelectedEdge: AudioEdge | null
	lastSelectedInstrument: AudioNode | null
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

		applyNodeChanges: changes => {
			const prevState = get()
			const nodes = applyNodeChanges(changes, prevState.nodes)

			const selectedNode = changes.reduce(
				(s, c) =>
					c.type == 'select' && c.selected
						? nodes.find(n => n.id == c.id) ?? null
						: s,
				prevState.lastSelectedNode,
			)

			const selectedInstrument =
				selectedNode &&
				audioNodeSchemas[selectedNode.data.type].group == 'instrument'
					? selectedNode
					: prevState.lastSelectedInstrument

			set({
				nodes,
				lastSelectedNode: selectedNode,
				lastSelectedInstrument: selectedInstrument,
			})
		},

		applyEdgeChanges: changes => {
			const edges = applyEdgeChanges(changes, get().edges)

			let lastSelectedEdge = get().lastSelectedEdge

			for (const change of changes) {
				if (change.type == 'select') {
					lastSelectedEdge = change.selected
						? edges.find(e => e.id == change.id) ?? null
						: lastSelectedEdge
				}
			}

			set({ edges, lastSelectedEdge })
		},

		connect: connection => set({ edges: addEdge(connection, get().edges) }),
	}))
}
