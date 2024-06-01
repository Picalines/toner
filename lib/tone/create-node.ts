import {
	Compressor,
	Gain,
	Panner,
	PolySynth,
	Reverb,
	Synth,
	type ToneAudioNode,
	type Param as ToneParam,
	type Signal as ToneSignal,
	type Unit as ToneUnit,
	Vibrato,
	getDestination as getToneDestination,
} from 'tone'
import {
	AudioNodeDefinition,
	AudioNodeProperties,
	AudioNodeType,
	audioNodeDefinitions as nodeDefs,
} from '@/lib/schemas/audio-node'
import { KeyOfUnion } from '@/lib/utils'

type MappedToneNode = {
	toneNode: ToneAudioNode
	setProperty: (key: string, value: number) => void
}

export function createToneNode<T extends AudioNodeType>(
	nodeType: T,
	properties: Record<string, number>,
): MappedToneNode {
	const { toneNode, setters } = TONE_NODE_MAPPINGS[nodeType](
		nodeDefs[nodeType],
	)

	const settersRecord = setters as Partial<
		Record<string, (value: number) => void>
	>

	const setProperty = (key: string, value: number) => {
		settersRecord[key]?.(value)
	}

	for (const [property, defaultValue] of Object.entries(properties)) {
		setProperty(property, defaultValue)
	}

	return { toneNode, setProperty }
}

type ToneNodeMapping<T extends AudioNodeType> = {
	toneNode: ToneAudioNode
	setters: {
		[P in keyof AudioNodeProperties<T>]: (value: number) => void
	}
}

type ToneNodeMappings = {
	[T in AudioNodeType]: (def: AudioNodeDefinition<T>) => ToneNodeMapping<T>
}

const TONE_NODE_MAPPINGS: ToneNodeMappings = {
	output: () => {
		const toneNode = getToneDestination()
		return {
			toneNode,
			setters: {
				volume: paramSetter(toneNode.volume),
			},
		}
	},

	synth: synthDef => {
		const synth = new PolySynth(Synth)

		const oscType = labelGetter(synthDef, 'osc.type')

		return {
			toneNode: synth,
			setters: {
				volume: paramSetter(synth.volume),
				'osc.type': t =>
					// @ts-expect-error TODO: figure out Tone.js typing
					synth.set({ oscillator: { type: oscType(t) } }),
				'env.attack': a => synth.set({ envelope: { attack: a } }),
				'env.decay': d => synth.set({ envelope: { decay: d } }),
				'env.sustain': s => synth.set({ envelope: { sustain: s } }),
				'env.release': r => synth.set({ envelope: { release: r } }),
			},
		}
	},

	gain: () => {
		const gain = new Gain(undefined, 'decibels')
		return {
			toneNode: gain,
			setters: {
				gain: paramSetter(gain.gain),
			},
		}
	},

	reverb: () => {
		const reverb = new Reverb()
		return {
			toneNode: reverb,
			setters: {
				wet: signalSetter(reverb.wet),
				decay: d => (reverb.decay = d),
			},
		}
	},

	vibrato: vibratoDef => {
		const vibrato = new Vibrato()
		const type = labelGetter(vibratoDef, 'type')
		return {
			toneNode: vibrato,
			setters: {
				wet: signalSetter(vibrato.wet),
				frequency: signalSetter(vibrato.frequency),
				// @ts-expect-error TODO: figure out Tone.js typing
				type: t => (vibrato.type = type(t)),
				depth: paramSetter(vibrato.depth),
			},
		}
	},

	compressor: () => {
		const compressor = new Compressor()
		return {
			toneNode: compressor,
			setters: {
				threshold: paramSetter(compressor.threshold),
				attack: paramSetter(compressor.attack),
				release: paramSetter(compressor.release),
				knee: paramSetter(compressor.knee),
				ratio: paramSetter(compressor.ratio),
			},
		}
	},

	panner: () => {
		const panner = new Panner()
		return {
			toneNode: panner,
			setters: {
				pan: paramSetter(panner.pan),
			},
		}
	},
}

function paramSetter<U extends ToneUnit.UnitName>(param: ToneParam<U>) {
	return (value: number) => (param.value = value)
}

function signalSetter<U extends ToneUnit.UnitName>(signal: ToneSignal<U>) {
	return (value: number) => (signal.value = value)
}

function labelGetter<
	T extends AudioNodeType,
	D extends AudioNodeDefinition<T>,
	P extends KeyOfUnion<D['properties']> & string,
>(nodeDefinition: D, property: P): (value: number) => string {
	const { valueLabels } =
		nodeDefinition.properties[
			property as keyof typeof nodeDefinition.properties
		]

	const defaultKey = Object.keys(valueLabels)[0]

	return value =>
		value in valueLabels ? valueLabels[value] : valueLabels[defaultKey]
}
