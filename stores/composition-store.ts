import type { Connection, EdgeChange, NodeChange } from '@xyflow/react'
import { nanoid } from 'nanoid'
import { StoreApi, create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { capitalize, safeParseOr, someIter, zodIs } from '@/lib/utils'
import {
	AudioEdge,
	AudioEdgeId,
	AudioNode,
	AudioNodeId,
	AudioNodeType,
	audioNodeDefinitions,
	audioNodeSchemas,
	audioNodeSchemas as nodeSchemas,
} from '@/schemas/audio-node'
import {
	CompositionId,
	compositionSchemas as compSchemas,
} from '@/schemas/composition'
import { MusicKeyId, MusicLayerId, musicSchemas } from '@/schemas/music'
import {
	AudioFlowEdge,
	AudioFlowNode,
} from '@/components/editor/audio-node-flow'

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

	applyNodeChanges: (changes: NodeChange<AudioFlowNode>[]) => void
	applyEdgeChanges: (changes: EdgeChange<AudioFlowEdge>[]) => void
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
					id: nanoid(),
					type,
					label: capitalize(type),
					position,
					properties,
				}

				const audioNodes = new Map(get().audioNodes)
				audioNodes.set(newNode.id, newNode)
				set({ audioNodes })

				return newNode
			},

			renameNode: (id, label) => {
				const node = get().getNodeById(id)
				if (!node) {
					return
				}

				label = safeParseOr(nodeSchemas.label, label, node.label)
				if (node.label == label) {
					return
				}

				node.label = label

				set({ audioNodes: new Map(get().audioNodes) })
			},

			setNodeProperty: (id, property, value) => {
				const node = get().audioNodes.get(id)
				if (!node) {
					return
				}

				const safeProperty = safeParseOr(
					nodeSchemas.propertyKey,
					property,
					null,
				)
				if (safeProperty === null) {
					return
				}

				node.properties[safeProperty] = value

				set({ audioNodes: new Map(get().audioNodes) })
			},

			applyNodeChanges: changes => {
				if (!changes.length) {
					return
				}

				const audioNodes = new Map(get().audioNodes)
				let changed = false

				for (const change of changes) {
					switch (change.type) {
						case 'remove': {
							audioNodes.delete(change.id)
							changed = true
							break
						}

						case 'position': {
							if (!change.position) {
								break
							}

							const node = audioNodes.get(change.id)
							if (node) {
								const { x, y } = change.position
								audioNodes.set(change.id, {
									...node,
									position: [x, y],
								})
								changed = true
							}

							break
						}
					}
				}

				if (changed) {
					set({ audioNodes })
				}
			},

			applyEdgeChanges: changes => {
				if (!changes.length) {
					return
				}

				const audioEdges = new Map(get().audioEdges)
				let changed = false

				for (const change of changes) {
					switch (change.type) {
						case 'remove': {
							audioEdges.delete(change.id)
							changed = true
							break
						}
					}
				}

				if (changed) {
					set({ audioEdges })
				}
			},

			connect: connection => {
				const { source, target, sourceHandle, targetHandle } =
					connection

				const sourceSocket = safeParseOr(
					audioNodeSchemas.socketId,
					parseInt(sourceHandle ?? '0'),
					null,
				)

				const targetSocket = safeParseOr(
					audioNodeSchemas.socketId,
					parseInt(targetHandle ?? '0'),
					null,
				)

				if (sourceSocket === null || targetSocket === null) {
					return null
				}

				let { audioEdges } = get()

				const edgeExists = someIter(
					audioEdges.values(),
					existingEdge =>
						existingEdge.source === source &&
						existingEdge.target == target &&
						existingEdge.sourceSocket == sourceSocket &&
						existingEdge.targetSocket == targetSocket,
				)

				if (edgeExists) {
					return null
				}

				const newEdge: AudioEdge = {
					id: nanoid(),
					source,
					target,
					sourceSocket,
					targetSocket,
				}

				audioEdges = new Map(audioEdges)
				audioEdges.set(newEdge.id, newEdge)

				set({ audioEdges })
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
