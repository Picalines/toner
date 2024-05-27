'use client'

import { MousePointerClickIcon } from 'lucide-react'
import { ChangeEvent, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { KeyOfUnion, cn, mapRange, trimFraction, tw } from '@/lib/utils'
import {
	AudioNodeGroup,
	AudioNodeId,
	AudioNodeProperties,
	AudioNodePropertySchema,
	AudioNodeType,
	audioNodeDefinitions,
} from '@/schemas/audio-node'
import { CompositionStore } from '@/stores/composition-store'
import { EditorStore } from '@/stores/editor-store'
import {
	useCompositionStore,
	useCompositionStoreApi,
} from '../providers/composition-store-provider'
import {
	useEditorStore,
	useEditorStoreApi,
} from '../providers/editor-store-provider'
import { Input } from '../ui/input'
import { ScrollArea, ScrollBar } from '../ui/scroll-area'
import { Slider } from '../ui/slider'

type Props = Readonly<{
	className?: string
}>

const getNodeSelector = ({ getNodeById }: CompositionStore) => getNodeById

const selectedNodeSelector = ({ nodeSelection }: EditorStore) =>
	nodeSelection.length == 1 ? nodeSelection[0] : null

const applyChangeSelector = ({ applyChange }: EditorStore) => applyChange

export default function NodePropertiesEditor({ className }: Props) {
	const getNodeById = useCompositionStore(getNodeSelector)
	const selectedNodeId = useEditorStore(selectedNodeSelector)

	const selectedNode = selectedNodeId ? getNodeById(selectedNodeId) : null

	const bgClassName = tw`relative bg-neutral-300 dark:bg-neutral-800`

	if (!selectedNodeId || !selectedNode) {
		return (
			<div className={cn(bgClassName, className)}>
				<div className="absolute left-1/2 top-1/2 w-fit -translate-x-1/2 -translate-y-1/2">
					<div className="flex select-none flex-col items-center text-nowrap text-xs opacity-50">
						<MousePointerClickIcon />
						<span>select node</span>
					</div>
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

const renameNodeSelector = ({ renameNode }: CompositionStore) => renameNode

function NodeNameInput() {
	const nodeId = useEditorStore(selectedNodeSelector)
	const applyChange = useEditorStore(applyChangeSelector)

	const getNodeById = useCompositionStore(getNodeSelector)
	const renameNode = useCompositionStore(renameNodeSelector)

	const { type: nodeType, label } =
		(nodeId ? getNodeById(nodeId) : null) ?? {}

	const [labelInput, setLabelInput] = useState(label ?? '')

	const { group } = nodeType
		? audioNodeDefinitions[nodeType]
		: { group: null }

	const onNameChange = (event: ChangeEvent<HTMLInputElement>) => {
		const label = event.target.value
		if (nodeId) {
			renameNode(nodeId, label)
			applyChange({ type: 'node-update', id: nodeId, label })
			setLabelInput(label)
		}
	}

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

const nodePropertySelector =
	(nodeId: AudioNodeId | null, property: string) =>
	({ getNodeById }: CompositionStore) => {
		const { type, properties } = (nodeId ? getNodeById(nodeId) : null) ?? {}
		return { type, propertyValue: properties?.[property] }
	}

function NodePropertySlider<T extends AudioNodeType>({
	property,
	className,
}: PropertySliderProps<T>) {
	const compositionStore = useCompositionStoreApi()
	const editorStore = useEditorStoreApi()
	const nodeId = useEditorStore(selectedNodeSelector)

	const onSliderChange = (values: number[]) => {
		if (!nodeId) {
			return
		}

		const { setNodeProperty } = compositionStore.getState()
		const { applyChange } = editorStore.getState()

		const [propertyValue] = values
		setNodeProperty(nodeId, property, propertyValue)
		applyChange({
			type: 'node-update',
			id: nodeId,
			properties: { [property]: propertyValue },
		})
	}

	const { type: nodeType, propertyValue } = useCompositionStore(
		useShallow(nodePropertySelector(nodeId, property)),
	)

	if (!nodeType) {
		return null
	}

	const nodeProperties = audioNodeDefinitions[nodeType as T]
		.properties as AudioNodeProperties<T>

	const {
		name,
		default: defaultValue,
		step,
		range: [min, max],
		displayRange: [displayMin, displayMax] = [min, max],
		units,
		valueLabels,
	} = nodeProperties[property] as AudioNodePropertySchema

	const displayedValue = propertyValue ?? defaultValue

	return (
		<div
			className={cn(
				'relative h-min cursor-ew-resize text-nowrap p-1 px-2 shadow-[0_0_2px_rgba(0,0,0,0.2)]',
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
				value={[displayedValue]}
				onValueChange={onSliderChange}
			/>
			<div className="pointer-events-none relative flex flex-col items-start gap-0.5 text-sm">
				<span className="text-slate-700 dark:text-slate-100">
					{name}
				</span>
				<span className="text-slate-500 dark:text-slate-300">
					{valueLabels && displayedValue in valueLabels
						? valueLabels[displayedValue]
						: trimFraction(
								mapRange(
									displayedValue,
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
