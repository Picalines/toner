import { z } from 'zod'
import { zodLiteralUnion } from '@/lib/utils'

const propertySchema = z.string().trim().min(1).max(32)

export const audioNodeSchemas = {
	nodeId: z.string().min(1).max(36),
	edgeId: z.string().min(1).max(36),
	socketId: z.number().int().min(0).max(16),

	label: z.string().trim().min(1).max(32),
	position: z.tuple([z.number(), z.number()]),
	property: propertySchema,
	properties: z.record(propertySchema, z.number()), // TODO: limit amount of properties

	type: zodLiteralUnion('output', 'synth', 'gain', 'reverb', 'vibrato'),
}

export type AudioNodeId = z.infer<(typeof audioNodeSchemas)['nodeId']>

export type AudioEdgeId = z.infer<(typeof audioNodeSchemas)['edgeId']>

export type AudioNodeType = z.infer<(typeof audioNodeSchemas)['type']>

export type AudioNodeGroup = 'instrument' | 'effect' | 'output'

export type AudioNodeProperty = {
	name: string
	default: number
	min: number
	max: number
	step: number
	valueLabels?: Readonly<Record<number, string>>
}

export type AudioNodeDefinition<T extends AudioNodeType = AudioNodeType> =
	(typeof audioNodeDefinitions)[T]

export type AudioNodeProperties<T extends AudioNodeType = AudioNodeType> =
	AudioNodeDefinition<T>['properties']

type DefinitionShape = {
	group: AudioNodeGroup
	inputs: { name: string }[]
	outputs: { name: string }[]
	properties: Record<string, AudioNodeProperty>
}

const volumeProperty: AudioNodeProperty = {
	name: 'volume',
	default: 0,
	min: -50,
	max: 10,
	step: 0.5,
}

const wetProperty: AudioNodeProperty = {
	name: 'mix',
	default: 1,
	min: 0,
	max: 1,
	step: 0.001,
}

const oscillatorType: AudioNodeProperty = {
	name: 'type',
	default: 0,
	min: 0,
	max: 3,
	step: 1,
	valueLabels: {
		0: 'triangle',
		1: 'sawtooth',
		2: 'square',
		3: 'sine',
	},
}

export const audioNodeDefinitions = {
	output: {
		group: 'output',
		inputs: [{ name: 'audio' }],
		outputs: [],
		properties: { volume: volumeProperty },
	},

	synth: {
		group: 'instrument',
		inputs: [],
		outputs: [{ name: 'audio' }],
		properties: {
			volume: volumeProperty,
			'osc.type': oscillatorType,
			'env.attack': {
				name: 'attack',
				default: 0.1,
				min: 0,
				max: 2,
				step: 0.001,
			},
			'env.decay': {
				name: 'decay',
				default: 0.1,
				min: 0,
				max: 2,
				step: 0.001,
			},
			'env.sustain': {
				name: 'sustain',
				default: 1,
				min: 0,
				max: 1,
				step: 0.001,
			},
			'env.release': {
				name: 'release',
				default: 0.1,
				min: 0,
				max: 5,
				step: 0.001,
			},
		},
	},

	gain: {
		group: 'effect',
		inputs: [{ name: 'audio' }],
		outputs: [{ name: 'audio' }],
		properties: {
			gain: {
				name: 'decibels',
				default: 0,
				min: -50,
				max: 10,
				step: 0.5,
			},
		},
	},

	reverb: {
		group: 'effect',
		inputs: [{ name: 'audio' }],
		outputs: [{ name: 'audio' }],
		properties: {
			wet: wetProperty,
			decay: {
				name: 'decay',
				default: 0.001,
				min: 0.001,
				max: 255,
				step: 0.001,
			},
		},
	},

	vibrato: {
		group: 'effect',
		inputs: [{ name: 'audio' }],
		outputs: [{ name: 'audio' }],
		properties: {
			wet: wetProperty,
			frequency: {
				name: 'frequencry',
				default: 255,
				min: 1,
				max: 2048,
				step: 1,
			},
			type: oscillatorType,
			depth: {
				name: 'depth',
				default: 0.5,
				min: 0,
				max: 1,
				step: 0.001,
			},
		},
	},
} satisfies Record<AudioNodeType, DefinitionShape>
