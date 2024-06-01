import { nanoid } from 'nanoid'
import { StoreApi, create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import {
	AudioEdge,
	AudioEdgeId,
	AudioNode,
	AudioNodeId,
	AudioNodeType,
	AudioSocketId,
	audioNodeDefinitions,
	audioNodeSchemas as nodeSchemas,
} from '@/lib/schemas/audio-node'
import {
	CompositionId,
	compositionSchemas as compSchemas,
} from '@/lib/schemas/composition'
import {
	MusicKey,
	MusicKeyId,
	MusicLayer,
	MusicLayerId,
	musicSchemas,
} from '@/lib/schemas/music'
import { capitalize, safeParseOr, someIter, zodIs } from '@/lib/utils'

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

	getAudioNodeById: (id: AudioNodeId) => Readonly<AudioNode> | null
	getAudioEdgeById: (id: AudioEdgeId) => Readonly<AudioEdge> | null
	getMusicLayerById: (id: MusicLayerId) => Readonly<MusicLayer> | null
	getMusicKeyById: (id: MusicKeyId) => Readonly<MusicKey> | null

	createAudioNode: (
		type: AudioNodeType,
		position: [number, number],
	) => Readonly<AudioNode>
	renameAudioNode: (id: AudioNodeId, label: string) => boolean
	moveAudioNode: (
		id: AudioNodeId,
		position: [x: number, y: number],
	) => boolean
	setAudioProperty: (
		id: AudioNodeId,
		property: string,
		value: number,
	) => boolean

	connectAudioNodes: (
		source: [AudioNodeId, AudioSocketId],
		target: [AudioNodeId, AudioSocketId],
	) => Readonly<AudioEdge> | null

	createMusicLayer: (name: string) => Readonly<MusicLayer> | null
	renameMusicLayer: (id: MusicLayerId, name: string) => void

	createMusicKey: (
		layerId: MusicLayerId,
		instrumentId: AudioNodeId,
		note: Pick<MusicKey, 'time' | 'note' | 'duration'>,
	) => Readonly<MusicKey> | null
	moveMusicKey: (id: MusicKeyId, time: number, note: number) => boolean
	setMusicKeyInstrument: (
		keyIds: MusicKeyId[],
		instrumentId: AudioNodeId,
	) => boolean

	removeAudioNode: (id: AudioNodeId) => boolean
	removeAudioEdge: (id: AudioEdgeId) => boolean
	removeMusicLayer: (id: MusicLayerId) => boolean
	removeMusicKey: (id: MusicKeyId) => boolean
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

			getAudioNodeById: id => get().audioNodes.get(id) ?? null,
			getAudioEdgeById: id => get().audioEdges.get(id) ?? null,
			getMusicLayerById: id => get().musicLayers.get(id) ?? null,
			getMusicKeyById: id => get().musicKeys.get(id) ?? null,

			createAudioNode: (type, position) => {
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

			renameAudioNode: (id, label) => {
				const node = get().audioNodes.get(id)
				if (!node) {
					return false
				}

				label = safeParseOr(nodeSchemas.label, label, node.label)
				if (node.label == label) {
					return false
				}

				node.label = label

				set({ audioNodes: new Map(get().audioNodes) })
				return true
			},

			moveAudioNode: (id, [x, y]) => {
				const node = get().audioNodes.get(id)
				if (!node) {
					return false
				}

				node.position = [x, y]
				set({ audioNodes: new Map(get().audioNodes) })
				return true
			},

			setAudioProperty: (id, property, value) => {
				const node = get().audioNodes.get(id)
				if (!node) {
					return false
				}

				const safeProperty = safeParseOr(
					nodeSchemas.propertyKey,
					property,
					null,
				)
				if (safeProperty === null) {
					return false
				}

				node.properties[safeProperty] = value

				set({ audioNodes: new Map(get().audioNodes) })
				return true
			},

			connectAudioNodes: (
				[source, sourceSocket],
				[target, targetSocket],
			) => {
				const { getAudioNodeById } = get()
				if (!getAudioNodeById(source) || !getAudioNodeById(target)) {
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
				const safeName = safeParseOr(musicSchemas.layerName, name, null)
				if (!safeName) {
					return null
				}

				const id = nanoid()
				const newLayer: MusicLayer = { id, name: safeName }

				const musicLayers = new Map(get().musicLayers)
				musicLayers.set(id, newLayer)
				set({ musicLayers })
				return newLayer
			},

			renameMusicLayer: (id, name) => {
				const musicLayers = get().musicLayers
				const musicLayer = musicLayers.get(id)
				if (!musicLayer) {
					return
				}

				name = safeParseOr(
					musicSchemas.layerName,
					name,
					musicLayer.name,
				)

				if (musicLayer.name != name) {
					musicLayer.name = name
					set({ musicLayers: new Map(musicLayers) })
				}
			},

			createMusicKey: (
				layerId,
				instrumentId,
				{ time, note, duration },
			) => {
				if (
					!zodIs(musicSchemas.keyTime, time) ||
					!zodIs(musicSchemas.keyNote, note) ||
					!zodIs(musicSchemas.keyDuration, duration)
				) {
					return null
				}

				const { musicLayers, audioNodes } = get()
				if (
					!musicLayers.has(layerId) ||
					!audioNodes.has(instrumentId)
				) {
					return null
				}

				const newKey: MusicKey = {
					id: nanoid(),
					layerId,
					instrumentId,
					note,
					time,
					duration,
					velocity: 1, // TODO: workout velocity stuff
				}

				const musicKeys = new Map(get().musicKeys)
				musicKeys.set(newKey.id, newKey)
				set({ musicKeys })

				return newKey
			},

			moveMusicKey: (id, time, note) => {
				if (
					!zodIs(musicSchemas.keyTime, time) ||
					!zodIs(musicSchemas.keyNote, note)
				) {
					return false
				}

				const musicKey = get().musicKeys.get(id)
				if (!musicKey) {
					return false
				}

				musicKey.time = time
				musicKey.note = note

				set({ musicKeys: new Map(get().musicKeys) })
				return true
			},

			setMusicKeyInstrument: (keyIds, instrumentId) => {
				const { musicKeys, audioNodes } = get()
				if (
					!audioNodes.has(instrumentId) ||
					keyIds.some(id => !musicKeys.has(id))
				) {
					return false
				}

				for (const keyId of keyIds) {
					musicKeys.get(keyId)!.instrumentId = instrumentId
				}

				set({ musicKeys: new Map(musicKeys) })
				return true
			},

			removeAudioNode: id => {
				let audioNodes = get().audioNodes
				if (!audioNodes.has(id)) {
					return false
				}

				audioNodes = new Map(audioNodes)
				audioNodes.delete(id)
				set({ audioNodes })
				return true
			},

			removeAudioEdge: id => {
				let audioEdges = get().audioEdges
				if (!audioEdges.has(id)) {
					return false
				}

				audioEdges = new Map(audioEdges)
				audioEdges.delete(id)
				set({ audioEdges })
				return true
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

			removeMusicKey: id => {
				let musicKeys = get().musicKeys
				if (!musicKeys.has(id)) {
					return false
				}

				musicKeys = new Map(musicKeys)
				musicKeys.delete(id)
				set({ musicKeys })
				return true
			},
		}
	}

	return create(subscribeWithSelector(initStore))
}
