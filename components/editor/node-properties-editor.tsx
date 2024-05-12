'use client'

import { cn, tw } from '@/lib/utils'
import {
	AudioNodeGroup,
	AudioNodeProperty,
	audioNodeSchemas,
} from '@/schemas/nodes'
import { AudioNode } from '@/stores/composition-store'
import { useCompositionStore } from '../providers/composition-store-provider'
import { Input } from '../ui/input'
import { Slider } from '../ui/slider'

const nodeGroupClassNames: Record<AudioNodeGroup, string> = {
	instrument: tw`bg-red-400`,
	effect: tw`bg-orange-300`,
	output: tw`bg-neutral-300`,
}

export default function NodePropertiesEditor() {
	const selectedNode = useCompositionStore(comp => comp.lastSelectedNode)

	if (!selectedNode) {
		return (
			<div className="relative left-1/2 top-1/2 w-fit -translate-x-1/2 -translate-y-1/2 text-nowrap italic">
				Select node
			</div>
		)
	}

	const {
		data: { type, label },
	} = selectedNode

	const { group, properties } = audioNodeSchemas[type]

	console.log(label)

	return (
		<div>
			<div
				className={cn(
					'w-full p-1 text-center text-black',
					nodeGroupClassNames[group],
				)}
			>
				{type.toUpperCase()}
			</div>
			<Input
				className="rounded-none border-l-0 border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0"
				value={label}
				onChange={console.log}
			/>
			{Object.entries(properties).map(([key, propertySchema]) => (
				<NodePropertySlider
					key={key}
					node={selectedNode}
					propertySchema={propertySchema}
				/>
			))}
		</div>
	)
}

type PropertySliderProps = Readonly<{
	node: AudioNode
	propertySchema: AudioNodeProperty
	className?: string
}>

function NodePropertySlider({
	node,
	propertySchema,
	className,
}: PropertySliderProps) {
	// TODO: wip

	return (
		<div className={className}>
			<Slider thumb={false} className="w-min rounded-none" />
		</div>
	)
}
