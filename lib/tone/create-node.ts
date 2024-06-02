import {
	Compressor,
	Gain,
	Panner,
	PolySynth,
	Reverb,
	Synth,
	type ToneAudioNode,
	type Unit as ToneUnit,
	Vibrato,
	getDestination as getToneDestination,
} from 'tone'
import type { AbstractParam as ToneAbstractParam } from 'tone/build/esm/core/context/AbstractParam'
import {
	type AudioNodeProperties,
	type AudioNodeType,
	audioNodeDefinitions as nodeDefs,
} from '@/lib/schemas/audio-node'

export function createToneNode<T extends AudioNodeType>(
	nodeType: T,
	properties: Record<string, number>,
): ToneAudioNode {
	const toneNode = TONE_CONSTRUCTORS[nodeType]()

	for (const [property, defaultValue] of Object.entries(properties)) {
		setToneNodeProperty(
			nodeType,
			toneNode,
			property as keyof AudioNodeProperties<T>,
			defaultValue,
		)
	}

	return toneNode
}

export function setToneNodeProperty<T extends AudioNodeType>(
	audioNodeType: T,
	toneNode: ToneAudioNode,
	property: keyof AudioNodeProperties<T>,
	value: number,
) {
	const setters = TONE_PROPERTY_SETTERS[audioNodeType]

	setters[property](
		toneNode as ReturnType<(typeof TONE_CONSTRUCTORS)[T]>,
		value,
	)
}

type ToneConstructors = { [T in AudioNodeType]: () => ToneAudioNode }

type TonePropertySetters<Constructors extends ToneConstructors> = {
	[T in keyof ToneConstructors]: Record<
		keyof AudioNodeProperties<T>,
		(node: ReturnType<Constructors[T]>, value: number) => void
	>
}

const TONE_CONSTRUCTORS = {
	output: () => getToneDestination(),
	synth: () => new PolySynth(Synth),
	gain: () => new Gain(undefined, 'decibels'),
	reverb: () => new Reverb(),
	vibrato: () => new Vibrato(),
	compressor: () => new Compressor(),
	panner: () => new Panner(),
} satisfies ToneConstructors

const TONE_PROPERTY_SETTERS: TonePropertySetters<typeof TONE_CONSTRUCTORS> = {
	output: {
		volume: paramSetter('volume'),
	},
	synth: {
		volume: paramSetter('volume'),
		'osc.type': (synth, t) =>
			synth.set({
				oscillator: {
					// @ts-expect-error TODO: figure out Tone.js typing
					type: nodeDefs.synth.properties['osc.type'].valueLabels![t],
				},
			}),
		'env.attack': (synth, a) => synth.set({ envelope: { attack: a } }),
		'env.decay': (synth, d) => synth.set({ envelope: { decay: d } }),
		'env.sustain': (synth, s) => synth.set({ envelope: { sustain: s } }),
		'env.release': (synth, r) => synth.set({ envelope: { release: r } }),
	},
	gain: {
		gain: paramSetter('gain'),
	},
	reverb: {
		decay: (reverb, d) => (reverb.decay = d),
		wet: paramSetter('wet'),
	},
	vibrato: {
		wet: paramSetter('wet'),
		frequency: paramSetter('frequency'),
		type: (vibrato, t) =>
			// @ts-expect-error TODO
			(vibrato.type =
				nodeDefs.vibrato.properties['type'].valueLabels![t]),
		depth: paramSetter('depth'),
	},
	compressor: {
		attack: paramSetter('attack'),
		release: paramSetter('release'),
		threshold: paramSetter('threshold'),
		knee: paramSetter('knee'),
		ratio: paramSetter('ratio'),
	},
	panner: {
		pan: paramSetter('pan'),
	},
}

function paramSetter<
	ToneNode extends ToneAudioNode,
	P extends keyof {
		[P in keyof ToneNode as ToneNode[P] extends ToneAbstractParam<ToneUnit.UnitName>
			? P
			: never]: 0
	},
>(nodeKey: P) {
	// @ts-expect-error TODO: add better check
	return (node: ToneNode, value: number) => (node[nodeKey].value = value)
}
