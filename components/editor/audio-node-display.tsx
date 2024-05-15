import { Handle, NodeProps, Position } from '@xyflow/react'
import { cn, tw } from '@/lib/utils'
import { AudioNodeGroup, audioNodeDefinitions } from '@/schemas/audio-node'
import { AudioNode } from '@/stores/composition-store'
import { Card } from '../ui/card'

const nodeGroupClassNames: Record<AudioNodeGroup, string> = {
	instrument: tw`bg-red-500`,
	effect: tw`bg-orange-500`,
	output: tw`bg-neutral-500`,
}

export default function AudioNodeDisplay({
	selected,
	data: { type, label },
}: NodeProps<AudioNode>) {
	const { group, inputs, outputs } = audioNodeDefinitions[type]

	return (
		<Card
			className={cn(
				'h-16 w-24 p-2 outline outline-0 outline-primary transition-all',
				nodeGroupClassNames[group],
				selected && 'outline-2',
			)}
		>
			{inputs.map(({ name }, i) => (
				<Handle
					key={name}
					type="target"
					id={String(i)}
					position={Position.Left}
				/>
			))}
			{outputs.map(({ name }, i) => (
				<Handle
					key={name}
					type="source"
					id={String(i)}
					position={Position.Right}
				/>
			))}
			<span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white">
				{label}
			</span>
		</Card>
	)
}
