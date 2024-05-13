'use client'

import { ChangeEvent, useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { cn, tw } from '@/lib/utils'
import {
	AudioNodeGroup,
	AudioNodeProperty,
	audioNodeSchemas,
} from '@/schemas/nodes'
import { AudioNode } from '@/stores/composition-store'
import { useCompositionStore } from '../providers/composition-store-provider'
import { Input } from '../ui/input'
import { ScrollArea, ScrollBar } from '../ui/scroll-area'
import { Slider } from '../ui/slider'

export type Props = Readonly<{
	className?: string
}>

export default function NodePropertiesEditor({ className }: Props) {
	const selectedNode = useCompositionStore(
		useShallow(comp => {
			const node = comp.getNodeById(comp.selectedNodeId ?? '')
			return node ? { id: node.id, type: node.data.type } : null
		}),
	)

	const selectedNodeId = selectedNode?.id

	if (!selectedNode || !selectedNodeId) {
		return (
			<div className={cn('relative dark:bg-neutral-900', className)}>
				<div className="absolute left-1/2 top-1/2 w-fit -translate-x-1/2 -translate-y-1/2 text-nowrap italic">
					Select node
				</div>
			</div>
		)
	}

	const { type } = selectedNode
	const { properties } = audioNodeSchemas[type]

	return (
		<ScrollArea className={cn('dark:bg-neutral-900', className)}>
			<NodeNameInput nodeId={selectedNodeId} />
			{Object.entries(properties).map(([key, propertySchema]) => (
				<NodePropertySlider
					key={key}
					nodeId={selectedNodeId}
					propertyKey={key}
					propertySchema={propertySchema as AudioNodeProperty}
				/>
			))}
			<ScrollBar />
		</ScrollArea>
	)
}

type NodeNameInputProps = Readonly<{ nodeId: AudioNode['id'] }>

function NodeNameInput({ nodeId }: NodeNameInputProps) {
	const renameNode = useCompositionStore(comp => comp.renameNode)
	const { type, label } = useCompositionStore(
		useShallow(comp => {
			const {
				data: { type, label },
			} = comp.getNodeById(nodeId)!
			return { type, label }
		}),
	)

	const { group } = audioNodeSchemas[type]

	const onNameChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			renameNode(nodeId, event.target.value)
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
				nodeGroupClassNames[group],
			)}
			value={label}
			onChange={onNameChange}
		/>
	)
}

type PropertySliderProps = Readonly<{
	nodeId: AudioNode['id']
	propertyKey: string
	propertySchema: AudioNodeProperty
	className?: string
}>

function NodePropertySlider({
	nodeId,
	propertyKey,
	propertySchema: { name, default: defaultValue, min, max, valueLabels },
	className,
}: PropertySliderProps) {
	const setNodeProperties = useCompositionStore(
		comp => comp.setNodeProperties,
	)

	const propertyValue = useCompositionStore(
		comp =>
			comp.getNodeById(nodeId)?.data.properties[propertyKey] ??
			defaultValue,
	)

	const onValueChange = useCallback(
		(values: number[]) =>
			setNodeProperties(nodeId, { [propertyKey]: values[0] }),
		[setNodeProperties, nodeId, propertyKey],
	)

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
				step={1}
				value={[propertyValue]}
				onValueChange={onValueChange}
			/>
			<div className="pointer-events-none absolute inset-0 flex items-center justify-between gap-2 p-2 text-white">
				<span>{name}</span>
				<span>{valueLabels?.[propertyValue] ?? propertyValue}</span>
			</div>
		</div>
	)
}
