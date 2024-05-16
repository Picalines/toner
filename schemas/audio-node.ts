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
	step: number
	range: [min: number, max: number]
	displayRange?: [min: number, max: number]
	units?: string
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

const UNITS = { decibels: 'db', hertz: 'hz', seconds: 'sec', percentage: '%' }

const volumeProperty: AudioNodeProperty = {
	name: 'volume',
	default: 0,
	step: 0.5,
	range: [-50, 50],
	units: UNITS.decibels,
}

const wetProperty: AudioNodeProperty = {
	name: 'mix',
	default: 1,
	step: 0.001,
	range: [0, 1],
	displayRange: [0, 100],
	units: UNITS.percentage,
}

const oscillatorType: AudioNodeProperty = {
	name: 'type',
	default: 0,
	step: 1,
	range: [0, 3],
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
				step: 0.001,
				range: [0, 2],
				units: UNITS.seconds,
			},
			'env.decay': {
				name: 'decay',
				default: 0.1,
				step: 0.001,
				range: [0, 2],
				units: UNITS.seconds,
			},
			'env.sustain': {
				name: 'sustain',
				default: 1,
				step: 0.001,
				range: [0, 1],
				displayRange: [0, 100],
				units: UNITS.percentage,
			},
			'env.release': {
				name: 'release',
				default: 0.1,
				step: 0.001,
				range: [0, 5],
				units: UNITS.seconds,
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
				step: 0.5,
				range: [-50, 10],
				units: UNITS.decibels,
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
				default: 1,
				step: 0.001,
				range: [0.001, 100],
				units: UNITS.seconds,
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
				step: 1,
				range: [1, 2048],
				units: UNITS.hertz,
			},
			type: oscillatorType,
			depth: {
				name: 'depth',
				default: 0.5,
				step: 0.001,
				range: [0, 1],
				displayRange: [0, 100],
				units: UNITS.percentage,
			},
		},
	},
} satisfies Record<AudioNodeType, DefinitionShape>
