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
import { safeParseOr } from '@/lib/utils'
import {
	AudioNodeType,
	audioNodeSchemas as nodeSchemas,
} from '@/schemas/audio-node'
import {
	CompositionChange,
	compositionSchemas as compSchemas,
} from '@/schemas/composition'

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

const MAX_HISTORY_LENGTH = 100

export type CompositionActions = {
	setName: (name: string) => void
	setDescription: (description: string) => void

	getNodeById: (id: AudioNode['id']) => AudioNode | null
	renameNode: (id: AudioNode['id'], label: string) => void
	setNodeProperty: (
		id: AudioNode['id'],
		property: string,
		value: number,
	) => void

	applyNodeChanges: (changes: NodeChange<AudioNode>[]) => void
	applyEdgeChanges: (changes: EdgeChange<AudioEdge>[]) => void
	connect: (connection: Connection) => void

	saveChanges: () => void
}

export type CompositionStore = CompositionState & CompositionActions

export function createCompositionStore(initialState: CompositionState) {
	// TODO: validate initialState

	return createStore<CompositionStore>()((set, get) => {
		const addChanges = (...changes: CompositionChange[]) =>
			set({
				changeHistory: mergeChanges(get().changeHistory, ...changes),
			})

		return {
			...initialState,

			setName: name => {
				const { name: currentName } = get()
				name = safeParseOr(compSchemas.name, name, currentName)

				if (name != currentName) {
					set({ name })
					addChanges({ type: 'set-name', name })
				}
			},

			setDescription: description => {
				const { description: currentDescription } = get()
				description = safeParseOr(
					compSchemas.description,
					description,
					currentDescription,
				)

				if (description != currentDescription) {
					set({ description })
					addChanges({ type: 'set-description', description })
				}
			},

			getNodeById: id => get().nodes.get(id) ?? null,

			renameNode: (id, label) => {
				const node = get().getNodeById(id)
				if (!node) {
					return
				}

				label = safeParseOr(nodeSchemas.label, label, node.data.label)
				if (node.data.label == label) {
					return
				}

				node.data.label = label

				set({ nodes: new Map(get().nodes) })
				addChanges({
					type: 'node-rename',
					id,
					label,
				})
			},

			setNodeProperty: (id, property, value) => {
				const node = get().nodes.get(id)
				if (!node) {
					return
				}

				const safeProperty = safeParseOr(
					nodeSchemas.property,
					property,
					null,
				)
				if (safeProperty === null) {
					return
				}

				node.data.properties[safeProperty] = value

				set({ nodes: new Map(get().nodes) })
				addChanges({
					type: 'node-set-property',
					id,
					property: safeProperty,
					value,
				})
			},

			applyNodeChanges: changes => {
				const nodes = applyNodeChanges(changes, [
					...get().nodes.values(),
				])
				set({ nodes: new Map(nodes.map(node => [node.id, node])) })

				const compChanges = changes
					.map(change => nodeChangeToCompositionChange(change))
					.filter(Boolean) as CompositionChange[]

				if (compChanges.length) {
					addChanges(...compChanges)
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
				const edges = applyEdgeChanges(changes, [
					...get().edges.values(),
				])
				set({ edges: new Map(edges.map(edge => [edge.id, edge])) })

				const compChanges = changes
					.map(change => edgeChangeToCompositionChange(change))
					.filter(Boolean) as CompositionChange[]

				if (compChanges.length) {
					addChanges(...compChanges)
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

			connect: ({ source, target, sourceHandle, targetHandle }) => {
				const prevEdges = get().edges
				const newEdge: AudioEdge = { id: nanoid(), source, target }
				const edges = addEdge(newEdge, [...prevEdges.values()])

				if (edges.length == prevEdges.size) {
					return
				}

				set({ edges: new Map(edges.map(edge => [edge.id, edge])) })
				addChanges({
					type: 'edge-add',
					id: newEdge.id,
					source: [source, parseInt(sourceHandle ?? '0')],
					target: [target, parseInt(targetHandle ?? '0')],
				})
			},

			saveChanges: () => addChanges({ type: 'save-changes' }),
		}
	})
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
			source: [edge.source, parseInt(edge.sourceHandle ?? '0')],
			target: [edge.target, parseInt(edge.targetHandle ?? '0')],
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

const changeReplacer =
	<H extends CompositionChange['type'], I extends CompositionChange['type']>(
		historyType: H,
		incomingType: I,

		condition?: (
			historyChange: CompositionChange & { type: H },
			incomingChange: CompositionChange & { type: I },
		) => boolean,
	) =>
	(historyChange: CompositionChange, incomingChange: CompositionChange) => {
		return (
			historyChange.type == historyType &&
			incomingChange.type == incomingType &&
			(!condition ||
				condition(
					historyChange as CompositionChange & { type: H },
					incomingChange as CompositionChange & { type: I },
				))
		)
	}

const changeReplacers = [
	changeReplacer('save-changes', 'save-changes'),
	changeReplacer('set-name', 'set-name'),
	changeReplacer('set-description', 'set-description'),
	changeReplacer('node-move', 'node-move', (a, b) => a.id == b.id),
	changeReplacer('node-rename', 'node-rename', (a, b) => a.id == b.id),
	changeReplacer(
		'node-set-property',
		'node-set-property',
		(a, b) => a.id == b.id && a.property == b.property,
	),
]

function mergeChanges(
	changeHistory: CompositionChange[],
	...newChanges: CompositionChange[]
): CompositionChange[] {
	if (!changeHistory.length) {
		return newChanges
	}

	newChanges = newChanges.flatMap(c => {
		const pc = safeParseOr(compSchemas.change, c, null)

		if (!pc) {
			console.warn('invalid composition change', c)
			return []
		}

		return [pc]
	})

	if (!newChanges.length) {
		return changeHistory
	}

	let historySlice = changeHistory

	if (newChanges.length == 1) {
		const lastChange = changeHistory[changeHistory.length - 1]
		const incomingChange = newChanges[0]

		if (changeReplacers.some(c => c(lastChange, incomingChange))) {
			historySlice = changeHistory.slice(0, changeHistory.length - 1)
		}
	}

	if (historySlice.length > MAX_HISTORY_LENGTH) {
		// TODO: this might throw away very old & unsaved changes
		// ...if you're willing to spam 100+ changes in a row
		historySlice = historySlice.slice(
			historySlice.length - MAX_HISTORY_LENGTH,
			historySlice.length,
		)
	}

	return historySlice.concat(newChanges)
}
