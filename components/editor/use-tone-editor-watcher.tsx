'use client'

import { useEffect, useRef } from 'react'
import * as Tone from 'tone'
import { useStore } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { KeyOfUnion } from '@/lib/utils'
import {
	AudioNodeDefinition,
	AudioNodeProperties,
	AudioNodeType,
	audioNodeDefinitions as nodeDefs,
} from '@/schemas/audio-node'
import { CompositionStore } from '@/stores/composition-store'
import { ToneStore } from '@/stores/tone-store'
import { useCompositionStoreApi } from '../providers/composition-store-provider'
import { useToneStore } from '../providers/tone-store-provider'

const changeHistorySelector = ({ changeHistory }: CompositionStore) =>
	changeHistory

const toneSelector = ({
	isAudioAvailable,
	getNodeById,
	addNode,
	connect,
	disposeNode,
	disposeAll,
}: ToneStore) => ({
	isAudioAvailable,
	getNodeById,
	addNode,
	connect,
	disposeNode,
	disposeAll,
})

export function useToneEditorWatcher() {
	const compositionStore = useCompositionStoreApi()
	const changeHistory = useStore(compositionStore, changeHistorySelector)

	const {
		isAudioAvailable,
		getNodeById,
		addNode,
		connect,
		disposeNode,
		disposeAll,
	} = useToneStore(useShallow(toneSelector))

	const toneSetters =
		useRef<WeakMap<Tone.ToneAudioNode, MappedToneNode['setProperty']>>()
	if (!toneSetters.current) {
		toneSetters.current = new WeakMap()
	}

	const edgeDisconnects = useRef<Map<string, () => void>>()
	if (!edgeDisconnects.current) {
		edgeDisconnects.current = new Map()
	}

	useEffect(() => {
		const change = changeHistory[changeHistory.length - 1]

		switch (change?.type) {
			case 'node-add': {
				const { toneNode, setProperty } = createToneNode(
					change.nodeType,
					change.properties,
				)
				addNode(change.id, toneNode)
				toneSetters.current!.set(toneNode, setProperty)
				break
			}

			case 'node-remove': {
				disposeNode(change.id)
				break
			}

			case 'node-set-property': {
				const node = getNodeById(change.id)
				if (node) {
					const setProperty = toneSetters.current!.get(node)
					setProperty?.(change.property, change.value)
				}
				break
			}

			case 'edge-add': {
				const { source, target } = change
				const disconnect = connect(source, target)
				if (disconnect) {
					edgeDisconnects.current?.set(change.id, disconnect)
				}
				break
			}

			case 'edge-remove': {
				edgeDisconnects.current?.get(change.id)?.()
				edgeDisconnects.current?.delete(change.id)
				break
			}
		}
	}, [changeHistory, getNodeById, addNode, connect, disposeNode])

	useEffect(() => {
		if (!isAudioAvailable) {
			return
		}

		const { nodes, edges } = compositionStore.getState()

		for (const [nodeId, node] of nodes) {
			const { toneNode, setProperty } = createToneNode(
				node.data.type,
				node.data.properties,
			)
			addNode(nodeId, toneNode)
			toneSetters.current!.set(toneNode, setProperty)
		}

		for (const [edgeId, edge] of edges) {
			const disconnect = connect(
				[edge.source, parseInt(edge.sourceHandle ?? '0')],
				[edge.target, parseInt(edge.targetHandle ?? '0')],
			)
			if (disconnect) {
				edgeDisconnects.current?.set(edgeId, disconnect)
			}
		}

		return () => {
			edgeDisconnects.current?.clear()
			disposeAll()
		}
	}, [isAudioAvailable, compositionStore, addNode, connect, disposeAll])
}

type ToneNodeMapping<T extends AudioNodeType> = {
	toneNode: Tone.ToneAudioNode
	setters: {
		[P in keyof AudioNodeDefinition<T>['properties']]: (
			value: number,
		) => void
	}
}

type ToneUnit = 'decibels' | 'normalRange' // TODO: Tone.Unit is not exported

const paramSetter =
	<U extends ToneUnit>(param: Tone.Param<U>) =>
	(value: number) =>
		(param.value = value)

const signalSetter =
	<U extends ToneUnit>(signal: Tone.Signal<U>) =>
	(value: number) =>
		(signal.value = value)

const TONEJS_MAPPINGS: {
	[T in AudioNodeType]: (def: AudioNodeDefinition<T>) => ToneNodeMapping<T>
} = {
	output: () => {
		const toneNode = Tone.getDestination()
		return {
			toneNode,
			setters: {
				volume: paramSetter(toneNode.volume),
			},
		}
	},

	synth: def => {
		const synth = new Tone.PolySynth(Tone.Synth)
		const oscType = labelGetter(def, 'osc.type')
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

type MappedToneNode = {
	toneNode: Tone.ToneAudioNode
	setProperty: (key: string, value: number) => void
}

function createToneNode<T extends AudioNodeType>(
	nodeType: T,
	properties: Record<string, number>,
): MappedToneNode {
	const { toneNode, setters } = TONEJS_MAPPINGS[nodeType](nodeDefs[nodeType])

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

const labelGetter = <
	T extends AudioNodeType,
	D extends AudioNodeDefinition<T>,
	P extends KeyOfUnion<AudioNodeProperties<T>> & string,
>(
	nodeDefinition: D,
	property: P,
): ((value: number) => string) => {
	const { valueLabels } =
		nodeDefinition.properties[
			property as keyof typeof nodeDefinition.properties
		]

	const defaultKey = Object.keys(valueLabels)[0]

	return value =>
		value in valueLabels ? valueLabels[value] : valueLabels[defaultKey]
}
