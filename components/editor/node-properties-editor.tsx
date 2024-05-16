'use client'

import { ChangeEvent, useCallback, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { KeyOfUnion, cn, tw } from '@/lib/utils'
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

	if (!selectedNodeId || !selectedNode) {
		return (
			<div className={cn('relative dark:bg-neutral-900', className)}>
				<div className="absolute left-1/2 top-1/2 w-fit -translate-x-1/2 -translate-y-1/2 text-nowrap italic">
					Select node
				</div>
			</div>
		)
	}

	const { type: nodeType } = selectedNode
	const { properties } = audioNodeDefinitions[nodeType]

	return (
		<ScrollArea className={cn('dark:bg-neutral-900', className)}>
			<NodeNameInput key={selectedNodeId} />
			{Object.keys(properties).map(property => (
				<NodePropertySlider
					key={property}
					property={property as KeyOfUnion<AudioNodeProperties>}
				/>
			))}
			<ScrollBar />
		</ScrollArea>
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
		instrument: tw`bg-red-500`,
		effect: tw`bg-orange-500`,
		output: tw`bg-neutral-500`,
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
		min,
		max,
		step,
		valueLabels,
		default: defaultValue,
	} = nodeProperties[property] as AudioNodeProperty

	propertyValue ??= defaultValue

	return (
		<div
			className={cn(
				className,
				'relative h-8 cursor-ew-resize text-nowrap border-t p-0',
			)}
		>
			<Slider
				thumb={false}
				className="h-full"
				rangeClassName="bg-neutral-500 shadow-lg"
				trackClassName="rounded-none bg-neutral-600"
				min={min}
				max={max}
				step={step}
				value={[propertyValue]}
				onValueChange={onSliderChange}
			/>
			<div className="pointer-events-none absolute inset-0 flex items-center justify-between gap-2 p-2 text-white">
				<span>{name}</span>
				<span>
					{valueLabels && propertyValue in valueLabels
						? valueLabels[propertyValue]
						: propertyValue}
				</span>
			</div>
		</div>
	)
}
