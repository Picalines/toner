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
import { StoreApi, create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { capitalize, safeParseOr, zodIs } from '@/lib/utils'
import {
	AudioEdgeId,
	AudioNodeId,
	AudioNodeType,
	audioNodeDefinitions,
	audioNodeSchemas as nodeSchemas,
} from '@/schemas/audio-node'
import {
	CompositionChange,
	CompositionChangeType,
	CompositionId,
	compositionSchemas as compSchemas,
} from '@/schemas/composition'

export type AudioNode = Node<
	{
		type: AudioNodeType
		label: string
		properties: Record<string, number>
	},
	'audio'
>

export type AudioEdge = Edge<{}>

export type CompositionState = {
	id: CompositionId

	changeHistory: CompositionChange[]

	name: string
	description: string

	nodes: Map<AudioNodeId, AudioNode>
	edges: Map<AudioNodeId, AudioEdge>

	selectedNodeId: AudioNodeId | null
	selectedEdgeId: AudioEdgeId | null
}

const MAX_HISTORY_LENGTH = 100

export type CompositionActions = {
	setName: (name: string) => void
	setDescription: (description: string) => void

	getNodeById: (id: AudioNodeId) => AudioNode | null
	getEdgeById: (id: AudioEdgeId) => AudioEdge | null

	createNode: (type: AudioNodeType, position: [number, number]) => AudioNodeId
	renameNode: (id: AudioNodeId, label: string) => void
	setNodeProperty: (id: AudioNodeId, property: string, value: number) => void

	applyNodeChanges: (changes: NodeChange<AudioNode>[]) => void
	applyEdgeChanges: (changes: EdgeChange<AudioEdge>[]) => void
	connect: (connection: Connection) => void

	saveChanges: () => void
}

export type CompositionStore = CompositionState & CompositionActions

export type CompositionStoreApi = ReturnType<typeof createCompositionStore>

export function createCompositionStore(initialState: CompositionState) {
	// TODO: validate initialState

	const initStore = (
		set: StoreApi<CompositionStore>['setState'],
		get: StoreApi<CompositionStore>['getState'],
	): CompositionStore => {
		const addChanges = (...changes: CompositionChange[]) => {
			let changeHistory = get().changeHistory
			for (const change of changes) {
				changeHistory = mergeCompositionChange(changeHistory, change)
				set({ changeHistory })
			}
		}

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

			getEdgeById: id => get().edges.get(id) ?? null,

			createNode: (type, position) => {
				const properties = Object.fromEntries(
					Object.entries(audioNodeDefinitions[type].properties).map(
						([key, { default: value }]) => [key, value],
					),
				)

				const id = nanoid()
				const newNode: AudioNode = {
					type: 'audio',
					id,
					position: { x: position[0], y: position[1] },
					data: { type, label: capitalize(type), properties },
				}

				get().applyNodeChanges([{ type: 'add', item: newNode }])
				return id
			},

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
				const compChanges = changes
					.map(change => nodeChangeToCompositionChange(get(), change))
					.filter(Boolean) as CompositionChange[]

				const nodes = applyNodeChanges(changes, [
					...get().nodes.values(),
				])
				set({ nodes: new Map(nodes.map(node => [node.id, node])) })

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
				const compChanges = changes
					.map(change => edgeChangeToCompositionChange(get(), change))
					.filter(Boolean) as CompositionChange[]

				const edges = applyEdgeChanges(changes, [
					...get().edges.values(),
				])
				set({ edges: new Map(edges.map(edge => [edge.id, edge])) })

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
	}

	return create(subscribeWithSelector(initStore))
}

function nodeChangeToCompositionChange(
	{ getNodeById }: CompositionStore,
	change: NodeChange<AudioNode>,
): CompositionChange | null {
	switch (change.type) {
		case 'add': {
			const node = change.item
			if (node.type != 'audio' || getNodeById(node.id) !== null) {
				break
			}

			return {
				type: 'node-add',
				id: node.id,
				label: node.data.label,
				nodeType: node.data.type,
				position: [node.position.x, node.position.y],
				properties: { ...node.data.properties },
			}
		}

		case 'remove': {
			if (!getNodeById(change.id)) {
				break
			}

			return {
				type: 'node-remove',
				id: change.id,
			}
		}

		case 'position': {
			if (!change.position || change.dragging) {
				break
			}

			const { x, y } = change.position
			return {
				type: 'node-move',
				id: change.id,
				position: [x, y],
			}
		}
	}

	return null
}

function edgeChangeToCompositionChange(
	{ getNodeById, getEdgeById }: CompositionStore,
	change: EdgeChange<AudioEdge>,
): CompositionChange | null {
	switch (change.type) {
		case 'add': {
			const {
				item: { id, source, target, sourceHandle, targetHandle },
			} = change

			if (
				getEdgeById(id) ||
				!getNodeById(source) ||
				!getNodeById(target)
			) {
				break
			}

			return {
				type: 'edge-add',
				id,
				source: [source, parseInt(sourceHandle ?? '0')],
				target: [target, parseInt(targetHandle ?? '0')],
			}
		}

		case 'remove': {
			const { id } = change

			if (!getEdgeById(id)) {
				break
			}

			return { type: 'edge-remove', id }
		}
	}

	return null
}

function compChangeIs<T extends CompositionChangeType>(
	change: CompositionChange,
	changeType: T,
): change is CompositionChange<T> {
	return change.type == changeType
}

function changeReplacer<
	H extends CompositionChangeType,
	I extends CompositionChangeType,
>(
	historyType: H,
	incomingType: I,
	condition?: (
		historyChange: CompositionChange<H>,
		incomingChange: CompositionChange<I>,
	) => boolean,
) {
	return (
		historyChange: CompositionChange,
		incomingChange: CompositionChange,
	) => {
		return (
			compChangeIs(historyChange, historyType) &&
			compChangeIs(incomingChange, incomingType) &&
			(!condition || condition(historyChange, incomingChange))
		)
	}
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

function mergeCompositionChange(
	changeHistory: CompositionChange[],
	newChange: CompositionChange,
): CompositionChange[] {
	if (!zodIs(compSchemas.change, newChange)) {
		console.warn('invalid composition change', newChange)
		return changeHistory
	}

	if (!changeHistory.length) {
		return [newChange]
	}

	let historySlice = changeHistory

	const lastChange = changeHistory[changeHistory.length - 1]

	if (changeReplacers.some(c => c(lastChange, newChange))) {
		historySlice = changeHistory.slice(0, changeHistory.length - 1)
	}

	if (historySlice.length > MAX_HISTORY_LENGTH) {
		// TODO: this might throw away very old & unsaved changes
		// ...if you're willing to spam 100+ changes in a row
		historySlice = historySlice.slice(
			historySlice.length - MAX_HISTORY_LENGTH,
			historySlice.length,
		)
	}

	return historySlice.concat(newChange)
}
