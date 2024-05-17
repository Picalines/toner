'use client'

import { ChangeEvent, useCallback, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { KeyOfUnion, cn, mapRange, trimFraction, tw } from '@/lib/utils'
import {
	AudioNodeGroup,
	AudioNodeProperties,
	AudioNodeProperty,
	AudioNodeType,
	audioNodeDefinitions,
} from '@/schemas/audio-node'
import { CompositionStore } from '@/stores/composition-store'
import { useCompositionStore } from '../providers/composition-store-provider'
import { Input } from '../ui/input'
import { ScrollArea, ScrollBar } from '../ui/scroll-area'
import { Slider } from '../ui/slider'

type Props = Readonly<{
	className?: string
}>

const currentNodeCompSelector = ({
	selectedNodeId,
	getNodeById,
}: CompositionStore) => ({ selectedNodeId, getNodeById })

export default function NodePropertiesEditor({ className }: Props) {
	const { selectedNodeId, getNodeById } = useCompositionStore(
		useShallow(currentNodeCompSelector),
	)

	const selectedNode = selectedNodeId
		? getNodeById(selectedNodeId)?.data
		: null

	const bgClassName = tw`relative bg-neutral-300 dark:bg-neutral-800`

	if (!selectedNodeId || !selectedNode) {
		return (
			<div className={cn(bgClassName, className)}>
				<div className="absolute left-1/2 top-1/2 w-fit -translate-x-1/2 -translate-y-1/2 text-nowrap italic">
					Select node
				</div>
			</div>
		)
	}

	const { type: nodeType } = selectedNode
	const { properties } = audioNodeDefinitions[nodeType]

	return (
		<div className={cn(bgClassName, 'flex flex-col', className)}>
			<NodeNameInput key={selectedNodeId} />
			<ScrollArea>
				{Object.keys(properties).map(property => (
					<NodePropertySlider
						className="m-1 overflow-hidden rounded-sm"
						key={property}
						property={property as KeyOfUnion<AudioNodeProperties>}
					/>
				))}
				<ScrollBar />
			</ScrollArea>
		</div>
	)
}

const renameNodeSelector = ({ renameNode }: CompositionStore) => ({
	renameNode,
})

function NodeNameInput() {
	const { selectedNodeId: nodeId, getNodeById } = useCompositionStore(
		useShallow(currentNodeCompSelector),
	)

	const { renameNode } = useCompositionStore(useShallow(renameNodeSelector))

	const { type: nodeType, label } =
		(nodeId ? getNodeById(nodeId)?.data : null) ?? {}

	const [labelInput, setLabelInput] = useState(label ?? '')

	const { group } = nodeType
		? audioNodeDefinitions[nodeType]
		: { group: null }

	const onNameChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			if (nodeId) {
				renameNode(nodeId, event.target.value)
			}
			setLabelInput(event.target.value)
		},
		[renameNode, nodeId],
	)

	const nodeGroupClassNames: Record<AudioNodeGroup, string> = {
		output: tw`bg-neutral-500`,
		instrument: tw`bg-red-500`,
		effect: tw`bg-orange-500`,
		component: tw`bg-cyan-500`,
	}

	return (
		<Input
			className={cn(
				'h-9 rounded-none border-none text-white focus-visible:ring-0 focus-visible:ring-offset-0',
				group && nodeGroupClassNames[group],
			)}
			value={labelInput}
			onChange={onNameChange}
		/>
	)
}

type PropertySliderProps<T extends AudioNodeType> = Readonly<{
	property: KeyOfUnion<AudioNodeProperties<T>> & string
	className?: string
}>

const nodePropertySelector = ({ setNodeProperty }: CompositionStore) => ({
	setNodeProperty,
})

function NodePropertySlider<T extends AudioNodeType>({
	property,
	className,
}: PropertySliderProps<T>) {
	const { selectedNodeId: nodeId, getNodeById } = useCompositionStore(
		useShallow(currentNodeCompSelector),
	)

	const { setNodeProperty } = useCompositionStore(
		useShallow(nodePropertySelector),
	)

	const onSliderChange = useCallback(
		(values: number[]) => {
			if (nodeId) {
				const [propertyValue] = values
				setNodeProperty(nodeId, property, propertyValue)
			}
		},
		[setNodeProperty, nodeId, property],
	)

	const node = nodeId ? getNodeById(nodeId)?.data : null

	let propertyValue = useCompositionStore(() => node?.properties[property])

	if (!node) {
		return null
	}

	const nodeProperties = audioNodeDefinitions[node.type as T]
		.properties as AudioNodeProperties<T>

	const {
		name,
		default: defaultValue,
		step,
		range: [min, max],
		displayRange: [displayMin, displayMax] = [min, max],
		units,
		valueLabels,
	} = nodeProperties[property] as AudioNodeProperty

	propertyValue ??= defaultValue

	return (
		<div
			className={cn(
				'relative h-min cursor-ew-resize text-nowrap p-1 shadow-[0_0_2px_rgba(0,0,0,0.2)]',
				className,
			)}
		>
			<Slider
				thumb={false}
				className="absolute inset-0 h-full"
				rangeClassName={tw`bg-neutral-100 shadow-[5px_0_10px_rgba(0,0,0,0.1)] dark:bg-neutral-500`}
				trackClassName={tw`rounded-none bg-neutral-200 dark:bg-neutral-600`}
				min={min}
				max={max}
				step={step}
				value={[propertyValue]}
				onValueChange={onSliderChange}
			/>
			<div className="pointer-events-none relative flex flex-col items-start gap-0.5 text-sm">
				<span className="text-slate-700 dark:text-slate-100">
					{name}
				</span>
				<span className="text-slate-500 dark:text-slate-300">
					{valueLabels && propertyValue in valueLabels
						? valueLabels[propertyValue]
						: trimFraction(
								mapRange(
									propertyValue,
									[min, max],
									[displayMin, displayMax],
								),
								2,
							)}
					{units ? ' ' + units : null}
				</span>
			</div>
		</div>
	)
}
