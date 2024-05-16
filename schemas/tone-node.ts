import * as Tone from 'tone'
import { KeyOfUnion } from '@/lib/utils'
import {
	AudioNodeDefinition,
	AudioNodeProperties,
	AudioNodeType,
	audioNodeDefinitions as nodeDefs,
} from '@/schemas/audio-node'

type MappedToneNode = {
	toneNode: Tone.ToneAudioNode
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
	toneNode: Tone.ToneAudioNode
	setters: {
		[P in keyof AudioNodeProperties<T>]: (value: number) => void
	}
}

type ToneNodeMappings = {
	[T in AudioNodeType]: (def: AudioNodeDefinition<T>) => ToneNodeMapping<T>
}

const TONE_NODE_MAPPINGS: ToneNodeMappings = {
	output: () => {
		const toneNode = Tone.getDestination()
		return {
			toneNode,
			setters: {
				volume: paramSetter(toneNode.volume),
			},
		}
	},

	synth: synthDef => {
		const synth = new Tone.PolySynth(Tone.Synth)
		const oscType = labelGetter(synthDef, 'osc.type')
		return {
			toneNode: synth,
			setters: {
				volume: paramSetter(synth.volume),
				'osc.type': t =>
					// @ts-expect-error TODO: figure out Tone.js typing
					synth.set({ oscillator: { type: oscType(t) } }),
			},
		}
	},

	gain: () => {
		const gain = new Tone.Gain(undefined, 'decibels')
		return {
			toneNode: gain,
			setters: {
				gain: paramSetter(gain.gain),
			},
		}
	},

	reverb: () => {
		const reverb = new Tone.Reverb()
		return {
			toneNode: reverb,
			setters: {
				wet: signalSetter(reverb.wet),
				decay: d => (reverb.decay = d),
			},
		}
	},
}

type ToneUnit = 'decibels' | 'normalRange' // TODO: Tone.Unit is not exported

function paramSetter<U extends ToneUnit>(param: Tone.Param<U>) {
	return (value: number) => (param.value = value)
}

function signalSetter<U extends ToneUnit>(signal: Tone.Signal<U>) {
	return (value: number) => (signal.value = value)
}

function labelGetter<
	T extends AudioNodeType,
	D extends AudioNodeDefinition<T>,
	P extends KeyOfUnion<AudioNodeProperties<T>> & string,
>(nodeDefinition: D, property: P): (value: number) => string {
	const { valueLabels } =
		nodeDefinition.properties[
			property as keyof typeof nodeDefinition.properties
		]

	const defaultKey = Object.keys(valueLabels)[0]

	return value =>
		value in valueLabels ? valueLabels[value] : valueLabels[defaultKey]
}
