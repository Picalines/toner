export type AudioNodeType = 'output' | 'synth' | 'gain' | 'reverb'

export type AudioNodeGroup = 'instrument' | 'effect' | 'output'

export type AudioNodeProperty = {
	name: string
	default: number
	min: number
	max: number
	valueLabels?: Record<number, string>
}

export type AudioNodeSchema = {
	group: AudioNodeGroup
	inputs: { name: string }[]
	outputs: { name: string }[]
	properties: Record<string, AudioNodeProperty>
}

const volumeProperty = {
	name: 'volume',
	default: 128,
	min: 0,
	max: 255,
} as const satisfies AudioNodeProperty

const wetProperty = {
	name: 'mix',
	default: 255,
	min: 0,
	max: 255,
} as const satisfies AudioNodeProperty

export const audioNodeSchemas = {
	output: {
		group: 'output',
		inputs: [{ name: 'audio' }],
		outputs: [],
		properties: {},
	},

	synth: {
		group: 'instrument',
		inputs: [],
		outputs: [{ name: 'audio' }],
		properties: {
			volume: volumeProperty,
			'osc.type': {
				name: 'type',
				default: 0,
				min: 0,
				max: 4,
				valueLabels: {
					0: 'triangle',
					1: 'sawtooth',
					2: 'square',
					3: 'noise',
					4: 'sin',
				},
			},
		},
	},

	gain: {
		group: 'effect',
		inputs: [{ name: 'audio' }],
		outputs: [{ name: 'audio' }],
		properties: {
			wet: wetProperty,
			gain: {
				name: 'decibels',
				default: 0,
				min: 0,
				max: 255,
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
				default: 0,
				min: 0,
				max: 255,
			},
		},
	},
} as const satisfies Record<AudioNodeType, AudioNodeSchema>
