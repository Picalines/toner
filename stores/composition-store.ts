import {
	Connection,
	type Edge,
	type EdgeChange,
	EdgeSelectionChange,
	type Node,
	type NodeChange,
	NodeSelectionChange,
	addEdge,
	applyEdgeChanges,
	applyNodeChanges,
} from '@xyflow/react'
import { createStore } from 'zustand/vanilla'
import { AudioNodeType } from '@/schemas/nodes'

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

	nodes: Map<AudioNode['id'], AudioNode>
	edges: Map<AudioNode['id'], AudioEdge>

	selectedNodeId: AudioNode['id'] | null
	selectedEdgeId: AudioEdge['id'] | null
}

export type CompositionActions = {
	updateInfo: (info: Readonly<{ name: string; description: string }>) => void

	getNodeById: (id: AudioNode['id']) => AudioNode | null
	applyNodeChanges: (changes: NodeChange<AudioNode>[]) => void
	applyEdgeChanges: (changes: EdgeChange<AudioEdge>[]) => void
	connect: (connection: Connection) => void

	renameNode: (id: AudioNode['id'], displayName: string) => void
	setNodeProperties: (
		id: AudioNode['id'],
		properties: Record<string, number>,
	) => void
}

export type CompositionStore = CompositionState & CompositionActions

export function createCompositionStore(initialState: CompositionState) {
	// TODO: validate initialState

	return createStore<CompositionStore>()((set, get) => ({
		...initialState,

		updateInfo: ({ name, description }) => set({ name, description }),

		getNodeById: id => get().nodes.get(id) ?? null,

		applyNodeChanges: changes => {
			const nodes = applyNodeChanges(changes, [...get().nodes.values()])
			set({ nodes: new Map(nodes.map(node => [node.id, node])) })

			const selectChanges = changes.filter(
				(c): c is NodeSelectionChange => c.type == 'select',
			)

			if (selectChanges.length) {
				set({
					selectedNodeId:
						selectChanges.find(c => c.selected)?.id ?? null,
				})
			}
		},

		applyEdgeChanges: changes => {
			const edges = applyEdgeChanges(changes, [...get().edges.values()])
			set({ edges: new Map(edges.map(edge => [edge.id, edge])) })

			const selectChanges = changes.filter(
				(c): c is EdgeSelectionChange => c.type == 'select',
			)

			if (selectChanges.length) {
				set({
					selectedEdgeId:
						selectChanges.find(c => c.selected)?.id ?? null,
				})
			}
		},

		connect: connection => {
			const edges = addEdge(connection, [...get().edges.values()])
			set({ edges: new Map(edges.map(edge => [edge.id, edge])) })
		},

		renameNode: (id, displayName) => {
			const { nodes } = get()
			const node = nodes.get(id)!
			node.data.label = displayName
			set({ nodes: new Map(nodes) })
		},

		setNodeProperties: (id, properties) => {
			const { nodes } = get()
			const node = nodes.get(id)!
			Object.assign(node.data.properties, properties)
			set({ nodes: new Map(nodes) })
		},
	}))
}
