export type AudioNodeType = 'output' | 'synth' | 'reverb'

export type AudioNodeGroup = 'instrument' | 'effect' | 'output'

export type AudioNodeProperty = {
	name: string
	type: 'integer' | 'float'
	default: number
	min: number
	max: number
	valueLabels: Record<number, string>
}

export type AudioNodeSchema = {
    group: AudioNodeGroup
	inputs: { name: string }[]
	outputs: { name: string }[]
	properties: Record<string, AudioNodeProperty>
}

export const audioNodeSchemas = {
	output: {
        group: 'output',
		inputs: [{ name: 'Audio' }],
		outputs: [],
		properties: {},
	},

	synth: {
        group: 'instrument',
		inputs: [],
		outputs: [{ name: 'Audio' }],
		properties: {
			'osc.type': {
				name: 'Type',
				type: 'integer',
				default: 0,
				min: 0,
				max: 5,
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

	reverb: {
        group: 'effect',
		inputs: [{ name: 'Audio' }],
		outputs: [{ name: 'Audio' }],
		properties: {},
	},
} as const satisfies Record<AudioNodeType, AudioNodeSchema>
