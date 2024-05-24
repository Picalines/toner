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

	name: string
	description: string

	audioNodes: Map<AudioNodeId, AudioNode>
	audioEdges: Map<AudioNodeId, AudioEdge>

	musicLayers: Map<MusicLayerId, MusicLayer>
	musicKeys: Map<MusicKeyId, MusicKey>
}

export type CompositionActions = {
	setName: (name: string) => void
	setDescription: (description: string) => void

	getNodeById: (id: AudioNodeId) => AudioNode | null
	getEdgeById: (id: AudioEdgeId) => AudioEdge | null
	getMusicLayerById: (id: MusicLayerId) => MusicLayer | null
	getMusicKeyById: (id: MusicKeyId) => MusicKey | null

	createNode: (type: AudioNodeType, position: [number, number]) => AudioNode
	renameNode: (id: AudioNodeId, label: string) => void
	setNodeProperty: (id: AudioNodeId, property: string, value: number) => void

	applyNodeChanges: (changes: NodeChange<AudioNode>[]) => void
	applyEdgeChanges: (changes: EdgeChange<AudioEdge>[]) => void
	connect: (connection: Connection) => AudioEdge | null

	createMusicLayer: (name: string) => MusicLayer | null
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
		return {
			...initialState,

			setName: name => {
				const { name: currentName } = get()
				name = safeParseOr(compSchemas.name, name, currentName)

				if (name != currentName) {
					set({ name })
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
				}
			},

			getNodeById: id => get().audioNodes.get(id) ?? null,
			getEdgeById: id => get().audioEdges.get(id) ?? null,
			getMusicLayerById: id => get().musicLayers.get(id) ?? null,
			getMusicKeyById: id => get().musicKeys.get(id) ?? null,

			createNode: (type, position) => {
				const properties = Object.fromEntries(
					Object.entries(audioNodeDefinitions[type].properties).map(
						([key, { default: value }]) => [key, value],
					),
				)

				const newNode: AudioNode = {
					type: 'audio',
					id: nanoid(),
					position: { x: position[0], y: position[1] },
					data: { type, label: capitalize(type), properties },
				}

				get().applyNodeChanges([{ type: 'add', item: newNode }])
				return newNode
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

				set({ audioNodes: new Map(get().audioNodes) })
			},

			setNodeProperty: (id, property, value) => {
				const node = get().audioNodes.get(id)
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

				set({ audioNodes: new Map(get().audioNodes) })
			},

			applyNodeChanges: changes => {
				const nodes: CompositionState['audioNodes'] = new Map()
				for (const changedNode of applyNodeChanges(
					changes,
					Array.from(get().audioNodes.values()),
				)) {
					nodes.set(changedNode.id, changedNode)
				}

				set({ audioNodes: nodes })
			},

			applyEdgeChanges: changes => {
				const edges: CompositionState['audioEdges'] = new Map()
				for (const changedEdge of applyEdgeChanges(
					changes,
					Array.from(get().audioEdges.values()),
				)) {
					edges.set(changedEdge.id, changedEdge)
				}

				set({ audioEdges: edges })
			},

			connect: ({ source, target, sourceHandle, targetHandle }) => {
				const prevEdges = get().audioEdges
				const newEdge: AudioEdge = {
					id: nanoid(),
					source,
					target,
					sourceHandle,
					targetHandle,
				}
				const edges = addEdge(newEdge, [...prevEdges.values()])

				if (edges.length == prevEdges.size) {
					return null
				}

				set({ audioEdges: new Map(edges.map(edge => [edge.id, edge])) })
				return newEdge
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
				return newLayer
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
						// NOTICE: don't generate music-key-remove changes
						musicKeys.delete(musicKey.id)
					}
				}

				if (oldKeysSize != musicKeys.size) {
					set({ musicKeys: new Map(musicKeys) })
				}

				set({ musicLayers: new Map(musicLayers) })
				return true
			},
		}
	}

	return create(subscribeWithSelector(initStore))
}
