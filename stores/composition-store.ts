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
import { shallow } from 'zustand/shallow'
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
import { MusicKeyId, MusicLayerId, musicSchemas } from '@/schemas/music'

export type AudioNode = Node<
	{
		type: AudioNodeType
		label: string
		properties: Record<string, number>
	},
	'audio'
>

export type AudioEdge = Edge<{}>

export type MusicLayer = {
	id: MusicLayerId
	name: string
}

export type MusicKey = {
	id: MusicKeyId
	layerId: MusicLayerId
	instrumentId: AudioNodeId
	note: number
	time: number
	duration: number
	velocity: number
}

export type CompositionState = {
	id: CompositionId

	changeHistory: CompositionChange[]

	name: string
	description: string

	nodes: Map<AudioNodeId, AudioNode>
	edges: Map<AudioNodeId, AudioEdge>

	musicLayers: Map<MusicLayerId, MusicLayer>
	musicKeys: Map<MusicKeyId, MusicKey>

	selectedNodeId: AudioNodeId | null // TODO: move selected state to editor store
	selectedEdgeId: AudioEdgeId | null
}

const MAX_HISTORY_LENGTH = 100

export type CompositionActions = {
	setName: (name: string) => void
	setDescription: (description: string) => void

	saveChanges: () => void

	getNodeById: (id: AudioNodeId) => AudioNode | null
	getEdgeById: (id: AudioEdgeId) => AudioEdge | null
	getMusicLayerById: (id: MusicLayerId) => MusicLayer | null
	getMusicKeyById: (id: MusicKeyId) => MusicKey | null

	createNode: (type: AudioNodeType, position: [number, number]) => AudioNodeId
	renameNode: (id: AudioNodeId, label: string) => void
	setNodeProperty: (id: AudioNodeId, property: string, value: number) => void

	applyNodeChanges: (changes: NodeChange<AudioNode>[]) => void
	applyEdgeChanges: (changes: EdgeChange<AudioEdge>[]) => void
	connect: (connection: Connection) => void

	createMusicLayer: (name: string) => MusicLayerId | null
	renameMusicLayer: (id: MusicLayerId, name: string) => void
	removeMusicLayer: (id: MusicLayerId) => boolean
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
					addChanges({ type: 'update', name })
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
					addChanges({ type: 'update', description })
				}
			},

			saveChanges: () => addChanges({ type: 'save-changes' }),

			getNodeById: id => get().nodes.get(id) ?? null,

			getEdgeById: id => get().edges.get(id) ?? null,

			getMusicLayerById: id => get().musicLayers.get(id) ?? null,

			getMusicKeyById: id => get().musicKeys.get(id) ?? null,

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
				addChanges({ type: 'node-update', id, label })
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
					type: 'node-update',
					id,
					properties: { [safeProperty]: value },
				})
			},

			applyNodeChanges: changes => {
				const prevState = get()
				const compChanges = changes
					.map(change =>
						nodeChangeToCompositionChange(prevState, change),
					)
					.filter(Boolean) as CompositionChange[]

				const nodes: CompositionState['nodes'] = new Map()
				for (const changedNode of applyNodeChanges(
					changes,
					Array.from(prevState.nodes.values()),
				)) {
					nodes.set(changedNode.id, changedNode)
				}

				set({ nodes })

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
				} else if (
					prevState.selectedNodeId &&
					!nodes.has(prevState.selectedNodeId)
				) {
					set({ selectedNodeId: null })
				}
			},

			applyEdgeChanges: changes => {
				const prevState = get()
				const compChanges = changes
					.map(change =>
						edgeChangeToCompositionChange(prevState, change),
					)
					.filter(Boolean) as CompositionChange[]

				const edges: CompositionState['edges'] = new Map()
				for (const changedEdge of applyEdgeChanges(
					changes,
					Array.from(prevState.edges.values()),
				)) {
					edges.set(changedEdge.id, changedEdge)
				}

				set({ edges })

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
				} else if (
					prevState.selectedEdgeId &&
					!edges.has(prevState.selectedEdgeId)
				) {
					set({ selectedEdgeId: null })
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

			createMusicLayer: name => {
				if (!zodIs(musicSchemas.layer.name, name)) {
					return null
				}

				const id = nanoid()
				const newLayer: MusicLayer = { id, name }

				const musicLayers = new Map(get().musicLayers)
				musicLayers.set(id, newLayer)
				set({ musicLayers })
				addChanges({ type: 'music-layer-add', id, name })

				return id
			},

			renameMusicLayer: (id, name) => {
				if (!zodIs(musicSchemas.layer.name, name)) {
					return
				}

				const musicLayers = get().musicLayers
				const musicLayer = musicLayers.get(id)
				if (!musicLayer) {
					return
				}

				musicLayer.name = name
				set({ musicLayers: new Map(musicLayers) })
				addChanges({ type: 'music-layer-update', id, name })
			},

			removeMusicLayer: id => {
				const musicLayers = get().musicLayers
				if (musicLayers.size <= 1 || !musicLayers.delete(id)) {
					return false
				}

				const musicKeys = get().musicKeys
				const oldKeysSize = musicKeys.size
				for (const musicKey of musicKeys.values()) {
					if (musicKey.layerId == id) {
						// NOTICE: don't generate music-key-remove chanes
						musicKeys.delete(musicKey.id)
					}
				}

				if (oldKeysSize != musicKeys.size) {
					set({ musicKeys: new Map(musicKeys) })
				}

				set({ musicLayers: new Map(musicLayers) })

				addChanges({ type: 'music-layer-remove', id })
				return true
			},
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
				type: 'node-update',
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

const shallowKeys = <T extends {}>(a: T, b: T): boolean =>
	shallow(Object.keys(a), Object.keys(b))

const changeReplacers = [
	changeReplacer('save-changes', 'save-changes'),
	changeReplacer('update', 'update', shallowKeys),
	changeReplacer(
		'node-update',
		'node-update',
		(a, b) =>
			shallowKeys(a, b) &&
			shallowKeys(a.properties ?? {}, b.properties ?? {}),
	),
	changeReplacer('music-layer-update', 'music-layer-update', shallowKeys),
	changeReplacer('music-key-update', 'music-key-update', shallowKeys),
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
