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
import { nanoid } from 'nanoid'
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

	changeHistory: CompositionChange[]

	name: string
	description: string

	nodes: Map<AudioNode['id'], AudioNode>
	edges: Map<AudioNode['id'], AudioEdge>

	selectedNodeId: AudioNode['id'] | null
	selectedEdgeId: AudioEdge['id'] | null
}

export type CompositionChange =
	| {
			type: 'node-add'
			id: AudioNode['id']
			position: [x: number, y: number]
			nodeType: AudioNodeType
			label: string
			properties: Record<string, number>
	  }
	| {
			type: 'node-move'
			id: AudioNode['id']
			position: [x: number, y: number]
	  }
	| {
			type: 'node-rename'
			id: AudioNode['id']
			label: AudioNode['data']['label']
	  }
	| {
			type: 'node-set-property'
			id: AudioNode['id']
			properties: Record<string, number>
	  }
	| {
			type: 'node-remove'
			id: AudioNode['id']
	  }
	| {
			type: 'edge-add'
			id: AudioEdge['id']
			sender: AudioNode['id']
			receiver: AudioNode['id']
	  }
	| {
			type: 'edge-remove'
			id: AudioEdge['id']
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

			const newCompChanges = changes
				.map(change => nodeChangeToCompositionChange(change))
				.filter(Boolean) as CompositionChange[]

			if (newCompChanges.length) {
				set({
					changeHistory: [...get().changeHistory, ...newCompChanges],
				})
			}

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

			const newCompChanges = changes
				.map(change => edgeChangeToCompositionChange(change))
				.filter(Boolean) as CompositionChange[]

			if (newCompChanges.length) {
				set({
					changeHistory: [...get().changeHistory, ...newCompChanges],
				})
			}

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

		connect: ({ source, target }) => {
			const newEdge: AudioEdge = { id: nanoid(), source, target }
			const edges = addEdge(newEdge, [...get().edges.values()])

			set({
				edges: new Map(edges.map(edge => [edge.id, edge])),
				changeHistory: [
					...get().changeHistory,
					{
						type: 'edge-add',
						id: newEdge.id,
						sender: source,
						receiver: target,
					},
				],
			})
		},

		renameNode: (id, displayName) => {
			const { nodes, changeHistory } = get()
			const node = nodes.get(id)!
			node.data.label = displayName

			set({
				nodes: new Map(nodes),
				changeHistory: [
					...changeHistory,
					{
						type: 'node-rename',
						id,
						label: displayName,
					},
				],
			})
		},

		setNodeProperties: (id, properties) => {
			const { nodes, changeHistory } = get()
			const node = nodes.get(id)!
			Object.assign(node.data.properties, properties)

			set({
				nodes: new Map(nodes),
				changeHistory: [
					...changeHistory,
					{
						type: 'node-set-property',
						id,
						properties: { ...properties },
					},
				],
			})
		},
	}))
}

function nodeChangeToCompositionChange(
	change: NodeChange<AudioNode>,
): CompositionChange | null {
	if (change.type == 'add') {
		const node = change.item
		return {
			type: 'node-add',
			id: node.id,
			label: node.data.label,
			nodeType: node.data.type,
			position: [node.position.x, node.position.y],
			properties: { ...node.data.properties },
		}
	}

	if (change.type == 'remove') {
		return {
			type: 'node-remove',
			id: change.id,
		}
	}

	if (change.type == 'position' && change.position && !change.dragging) {
		const { x, y } = change.position
		return {
			type: 'node-move',
			id: change.id,
			position: [x, y],
		}
	}

	return null
}

function edgeChangeToCompositionChange(
	change: EdgeChange<AudioEdge>,
): CompositionChange | null {
	if (change.type == 'add') {
		const edge = change.item
		return {
			type: 'edge-add',
			id: edge.id,
			sender: edge.source,
			receiver: edge.target,
		}
	}

	if (change.type == 'remove') {
		return {
			type: 'edge-remove',
			id: change.id,
		}
	}

	return null
}
