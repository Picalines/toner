import { z } from 'zod'

const nodeType = z.enum([
	'output',
	'synth',
	'gain',
	'reverb',
	'vibrato',
	'compressor',
	'panner',
])

const nodeGroup = z.enum(['instrument', 'effect', 'component', 'output'])

const nodeId = z.string().min(1).max(36)
const edgeId = z.string().min(1).max(36)
const socketId = z.number().int().min(0).max(16)

const label = z.string().trim().min(1).max(32)
const position = z.tuple([z.number(), z.number()])
const propertyKey = z.string().trim().min(1).max(32)
const propertyValue = z.number()
const properties = z.record(propertyKey, propertyValue) // TODO: limit amount of properties

const nodeSchema = z.object({
	id: nodeId,
	type: nodeType,
	label,
	position,
	properties,
})

const edgeSchema = z.object({
	id: edgeId,
	source: nodeId,
	target: nodeId,
	sourceSocket: socketId,
	targetSocket: socketId,
})

export const audioNodeSchemas = {
	type: nodeType,
	group: nodeGroup,

	nodeId,
	edgeId,
	socketId,

	label,
	position,
	propertyKey,
	propertyValue,
	properties,

	node: nodeSchema,
	edge: edgeSchema,
}

export type AudioNodeId = z.infer<typeof nodeId>

export type AudioEdgeId = z.infer<typeof edgeId>

export type AudioNodeType = z.infer<typeof nodeType>

export type AudioNodeGroup = z.infer<typeof nodeGroup>

export type AudioNode = z.infer<typeof nodeSchema>

export type AudioEdge = z.infer<typeof edgeSchema>

export type AudioNodePropertySchema = {
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
	properties: Record<string, AudioNodePropertySchema>
}

const UNITS = { decibels: 'db', hertz: 'hz', seconds: 'sec', percentage: '%' }

const volumeProperty: AudioNodePropertySchema = {
	name: 'volume',
	default: 0,
	step: 0.5,
	range: [-50, 50],
	units: UNITS.decibels,
}

const wetProperty: AudioNodePropertySchema = {
	name: 'mix',
	default: 1,
	step: 0.001,
	range: [0, 1],
	displayRange: [0, 100],
	units: UNITS.percentage,
}

const oscillatorType: AudioNodePropertySchema = {
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

	compressor: {
		group: 'component',
		inputs: [{ name: 'audio' }],
		outputs: [{ name: 'audio' }],
		properties: {
			threshold: {
				name: 'threshold',
				default: 0,
				step: 0.001,
				range: [-100, 0],
				units: UNITS.decibels,
			},
			attack: {
				name: 'attack',
				default: 0,
				step: 0.001,
				range: [0, 1],
				units: UNITS.seconds,
			},
			release: {
				name: 'release',
				default: 0,
				step: 0.001,
				range: [0, 1],
				units: UNITS.seconds,
			},
			knee: {
				name: 'knee',
				default: 0,
				step: 0.001,
				range: [0, 40],
				units: UNITS.decibels,
			},
			ratio: {
				name: 'ratio',
				default: 1,
				step: 0.001,
				range: [1, 20],
				units: UNITS.decibels,
			},
		},
	},

	panner: {
		group: 'component',
		inputs: [{ name: 'audio' }],
		outputs: [{ name: 'audio' }],
		properties: {
			pan: {
				name: 'pan',
				default: 0,
				step: 0.001,
				range: [-1, 1],
				displayRange: [-100, 100],
				units: UNITS.percentage,
			},
		},
	},
} satisfies Record<AudioNodeType, DefinitionShape>
